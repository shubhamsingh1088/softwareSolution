


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeadCallbackSchema = new Schema({
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
		type: String
	},
	represantativeNumber: {
		type: String
	},
	remarks: {
		type: String
	},
	created: { 
		type: String,
		default: Date.now
	}
});

var Leadcallback = mongoose.model('Leadcallback', LeadCallbackSchema);

module.exports = Leadcallback;