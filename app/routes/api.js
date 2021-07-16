
var userid = 'sudhir';
var password = 'marg@sudhir#1985';
var senderid = 'SOFSOL';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jwt = require('jsonwebtoken');
var secret = 'harry potter';
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var morgan = require('morgan');
var fs = require('fs');
var http = require('http');
var https = require('https');
var session = require('express-session');
var path = require('path');
var MongoStore = require('connect-mongo')(session);
var qs = require('querystring');
var request = require('request');
var csv = require('fast-csv');
var fileUpload = require('express-fileupload');
var request = require('request');
var AdmZip = require('adm-zip');
var uploadDir = fs.readdirSync(__dirname+"/setup");

var multer = require('multer');
var uploads = multer({ dest: 'uploads/' });

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

var upload = multer({ storage : storage });
var cpUpload = upload.fields([{ name: 'format', maxCount: 1 }, { name: 'image', maxCount: 1 }]);

var Login = require('../models/login');
var User = require('../models/user');
var Otp = require('../models/otp');
var Leadforward = require('../models/leadForward');
var Leadcallback = require('../models/leadCallback');
var Text = require('../models/text');
var CallerId = require('../models/callerid');
var Marketing = require('../models/marketingLead');
var BillFormat = require('../models/billFormat');
var Portal = require('../models/portalData');
var Lead = require('../models/facebookLead');
var Member = require('../models/memberModel');
var RegistrationForm = require('../models/registrationForm');
var portalTemplate = require('../routes/portalTemplate');
var QRCode = require('qrcode');
var StudentForm = require('../models/studentForm');
var UpdatePortal = require('../models/updatedPortalData');
var AssignedLead = require('../models/assignedLead');

