
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AssignedLeadSchema = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Login",
	},
	portalDatas: [
      {
        portalId: { type: mongoose.Schema.Types.ObjectId, ref: "Portal" },
        name: String,
        number: Number,
        trade: String
      }
    ],
	created: {
		type: String,
		default: Date.now
	}
});

var AssignedLead = mongoose.model('AssignedLead', AssignedLeadSchema);
module.exports = AssignedLead;