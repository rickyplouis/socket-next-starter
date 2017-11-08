import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'
import Timer from '../components/timer'
import CardComponent from '../components/cardComponent'

import { Header, Form, Button, Card, Feed, Icon, Input, Progress, Label, Radio } from 'semantic-ui-react'
import SortableList from '../components/SortableList'
import Head from 'next/head';

import { findTopicIndex, addTopic, deleteTopic, changeName, changeEditStatus, shiftAgenda } from '../controllers/agendaController'

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

  componentWillMount(){
    this.setState({
      timerObject: {
        startingSeconds: this.convertTimeToSeconds(this.state.timerObject)
      },
      seconds: this.convertTimeToSeconds(this.state.timerObject)
    })
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
      },
      timerObject: {
        startingSeconds: 0,
        percent: 100,
        minutes: 2,
        seconds: 5
      },
      startingSeconds: 0,
      percent: 100,
      timerRunning: false
    }
      this.timer = 0;
      this.startTimer = this.startTimer.bind(this);
      this.countDown = this.countDown.bind(this);
      this.pauseTimer = this.pauseTimer.bind(this);

  }

  updateAgenda = (newAgenda) => {
    this.setState({
      inputTopic: this.state.inputTopic,
      room: {
        id: this.state.id,
        roomName: this.state.room.roomName,
        password: this.state.room.password,
        passwordProtected: this.state.room.passwordProtected,
        duration: this.state.room.duration,

        agenda: newAgenda
      }
    })
    this.socket.emit('updateRoom', this.state.room)
  }

  agendaExists = (agenda) => {
    return agenda && agenda.length > 0;
  }

  handleQueue = () => {
    if (this.agendaExists(this.state.room.agenda)){
      shiftAgenda(this.state.room.agenda).then( (newAgenda) => this.updateAgenda(newAgenda))
    }
  }

  changeTopicName = (event, topic, agenda) => {
    changeName(event, topic, agenda).then( (newAgenda) => this.updateAgenda(newAgenda) );
  }

  editStatus = (event, topic, agenda) => {
    changeEditStatus(event, topic, agenda).then( (newAgenda) => this.updateAgenda(newAgenda) );
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

  /**
  *
  * Topic Components
  *
  */

  renderTopicHeader = (topic) => {
    return (<div>
              {topic.name+" "} <Button active={topic.editable} onClick={(e) => this.editStatus(e, topic, this.state.room.agenda)}>{topic.editable ? 'Finish': 'Edit'} </Button>
            </div>)
  }

  renderEditForm = (topic) => {
    return (
      <Form size={'large'} width={16}>
        <Form.Field inline>
          <label>Edit Topic:</label>
          <Input placeholder="Enter Topic Title" value={topic.name} onChange={(e) => this.changeTopicName(e, topic, this.state.room.agenda)} ></Input>
        </Form.Field>
        <Form.Field>
          <Button onClick={(e) => this.removeTopic(e, topic, this.state.room.agenda)}>Delete Topic</Button>
        </Form.Field>
      </Form>
    )
  }

  renderTopics(){
    let index = 0;
    return this.state.room.agenda.map( (topic) =>
            (<Card style={{margin: '0 auto', display: 'table', width: '50vw'}} key={index++}>
              <Card.Content>
                <Card.Header>
                  {this.renderTopicHeader(topic)}
                </Card.Header>
              </Card.Content>
              {topic.editable &&
                <Card.Content extra>
                  {this.renderEditForm(topic)}
                </Card.Content>
              }
              <Card.Content>
                  <SortableList items={this.state.room.agenda[findTopicIndex(topic, this.state.room.agenda)].items} onSortEnd={this.onSortEnd} />
                  {this.renderItem(topic)}
                </Card.Content>
              </Card>))
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
      <Card style={{margin: '0 auto', display: 'table', width: '50vw'}}>
        <Card.Content>
          <Form>
            <label>Add Topic:</label>
            <Form.Input type="text" value={this.state.inputTopic} onChange={this.handleTopic} />
            <Button onClick={(e) => this.submitTopic(e, this.state.inputTopic, this.state.room.agenda)}>Send</Button>
          </Form>
        </Card.Content>
      </Card>
    )
  }

  roomIsEmpty = (room) => {
    return Object.keys(room).length === 0 && room.constructor === Object
  }

   /*
    *
    * Timer Components
    *
    */

  startTimer() {
    if (this.state.seconds > 0 && !this.state.timerRunning){
      this.timer = setInterval(this.countDown, 1000);
      this.setState({
        timerRunning: true
      })
    }
  }


  countDown() {
    let seconds = this.state.seconds - 1;
    if (seconds <= 0) {
      this.pauseTimer();
    }

    // Remove one second, set state so a re-render happens.
    this.setState({
      seconds: seconds,
      percent: (seconds / this.state.timerObject.startingSeconds) * 100
    });
  }

  pauseTimer(){
    clearInterval(this.timer);
    this.setState({
      timerRunning: false
    })
  }

  displaySeconds(totalSeconds){
    let seconds = totalSeconds % 60;
    return seconds < 10 ? '0' + seconds : seconds;
  }

  displayMinutes(seconds){
    let mins = Math.floor(seconds / 60);
    return mins;
  }

  convertTimeToSeconds = (timerObject) => {
    return timerObject.minutes * 60 + timerObject.seconds
  }

  startTimer() {
    if (this.state.seconds > 0 && !this.state.timerRunning){
      this.timer = setInterval(this.countDown, 1000);
      this.setState({
        timerRunning: true
      })
    }
  }

  renderTimerButtons = () => {
    return this.state.timerRunning ?
          <Button onClick={this.pauseTimer} color='red'>Pause</Button>
          :
          <Button onClick={this.startTimer} color='blue'>Start</Button>
  }

  renderTimer = () => {
    let currentSpeaker = this.state.room.agenda[0].items[0];
      return(
        <div>
          <Card.Header>
            Current Speaker is {currentSpeaker.name}
          </Card.Header>
          <Header as='h4'>Time Remaining: {this.displayMinutes(this.state.seconds)}:{this.displaySeconds(this.state.seconds)}</Header>
          <Progress percent={this.state.percent} indicating size={'tiny'} style={{width: '50vw'}} />
          {this.renderTimerButtons()}
          <Button onClick={this.handleQueue} color="purple">Skip Speaker</Button>
        </div>
      )
  }

  timerVisible(){
    return this.agendaExists(this.state.room.agenda) && this.state.room.agenda[0].items.length > 0 ;
  }

  renderRoom = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Header as="h2">In room {this.state.room.roomName}</Header>
          <Header as="h4">Expected Duration: {this.state.room.duration} mins</Header>
          <Card style={{margin: '0 auto', display: 'table', width: '50vw'}}>
            <Card.Content>
              <Card.Header>
                <Header as="h2">
                  Meeting Agenda
                </Header>
              </Card.Header>
            </Card.Content>
            { this.timerVisible() && this.renderTimer()}
          </Card>
          {this.renderTopics()}
          {this.renderAddTopicForm()}
          <Form onSubmit={this.handleSubmit}>
            <label>My username:</label>
            <Form.Input type="text" placeholder="Enter your name" value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
          </Form>
        </div>
      )
  }

  passwordMismatch = () => {
    return this.state.inputPassword !== this.state.room.password;
  }

  connectUser = () => {
    this.setState({
      userConnected: true
    })
  }

  submitEntranceForm = (e) => {
    e.preventDefault();

    if (this.state.room.passwordProtected && this.passwordMismatch()){
      this.setState({
        wrongPassword: true,
        inputPassword: ''
      })
    } else {
      this.connectUser()
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

  disableEntranceButton = () => {
    if (this.state.room.passwordProtected){
      return this.state.inputPassword.length === 0 || this.state.username.length === 0;
    } else {
      return this.state.username.length === 0;
    }
  }

  roomHasPassword = () => {
    return this.state.room.passwordProtected;
  }

  renderPasswordField = () => {
    return (<div>
            { this.roomHasPassword()
              &&
              <Form.Input placeholder='Enter the room password' type="password" error={this.state.wrongPassword && this.state.inputPassword.length == 0} name='password' value={this.state.inputPassword} onChange={ (e) => this.handlePassword(e)}/>
            }
            </div>)
  }

  renderJoinText = () => {
    return (<Header as="h2"> Enter your name{this.roomHasPassword() ? " and password ": " "}to join</Header>)
  }

  renderEntranceForm(){
    return (
      <div style={{margin: '0 auto', display: 'table'}}>
        {this.renderJoinText()}
        <Form size={'tiny'} onSubmit={(e) => this.submitEntranceForm(e)} >
          <Form.Group>
            <Form.Input placeholder='Enter your name' name='name' value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
            {this.renderPasswordField()}
            <Form.Button content='Submit' disabled={this.disableEntranceButton()} />
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
      return this.state.userConnected ? <div>{this.renderRoom()}</div> : <div>{this.renderEntranceForm()}</div>
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
