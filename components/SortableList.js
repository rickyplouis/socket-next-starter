import { Feed } from 'semantic-ui-react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';

const SortableItem = SortableElement(({value}) =>
  <Feed.Event>
    <Feed.Label>
      <img src={'/static/images/elephant-avatar.png'} />
    </Feed.Label>
    <Feed.Content>
      <Feed.Summary>
        <Feed.User>{value.name}</Feed.User> will discuss {value.details}
        <Feed.Date>{value.duration} mins</Feed.Date>
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
