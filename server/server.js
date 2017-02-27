require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const fileUpload = require('express-fileupload');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {fileModel} = require('./models/file');

var {authenticate} = require('./middleware/authentication');

// load service
var {saveFile, saveFileInfo} = require('./service/file-service');


var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(fileUpload());

// private route
// user post a todo
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

// private route
// user get all todo list
app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate(
        {_id: id, _creator: req.user._id},
        {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    })
});


// public route, user sign up
// return to user an auth token for future authentication
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    })
});


/**
 * public route, user login with email and password
 * return to user an auth token for future authentication
 */
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

// private route
// return user its infomation
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// private route
// delete user
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});


//image upload
app.post('/upload_img', authenticate, (req, res) => {
    //console.log(req.param('name')); get text form data
    if (!req.files)
        return res.status(400).send({status: "FAIL", error: 'file does not exist'});

    let file = req.files.uploadfile;

    saveFile(file, __dirname + '/public/img/', ['jpg', 'png', 'jpeg']).then((result) => {
        return saveFileInfo(result.id, `/img/${result.id}.${result.ext}`, req.user._id);
    }).then((result) => {
        result.status = 'SUCCESS';
        res.send(result);
    }).catch((err) => {
        console.log(err);
        err.status = 'FAIL';
        return res.status(400).send(err);
    });

});


app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});

module.exports = {app};
