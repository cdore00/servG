'use strict';
const fs = require('fs');
const nodemailer = require('nodemailer');
const jsonInfo = "mailInfo.json";
var transporter = null;
var subject, toMail, userM, passW;

var Mailer = {
	user: "",
	pass: ""
}

Mailer.initMailer = initM;

function initM(mailer, PARAM_DIR) {
	
//console.log(process.env.MAIL + " Pass= " + process.env.INFO);
  fs.readFile( PARAM_DIR + jsonInfo, function(err, jsonInfo) {  
    if (err) {
		console.log('Error reading mailInfo.json : ' + err.message);
    }else {
		var mailInfo = JSON.parse(jsonInfo);
		subject = mailInfo.subject;
		toMail = mailInfo.to;

		if (process.env.MAIL){
			userM = process.env.MAIL;
			passW = process.env.INFO;
		}else{
			userM = mailInfo.user;
			passW = mailInfo.pass;
		}
		mailer.user = userM;
		mailer.pass = passW;
		// Create a SMTP transporter object
		transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: userM,
				pass: passW
			}
		}, {
			// sender info
			from: 'cdore <popote@popote.com>',
			headers: {
				'X-Laziness-level': 1000 // just an example header, no need to use this
			}
		});
	}
  });

}
// END define email transporter

Mailer.formatMailData = function (HOST, laDate, userName, userMail, updRange, m1arr, m3arr, m1Info, m3Info, photo) {
	var formattedBody = "<p>Bonjour,</p><p>&nbsp;</p><p></br>Voici ma commande.</p><p>&nbsp;</p>";
	if (m1arr.length > 1){
		formattedBody += "<p>" + m1arr[0] + "</p><ul>";
		for (var i=1; i < m1arr.length; i++) {
			formattedBody += "<li>" + m1arr[i] + "</li>";
		}
		formattedBody += "</ul>";
		m1Info = m1Info.substring(m1Info.indexOf("$"));
	}else
		m1Info = "";

	if (m3arr.length > 1){
		formattedBody += "<p>" + m3arr[0] + "</p><ul>";
		for (var i=1; i < m3arr.length; i++) {
			formattedBody += "<li>" + m3arr[i] + "</li>";
		}
		formattedBody += "</ul>";
		m3Info = m3Info.substring(m3Info.indexOf("$"));
	}else
		m3Info = "";

	formattedBody += "<p>&nbsp;</p><p>Merci,</p><p>" + userName + "</p><p>&nbsp;</p>";
	var modURL = HOST + 'menu.html?rang=' + updRange + '$' + userMail + '$' + laDate + m1Info + m3Info ;
	formattedBody += '<a href="' + modURL + '">Modifier ma commande</a>';
	
	if (photo){
	formattedBody = '<div><div style="float: right;"><img src="' + photo + '" /></div>' + formattedBody + '</div>';
	}
return { url: modURL, Mbody: formattedBody };
}

Mailer.sendMessage = function( res, userName, userMail, bodyMess, linkMess) {
	// Message object
	var message = {

		// Comma separated list of recipients
		to: toMail,
		cc: userMail,
		subject: subject + userName, //

		// HTML body
		html: bodyMess ,
		// Apple Watch specific HTML body
		watchHtml: bodyMess 
	};
	//console.log('Sending Mail...');  // + message.html
	transporter.sendMail(message, (error, info) => {
		if (error) {
			console.log('Error occurred');
			console.log(error.message);
		}else{
			//this.logFile('Message sent successfully to: ' + userMail + '! Server responded with: ' + info.response);
			console.log('Server responded with "%s"', info.response);
			if (res){
				res.write(linkMess);
				res.end();  //JSON.stringify(infoVal)
			}
		}
		transporter.close();
	});
}

module.exports = Mailer;
