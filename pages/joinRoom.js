import React from 'react'
import Router from 'next/router'

export default class JoinRoom extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text: "Hello from JoinRoom.js",
      inputID: ""
    }
  }

  handleRouter = event => {
    event.preventDefault();
    Router.push({
      pathname: '/rooms',
      query: { id: this.state.inputID}
    })
  }

  handleID = event =>  {
    this.setState({
      inputID: event.target.value
    })
  }

  disableSubmit(){
    return this.state.inputID.length == 0
  }

  render(){
    return (
      <div>
      <form onSubmit={this.handleRouter}>
        <input
          onChange={this.handleID}
          type='text'
          placeholder='Enter The ID of the room you want to join'
          value={this.state.inputID}
        />
      <button disabled={this.disableSubmit()}>Send</button>
      </form>
        {this.state.text}
      </div>
    )
  }
}
