import React from 'react'

export default class RoomPage extends React.Component {

  // fetch old messages data from the server
  static async getInitialProps ({ req }) {
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/messages/' : 'https://robertrules.io/messages';
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
      rooms: this.props.rooms
    }
  }


  render(){
    return (
      <div>{this.state.text}</div>
    )
  }
}
