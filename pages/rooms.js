import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'
import Timer from '../components/timer'
import CardComponent from '../components/cardComponent'

import { Header, Form, Button, Card, Feed, Icon, Input } from 'semantic-ui-react'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

const uuidv1 = require('uuid/v1');

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

  updateAgenda = (newAgenda) => {
    this.setState({
      inputTopic: this.state.inputTopic,
      room: {
        id: this.state.id,
        admin: this.state.room.admin,
        password: this.state.room.password,
        agenda: newAgenda
      }
    })
    this.socket.emit('updateRoom', this.state.room)
  }

  changeTopicTitle = (event, topic) => {
    event.preventDefault();
    let index = this.findTopicIndex(topic);
    var newAgenda = this.state.room.agenda;
    newAgenda[index].name = event.target.value
    this.updateAgenda(newAgenda);
  }

  removeTopic = (e, topic) => {
    event.preventDefault();

    let index = this.findTopicIndex(topic);
    var newAgenda = this.state.room.agenda;
    newAgenda.splice(index, 1);
    this.updateAgenda(newAgenda);
  }

  renderTopics(){
    let index = 0;
    return this.state.room.agenda.map( (topic) =>
            (
              <Card.Content key={index++}>
                <Header as="h2">{topic.name}</Header>
                  <Form size={'large'} width={16}>
                    <Form.Field inline>
                      <label>Edit Topic:</label>
                      <Input placeholder="Enter Topic Title" value={topic.name} onChange={(e) => this.changeTopicTitle(e, topic)} ></Input>
                      <Button onClick={(e) => this.removeTopic(e, topic)}>Delete</Button>
                    </Form.Field>
                  </Form>
                  <SortableList items={this.state.items} onSortEnd={this.onSortEnd} />
                  <Form size={'tiny'}>
                    <Form.Group>
                      <Form.Input label="My name is" placeholder='Enter your name' name='name' value={""} onChange={this.handleChange} />
                      <Form.Input label="I will talk about..." placeholder='How we will create a product roadmap' width={'eight'} name='detail' value={""} onChange={this.handleChange} />
                      <Form.Input label="Duration" placeholder='10 mins' width={'two'} name='duration' value={0} onChange={this.handleChange} />
                      <Form.Button label="Submit" content='Submit' />
                    </Form.Group>
                  </Form>
                </Card.Content>))
              }

  handleTopic = event => {
    return this.setState({
      inputTopic: event.target.value,
      room: this.state.room
    })
  }

  findTopicIndex = (topic) => {
    let agenda = this.state.room.agenda
    if (agenda.length == 0){
      return -1
    }
    for (let x = 0; x < agenda.length; x++){
      if (agenda[x].id == topic.id){
        return x;
      }
    }
  }


  addTopic(){
    let topic = {
      'id': uuidv1(),
      'name': this.state.inputTopic,
      'items': []
    }

    this.setState({
      room: {
        id: this.state.id,
        admin: this.state.room.admin,
        password: this.state.room.password,
        duration: this.state.room.duration,
        agenda: this.state.room.agenda.concat(topic)
      }
    })

  }


  submitTopic = event => {
    event.preventDefault();
    Promise.all([this.addTopic()]).then( () => this.socket.emit('updateRoom', this.state.room))
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
            {this.renderTopics()}
          </Card>
          <Form onSubmit={this.handleSubmit}>
            <label>Current admin:</label>
            <Form.Input type="text" value={this.state.room.admin} onChange={this.handleAdmin} />
            <Button disabled={this.disableSubmit()}>Send</Button>
          </Form>
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
