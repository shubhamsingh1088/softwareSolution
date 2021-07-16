
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TextSchema = new Schema({
	text: { type: String, required: true },
	ttsfilename: { type: String, required: true }
});

module.exports = mongoose.model('Text', TextSchema);