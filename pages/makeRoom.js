import { Component } from 'react'
import io from 'socket.io-client'
import fetch from 'isomorphic-fetch'

import Link from 'next/link';

import Router from 'next/router'

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
      inputName: '',
      inputPassword: '',
      inputMinutes: 0,
    }
    this.handleAdmin = this.handleAdmin.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
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

  handleAdmin = event => {
    this.setState({ inputName: event.target.value })
  }

  handlePassword = event => {
    this.setState({ inputPassword: event.target.value })
  }

  handleDuration = event => {
    this.setState({ inputMinutes: event.target.value })
  }

  // send messages to server and add them to the state
  handleSubmit = event => {
    event.preventDefault()
    let roomID = uuidv1();

    const room = {
      id: roomID,
      createdAt: new Date(),
      admin: this.state.inputName,
      password: this.state.inputPassword,
      duration: this.state.inputMinutes,
      agenda: []
    }

    this.setState(state => ({
      rooms: state.rooms.concat(room)
    }))

    Router.push({
      pathname: '/rooms',
      query: { id: roomID }
    })

    // send object to WS server
    this.socket.emit('makeRoom', room)
  }

  disableSubmit(){
    return this.state.inputName.length == 0 || this.state.inputPassword.length == 0 || this.state.inputMinutes == 0;
  }

  render () {
    return (
      <main>
        <div>
          <form onSubmit={this.handleSubmit}>
            <input
              onChange={this.handleAdmin}
              type='text'
              placeholder='Enter Your Name'
              value={this.state.inputName}
            />
            <input
              onChange={this.handlePassword}
              type='text'
              placeholder='Enter Your Room Password'
              value={this.state.inputPassword}
            />
            <input
              onChange={this.handleDuration}
              type='number'
              placeholder='Enter Duration'
              value={this.state.inputMinutes}
            />
          <button disabled={this.disableSubmit()}>Send</button>
          </form>
        </div>
      </main>
    )
  }
}
