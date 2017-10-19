import { Card, Image, Button } from 'semantic-ui-react'

export default class CurrentUser extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      text: 'Hello World'
    }
  }

  render(){
    return(
      <Card style={{margin: '0 auto', display: 'table', width: '50vw'}}>
        <Card.Content>
          <Image floated='right' size='mini' src='/static/images/daniel.jpg' />
          <Card.Header>
            Current Speaker: Daniel
          </Card.Header>
          <Card.Meta>
            Speaking about Atlassian
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          {this.props.children}
        </Card.Content>
      </Card>
    )
  }
}
