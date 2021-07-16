
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [
  validate({
  	validator: 'matches',
  	arguments: /^(([a-zA-z]{3,20})+[ ]+([a-zA-z]{3,20})+)+$/,
  	message: 'Name Must be atleast 3 characters, max 20, no speacial characters or numbers.'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 20],
    message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

var emailValidator = [
  validate({
  	validator: 'isEmail',
  	message: 'Is not a valid e-mail'
  }),
  validate({
    validator: 'isLength',
    arguments: [8, 55],
    message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];


var usernameValidator = [
  validate({
  	validator: 'isLength',
  	arguments: [3, 25],
  	message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
  	validator: 'isAlphanumeric',
  	message: 'Username must contain letters and numbers only'
  })
];

var passwordValidator = [
  validate({
    validator: 'matches',
    arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
    message: 'Password needs to have atleast one lowercase, one uppercase, one number, one speacial character, atleast 8 characters, but no more than 35'
  }),
  validate({
    validator: 'isLength',
    arguments: [8, 35],
    message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];


var StudentFormSchema = new Schema({

	firstName: { type: String, required: true },
  lastName: { type: String, required: true },
	email: { type: String, required: true, unique: true, validate: emailValidator },
	fatherName: { type: String, required: true },
	contactNo: { type: Number, unique: true, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  pincode: { type: Number, required: true },
  currentAddress: { type: String, required: true }

});

// StudentFormSchema.plugin(titlize, {
//   paths: ['firstName', 'lastName', 'fatherName']
// });

module.exports = mongoose.model('StudentForm', StudentFormSchema);