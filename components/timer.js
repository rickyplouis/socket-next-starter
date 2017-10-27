import { Progress, Header, Form , Button, Label } from 'semantic-ui-react'
export default class Timer extends React.Component {
  constructor() {
    super();
    this.state = {
      timeObject: {
        minutes: 2,
        seconds: 5
      },
      inputMins: 0,
      inputSeconds: 0,
      initialTime: 0,
      percent: 100,
      timerRunning: false
    };

    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
  }

  convertTimeToSeconds = (timeObject) => {
    return timeObject.minutes * 60 + timeObject.seconds
  }

  startTimer() {
    if (this.state.seconds > 0 && !this.state.timerRunning){
      this.timer = setInterval(this.countDown, 1000);
      this.setState({
        timerRunning: true
      })
    }
  }

  componentWillMount(){
    this.setState({
      initialTime: this.convertTimeToSeconds(this.state.timeObject),
      seconds: this.convertTimeToSeconds(this.state.timeObject)
    })
  }

  countDown() {
    let seconds = this.state.seconds - 1;
    if (seconds <= 0) {
      this.pauseTimer();
    }

    // Remove one second, set state so a re-render happens.
    this.setState({
      seconds: seconds,
      percent: (seconds / this.state.initialTime) * 100
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

  handleMins = (event) => {
    event.preventDefault();
    this.setState({
      inputMins: parseInt(event.target.value)
    })
  }

  handleSeconds = (event) => {
    event.preventDefault();
    this.setState({
      inputSeconds: parseInt(event.target.value)
    })
  }

  setTimer = () => {
    let totalSeconds = this.state.inputSeconds + this.state.inputMins * 60;
    this.setState({
      initialTime: totalSeconds,
      seconds: totalSeconds
    })
  }

  renderTimeInput = () => {
    return (
      <Form>
        <Form.Group widths={'equal'}>
        <Form.Input labelPosition='left' type='number' placeholder='Mins' onChange={(e) => this.handleMins(e)}>
          <Label basic>Minutes</Label>
          <input />
        </Form.Input>
        <Form.Input labelPosition='left' type='number' placeholder='Seconds' onChange={(e) => this.handleSeconds(e)}>
          <Label basic>Seconds</Label>
          <input />
        </Form.Input>
        </Form.Group>
        <Form.Button onClick={this.setTimer} disabled={(this.state.inputSeconds + this.state.inputMins * 60) === 0} >Set Timer</Form.Button>
      </Form>
    )
  }

  renderTimerButtons = () => {
    if (this.state.timerRunning){
      return (
        <Button onClick={this.pauseTimer} color='red'>Pause</Button>
      )
    } else {
      return (
        <Button onClick={this.startTimer} color='blue'>Start</Button>
      )
    }
  }

  render() {
    return(
      <div>
        <Header as='h4'>Time Remaining: {this.displayMinutes(this.state.seconds)}:{this.displaySeconds(this.state.seconds)}</Header>
        <Progress percent={this.state.percent} indicating size={'tiny'} style={{width: '50vw'}} />
        {this.renderTimerButtons()}
        {this.renderTimeInput()}
      </div>
    )
  }
}
