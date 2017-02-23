/**
 *
 * @param file
 * @param path the path to save file
 * @param types string containing all allowed types e.g. ['jpg','jpeg','png'] case insensitive
 * @param hash return hashed filename default false
 */

const _ = require('lodash');
const {ObjectID} = require('mongodb');

var saveFile = (file, path, types, hash = true) => {
    return new Promise((resolve, reject) => {
        if (!(file && file.name)) {
            return reject({"error": "file name not provided"});

        }

        let re = /(?:\.([^.]+))?$/;
        let ext = re.exec(file.name)[1]; // get the file extension name

        if (!ext) {
            return reject({"error": "file extension not provided"});

        }

        //if types restriction specified, check if the given file is allowed
        if (types) {
            // if extension name is not contained in the type list
            if (!_.includes(types, ext)) {
                return reject({"error": "file extension not allowed, allowed types " + types.toString()});

            }
        }

        let id = new ObjectID().toString();
        // save the file
        file.mv(path + id + '.' + ext, (err) => {
            if (err) {
                return reject({"error": err});
            }
        });

        resolve({id});

    });
};


module.exports = {
    saveFile
};