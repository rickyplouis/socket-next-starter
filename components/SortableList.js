import { Feed } from 'semantic-ui-react';
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

export default SortableList
