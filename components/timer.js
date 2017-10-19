import { Progress, Header, Input, Button, Label } from 'semantic-ui-react'
export default class Timer extends React.Component {
  constructor() {
    super();
    this.state = {
      time: {},
      seconds: 59,
      initialTime: 0,
      percent: 100,
    };

    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
  }

  secondsToTime(secs){
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      "h": hours,
      "m": minutes,
      "s": seconds
    };
    return obj;
  }

  componentDidMount() {
    let timeLeftVar = this.secondsToTime(this.state.seconds);
    this.setState({ time: timeLeftVar });
  }

  startTimer() {
    if (this.state.seconds > 0){
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    if (this.state.initialTime == 0){
      this.setState({
        initialTime: this.state.seconds
      })
    }
    let seconds = this.state.seconds - 1;

    if (seconds == 0) {
      this.pauseTimer();
    }

    // Remove one second, set state so a re-render happens.
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
      percent: (seconds / this.state.initialTime) * 100
    });

  }

  pauseTimer(){
    clearInterval(this.timer);
  }

  displaySeconds(secs){
    return secs < 10 ? '0' + secs : secs;
  }

  renderTimeInput(){
    return (
      <div>
        <Input labelPosition='left' type='number' placeholder='Mins'>
          <Label basic>Minutes</Label>
          <input />
        </Input>
        <Input labelPosition='left' type='number' placeholder='Seconds'>
          <Label basic>Seconds</Label>
          <input />
        </Input>
      </div>
    )
  }

  //TODO: Input doesn't work so need to incorporate that into the state
  render() {
    return(
      <div >
        <Header as='h4'>Time Remaining: {this.state.m || 0}:{this.displaySeconds(this.state.time.s)}</Header>
        <Progress percent={this.state.percent} indicating size={'tiny'} style={{width: '50vw'}} />
        <Button onClick={this.startTimer} color='blue'>Start</Button>
        <Button onClick={this.pauseTimer} color='red'>Pause</Button>
      </div>
    )
  }
}
