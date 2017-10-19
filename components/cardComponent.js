import React from 'react'
import { Card, Feed, Header, Icon } from 'semantic-ui-react'
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

export default class CardComponent extends React.Component {
    state = {
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
    };

    onSortEnd = ({oldIndex, newIndex}) => {
      this.setState({
        items: arrayMove(this.state.items, oldIndex, newIndex),
      });
    };


  render(){
    return(
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
              Current Speaker:
            </Header>
            <Feed>
              <Feed.Event>
                <Feed.Label image='/static/images/christian.jpg' />
                <Feed.Content>
                  <Feed.Date content='1 day ago' />
                  <Feed.Summary>
                    You added <a>Christian Smith</a> to your <a>coworker</a> group.
                  </Feed.Summary>
                  {this.props.children}
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
          <SortableList items={this.state.items} onSortEnd={this.onSortEnd} />;
        </Card.Content>
      </Card>
    )
  }
}
