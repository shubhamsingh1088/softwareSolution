
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RegistrationSchema = new Schema({
  cName: { type: String, required: true },
  number: { type: String, required: true },
  address: { type: String, required: true },
  serialno: { type: String, required: true },
  finalAmount: { type: String, required: true }
});

module.exports = mongoose.model('RegistrationForm', RegistrationSchema);