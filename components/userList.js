import React, {Component} from 'react';
import {render} from 'react-dom';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

import { Feed, Icon } from 'semantic-ui-react'

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

export default class SortableComponent extends Component {
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
  render() {
    return <SortableList items={this.state.items} onSortEnd={this.onSortEnd} />;
  }
}
