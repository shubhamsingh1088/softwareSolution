
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CallerIdSchema = new Schema({
	name: { type: String, required: true },
	number: { type: String, required: true }
});

module.exports = mongoose.model('CallerId', CallerIdSchema);