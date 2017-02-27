/**
 *
 * @param file
 * @param path the path to save file
 * @param types string containing all allowed types e.g. ['jpg','jpeg','png'] case insensitive
 * @param hash return hashed filename default false
 */

const _ = require('lodash');
const {ObjectID} = require('mongodb');
var {fileModel} = require('../models/file');
var {mongoose} = require('../db/mongoose');


var saveFile = (file, path, types, hash = true) => {
    return new Promise((resolve, reject) => {
        if (!(file && file.name)) {
            reject({"error": "file name not provided"});
            return;
        }

        let re = /(?:\.([^.]+))?$/;
        let ext = re.exec(file.name)[1]; // get the file extension name

        if (!ext) {
            reject({"error": "file extension not provided"});
            return;
        }

        //if types restriction specified, check if the given file is allowed
        if (types) {
            // if extension name is not contained in the type list
            if (!_.includes(types, ext)) {
                reject({"error": "file extension not allowed, allowed types " + types.toString()});
                return;

            }
        }

        let id = new ObjectID().toString();
        // save the file
        file.mv(path + id + '.' + ext, (err) => {
            if (err) {
                reject({"error": err});
                return;
            }
        });

        resolve({id, ext});

    });
};

var saveFileInfo = (id, path, creator) => {
    return new Promise((resolve, reject) => {
        let file = new fileModel({
            filePath: path,
            createdAt: new Date().getTime(),
            _creator: creator
        });

        file.save().then(() => {
            resolve({id});
        }).catch((err) => {
            reject(err);
        });
    });


};


module.exports = {
    saveFile,
    saveFileInfo
};