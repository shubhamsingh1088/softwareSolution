
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BillFormatSchema = new Schema({
	name: {
		type: String
	},
	image: {
		type: String,
		required: true
	},
	format: {
		type: String,
		required: true
	},
	formatname: {
		type: String,
		required: true
	},
	created: { 
		type: String,
		default: Date.now
	}
});


var BillFormat = mongoose.model('BillFormat', BillFormatSchema);

module.exports = BillFormat;