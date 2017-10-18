import React from 'react'

export default class RoomPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps);
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
  }

  // fetch old messages data from the server
  /**
  static async getInitialProps ({ req }) {
    console.log('state here is', this.state);
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/rooms/' : 'https://robertrules.io/rooms';
    const response = await fetch(appUrl)
    const rooms = await response.json()
    return { rooms }
  }

  **/
  static defaultProps = {
    rooms: []
  }

  constructor(props){
    super(props);
    console.log('props at constructor', this.props);
    this.state = {
      room: {},
      id: this.props.url.query.id,
      text: 'Hello world'
    }
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
