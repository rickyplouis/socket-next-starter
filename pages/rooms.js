import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'
import Timer from '../components/timer'
import CardComponent from '../components/cardComponent'

import { Header, Form, Button, Card, Feed, Icon, Input, Label } from 'semantic-ui-react'
import SortableList from '../components/SortableList'
import Head from 'next/head';

import { findTopicIndex, addTopic, deleteTopic, changeName, shiftAgenda } from '../controllers/agendaController'

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
    for (let room of this.props.rooms){
      if (room.id === this.props.url.query.id){
        targetRoom = room;
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
      itemForm: {
        'details': '',
        'duration': 0
      }
    }
    console.log('this.state.room', this.state.room);
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

  handleQueue = () => {
    shiftAgenda(this.state.room.agenda).then( (newAgenda) => this.updateAgenda(newAgenda))
  }

  changeTopicName = (event, topic, agenda) => {
    changeName(event, topic, agenda).then( (newAgenda) => this.updateAgenda(newAgenda) );
  }

  removeTopic = (e, topic, agenda) => {
    deleteTopic(e, topic, agenda).then( (newAgenda) => this.updateAgenda(newAgenda) )
  }

  handleItemDetails = (event) => {
    event.preventDefault();
    let newItem = this.state.itemForm;
    newItem.details = event.target.value
    this.setState({
      itemForm: newItem
    })
  }

  handleItemDuration = (event) => {
    event.preventDefault();
    let newItem = this.state.itemForm;
    newItem.duration = event.target.value
    this.setState({
      itemForm: newItem
    })
  }

  addItem = (event, topic) => {
    event.preventDefault();
    let topicIndex = findTopicIndex(topic, this.state.room.agenda);
    var newAgenda = this.state.room.agenda;
    let item = {
      'name': this.state.username,
      'details': this.state.itemForm.details,
      'duration': this.state.itemForm.duration
    }

    newAgenda[topicIndex].items.push(item);
    this.setState({
      room: {
        id: this.state.id,
        admin: this.state.room.admin,
        password: this.state.room.password,
        duration: this.state.room.duration,
        agenda: newAgenda,
      },
      itemForm: {
        details: "",
        duration: 0
      }
    })
  }

  submitItem = (event, topic) => {
    event.preventDefault();
    Promise.all([this.addItem(event, topic)]).then( () => {
      this.socket.emit('updateRoom', this.state.room)
    })
  }

  itemFormInvalid = () => {
    return this.state.itemForm.details.length === 0 || this.state.itemForm.duration === 0;
  }

  renderItem = (topic) => {
    return (
        <Form size={'tiny'} onSubmit={(e) => this.submitItem(e, topic)}>
          <Form.Group>
            <Form.Input label="I will talk about..." placeholder='How we will create a product roadmap' width={'eight'} name='details' value={this.state.itemForm.details} onChange={this.handleItemDetails} />
            <Form.Input label="For..." labelPosition='right' width={'three'} type='number' placeholder='Amount' name='duration' value={this.state.itemForm.duration}  onChange={this.handleItemDuration}>
              <input />
              <Label>Mins</Label>
            </Form.Input>
            <Form.Button label="Submit" content='Submit' disabled={this.itemFormInvalid()} />
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
                      <Input placeholder="Enter Topic Title" value={topic.name} onChange={(e) => this.changeTopicName(e, topic, this.state.room.agenda)} ></Input>
                      <Button onClick={(e) => this.removeTopic(e, topic, this.state.room.agenda)}>Delete</Button>
                    </Form.Field>
                  </Form>
                  <SortableList items={this.state.room.agenda[findTopicIndex(topic, this.state.room.agenda)].items} onSortEnd={this.onSortEnd} />
                  {this.renderItem(topic)}
                </Card.Content>))
              }

  handleTopic = event => {
    return this.setState({
      inputTopic: event.target.value,
      room: this.state.room
    })
  }

  submitTopic = (event, topicName, agenda) => {
    event.preventDefault();
    addTopic(event, topicName, agenda).then( (newAgenda) => {
      this.updateAgenda(newAgenda)})
  }

  handleSubmit = event => {
    event.preventDefault()
    this.socket.emit('updateRoom', this.state.room)
  }

  renderAddTopicForm = () => {
    return (
      <Card.Content>
        <Form>
          <label>Add Topic:</label>
          <Form.Input type="text" value={this.state.inputTopic} onChange={this.handleTopic} />
          <Button onClick={(e) => this.submitTopic(e, this.state.inputTopic, this.state.room.agenda)}>Send</Button>
        </Form>
      </Card.Content>
    )
  }

  roomIsEmpty = (room) => {
    return Object.keys(room).length === 0 && room.constructor === Object
  }

  renderRoom = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Header as="h2">On room.js</Header>
          <Header as="h3"> Room id is {this.state.id}</Header>
          <Card style={{margin: '0 auto', display: 'table', width: '50vw'}}>
            <Card.Content>
              <Card.Header>
                <Header as="h2">
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
            <Button onClick={this.handleQueue}>
              Handle Queue
            </Button>
            {this.renderTopics()}
            {this.renderAddTopicForm()}
          </Card>
          <Form onSubmit={this.handleSubmit}>
            <label>My username:</label>
            <Form.Input type="text" placeholder="Enter your name" value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
          </Form>
        </div>
      )
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
            <Form.Input placeholder='Enter the room password' type="password" error={this.state.wrongPassword && this.state.inputPassword.length == 0} name='password' value={this.state.inputPassword} onChange={ (e) => this.handlePassword(e)} />
            <Form.Button content='Submit' disabled={this.state.username.length == 0 || this.state.inputPassword.length == 0} />
          </Form.Group>
        </Form>
      </div>

    )
  }

  renderPage (){
    if (this.roomIsEmpty(this.state.room)){
      return <div>No room available at this id</div>
    }
    else {
      return this.state.userConnected ? <div>{this.renderRoom()}</div> : <div>{this.renderUsernameForm()}</div>
    }
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
