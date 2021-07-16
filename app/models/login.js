
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var saltRounds = 10;
var myPlaintextPassword = 's0/\/\P4$$w0rD';
var someOtherPlaintextPassword = 'not_bacon';
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


var LoginSchema = new Schema({
	// name: { type: String, validate: nameValidator },
	email: { type: String, lowercase: true, unique: true, validate: emailValidator },
	username: { type: String, lowercase: true, unique: true, validate: usernameValidator },
	password: { type: String, select: false },
	number: { type: Number },
  active: { type: Boolean, required: false, default: true },
  permission: { type: String, default: 'telecaller' }
});

LoginSchema.pre('save', function(next) {
	var user = this;
  if (!user.isModified('password')) return next();

	bcrypt.hash(user.password, saltRounds, function(err, hash) {
		if (err) return next(err);
		user.password = hash;
		next();
	});
});


LoginSchema.plugin(titlize, {
  paths: ['name']
});

LoginSchema.methods.comparePassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

// LoginSchema.methods.getPassword = function(password) {
//   return bcrypt.compareSync(myPlaintextPassword, this.password);
// };

module.exports = mongoose.model('Login', LoginSchema, 'logins');