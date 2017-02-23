const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '58ae47f58cd2f35ff60203b1a';

if (!ObjectID.isValid(id)) {
  console.log('ID not valid');
}

Todo.findById(id).then((todo) => {
  if (!todo) {
    console.log('Id not found');
  }
  console.log('Todo By Id', todo);
}, (e)=>{
    console.log(e)
});