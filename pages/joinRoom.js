import React from 'react'
import Router from 'next/router'
import PageContainer from '../components/pageContainer'
import { Form, Button, Header } from 'semantic-ui-react'

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
      <PageContainer>
        <Form onSubmit={this.handleRouter}  style={{marginTop: '10vh', marginLeft: '30vw', marginRight:'30vw'}}>
          <Header as="h2">Join A Room</Header>
          <Form.Group>
            <Form.Input
              onChange={this.handleID}
              type='text'
              placeholder='Enter Your Room ID'
              value={this.state.inputID}
              width={16}
              />
            <Button disabled={this.disableSubmit()}>Send</Button>
          </Form.Group>
        </Form>
      </PageContainer>
    )
  }
}
