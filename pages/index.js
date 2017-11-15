import React from 'react'
import Router from 'next/router'
import { Button, Header } from 'semantic-ui-react'

import PageContainer from '../components/pageContainer'

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
      <PageContainer>
        <div style={{marginTop: '10vh'}}>
          <Header as="h2">Welcome to Robert Rules</Header>
          <Header as="h3">We make meetings less painful</Header>
          <br/>
          <Button onClick={() => handler('/makeRoom')}>Make A Room</Button>
          <Button onClick={() => handler('/joinRoom')}>Join A Room</Button>
        </div>
      </PageContainer>
    )
  }
}
