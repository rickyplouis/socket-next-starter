import { Component } from 'react'
import io from 'socket.io-client'
import fetch from 'isomorphic-fetch'

import Link from 'next/link';

const uuidv1 = require('uuid/v1');

class HomePage extends Component {
  // fetch old messages data from the server
  static async getInitialProps ({ req }) {
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/messages' : 'https://robertrules.io/messages';
    const response = await fetch(appUrl)
    const rooms = await response.json()
    return { rooms }
  }

  static defaultProps = {
    rooms: []
  }

  constructor(props){
    super(props);
    this.state = {
      rooms: this.props.rooms,
      inputName: '',
      inputPassword: '',

    }
    this.handleAdmin = this.handleAdmin.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('message', this.handleMessage)
  }

  // close socket connection
  componentWillUnmount () {
    this.socket.off('message', this.handleMessage)
    this.socket.close()
  }

  // add messages from server to the state
  handleMessage = (room) => {
    this.setState(state => ({ rooms: state.rooms.concat(room) }))
  }

  handleAdmin = event => {
    this.setState({ inputName: event.target.value })
  }

  // send messages to server and add them to the state
  handleSubmit = event => {
    event.preventDefault()

    const agendaItems = {
      title: "",
      message: {
        speaker: '',
        description: '',
        duration: '',
        startTime: ''
      }
    }

    console.log('this.state.inputName', this.state.inputName);
    // create message object
    const room = {
      id: uuidv1(),
      createdAt: new Date(),
      admin: this.state.inputName,
      password: this.state.inputPassword,
      agenda: [] //array of agendaItems
    }

    // send object to WS server
    this.socket.emit('message', room)

    // add it to state and clean current input value
    this.setState(state => ({
      rooms: state.rooms.concat(room)
    }))
  }

  disableSubmit(){
    return this.state.inputName.length == 0;
  }

  render () {
    return (
      <main>
        <div>
          <ul>
            {this.state.rooms.map(room =>
              <div key={room.id}>
                <strong>id:</strong> {room.id}<br/>
                <strong>admin:</strong> {room.admin}<br/>
                <strong>password:</strong> {room.password}<br/>
              </div>
            )}
          </ul>
          <form onSubmit={this.handleSubmit}>
            <input
              onChange={this.handleAdmin}
              type='text'
              placeholder='Enter Your Name'
              value={this.state.inputName}
            />
          <button disabled={this.disableSubmit()}>Send</button>
          </form>
        </div>
      </main>
    )
  }
}

export default HomePage
