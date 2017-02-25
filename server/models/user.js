const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

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
        decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// find user by email and password
UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        // use bcryptjs to check password matching
        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

// remove a user's token
UserSchema.methods.removeToken = function (token) {
    var user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
};



// define a mongoose pre middleware to hash the plain text password
UserSchema.pre('save', function (next) {
    var user = this;
    // we have to structure like this because without the next() inside hash()
    // the lower next() will be execute first and we won't get the hashed password!
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});


var User = mongoose.model('User', UserSchema);

module.exports = {User};