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
      inputMinutes: 0,
      inputAgenda: [
        { title: "",
          message: {
            speaker: '',
            description: '',
            duration: '',
            startTime: ''
          }
        }
      ]
    }
    this.handleAdmin = this.handleAdmin.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
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

  handlePassword = event => {
    this.setState({ inputPassword: event.target.value })
  }

  handleDuration = event => {
    this.setState({ inputMinutes: event.target.value })
  }

  addAgendaItem = event => {
    this.setState( state => ({
      rooms: state.rooms,
      inputName: state.inputName,
      inputPassword: state.inputPassword,
      inputMinutes: state.inputMinutes,
      inputAgenda: state.inputAgenda.concat({
        title: "",
          message: {
            speaker: '',
            description: '',
            duration: '',
            startTime: ''
          }
        })
    }))
  }

  clearForm(){
    this.setState(state => ({
      rooms: state.rooms.concat(room),
      inputName: '',
      inputPassword: '',
      inputMinutes: 0,
      inputAgenda: []
    }))
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

    // create message object
    const room = {
      id: uuidv1(),
      createdAt: new Date(),
      admin: this.state.inputName,
      password: this.state.inputPassword,
      duration: this.state.inputMinutes,
      agenda: [] //array of agendaItems
    }

    // send object to WS server
    this.socket.emit('message', room)
    this.clearForm();
  }

  renderAgenda(){
    let index = 0;
    console.log('inputAgenda', this.state.inputAgenda);
    let agenda = this.state.inputAgenda;
    let agendaItems = agenda.map( (item) =>
      <form key={index++}>
        Some item
        <input placeholder="Some item" type="text"/>{item.title}
      </form>
    )
    return agendaItems
  }

  disableSubmit(){
    return this.state.inputName.length == 0 || this.state.inputPassword.length == 0 || this.state.inputMinutes == 0;
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
                <strong>duration:</strong> {room.duration}<br/>
              </div>
            )}
          </ul>
          {this.renderAgenda()}
          <button onClick={(e) => this.addAgendaItem()}>Add Agenda Item</button>
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

export default HomePage
