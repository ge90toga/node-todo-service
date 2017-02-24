const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

//override its toJSON method
UserSchema.methods.toJSON = function () {
    var user = this;
    //Returns an object with each property name and value corresponding to the entries in this collection.
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});
    //save the user in db
    return user.save().then(() => {
        // return the token and chain promise if onto this is valid
        return token;
    });
};

// static(model) method
UserSchema.statics.findByToken = function (token) {
    var User = this; //Model method gets called
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        // catch error if token verification fails
        return Promise.reject({e});
    }

    // query
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};



var User = mongoose.model('User', UserSchema);

module.exports = {User}