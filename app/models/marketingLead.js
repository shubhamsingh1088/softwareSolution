
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var titlize = require('mongoose-title-case');

var MarketingSchema = new Schema({
	name: { type: String, required: true },
	number: { type: Number, required: true, unique: true },
	address: { type: String, required: true },
	contactno: { type: Number },
	oldsoftware: { type: String },
	// trade: { type: String },
	image: { type: String }
});

module.exports = mongoose.model('Marketing', MarketingSchema);