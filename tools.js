// tools.js
'use strict';
const fs = require('fs');
const util = require('util');
const Intl = require('intl');

var timeZoneAjust = 0;
if (process.env.TIME_AJUST)
	timeZoneAjust = eval(process.env.TIME_AJUST);

var options = { year: "numeric", month: "2-digit", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"};
var dt =  new Intl.DateTimeFormat("fr-CA", options);

// Return America/New-York Time zone dateTime (yyyy-mm-dd hh:mm:ss)
exports.getDateTime = function (dateTime){
	var intlDateTime ;
	if (dateTime)
		intlDateTime = dateTime;
	else
		intlDateTime = new Date();
	
	intlDateTime.setUTCHours(intlDateTime.getUTCHours() + timeZoneAjust);
	intlDateTime = dt.format(intlDateTime);
	return intlDateTime.toLocaleString();
}

// Log to file
try{
	const t1970 = Date.now();
	const logFiler = fs.createWriteStream(__dirname + '/log/' + t1970 + '.log', {flags : 'w'});

	exports.logFile = function(data) {
	  logFiler.write(this.getDateTime() + '\t' + util.format(data) + '\r\n');
	};
  }catch(err){
	  console.log(err);
  }

// List log file password
exports.listLog = function (res, subWeb) {

	//res.statusCode = 200;
	//res.setHeader('Content-type', 'text/html');
	var htmlCode = '<!DOCTYPE html><html lang="en-CA"><head><meta name="viewport" content="width=device-width" /></head><body><form action="/listLog?" method="post"><input type="password" name="pass"></form></body></html>';
	res.write(htmlCode);
	res.end();
}

// List log files
exports.listLog2 = function (req, res, pass) {

	req.on('data', function(data) {
	var textChunk = data.toString('utf8');
	var textP = textChunk.replace("pass=","");
	//console.log(textP + passW);
		if (textP == pass){
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


var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();

exports.getHTTP = function (filePath, req, res){

filePath = "https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fspreadsheets%20https%3A%2F%2Fmail.google.com%2F%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send&response_type=code&client_id=425059252383-7ir1gosfrn60o59b3uvp8du7ehctlmdn.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fgoogserv4-goog-server.1d35.starter-us-east-1.openshiftapps.com%2F";

xhr.open("GET", filePath );
	xhr.onloadend=function(){
				//debugger;
				res.setHeader('Content-type', 'text/html');
				//res.write(xhr.responseXML);
				res.end("Result: " + xhr.responseText);
	    //console.log("HTTP res: " + xhr.responseText);
	}
xhr.send();
	
}
