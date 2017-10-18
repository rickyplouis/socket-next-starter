import React from 'react'
import Router from 'next/router'

const handler = (path) => {
  Router.push({
    pathname: path
  })
}

export default class HomePage extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text: "Hello from state"
    }
  }

  render(){
    return (
      <div>
        <button onClick={() => handler('/makeRoom')}>Make A Room</button>
        <button onClick={() => handler('/joinRoom')}>Join A Room</button>
        <button onClick={() => handler('/test')}>Test Page</button>
      </div>
    )
  }
}
