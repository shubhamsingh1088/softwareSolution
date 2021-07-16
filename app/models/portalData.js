
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var portalSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: { type: String },
	number: { type: Number },
	trade: { type: String },
	created: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Portal', portalSchema);