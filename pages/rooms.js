import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'
import Timer from '../components/timer'
import CardComponent from '../components/cardComponent'

import { Header, Form, Button, Card, Feed, Icon } from 'semantic-ui-react'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';


const SortableItem = SortableElement(({value}) =>
  <Feed.Event>
    <Feed.Label>
      <img src={value.image} />
    </Feed.Label>
    <Feed.Content>
      <Feed.Summary>
        <Feed.User>{value.name}</Feed.User> will discuss {value.topic}
        <Feed.Date>{value.time}</Feed.Date>
      </Feed.Summary>
    </Feed.Content>
  </Feed.Event>
);

const SortableList = SortableContainer(({items}) => {
  return (
    <Feed>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </Feed>
  );
});



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

  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState({
      items: arrayMove(this.state.items, oldIndex, newIndex),
    });
  };

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
      text: 'Hello world',
      inputTopic: '',
      items: [
              {
                _id: 'p1',
                name: 'Elliot',
                image: '/static/images/elliot.jpg',
                time: '10 Mins',
                topic: 'Marketing'
              },
              {
                _id: 'p2',
                name: 'Helen',
                image: '/static/images/helen.jpg',
                time: '20 mins',
                topic: 'Engineering'
              },
              {
                _id: 'p3',
                name: 'Chris',
                image: '/static/images/chris.jpg',
                time: '10 mins',
                topic: 'Sales'
              }
            ]
    }
    console.log('state is', this.state);
  }

  handleAdmin = event => {
    this.setState({
      inputTopic: this.state.inputTopic,
      room: {
        id: this.state.id,
        admin: event.target.value,
        password: this.state.room.password,
        agenda: this.state.room.agenda
      }
    })
  }

  renderTopics(){
    return this.state.room.agenda.map( (topic) => (<div>{topic.name}</div>) )
  }

  handleTopic = event => {
    this.setState({
      inputTopic: event.target.value,
      room: this.state.room
    })
  }

  makeAgenda(){
    return this.state.room.agenda.concat({'name': this.state.inputTopic})
  }

  submitTopic = event => {
    event.preventDefault();

    this.setState({
      room: {
        id: this.state.id,
        admin: event.target.value,
        password: this.state.room.password,
        agenda: this.makeAgenda()
      }
    })

    this.socket.emit('updateRoom', this.state.room)
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
        <div style={{margin: '0 auto', display: 'table'}}>
          <Header as="h2">On room.js</Header>
          <Header as="h3"> Room id is {this.state.id}</Header>
          <Card style={{margin: '0 auto', display: 'table', width: '50vw'}}>
            <Card.Content>
              <Card.Header>
                <Header as="h1">
                  Meeting Agenda
                </Header>
              </Card.Header>
            </Card.Content>
            <Card.Content>
              <Card.Header>
                <Header as="h3" floated="left">
                  Current Speaker: Christian Smith
                </Header>
                <Feed>
                  <Feed.Event>
                    <Feed.Label image='/static/images/christian.jpg' />
                    <Feed.Content>
                      <Feed.Date content='10 minutes totlal' />
                      <Feed.Summary>
                        Christian will be speaking about <a>something really really important</a>
                      </Feed.Summary>
                      <Timer/>
                    </Feed.Content>
                  </Feed.Event>
                </Feed>
              </Card.Header>
            </Card.Content>
            <Card.Content>
              <Card.Header>
                <Header as="h3" floated="left">
                  Marketing
                </Header>
              </Card.Header>
            </Card.Content>
            <Card.Content>
              <SortableList items={this.state.items} onSortEnd={this.onSortEnd} />
            </Card.Content>
          </Card>
          <Form onSubmit={this.handleSubmit}>
            <label>Current admin:</label>
            <Form.Input type="text" value={this.state.room.admin} onChange={this.handleAdmin} />
            <Button disabled={this.disableSubmit()}>Send</Button>
          </Form>
          {this.renderTopics()}
          <Form>
            <label>Add Topic:</label>
            <Form.Input type="text" value={this.state.inputTopic} onChange={this.handleTopic} />
            <Button onClick={this.submitTopic}>Send</Button>
          </Form>
        </div>
      )}
  }

  render(){
    return(
      <PageContainer>
        {this.renderRoom()}
      </PageContainer>
    )
  }
}
