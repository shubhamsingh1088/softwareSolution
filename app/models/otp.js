
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OtpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Login",
      required: true
    },
    otp: { type: Number },
    createdOn: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model('Otp', OtpSchema);