var mongoose = require('mongoose'); // don't need to require mongoose.js

var User = mongoose.model('User', {
    email:{
        type:String,
        required: true,
        trim: true,
        minlength: 1
    }
});

module.exports= {User};