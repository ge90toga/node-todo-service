var mongoose = require('mongoose');
/**
 * Mongoose lets you start using your models immediately, without waiting for mongoose to establish a connection to MongoDB.
 *
 * Mongoose buffers model function calls internally.
 * This buffering is convenient, but also a common source of confusion.
 * Mongoose will not throw any errors by default if you use a model without connecting.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);


module.exports = {mongoose};