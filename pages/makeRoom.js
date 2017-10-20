import { Component } from 'react';
import io from 'socket.io-client';
import Router from 'next/router';
import PageContainer from '../components/pageContainer';
import { Form, Button, Header } from 'semantic-ui-react';

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
      admin: '',
      password: '',
      confirmPassword: '',
      duration: 0,
      agenda: []
    }
    this.handleAdmin = this.handleAdmin.bind(this);
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

  handleAdmin = event => {
    this.setState({ admin: event.target.value })
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
      admin: this.state.admin,
      password: this.state.password,
      duration: this.state.duration,
      agenda: this.state.agenda,
      users: [
        {
          name: this.state.admin,
          isAdmin: true,
          isConnected: true
        }
      ]
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

  disableSubmit(){
    return this.state.admin.length == 0 || this.state.password.length == 0 || this.state.duration == 0;
  }

  render () {
    return (
      <PageContainer>
          <Form onSubmit={this.handleSubmit} style={{marginTop: '10vh', marginLeft: '30vw', marginRight:'30vw'}}>
            <Header as="h2">Make A Room</Header>
            <Form.Field style={{textAlign:'left'}}>
              <label>Enter Your Name</label>
              <Form.Input
                onChange={this.handleAdmin}
                type='text'
                placeholder='Robert Ruler'
                value={this.state.admin}
                />
            </Form.Field>
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
            <Form.Field style={{textAlign: 'left'}}>
              <label>Enter Meeting Duration (Mins)</label>
              <Form.Input
                onChange={this.handleDuration}
                type='number'
                placeholder='Enter Duration'
                value={this.state.duration}
                />
              <Button disabled={this.disableSubmit() || this.passwordMismatch()} style={{width: '20vw'}}>Create Room</Button>
            </Form.Field>
        </Form>
      </PageContainer>
    )
  }
}
