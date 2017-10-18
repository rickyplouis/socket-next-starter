import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

export default class RoomPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps);
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
  }

  static async getInitialProps ({ query: { id } }) {
    console.log('id is', id);
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
      if (room.id == this.props.url.query.id){
        targetRoom = room
      }
    }
    console.log('props at constructor', this.props);
    this.state = {
      room: targetRoom,
      id: this.props.url.query.id,
      text: 'Hello world'
    }
    console.log('state is', this.state);
  }

  handleAdmin = event => {
    this.setState({
      room: {
        id: this.state.id,
        admin: event.target.value,
        password: this.state.room.password
      }
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.socket.emit('updateRoom', this.state.room)
  }

  disableSubmit(){
    return this.state.room.admin.length == 0;
  }

  renderRoom = () => {
    let objectIsEmpty = Object.keys(this.state.room).length === 0 && this.state.room.constructor === Object
    if (objectIsEmpty){
      return <div>No room available at this id</div>
    } else {
      return (
        <div>
          <div>On rooms.js {this.state.text}</div>
          <div>Room id is {this.state.id}</div>
          <div> Current Room Admin: </div>
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={this.state.room.admin} onChange={this.handleAdmin} />
            <button disabled={this.disableSubmit()}>Send</button>
          </form>
        </div>
      )}
  }

  render(){
    return(
      <div>
        {this.renderRoom()}
      </div>
    )
  }
}
