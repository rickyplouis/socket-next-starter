import React from 'react'

import fetch from 'isomorphic-fetch'

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


  render(){
    return (
      <div>
        <div>On rooms.js {this.state.text}</div>
        <div>Room id is {this.state.id}</div>
        <div>
          Current Room Info:
            Admin: {this.state.room.admin}
        </div>
      </div>
    )
  }
}
