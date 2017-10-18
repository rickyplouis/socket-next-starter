import React from 'react'

export default class JoinRoom extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text: "Hello from JoinRoom.js"
    }
  }

  render(){
    return (
      <div>
        {this.state.text}
      </div>
    )
  }
}
