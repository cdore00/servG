// tools.js
'use strict';
const fs = require('fs');
const util = require('util');
var timeZoneAjust = 0;
//if (process.env.TIME_AJUST)
//	timeZoneAjust = process.env.TIME_AJUST;

// Return America/New-York Time zone dateTime (yyyy-mm-dd hh:mm:ss)
exports.getDateTime = function (dateTime){
	var timeNow ;
	if (dateTime)
		timeNow = dateTime;
	else
		timeNow = new Date();
		
	timeNow.setUTCHours(timeNow.getUTCHours() - timeZoneAjust);
	return timeNow.toLocaleString();
}

// Log to file
try{
	const t1970 = Date.now();
	const logFiler = fs.createWriteStream(__dirname + '/log/' + t1970 + '.log', {flags : 'w'});

	exports.logFile = function(d) {
	  logFiler.write(this.getDateTime() + '\t' + util.format(d) + '\r\n');
	};
  }catch(err){
	  console.log(err);
  }

//module.exports = logFile;

// List log file password
exports.listLog = function (res, subWeb) {

	//res.statusCode = 200;
	//res.setHeader('Content-type', 'text/html');
	var htmlCode = '<!DOCTYPE html><html lang="en-CA"><head><meta name="viewport" content="width=device-width" /></head><body><form action="/listLog?" method="post"><input type="password" name="pass"></form></body></html>';
	res.write(htmlCode);
	res.end();
}

// List log file
exports.listLog2 = function (req, res) {

//res.statusCode = 200;
	req.on('data', function(data) {
	var textChunk = data.toString('utf8');
	var textP = textChunk.replace("pass=","");
	//console.log(textP + passW);
		if (textP == passW){
			var laDate = new Date();
			var HTMLcode = '<!DOCTYPE html><html lang="en-CA"><head><meta name="viewport" content="width=device-width" /></head><body><h2>Log files list</h2>';
			fs.readdir("./log" , function(err, items) {
				if(err){
					console.log("Error listLog2: " + err.message);
					this.logFile("Error listLog2: " + err.message);
					//throw err;
				}else{
					for (var i=0; i<items.length; i++) {
						var logItem = items[i];
						var t1970 = logItem.substring(0,logItem.indexOf("."));
						laDate.setTime(logItem.substring(0,logItem.indexOf(".")));
						HTMLcode += '<a target="_blank" href="./showLog?nam=' + logItem + '">' + logItem + '&#8239;&#8239;' + laDate.toLocaleString("en-CA", {hour12: false}) + '</a></br>';
					}
					HTMLcode += '</body></html>'
					//res.setHeader('Content-type', 'text/html');
					//res.write(HTMLcode);
					res.end(HTMLcode);
				}
			});
		}else{
			//res.setHeader('Content-type', 'text/html', 'application/json; charset=utf-8');
			this.logFile("Error listLog2 : " + textChunk);
			res.end("<h2>Non autoris&eacute;</h2>");
		}
	});
}

// Show log file
exports.showLog = function (param, res) {
	fs.readFile('log/' + param.InfoArr[3], (err, html) => {
		if(err){
			this.logFile("Error showLog: " + err.message);
			res.end();
			//throw err;
		}else{
			this.logFile('Show log file: ' + param.InfoArr[2]);
			if (res){
				res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"})
				res.write(html, 'utf8');
				res.end();
			}
		}
	});
}


// Send email
//'use strict';

const nodemailer = require('nodemailer');
var transporter = null;
var subject, toMail, userM, passW;

exports.initMailer = function (PARAM_DIR) {
console.log(process.env.MAIL + " Pass= " + process.env.INFO);
  fs.readFile( PARAM_DIR + "mailInfo.json", function(err, jsonInfo) {  
    if (err) {
		this.logFile('Error reading mailInfo.json : ', err.message);
    }else {
		var mailInfo = JSON.parse(jsonInfo);
		subject = mailInfo.subject;
		toMail = mailInfo.to;
//debugger;
		if (process.env.MAIL){
			userM = process.env.MAIL;
			passW = process.env.INFO;
		}else{
			userM = mailInfo.user;
			passW = mailInfo.pass;
		}
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

exports.formatMailData = function (HOST, laDate, userName, userMail, updRange, m1arr, m3arr, m1Info, m3Info) {
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
formattedBody + '<p><a href="' + modURL + '">Modifier ma commande</a></p>';

return { url: modURL, Mbody: formattedBody };
}

exports.sendMessage = function( res, userName, userMail, bodyMess, url) {
// Message object
var message = {

    // Comma separated list of recipients
    to: toMail,
	cc: userMail,
    subject: subject + userName, //

    // plaintext body
    //text: 'Hello to myself!',
    // HTML body
    html: bodyMess + '<a target="_parent" href="' + url + '">Modifier ma commande</a>',
    // Apple Watch specific HTML body
    watchHtml: bodyMess + '<a target="_parent" href="' + url + '">Modifier ma commande</a>'
};
//console.log('Sending Mail...');  // + message.html
transporter.sendMail(message, (error, info) => {
    if (error) {
        console.log('Error occurred');
        console.log(error.message);
    }else{
		this.logFile('Message sent successfully to: ' + userMail + '! Server responded with: ' + info.response);
		console.log('Server responded with "%s"', info.response);
		if (res){
			res.write('<h3 style="margin: 0;"><a target="_parent" href="' + url + '">Courriel envoyé</a></h3>');
			res.end();  //JSON.stringify(infoVal)
		}
	}
    transporter.close();
});
}
// FIN Send email


var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

exports.getHTTP = function (filePath, req, res){

xhr.open("GET", filePath + "?_=" + new Date().getTime(), true);
	xhr.onloadend=function(){
				res.setHeader('Content-type', 'text/html');
				//res.write(xhr.responseXML);
				res.end(xhr.responseText);
	    console.log("HTTP res: " + xhr.responseText);
		debugger;
	}
xhr.send();
	
}
