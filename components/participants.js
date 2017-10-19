import React from 'react'
import { Button, Image, List, Header } from 'semantic-ui-react'


export default class Participants extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      text: 'Hello World'
    }
  }

  render(){
    return(
      <List divided verticalAlign='middle'>
        <List.Item>
          <Header as="h2">Participants</Header>
        </List.Item>
        <List.Item>
          <List.Content floated='right'>
            <Button>Select User</Button>
          </List.Content>
          <Image avatar src='../static/images/ade.jpg' />
          <List.Content>
            Ade
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content floated='right'>
            <Button>Select User</Button>
          </List.Content>
          <Image avatar src='../static/images/chris.jpg' />
          <List.Content>
            Chris
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content floated='right'>
            <Button>Select User</Button>
          </List.Content>
          <Image avatar src='../static/images/elliot.jpg' />
          <List.Content>
            Elliot
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Content floated='right'>
            <Button>Select User</Button>
          </List.Content>
          <Image avatar src='../static/images/helen.jpg' />
          <List.Content>
            Helen
          </List.Content>
        </List.Item>
      </List>
    )
  }
}
