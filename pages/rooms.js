import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'
import Timer from '../components/timer'
import CardComponent from '../components/cardComponent'

import { Header, Form, Button, Card, Feed, Icon, Input, Label } from 'semantic-ui-react'

import SortableList from '../components/SortableList'

import Head from 'next/head';

const uuidv1 = require('uuid/v1');





export default class RoomPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
  }

  static async getInitialProps ({ query: { id } }) {
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
    for (let x = this.props.rooms.length -1; x > -1; x--){
      if (this.props.rooms[x].id = this.props.url.query.id){
        targetRoom = this.props.rooms[x];
      }
    }
    this.state = {
      room: targetRoom,
      id: this.props.url.query.id,
      username: '',
      userConnected: false,
      inputPassword: '',
      wrongPassword: false,
      text: 'Hello world',
      inputTopic: '',
      inputItem: {
        'details': '',
        'duration': 0
      },
      items: [
              {
                _id: 'p1',
                name: 'Elliot',
                image: '/static/images/elephant-avatar.png',
                time: '10 Mins',
                topic: 'Marketing'
              },
              {
                _id: 'p2',
                name: 'Helen',
                image: '/static/images/fox-avatar.png',
                time: '20 mins',
                topic: 'Engineering'
              },
              {
                _id: 'p3',
                name: 'Chris',
                image: '/static/images/lion-avatar.png',
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
    console.log('updating room with', this.state.room);
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

  handleItemDetails = (event) => {
    event.preventDefault();
    let newItem = this.state.inputItem;
    newItem.details = event.target.value
    this.setState({
      inputItem: newItem
    })
  }

  handleItemDuration = (event) => {
    event.preventDefault();
    let newItem = this.state.inputItem;
    newItem.duration = event.target.value
    this.setState({
      inputItem: newItem
    })
  }

  addItem = (event, topic) => {
    event.preventDefault();
    let index = this.findTopicIndex(topic);
    let item = {
      'name': this.state.username,
      'details': this.state.inputItem.details,
      'duration': this.state.inputItem.duration
    }
    var newAgenda = this.state.room.agenda;
    newAgenda[index].items.push(item);
    this.updateAgenda(newAgenda);
  }

  renderItem = (topic) => {
    return (
        <Form size={'tiny'} onSubmit={(e) => this.addItem(e, topic)}>
          <Form.Group>
            <Form.Input label="I will talk about..." placeholder='How we will create a product roadmap' width={'eight'} name='details' value={this.state.inputItem.details} onChange={this.handleItemDetails} />
            <Form.Input label="For..." labelPosition='right' width={'three'} type='number' placeholder='Amount' name='duration' value={this.state.inputItem.duration}  onChange={this.handleItemDuration}>
              <input />
              <Label>Mins</Label>
            </Form.Input>
            <Form.Button label="Submit" content='Submit' disabled={this.state.inputItem.details.length === 0 || this.state.inputItem.duration === 0} />
          </Form.Group>
        </Form>
    )
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
                  {this.renderItem(topic)}
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

  renderAddTopicForm = () => {
    return (
      <Card.Content>
        <Form>
          <label>Add Topic:</label>
          <Form.Input type="text" value={this.state.inputTopic} onChange={this.handleTopic} />
          <Button onClick={this.submitTopic}>Send</Button>
        </Form>
      </Card.Content>
    )
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
                    <Feed.Label image='/static/images/moose-avatar.png' />
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
            {this.renderAddTopicForm()}
          </Card>
          <Form onSubmit={this.handleSubmit}>
            <label>My username:</label>
            <Form.Input type="text" placeholder="Enter your name" value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
          </Form>
        </div>
      )}
  }

  connectUser = (e) => {
    e.preventDefault();
    if (this.state.inputPassword !== this.state.room.password){
      this.setState({
        wrongPassword: true,
        inputPassword: ''
      })
    } else {
      this.setState({
        userConnected: true
      })
    }
  }

  handleUsername = (event) => {
    event.preventDefault();
    this.setState({
      username: event.target.value
    })
  }

  handlePassword = (event) => {
    event.preventDefault();
    this.setState({
      inputPassword: event.target.value
    })
  }

  renderUsernameForm(){
    return (
      <div style={{margin: '0 auto', display: 'table'}}>
        <Header as="h2">Enter your name and password to join</Header>
        <Form size={'tiny'} onSubmit={(e) => this.connectUser(e)} >
          <Form.Group>
            <Form.Input placeholder='Enter your name' name='name' value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
            <Form.Input placeholder='Enter the room password' type="password" error={this.state.wrongPassword} name='password' value={this.state.inputPassword} onChange={ (e) => this.handlePassword(e)} />
            <Form.Button content='Submit' disabled={this.state.username.length == 0 || this.state.inputPassword.length == 0} />
          </Form.Group>
        </Form>
      </div>

    )
  }

  renderPage (){
    return this.state.userConnected ? <div>{this.renderRoom()}</div> : <div>{this.renderUsernameForm()}</div>
  }

  render(){
    return(
      <PageContainer>
        <Head>
          <a href="http://www.freepik.com/free-vector/animal-avatars-in-flat-design_772910.htm">Animal Avatars by Freepik</a>
        </Head>
        {this.renderPage()}
      </PageContainer>
    )
  }
}
