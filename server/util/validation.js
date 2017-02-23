const _ = require('lodash');

var isValidImageExt = (ext)=>{
    var validExt = ['jpg', 'jpeg', 'png'];
    return _.includes(validExt, ext.toLowerCase());
};

module.exports = {
    isValidImageExt
};