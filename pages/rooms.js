import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'

import { Header, Form, Button, Input, Label } from 'semantic-ui-react'
import Head from 'next/head';

export default class RoomPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
  }

  static async getInitialProps ({ query: { id } }) {
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/rooms' : 'https://robertrules.io/rooms';
    const response = await fetch(appUrl)
    const rooms = await response.json()
    return { rooms }
  }


  static defaultProps = {
    rooms: []
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('updateRoom', this.loadRooms)
  }


  // close socket connection
  componentWillUnmount () {
    this.socket.off('updateRoom', this.loadRooms)
    this.socket.close()
  }

  // only update room if id matches
  // prevents cross room updates
  loadRooms = (room) => {
    if (room.id == this.state.id){
      this.setState(state => ({ room }))
    }
    return;
  }

  constructor(props){
    super(props);
    let targetRoom = {}
    for (let room of this.props.rooms){
      if (room.id === this.props.url.query.id){
        targetRoom = room;
      }
    }
    this.state = {
      room: targetRoom,
      id: this.props.url.query.id,
      username: '',
      userConnected: false,
      inputPassword: '',
      wrongPassword: false,
    }
  }

  updateRoom = (e) => {
    e.preventDefault;
    this.socket.emit('updateRoom', this.state.room)
  }

  handleRoomName = (event) => {
    event.preventDefault();
    this.setState({
      ...this.state,
      room: {
        ...this.state.room,
        roomName: event.target.value
      }
    })
  }

  handleUsername = (event) => {
    event.preventDefault();
    this.setState({
      username: event.target.value
    })
  }

  handlePassword = (event) => {
    event.preventDefault();
    this.setState({
      inputPassword: event.target.value
    })
  }

  roomIsEmpty = (room) => {
    return Object.keys(room).length === 0 && room.constructor === Object
  }

  renderRoom = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Form>
            <Form.Input type="text" placeholder="Room Name" value={this.state.room.roomName} onChange={ (e) => this.handleRoomName(e)} />
            <Form.Button content='Submit' onClick={(e) => this.updateRoom(e)} />
          </Form>
          <Header as="h2">In room {this.state.room.roomName}</Header>
          <Header as="h4">Expected Duration: {this.state.room.duration} mins</Header>
          <Form>
            <label>My username:</label>
            <Form.Input type="text" placeholder="Enter your name" value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
            <Form.Button content='Submit' />
          </Form>
        </div>
      )
  }

  passwordMismatch = () => {
    return this.state.inputPassword !== this.state.room.password;
  }

  connectUser = () => {
    this.setState({
      userConnected: true
    })
  }

  submitEntranceForm = (e) => {
    e.preventDefault();

    if (this.state.room.passwordProtected && this.passwordMismatch()){
      this.setState({
        wrongPassword: true,
        inputPassword: ''
      })
    } else {
      this.connectUser()
    }
  }

  disableEntranceButton = () => {
    if (this.state.room.passwordProtected){
      return this.state.inputPassword.length === 0 || this.state.username.length === 0;
    } else {
      return this.state.username.length === 0;
    }
  }

  roomHasPassword = () => {
    return this.state.room.passwordProtected;
  }

  renderPasswordField = () => {
    return (<div>
            { this.roomHasPassword()
              &&
              <Form.Input placeholder='Enter the room password' type="password" error={this.state.wrongPassword && this.state.inputPassword.length == 0} name='password' value={this.state.inputPassword} onChange={ (e) => this.handlePassword(e)}/>
            }
            </div>)
  }

  renderJoinText = () => {
    return (<Header as="h2"> Enter your name{this.roomHasPassword() ? " and password ": " "}to join</Header>)
  }

  renderEntranceForm(){
    return (
      <div style={{margin: '0 auto', display: 'table'}}>
        {this.renderJoinText()}
        <Form size={'tiny'} onSubmit={(e) => this.submitEntranceForm(e)} >
          <Form.Group>
            <Form.Input placeholder='Enter your name' name='name' value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
            {this.renderPasswordField()}
            <Form.Button content='Submit' disabled={this.disableEntranceButton()} />
          </Form.Group>
        </Form>
      </div>

    )
  }

  renderPage (){
    if (this.roomIsEmpty(this.state.room)){
      return <div>No room available at this id</div>
    }
    else {
      return this.state.userConnected ? <div>{this.renderRoom()}</div> : <div>{this.renderEntranceForm()}</div>
    }
  }

  render(){
    return(
      <PageContainer>
        <Head>
          <a href="http://www.freepik.com/free-vector/animal-avatars-in-flat-design_772910.htm">Animal Avatars by Freepik</a>
        </Head>
        {this.renderPage()}
      </PageContainer>
    )
  }
}
