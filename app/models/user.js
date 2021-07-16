
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var UserSchema = new Schema({
	name: { type: String, required: true },
	number: { type: Number, required: true, unique: true },
	pincode: { type: String, required: true }
});

UserSchema.plugin(titlize, {
  paths: ['name']
});

module.exports = mongoose.model('User', UserSchema);