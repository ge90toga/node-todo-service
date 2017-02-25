// create a ToDo model
var mongoose = require('mongoose'); // don't need to require mongoose.js

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },

    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

});

module.exports = {Todo};