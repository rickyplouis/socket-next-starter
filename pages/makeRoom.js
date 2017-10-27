import { Component } from 'react';
import io from 'socket.io-client';
import Router from 'next/router';
import PageContainer from '../components/pageContainer';
import { Form, Button, Header, Checkbox } from 'semantic-ui-react';

const uuidv1 = require('uuid/v1');

export default class MakeRoom extends Component {
  // fetch old messages data from the server

  static defaultProps = {
    rooms: []
  }

  constructor(props){
    super(props);
    this.state = {
      rooms: this.props.rooms,
      roomName: '',
      password: '',
      confirmPassword: '',
      passwordProtected: false,
      duration: 0,
      agenda: []
    }
    this.handleRoomName = this.handleRoomName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleConfirmPassword = this.handleConfirmPassword.bind(this);
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('makeRoom', this.loadRooms)
  }

  // close socket connection
  componentWillUnmount () {
    this.socket.off('makeRoom', this.loadRooms)
    this.socket.close()
  }

  // add messages from server to the state
  loadRooms = (room) => {
    this.setState(state => ({ rooms: state.rooms.concat(room) }))
  }

  //Form Handlers

  handleRoomName = event => {
    this.setState({ roomName: event.target.value })
  }

  handlePassword = event => {
    this.setState({ password: event.target.value })
  }

  handleConfirmPassword = event => {
    this.setState({ confirmPassword: event.target.value })
  }

  handleDuration = event => {
    this.setState({ duration: event.target.value })
  }

  makeRoom(roomID){
    return {
      id: roomID,
      createdAt: new Date(),
      roomName: this.state.roomName,
      password: this.state.password,
      passwordProtected: this.state.passwordProtected,
      duration: this.state.duration,
      agenda: this.state.agenda,
    }
  }

  handleSubmit = event => {
    event.preventDefault()
    let roomID = uuidv1();

    let room = this.makeRoom(roomID)

    this.setState(state => ({
      rooms: state.rooms.concat(this.makeRoom(room))
    }))

    Router.push({
      pathname: '/rooms',
      query: { id: roomID }
    })

    // send object to WS server
    this.socket.emit('makeRoom', room)
  }

  passwordMismatch(){
    return this.state.confirmPassword !== this.state.password;
  }

  invalidRoomDetails = () => {
    return this.state.roomName.length === 0 || this.state.duration === 0;
  }

  disableSubmit(){
    if (this.state.passwordProtected){
      return this.invalidRoomDetails() || this.passwordMismatch() || this.state.password.length === 0
    } else {
      return this.invalidRoomDetails()
    }
  }

  handleCheckbox = (event) => {
    event.preventDefault();
    this.setState({
      passwordProtected: !this.state.passwordProtected
    })
  }

  renderPasswordFields = () => {
    if (this.state.passwordProtected){
      return (<div>
                <Form.Field style={{textAlign: 'left'}}>
                  <label>Enter Password</label>
                  <Form.Input
                    onChange={this.handlePassword}
                    type='password'
                    placeholder='Enter Your Room Password'
                    value={this.state.password}
                    />
                </Form.Field>
                <Form.Field style={{textAlign: 'left'}}>
                  <label>Confirm Password</label>
                  <Form.Input
                    error={this.passwordMismatch() && this.state.confirmPassword.length > 0}
                    onChange={this.handleConfirmPassword}
                    type='password'
                    placeholder='Enter Your Room Password'
                    value={this.state.confirmPassword}
                    />
                </Form.Field>
              </div>)
    } else {
      return <div></div>
    }
  }

  render () {
    return (
      <PageContainer>
          <Form onSubmit={this.handleSubmit} style={{marginTop: '10vh', marginLeft: '30vw', marginRight:'30vw'}}>
            <Header as="h2">Make A Room</Header>
            <Form.Field style={{textAlign:'left'}}>
              <label>Enter Your Room Name</label>
              <Form.Input
                onChange={this.handleRoomName}
                type='text'
                placeholder='The best room'
                value={this.state.roomName}
                />
            </Form.Field>
            <Form.Field style={{textAlign: 'left'}}>
              <label>Enter Meeting Duration (Mins)</label>
              <Form.Input
                onChange={this.handleDuration}
                type='number'
                placeholder='Enter Duration'
                value={this.state.duration}
                />
            </Form.Field>
            {this.renderPasswordFields()}
            <Form.Field>
              <Checkbox checked={this.state.passwordProtected} onChange={(e) => this.handleCheckbox(e)} label='Make my room password protected' />
            </Form.Field>
            <Form.Field>
              <Button disabled={this.disableSubmit()} style={{width: '20vw'}}>Create Room</Button>
            </Form.Field>
        </Form>
      </PageContainer>
    )
  }
}
