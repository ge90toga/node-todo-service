var mongoose = require('mongoose');

var fileModel = mongoose.model('files', {

    filePath:{
        type: String,
        required: true,
        minLength: 1,
    },

    createdAt: {
        type: Number,
        default: null
    },

    // the user's object id
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

});

module.exports = {fileModel};