module.exports = function(router, app) {

	// Webhooks api

	router.use(fileUpload());

	router.get('/webhook', function(req, res) {
		console.log(req.query);
		var challenge = req.query['hub.challenge'],
		verify_token = req.query['hub.verify_token'];
		if (verify_token === 'abc123.') {
			res.send(challenge);
			console.log(challenge);
		}
	});

	// MargSetup download 

	router.get('/margSetup', (req, res) => {
		const zip = new AdmZip();

		for(var i = 0; i < uploadDir.length;i++){
			zip.addLocalFile(__dirname+"/setup/"+uploadDir[i]);
		}

		const downloadName = `MARGERPSETUP.exe.zip`;
		const data = zip.toBuffer();

		res.set('Content-Type','application/octet-stream');
		res.set('Content-Disposition',`attachment; filename=${downloadName}`);
		res.set('Content-Length',data.length);
		res.send(data);
	});

	router.post('/studentForm', function(req, res) {

		var firstName = req.body.firstName;
		var lastName = req.body.lastName;
		var email = req.body.email;
		var fatherName = req.body.fatherName;
		var contactNo = req.body.contactNo;
		var gender = req.body.gender;
		var dob = req.body.dob;
		var pincode = req.body.pincode;
		var currentAddress = req.body.currentAddress;

		StudentForm.bulkWrite([
			{ insertOne : { "document": { "firstName": firstName, "lastName": lastName, "email": email,
			"fatherName": fatherName, contactNo: contactNo, "gender": gender, "dob": dob, "pincode": pincode,
			"currentAddress": currentAddress } } }
			], function(err, result) {
				if (err) {
					if (err.code == 11000) {
						res.send({ success: false, message: 'Email or Number is already taken' });
					} else {
						res.send(err);
					}
				} else {
					res.status(200).send({ success: true, message: "Your Form Has Been Successfully Submitted" });
				}
			});

	});

	router.get('/studentFormData', function(req, res) {
		StudentForm.find({}, function(err, data) {
			if (err) throw err;
			if (!data) {
				res.send({ success: false, message: "No data found" });
			} else {
				res.json({ success: true, data: data });
			}
		});
	});

	// Otp Api's -----

	router.post('/otp', function(req, res) {
		var user = req.body.user;
		var otp = req.body.otp;

		Otp.bulkWrite([
			{ insertOne: { "document": { "user": user, "otp": otp } } }
			], function(err, result) {
				if (err) {
					res.send(err);
			} else {
				res.json({ success: true, result: "OTP has been sent successfully" });
			}
		});
	});

	router.post('/registrationForm', function(req, res) {
		var cName = req.body.cName;
		var number = req.body.number;
		var address = req.body.address;
		var serialno = req.body.serialno;
		var finalAmount = req.body.finalAmount;

		RegistrationForm.bulkWrite([
			{ insertOne: { "document": { "cName": cName, "number": number, "address": address,
			"serialno": serialno, "finalAmount": finalAmount } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send("Your Form Has Been Successfully Submitted");
				}
			});

	});

	var qrOption = { 
		margin : 7,
		width : 275
	};

	router.get('/qrcode', function(err, res) {
		QRCode.toDataURL('http://softwaresolution.co/registrationForm', qrOption, function (err, url) {
			res.send(url);
		});
	});

	router.post('/sendTextToAdmin', function(req, res) {

		var cName = req.body.cName;
		var number = req.body.number;
		var address = req.body.address;
		var serialno = req.body.serialno;
		var finalAmount = req.body.finalAmount;

		var options = {
			method: 'GET',
			url: 'http://shubhsms.com/api',
			qs: { 
				userid: userid,
				password: password,
				senderid: senderid,
				mobno: '7771012366',
				msg: ' Company Name: ' + cName + ',' + ' Number: ' + number + ',' + ' address: ' + address + ',' +
				 ' serialno: ' + serialno + ' finalAmount: ' + finalAmount,
				route: '4',
				duplicateCheck: 'true',
				format: 'json'
			},
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded' }
		}

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.send('successfully sent msg to admin');
			}
		});

	});

	router.get('/registrationForm', function(req, res) {
		RegistrationForm.find({}, function(err, result) {
			if (err) throw err;
			if (!result) {
				res.json({ success: false, message: 'No result found' });
			} else {
				res.json({ success: true, result: result });
			}
		});
	});

	router.post('/sendOtpToAdmin', function(req, res) {
		var otp = req.body.otp;

		var options = {
			method: 'GET',
			url: 'http://shubhsms.com/api',
			qs: {
				userid: userid,
				password: password,
				senderid: senderid,
				mobno: '7771012366',
				msg: otp,
				route: '4',
				duplicateCheck: 'true',
				format: 'json'
			},
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded' }
		}

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.send('successfully sent otp to admin');
			}
		});
	});

	// Portal Leads Api

	router.get('/portalTemplate', portalTemplate.get);

	router.post('/portalLead', function(req, res) {
		if (!req.files)
		return res.status(400).send('No files were uploaded.');

		var portalFile = req.files.file;
		var portals = [];

		csv
		.fromString(portalFile.data.toString(), {
			headers: true,
			ignoreEmpty: true
		})
		.on("data", function(data){
			data['_id'] = new mongoose.Types.ObjectId();
			portals.push(data);
		})
		.on("end", function(){
			Portal.create(portals, function(err, documents) {
				if (err) {
					if (err.code == 11000) {
						res.json({ success: false, message: 'There is some dublicate data in your file, Check for dublicate Phone numbers'});
					} else {
						res.json({ success: false, message: err });
					}
				} else {
					return res.json({ success: true, message: "Your Data Is Uploaded Successfully" });
				}
			});
		});
	});

	router.get('/getPortalLead', function(req, res) {
		Portal.find({}, function(err, portalLead) {
			if (err) throw err;
			if (!portalLead) {
				res.json({ success: false, message: 'No lead found' });
			} else {
				res.json({ success: true, portalLead: portalLead });
			}
		});
	});

	router.post('/deletePortalLead', function(req, res) {
		var portalLead = req.body.data;
		Portal.bulkWrite([
			{ deleteOne : { "filter": {} } }
		], function(err, result) {
			if (err) {
				res.send(err);
			} else {
				res.send('Successfully Deleted Leads');
			}
		});
	});

	router.post('/assignedLead', function(req, res) {
		var userId = req.body.userId;
		var portalId = req.body.portalId;
		var name = req.body.name;
		var number = req.body.number;
		var trade = req.body.trade;

		AssignedLead.create({
			userId,
			portalDatas: [{ portalId, name, number, trade }]
		});
	});

	router.get('/allAssignedLead', function(req, res) {
		AssignedLead.find({}, function(err, assignedLead) {
			if (err) throw err;
			if (!assignedLead) {
				res.json({ success: false, message: 'No Assigned Leads Found' });
			} else {
				res.status(200).json({ success: true, assignedLead: assignedLead });
			}
		});
	});

	router.get('/getSinglePortalLead/:id', function(req, res) {
		var assignedLeadId = req.params.id;
		AssignedLead.findOne({ _id: assignedLeadId }, function(err) {
			if (err) throw err;
			else AssignedLead.findOne({ _id: assignedLeadId }, function(err, singleData) {
				if (err) throw err;
				else {
					res.json({ success: true, singleData: singleData });
				}
			});
		});
	});

	router.post('/updatePortalLead', function(req, res) {
		var _id = req.body._id;
		var name = req.body.name;
		var number = req.body.number;
		var address = req.body.address;
		var represantativeName = req.body.represantativeName;
		var represantativeNumber = req.body.represantativeNumber;
		var remarks = req.body.remarks;
		var demoDate = req.body.demoDate;
		var trade = req.body.trade;
		var businessType = req.body.businessType;

		UpdatePortal.bulkWrite([
			{ insertOne: { "document": { "_id": _id, "name": name, "number": number, "address": address, "represantativeName": represantativeName, "represantativeNumber": represantativeNumber, "remarks": remarks, "demoDate": demoDate,
			"trade": trade, "businessType": businessType } } }
			], function(err, result) {
				if (err) throw err;
				else if (err) {
					if (err.code == 11000) {
						res.send({ success: false, message: 'This Party is already Contacted' });
					} else {
						res.send({ success: false, message: err });
					}
				} else {
					res.json({ success: true, result: result });
				}
			});
	});

	router.get('/getUpdatedLead', function(req, res) {
		UpdatePortal.find({}, function(err, result) {
			if (err) throw err;
			if (!result) {
				res.json({ success: false, message: "No result found" });
			} else {
				return res.status(200).json({ success: true, result: result });
			}
		});
	});

	router.post('/deleteUsedPortalLead', function(req, res) {
		var _id = req.body._id;
		AssignedLead.bulkWrite([
			{ deleteOne : { "filter": { "_id": _id } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send('Lead Deleted');
				}
			});
	});

	// BillFormat Api's

	router.post('/billFormat', cpUpload, function(req, res) {

		var image = req.files.image[0].path;
		var format = req.files.format[0].path;
		var formatname = req.files.format[0].filename;
		var name = req.body.name;

		BillFormat.bulkWrite([
			{ insertOne: {"document": { "name": name, "image": image, "format": format, "formatname": formatname } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					// res.send("File Uploaded Successfully, Click Back Button to go back to form");
					return res.redirect('back');
				}
			});

	});

	router.get('/billFormat', function(req, res) {
		BillFormat.find({}, function(err, billFormat) {
			if (err) throw err;
			if (!billFormat) {
				res.json({ success: false, message: 'No billFormat found' });
			} else {
				res.json({ success: true, billFormat: billFormat });
			}
		});
	});

	router.get('/getSelectedFormat/:formatId', function(req, res) {
		var formatId = req.params.formatId;
		BillFormat.findOne({ _id: formatId }, function(err) {
			if (err) throw err;
			else {
				BillFormat.findOne({ _id: formatId }, function(err, results) {
					if (err) {
						res.json({ success: false, message: 'No format found' });
					} else {
						return res.json({ success: true, results: results });
					}
				});
			}
		});
	});
	
	router.post('/downloadFormat', function(req, res) {
		var format = req.body.billFormat;
		var file = __dirname + '/' + format;
		res.download(file);
	});

	router.post('/deleteOtp', function(req, res) {
		var _id = req.body.id;
		Otp.bulkWrite([
			{ deleteOne : { "filter" : { "_id": _id} } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send('Otp Deleted');
				}
			}
		);
	});

	// Forms Leads

	router.post('/users', function(req, res) {

		var name = req.body.name;
		var number = req.body.number;
		var pincode = req.body.pincode;

		User.update(
			{number: req.body.number},
			{"name": name, "number": number, "pincode": pincode},
			{upsert: true},
			function(err, result) {
				if (err) {
					res.send('err');
				} else {
					res.send('Your Form is successfully submitted');
				}
			}
		);
	});

	//Marketing Leads

	router.post('/marketing', uploads.single('file'), function(req, res) {

		var name = req.body.name;
		var number = req.body.number;
		var address = req.body.address;
		var contactno = req.body.contactno;
		var oldsoftware = req.body.oldsoftware;
		// var trade = req.body.trade;
		var image = req.file.path;

		Marketing.bulkWrite([
			{ insertOne : { "document": { "name": name, "number": number, "address": address, "contactno": contactno, "oldsoftware": oldsoftware, "image": image } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send("File Uploaded Successfully, Click Back Button to go back to form");
				}
			});
	});

	router.post('/member', uploads.single('file'), function(req, res) {
		var name = req.body.name;
		var address = req.body.address;
		var gender = req.body.gender;
		var dob = req.body.dob;
		var trade = req.body.trade;
		var aadharNo = req.body.aadharNo;
		var mobNo = req.body.mobNo;
		var whatsappNo = req.body.whatsappNo;
		var areaOI = req.body.areaOI;
		var bGroup = req.body.bGroup;
		var image = req.file.path;

		Member.bulkWrite([
			{ insertOne : { "document": { "name": name, "address": address, "gender": gender, "dob": dob,
			 "trade": trade, "aadharNo": aadharNo, "mobNo": mobNo, "whatsappNo": whatsappNo, "areaOI": areaOI,
			 "bGroup": bGroup, "image": image } } }
			], function(err, result) {
				if (err) {
					res.send("new error");
				} else {
					res.send("File Uploaded Successfully, Click Back Button to go back to form");
				}
			}
		);
	});

	router.get('/marketing', function(req, res) {
		Marketing.find({}, function(err, marketing) {
			if (err) throw err;
			if (!marketing) {
				res.json({ success: false, message: 'No lead found' });
			} else {
				res.json({ success: true, marketing: marketing });
			}
		});
	});

	router.post('/leadInputUpload', function(req, res) {

		var name = req.body.name;
		var number = req.body.number;
		var created = req.body.created;

		Lead.bulkWrite([
			{ insertOne : { "document": { "name": name, "number": number, "created": created } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.json({ result: result, message: "Lead Is Successfully Forwarded" });
				}
			});
	});

	// Leads api Starts From Here

	router.get('/getLeads', function(req, res) {
		Lead.find({}, function(err, leads) {
			if (err) throw err;
			if (!leads) {
				res.json({ success: false, message: 'No lead found' });
			} else {
				res.json({ success: true, leads: leads });
			}
		});
	});

	router.get('/getSelectedLead/:id', function(req, res) {
		var lead = req.params.id;
		Lead.findOne({ _id: lead }, function(err) {
			if (err) throw err;
			else Lead.findOne({ _id: lead }, function(err, lead) {
				if (err) throw err;
				else {
					res.json({ success: true, lead: lead });
				}
			});
		});
	});

	router.get('/getWebSelectedLead/:id', function(req, res) {
		var webLead = req.params.id;
		User.findOne({ _id: webLead }, function(err) {
			if (err) throw err;
			else User.findOne({ _id: webLead }, function(err, webLead) {
				if (err) throw err;
				else {
					res.json({ success: true, webLead: webLead });
				}
			});
		});
	});

	router.post('/forwardLeads', function(req, res) {

		var _id = req.body._id;
		var name = req.body.name;
		var number = req.body.number;
		var address = req.body.address;
		var represantativeName = req.body.represantativeName;
		var represantativeNumber = req.body.represantativeNumber;
		var remarks = req.body.remarks;
		var demoDate = req.body.demoDate;
		var trade = req.body.trade;
		var businessType = req.body.businessType;

		Leadforward.bulkWrite([
			{ insertOne : { "document": { "_id": _id, "name": name, "number": number, "address": address, 
			"represantativeName": represantativeName, "represantativeNumber": represantativeNumber, "remarks": remarks, 
			"demoDate": demoDate, "trade": trade, "businessType": businessType } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.json({ result: result, message: "Lead Is Successfully Forwarded" });
				}
			});

	});

	router.get('/getForwardLeads', function(req, res) {

		Leadforward.find({}, function(err, forwardLeads) {
			if (err) throw err;
			if (!forwardLeads) {
				res.json({ success: false, message: 'No forwardLeads found' });
			} else {
				res.json({ success: true, forwardLeads: forwardLeads });
			}
		});

	});

	router.get('/getSelectedForwardLead/:id', function(req, res) {

		var lead = req.params.id;
		Leadforward.findOne({ _id: lead }, function(err) {
			if (err) throw err;
			else Leadforward.findOne({ _id: lead }, function(err, forwardLead) {
				if (err) throw err;
				else {
					res.json({ success: true, forwardLead: forwardLead });
				}
			});
		});

	});

	router.get('/todaysDemo', function(req, res) {

		var todaysDate = new Date().toDateString();
		Leadforward.find({ demoDate: { $gte: new Date(todaysDate),
			$lt: new Date(todaysDate + 1) } }, function(err, todaysDemo) {
				if (err) throw err;
				if (!todaysDemo) {
					res.send('no forwardLead found');
				} else {
					res.json({ success: true, todaysDemo: todaysDemo });
				}
			}
		);
		
	});

	router.post('/deleteLeadFromLeads', function(req, res) {

		var _id = req.body._id;
		Lead.bulkWrite([
			{ deleteOne : { "filter" : { "_id" : _id} } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send('Lead Deleted');
				}
			});
	});

	router.post('/deleteWebLeadFromLeads', function(req, res) {

		var _id = req.body._id;
		User.bulkWrite([
			{ deleteOne : { "filter" : { "_id" : _id } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send('Lead Deleted');
				}
			});
	});

	router.post('/callbackLeads', function(req, res) {

		var _id = req.body._id;
		var name = req.body.name;
		var number = req.body.number;
		var address = req.body.address;
		var represantativeName = req.body.represantativeName;
		var represantativeNumber = req.body.represantativeNumber;
		var trade = req.body.trade;
		var businessType = req.body.businessType;

		Leadcallback.bulkWrite([
			{ insertOne : { "document": { "_id": _id, "name": name, "number": number, "address": address, 
			"represantativeName": represantativeName, "represantativeNumber": represantativeNumber, "trade": trade, 
			"businessType": businessType } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.json({ result: result, message: "Lead Is Successfully Forwarded" });
				}
			});

	});

	router.get('/getCallbackLeads', function(req, res) {

		Leadcallback.find({}, function(err, callbackLeads) {
			if (err) throw err;
			if (!callbackLeads) {
				res.json({ success: false, message: 'No callbackLeads found' });
			} else {
				res.json({ success: true, callbackLeads: callbackLeads });
			}
		});

	});

	router.post('/updateCallbackLeads', function(req, res) {

		var _id = req.body._id;
		var address = req.body.address;
		var represantativeName = req.body.represantativeName;
		var represantativeNumber = req.body.represantativeNumber;
		var trade = req.body.trade;
		var remarks = req.body.remarks;
		var demoDate = req.body.demoDate;
		var businessType = req.body.businessType;

		Leadforward.update(
			{_id: req.body._id},
			{"represantativeName": represantativeName, "represantativeNumber": represantativeNumber, "remarks": remarks, 
			"demoDate": demoDate, "trade": trade, "address": address, "businessType": businessType },
			{upsert: true},
			function(err, result) {
				if (err) {
					res.send('err');
				} else {
					res.send('Your Form is successfully Updated');
				}
			}
		);
	});

	router.post('/deleteLeadFromCallback', function(req, res) {

		var _id = req.body._id;
		Leadforward.bulkWrite([
			{ deleteOne : { "filter" : { "_id" : _id} } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send('Lead Deleted');
				}
			}
		);
	});

	// Calling api Starts From Here

	router.post('/saveVoiceCall', function(req, res) {

		var text = req.body.text;
		var ttsfilename = req.body.ttsfilename;

		Text.update(
			{text: text},
			{"text": text, "ttsfilename": ttsfilename},
			{upsert: true},
			function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send('Voice message Added');
				}
			}
		);

	});

	router.get('/getVoiceCall', function(req, res) {

		Text.find({}, function(err, text) {
			if (err) throw err;
			if (!text) {
				res.json({ success: false, message: 'No matter found' });
			} else {
				res.json({ success: true, text: text });
			}
		});

	});

	router.get('/getSelectedVoiceCall/:ttsfilename', function(req, res) {

		var selectedVoiceCall = req.params.ttsfilename;

		Text.find({ ttsfilename: selectedVoiceCall }, function(err, selectedtext) {
			if (err) throw err;
			if (!selectedtext) {
				res.json({ success: false, message: 'No matter found' });
			} else {
				res.json({ success: true, selectedtext: selectedtext });
			}
		});

	});

	router.delete('/deleteSelectedVoiceCall/:ttsfilename', function(req, res) {
		var selectedVoiceCall = req.params.ttsfilename;

		Text.find({ ttsfilename: selectedVoiceCall }, function(err, text) {
			if (err) throw err;
			if (!text) {
				res.json({ success: false, message: 'No matter text found' });
			} else {
				Text.findOneAndRemove({ ttsfilename: selectedVoiceCall }, function(err, matter) {
					if (err) {
						res.send(err);
					} else {
						res.json({ success: true });
					}
				});
			}
		});
	});

	router.post('/saveCallerId', function(req, res) {
		var name = req.body.name;
		var number = req.body.number;

		CallerId.bulkWrite([
			{ insertOne : { "document": { "name": name, "number": number } } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.json({ result: result, message: "CallerId Is Saved Successfully" });
				}
			}
		);

	});

	router.get('/getCallerId', function(req, res) {
		CallerId.find({}, function(err, callerid) {
			if (err) throw err;
			if (!callerid) {
				res.json({ success: false, message: 'No callerid found' });
			} else {
				res.json({ success: true, callerid: callerid });
			}
		});
	});

	router.get('/getSelectedCallerId/:number', function(req, res) {

		var selectedNumber = req.params.number;

		CallerId.find({ number: selectedNumber }, function(err, selectednumber) {
			if (err) throw err;
			if (!selectednumber) {
				res.json({ success: false, message: 'No selectednumber found' });
			} else {
				res.json({ success: true, selectednumber: selectednumber });
			}
		});

	});


	router.post('/sendVoiceCall', function(req, res) {

		var mobno = req.body.numbers;
		var text = req.body.text;
		var callerid = req.body.callerid;

		var options = {
			method: 'POST',
			url: 'https://shubhsms.com/apivoice/ttscall',
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded', 'cache-control': 'no-cache' },
			form: {
				userid: userid,
				password: password,
				callerid: callerid,
				mobile: mobno,
				text: text,
				language: '3',
				duplicateCheck: 'true',
				format: 'json'
			}
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.json({ response: response });
			}
		});

	});

	router.post('/sendPharmaVoiceCall', function(req, res) {

		var mobno = req.body.numbers;
		var text = req.body.text;
		var callerid = req.body.callerid;

		var options = {
			method: 'POST',
			url: 'https://shubhsms.com/apivoice/ttscall',
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded', 'cache-control': 'no-cache' },
			form: {
				userid: userid,
				password: password,
				callerid: callerid,
				mobile: mobno,
				text: text,
				language: '3',
				duplicateCheck: 'true',
				format: 'json'
			}
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.json({ response: response });
			}
		});

	});

	router.post('/sendFmcgVoiceCall', function(req, res) {

		var mobno = req.body.numbers;
		var text = req.body.text;
		var callerid = req.body.callerid;

		var options = {
			method: 'POST',
			url: 'https://shubhsms.com/apivoice/ttscall',
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded', 'cache-control': 'no-cache' },
			form: {
				userid: userid,
				password: password,
				callerid: callerid,
				mobile: mobno,
				text: text,
				language: '3',
				duplicateCheck: 'true',
				format: 'json'
			}
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.json({ response: response });
			}
		});

	});

	router.post('/sendReadymadeVoiceCall', function(req, res) {

		var mobno = req.body.numbers;
		var text = req.body.text;
		var callerid = req.body.callerid;

		var options = {
			method: 'POST',
			url: 'https://shubhsms.com/apivoice/ttscall',
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded', 'cache-control': 'no-cache' },
			form: {
				userid: userid,
				password: password,
				callerid: callerid,
				mobile: mobno,
				text: text,
				language: '3',
				duplicateCheck: 'true',
				format: 'json'
			}
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.json({ response: response });
			}
		});

	});

	router.post('/sendJewelleryVoiceCall', function(req, res) {

		var mobno = req.body.numbers;
		var text = req.body.text;
		var callerid = req.body.callerid;

		var options = {
			method: 'POST',
			url: 'https://shubhsms.com/apivoice/ttscall',
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded', 'cache-control': 'no-cache' },
			form: {
				userid: userid,
				password: password,
				callerid: callerid,
				mobile: mobno,
				text: text,
				language: '3',
				duplicateCheck: 'true',
				format: 'json'
			}
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.json({ response: response });
			}
		});

	});

	router.get('/tradeRetailPharmacyCustomers', function(req, res) {
		Leadforward.find({ trade: { $eq: "pharma retail" } }, function(err, pharma) {
			if (err) throw err;
			if (!pharma) {
				res.json({ success: false, message: 'No pharma customer found' });
			} else {
				res.json({ success: true, pharma: pharma });
			}
		});
	});
	router.get('/tradeWholesalePharmacyCustomers', function(req, res) {
		Leadforward.find({ trade: { $eq: "pharma wholesale" } }, function(err, pharma) {
			if (err) throw err;
			if (!pharma) {
				res.json({ success: false, message: 'No pharma customer found' });
			} else {
				res.json({ success: true, pharma: pharma });
			}
		});
	});

	router.get('/tradeRetailfmcgCustomers', function(req, res) {
		Leadforward.find({ trade: { $eq: "fmcg retail" } }, function(err, fmcg) {
			if (err) throw err;
			if (!fmcg) {
				res.json({ success: false, message: 'No fmcg customer found' });
			} else {
				res.json({ success: true, fmcg: fmcg });
			}
		});
	});

	router.get('/tradeWholesalefmcgCustomers', function(req, res) {
		Leadforward.find({ trade: { $eq: "fmcg wholesale" } }, function(err, fmcg) {
			if (err) throw err;
			if (!fmcg) {
				res.json({ success: false, message: 'No fmcg customer found' });
			} else {
				res.json({ success: true, fmcg: fmcg });
			}
		});
	});

	router.get('/tradereadymadeCustomers', function(req, res) {
		Leadforward.find({ trade: { $eq: "readymade garments" } }, function(err, readymade) {
			if (err) throw err;
			if (!readymade) {
				res.json({ success: false, message: 'No readymade customer found' });
			} else {
				res.json({ success: true, readymade: readymade });
			}
		});
	});

	router.get('/tradejewelleryCustomers', function(req, res) {
		Leadforward.find({ trade: { $eq: "jewellery" } }, function(err, jewellery) {
			if (err) throw err;
			if (!jewellery) {
				res.json({ success: false, message: 'No jewellery customer found' });
			} else {
				res.json({ success: true, jewellery: jewellery });
			}
		});
	});

	router.delete('/tradeCustomers', function(req, res) {
		Leadforward.find({}, function(err) {
			if (err) throw err;
			else {
				Leadforward.deleteMany({}, function(err, user) {
					if (err) throw err;
					res.json({ success: true });
				});
			}
		});
	});

	

	// BulkSms Api For website Leads and User Saved

	router.post('/users', function(req, res) {

		var name = req.body.name;
		var number = req.body.number;
		var pincode = req.body.pincode;

		User.update(
			{number: req.body.number},
			{"name": name, "number": number, "pincode": pincode},
			{upsert: true},
			function(err, result) {
				if (err) {
					res.send('err');
				} else {
					res.send('Your Form is successfully submitted');
				}
			}
		);
	});

	router.post('/sendSms', function(req, res) {

		var mobno = req.body.number;

		var options = {
			method: 'GET',
			url: 'http://shubhsms.com/api',
			qs: { 
				userid: userid,
				password: password,
				senderid: senderid,
				mobno: mobno,
				msg: 'Thank you for regestering in Software Solution, You can call us at - ' + ' Number: ' + 7611111174 + ' or ' + 
				'Landline: ' + '0771-4089645',
				route: '4',
				duplicateCheck: 'true',
				format: 'json'
			},
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded' }
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.send(response);
			}
		});

	});

	router.post('/sendSmsToData', function(req, res) {

		var mobno = req.body.number;

		var options = {
			method: 'GET',
			url: 'http://shubhsms.com/api',
			qs: { 
				userid: userid,
				password: password,
				senderid: senderid,
				mobno: mobno,
				msg: 'This message is from software solutions.'<br>' visit our website:-' + 'http://softwaresolution.co',
				route: '4',
				duplicateCheck: 'true',
				format: 'json'
			},
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded' }
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.send(response);
			}
		});

	});

	router.post('/deleteFormData', function(req, res) {

		var _id = req.body._id;
		User.bulkWrite([
			{ deleteOne : { "filter" : { "_id" : _id} } }
			], function(err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send('Lead Deleted');
				}
			}
		);
	});

	router.post('/sendSmsToSalesPerson', function(req, res) {

		var mobno = req.body.represantativeNumber;
		var name = req.body.name;
		var number = req.body.number;
		var address = req.body.address;
		var represantativeName = req.body.represantativeName;
		var represantativeNumber = req.body.represantativeNumber;
		var remarks = req.body.remarks;
		var demoDate = req.body.demoDate;
		var businessType = req.body.businessType;

		var options = {
			method: 'GET',
			url: 'http://shubhsms.com/api',
			qs: { 
				userid: userid,
				password: password,
				senderid: senderid,
				mobno: represantativeNumber,
				msg: ' Lead name: ' + name + ',' + ' Number: ' + number + ',' + ' address: ' + address + ',' + ' remarks: ' + remarks + ',' + ' demoDate: ' + demoDate + ',' + ' businessType: ' + businessType,
				route: '4',
				duplicateCheck: 'true',
				format: 'json'
			},
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded' }
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.send(response);
			}
		});

	});

	router.post('/sendSmsToLeadCustomer', function(req, res) {
		var name = req.body.name;
		var number = req.body.number;
		var address = req.body.address;
		var represantativeName = req.body.represantativeName;
		var represantativeNumber = req.body.represantativeNumber;
		var demoDate = req.body.demoDate;

		var options = {
			method: 'GET',
			url: 'http://shubhsms.com/api',
			qs: { 
				userid: userid,
				password: password,
				senderid: senderid,
				mobno: number,
				msg: 'Hello' + name + ' ' + 'Greeting from Marg ERP! Your onsite Demo has been scheduled! On: ' + demoDate + ' ' + ' Our team will get you through the Software Online Demo.',
				route: '4',
				duplicateCheck: 'true',
				format: 'json'
			},
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded' }
		};

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.send(response);
			}
		});
	});

	router.post('/sendSmsToAdmin', function(req, res) {

		var number = req.body.number;
		var name = req.body.name;
		var pincode = req.body.pincode;

		var options = {
			method: 'GET',
			url: 'http://shubhsms.com/api',
			qs: { 
				userid: userid,
				password: password,
				senderid: senderid,
				mobno: '8839688474',
				msg: ' Name: ' + name + ',' + ' Number: ' + number + ',' + ' pincode: ' + pincode,
				route: '4',
				duplicateCheck: 'true',
				format: 'json'
			},
			headers: { 'content-type': 'routerlication/x-www-form-urlencoded' }
		}

		request(options, function (error, response) {
			if (error) {
				console.log(error);
			} else {
				res.send('successfully sent msg to admin');
			}
		});

	});

	var options = {
		auth: {
			api_user: 'shubham9584',
			api_key: 'lm109584.'
		}
	}

	var client = nodemailer.createTransport(sgTransport(options));

	// user registration route

	router.post('/login', function(req, res) {
		var login = new Login();
		// login.name = req.body.name;
		login.email = req.body.email;
		login.username = req.body.username;
		login.password = req.body.password;
		login.number = req.body.number;

		if (req.body.username == null || req.body.username == '' || req.body.email == null || req.body.email == '' || 
			req.body.number == null || req.body.number == '' || req.body.password == null || req.body.password == '') {
			res.json({ success: false, message: 'Ensure if every detail were provided' });
		} else {
			login.save(function(err, login) {
				if (err) {
					if (err.errors != null) {
						if (err.errors.name) {
							return res.send({ success: false, message: err.errors.name.message });
						} else if (err.errors.email) {
							return res.send({ success: false, message: err.errors.email.message });
						} else if (err.errors.username) {
							return res.send({ success: false, message: err.errors.username.message });
						} else if (err.errors.password) {
							return res.send({ success:false, message: err.errors.password.message });
						} else {
							return res.send({ success: false, message: err });
						}
					} else if (err) {
						if (err.code == 11000) {
							return res.send({ success: false, message: 'username or email or number is already taken' });
						} else {
							res.send({ success: false, message: err });
						}
					}
				} else {
					return res.status(200).json({ success:true, message: 'Account registered! Now you can login' });
				}
			});
		}
	});

	// user login route

	router.post('/authenticate', function(req, res) {
		Login.findOne({ username: req.body.username }).select('email username password number _id active').exec(function(err, user) {
			if (err) {
				return res.status(500).json(err);
			}
			if (!user) {
				return res.send({ success: false, message: 'Could not authenticate user' });
			} else if (user) {
				if (req.body.password) {
					var validPassword = user.comparePassword(req.body.password);
				} else {
					return res.send({ success: false, message: 'No password provided' });
				}
				if (!validPassword) {
					return res.send({ success: false, message: 'Could not authenticate password' });
				} else {
					var token = jwt.sign({ username: user.username, email: user.email, number: user.number, _id: user._id }, secret);
					return res.status(200).json({ success: true, message: 'User authenticated', token: token });
				}
			}
		});
	});

	router.use(function(req, res, next) {
		var token = req.body.token || req.body.query || req.headers['x-access-token'];

		if (token) {
			// verify token
			jwt.verify(token, secret, function(err, decoded) {
				if (err) {
					res.json({ success: false, message: 'Token invalid' });
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else {
			res.json({ success: false, message: 'No token provided' });
		}
	});

	router.post('/me', function(req, res) {
		res.send(req.decoded);
	});

	router.get('/permission', function(req, res) {
		Login.findOne({ username: req.decoded.username }, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.send({ success: false, message: 'No user was found' });
			} else {
				res.json({ success: true, permission: user.permission });
			}
		});
	});

	router.get('/getTeleCallerPermission', function(req, res) {
		Login.aggregate([
			{ $match: { "permission": "telecaller" } }
			], function(err, user) {
				if (err) throw err;
				if (!user) {
					res.json({ success: false, message: 'No user found' });
				} else {
					res.status(200).json({ success: true, user: user, permission: user.permission });
				}
			});
	});

	router.get('/assignedLead', function(req, res) {
		AssignedLead.aggregate([
			{$match: {"userId": mongoose.Types.ObjectId(req.decoded._id) }}
			],function(err, result) {
				if (err) throw err;
				if (!result) {
					res.json({ success: false, message: 'No leads found' });
				} else {
					res.json({ success: true, result: result });
				}
			});
	});

	router.get('/management', function(req, res) {
		Login.find({}, function(err, allUsers) {
			if (err) throw err;
			Login.findOne({ _id: req.decoded._id }, function(err, user) {
				if (err) throw err;
				if (!user) {
					res.json({ success: false, message: 'No user found' });
				} else {
					if (user.permission === 'admin' || user.permission === 'shubham') {
						if (!user) {
							res.json({ success: false, message: 'Users not found' });
						} else {
							res.status(200).json({ success: true, allUsers: allUsers, permission: user.permission });
						}
					} else {
						res.json({ success: false, message: 'Insufficient Permission' });
					}
				}
			});
		});
	});

	router.delete('/loggedInUser/:username', function(req, res) {
		var deletedUser = req.params.username;
		Login.findOne({ username: req.body.username }, function(err) {
			if (err) throw err;
			else {
				Login.findOneAndRemove({ username: deletedUser }, function(err, user) {
					if (err) throw err;
					res.json({ success: true });
				});
			}
		});
	});

	router.delete('/deleteFormat/:name', function(req, res) {
		var deleteFormat = req.params.name;
		BillFormat.findOne({ name: req.body.name }, function(err) {
			if (err) throw err;
			else {
				BillFormat.findOneAndRemove({ name: deleteFormat }, function(err, user) {
					if (err) throw err;
					res.json({ success: true });
				});
			}
		});
	});

	router.get('/getFormData', function(req, res) {
		User.find({}, function(err, customers) {
			if (err) throw err;
			User.findOne({}, function(err, customer) {
				if (err) throw err;
				else {
					res.json({ success: true, customers: customers });
				}
			});
		});
	});

	router.get('/getOtp', function(req, res) {
		Otp.find({}, function(err, otps) {
			if (err) throw err;
			Otp.findOne({}, function(err, otp) {
				if (!otp) {
					res.json({ success: false, message: "There is some err" });
				} else {
					res.json({ success: true, otps: otps });
				}
			});
		});
	});

	router.get('/profile', function(req, res) {
		Login.findOne({ _id: req.decoded._id }, function(err, user) {
			if (err) throw err;
			if (!user) {
				res.send({ success: false, message: 'No user was found' });
			} else {
				res.json({ success: true, user: user, permission: user.permission });
			}
		});
	});

	return router;
};