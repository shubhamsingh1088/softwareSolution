
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leadForwardSchema = new Schema({
	_id: {
		type: Schema.Types.ObjectId,
		ref: "Lead",
	},
	name: {
		type: String,
		required: true
	},
	number: {
		type: Number,
		required: true
	},
	trade: {
		type: String
	},
	businessType: {
		type: String
	},
	demoDate: {
		type: String
	},
	address: {
		type: String
	},
	represantativeName: {
		type: String,
		required: true
	},
	represantativeNumber: {
		type: String,
		required: true
	},
	remarks: {
		type: String
	},
	created: { 
		type: String,
		default: Date.now
	}
});

var Leadforward = mongoose.model('Leadforward', leadForwardSchema);

module.exports = Leadforward;