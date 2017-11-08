const uuidv1 = require('uuid/v1');

export function findTopicIndex (topic, agenda) {
  if (agenda.length == 0){
    return -1
  }
  for (let x = 0; x < agenda.length; x++){
    if (agenda[x].id == topic.id){
      return x;
    }
  }
}

export function deleteTopic(event, topic, agenda){
  return new Promise(function(resolve, reject) {
    event.preventDefault();
    let index = findTopicIndex(topic, agenda);
    let newAgenda = agenda;
    newAgenda.splice(index, 1);
    resolve(newAgenda);
  });
}

export function changeName(event, topic, agenda){
  return new Promise(function(resolve, reject) {
    event.preventDefault();
    let newAgenda = agenda;
    let index = findTopicIndex(topic, agenda);
    newAgenda[index].name = event.target.value
    resolve(newAgenda)
  });
}

export function changeEditStatus(event, topic, agenda){
  return new Promise(function(resolve, reject) {
    event.preventDefault();
    let newAgenda = agenda;
    let index = findTopicIndex(topic, agenda);
    newAgenda[index].editable = !newAgenda[index].editable
    resolve(newAgenda)
  });
}

export function shiftAgenda(agenda){
  return new Promise(function(resolve, reject) {
    let newAgenda = agenda;
    //if agenda topic has items under it then shift items
    if (newAgenda[0].items.length > 1){
      newAgenda[0].items.shift();
    //else shift agenda topic completely
    } else {
      newAgenda.shift();
    }
    resolve(newAgenda)
  });
}

export function addTopic(event, topicName, agenda){
  event.preventDefault();
  return new Promise(function(resolve, reject) {
    let topic = {
      'id': uuidv1(),
      'name': topicName,
      'editable': false,
      'items': []
    }
    let newAgenda = agenda.concat(topic);
    resolve(newAgenda);
  });
}
