

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
	name: { type: String, required: true },
	address: { type: String, required: true },
	gender: { type: String, required: true },
	dob: { type: String, required: true },
	trade: { type: String, required: true },
	aadharNo: { type: String, required: true },
	mobNo: { type: String, required: true },
	whatsappNo: { type: String, required: true },
	areaOI: { type: String, required: true },
	bGroup: { type: String, required: true },
	image: { type: String, required: true }
});

module.exports = mongoose.model('Member', MemberSchema);