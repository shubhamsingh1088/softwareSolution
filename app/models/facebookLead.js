
var mongoose = require('mongoose');

var leadSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	number: {
		type: Number,
		required: true
	},
	created: { 
		type: String
	}
});

var Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;