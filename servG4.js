// servG4.js    res.header("Content-Type", "application/json; charset=utf-8");
const http = require('http');
const fs = require('fs');
const Intl = require('intl');

var ip;
var url = require('url');
var port = 3000;

var hostname = '';
var hostURL = '';
var HOSTclient = 'cdore00.000webhostapp.com';
//'cdore00.000webhostapp.com';
//'http://cdore.no-ip.biz/lou/';


//var qs = require('querystring');
const args = process.argv;
if (args[2] && args[2] == 3000){
	port = args[2];
	hostURL = 'http://cdore.no-ip.biz/nod/';
}else{
	var port = 8080;
	hostURL = 'http://gserver-googleserv.44fs.preview.openshiftapps.com/';
}
console.log(hostURL + " args[20]=" + args[0] + " args[1]=" + args[1]);
const PARAM_DIR = './param/';

// tools.js (logging fct) module fs, util, bunyan, nodemailer, DOMParser
tl = require('./tools.js');
var infoBup = new Array();
var subWeb = '';
var subNod = 'nod/';
//console.log(url_parts.pathname + " subWeb= " + subWeb + " filePath= " + filePath);

// Instancier le serveur Web
	const server = http.createServer((req, res) => {
			//debugger;
		var url_parts = url.parse(req.url,true);
		var arrPath = url_parts.pathname.split("/");
		var filePath = arrPath[arrPath.length - 1];
		subWeb = arrPath[arrPath.length - 2] + '/';

		if (req.method == 'POST') {
			if (filePath == "listLog"){
				tl.listLog2(req, res);
			}else{
				res.end();
			}
		}else{  // method == 'GET'
		if (filePath == "newCode"){
			getNewCode(req, res, url_parts);
		}else{
		if (filePath == "getHTTP"){
			getHTTP("http://192.168.2.10/lou/v2.html", req, res);

		}else{
		if (filePath == "listLog"){
			tl.listLog(res, subNod);
		}else{
		if (filePath == "showLog"){
			tl.showLog(readQuery(req), res, subWeb);
		}else{
		if (filePath == "getRow"){
			getSheetInfo(readQuery(req), res);
		}else{
		if (filePath == "app.js"){
			writeToSheet(readQuery(req),req, res);
			}else{ //Si req inconnue on annule
				//console.log(url_parts.pathname + " subWeb= " + subWeb + " filePath= " + filePath);
				var param = url_parts.query;
				if (param.code)
					getNewCode(req, res, url_parts)
				else{
					res.statusCode = 200;
					res.end();
				}
			}
		}}}}}
		} //Fin GET
	});
// Démarrer l'écoute des requêtes au serveur
	server.listen(port, hostname, () => {
		console.log('Server started on port ' + port);
		tl.logFile('Server started on port ' + port);
		authorize();   // Instancier l'objet OAuth2 pour les API Google.
		tl.initMailer(PARAM_DIR);
	});
// FIN Serveur Web

function readQuery(req){
var url_parts = url.parse(req.url,true);
var param = url_parts.query;
var InfoArr = new Array();
var M1 = new Array();
var M3 = new Array();
//console.log(url_parts);
if (param.L1){
var M1info = param.L1.split("$"); 
var M3info = param.L3.split("$");
M1[M1.length] = M1info[0];
M3[M3.length] = M3info[0];
}

	if (req.headers['x-forwarded-for']) {
		ip = req.headers['x-forwarded-for'].split(",")[0];
	} else if (req.connection && req.connection.remoteAddress) {
		ip = req.connection.remoteAddress;
	} else {
		ip = req.ip;
	}//console.log("client IP is *********************" + ip);

console.log(url_parts.query);
InfoArr[InfoArr.length] = Date.now();
var options = { year: "numeric", month: "2-digit", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"};
var dt =  new Intl.DateTimeFormat("fr-CA", options);
InfoArr[InfoArr.length] = dt.format(new Date());
//Date().toLocaleString().substring(0,Date().toLocaleString().indexOf('GMT'));
InfoArr[InfoArr.length] = ip ;	
InfoArr[InfoArr.length] = ((param.nam != null) ? param.nam:"" ) ;
InfoArr[InfoArr.length] = ((param.adr != null) ? param.adr:"" ) ;
InfoArr[InfoArr.length] = ((param.em != null) ? param.em:"" ) ;
InfoArr[InfoArr.length] = ((param.range != null) ? param.range:"" ) ;

for (var j = 1; j < 4; j += 2) {  // Jour 1 lundi, jour 3 = mercredi
	for (var i = 1; i < 10; i++) {
		var tmpVal = eval("param.J" + j + "" + i);
		tmpVal = ((tmpVal != null) ? tmpVal:"" );
		if(typeof tmpVal == 'object'){  // Valeur multiple
			for (var z = 0; z < tmpVal.length; z++) {
				InfoArr[InfoArr.length] = tmpVal[z];
				mailInfo(M1, M3, j, tmpVal[z]);
			}
		}else{  // Valeur unique
			InfoArr[InfoArr.length] = tmpVal;
			mailInfo(M1, M3, j, tmpVal);
		}
	}
}

return { InfoArr: InfoArr, m1: M1, m3: M3, m1info: param.L1, m3info: param.L3 };
}

function mailInfo(M1, M3, jour, valInfo){
if (valInfo){
	if (jour == 1)
		M1[M1.length] = valInfo;
	if (jour == 3)
		M3[M3.length] = valInfo;
}
}


/* Begin Google Sheet */
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var gmail = google.gmail('v1');

var authObj;

// If modifying these scopes, delete your previously saved credentials
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets','https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.send'];
var TOKEN_PATH = PARAM_DIR + 'googleapis-nodejs.json';

function authorize(){
// Load client secrets from a local file.
fs.readFile( PARAM_DIR + 'client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client_secret.json: ' + err);
    return false;
  }
  // Authorize a client with the loaded credentials, then call the Google Sheets API and console.log(PARAM_DIR);
  //authorize(JSON.parse(content), InfoArr, res);
  var cred = JSON.parse(content);
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(cred.web.client_id, cred.web.client_secret, hostURL);
  var laDate = new Date();
  var auth2 = false;
  
  authObj = oauth2Client;

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
		auth2 = getNewToken();
    } else {
      oauth2Client.credentials = JSON.parse(token);
	  auth2 = oauth2Client;
	  laDate.setTime(oauth2Client.credentials.expiry_date);
	  console.log(oauth2Client.credentials.expiry_date + " = " + laDate.toLocaleString("en-CA", {hour12: false}));
	  tl.logFile("Token ending: " + oauth2Client.credentials.expiry_date + " = " + laDate.toLocaleString("en-CA", {hour12: false}));
    }
	if (auth2)
		return true;
	else
		return false;
  });
});
}

/**
 * Get and store new token after prompting for user authorization
 */
function getNewToken(res) {
/**  var authUrl = authObj.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  tl.logFile('Authorize this app by visiting this url: ' + authUrl);   */
	fs.readFile('getCode.html', (err, html) => {
		if(err){
			tl.logFile(err.message);
			throw err;
		}else{
			console.log('getNewToken');
			tl.logFile('getNewToken');
			//debugger;
			if (res){
				res.statusCode = 200;
				res.setHeader('Content-type', 'text/html');
				res.write(html);
				res.end();
			}
		}
	});
}

/**
 * Store token to disk be used in later program executions.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(PARAM_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
  tl.logFile('Token stored to ' + TOKEN_PATH);
}

/**
 * Write to Sheet
 */
function writeToSheet(infoG3, req, res, callBack) {
var InfoArr = infoG3.InfoArr;
var m1Info = infoG3.m1info;
var m3Info = infoG3.m3info;
var rangeInfo = infoG3.InfoArr[6];
var typInfo = "";

if (rangeInfo != ""){
	if (m1Info.indexOf('$') == -1 && m3Info.indexOf('$') == -1)
		typInfo = "Supprimé";
	else
		typInfo = "Modifié";
}
//debugger;
infoG3.InfoArr[6] = typInfo;
var infoVal = eval(JSON.stringify(infoG3.InfoArr));

  try {
	var sheets = google.sheets('v4');
	var options = {
	  auth: authObj,
	  spreadsheetId: "1B6seaxE--ew4wLVbjT6H4Peub8rKMDFBQL_9CZpmNe0",
	  range: "Feuille 1!A1",
	  valueInputOption: "RAW",
	  resource: {	  
		values: [infoVal]
	  }
	};  
	
	if (rangeInfo != ""){  // Update
		options.range = rangeInfo.substring(0, rangeInfo.indexOf(":")) ;
	sheets.spreadsheets.values.update(options, function(err, result) {
		if (cbWriteSheet(err, infoVal, res, infoG3, callBack)){
			var Mdata = tl.formatMailData(HOSTclient, InfoArr[1], InfoArr[3], InfoArr[5], escape(result.updatedRange), infoG3.m1, infoG3.m3, m1Info, m3Info);
			if (res){
				//res.writeHeader(200, { 'Content-Type': 'text/html; charset=utf-8' });
				res.writeHeader(200, { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin' : '*', 'Access-Control-Allow-Headers' : 'Origin, X-Requested-With, Content-Type, Accept'});
				res.write('<h3 style="color: #AD8700; margin: 0;"><a target="_parent" href="' + Mdata.url + '">Commande re&ccedil;ue.</a></h3>');
			}
			tl.sendMessage( res, InfoArr[3], InfoArr[5], Mdata.Mbody, Mdata.url);
			}
		});
	}else{		// Append new
	sheets.spreadsheets.values.append(options, function(err, result) {
		if (cbWriteSheet(err, infoVal, res, infoG3, callBack)){
			var Mdata = tl.formatMailData(HOSTclient, InfoArr[1], InfoArr[3], InfoArr[5], escape(result.updates.updatedRange), infoG3.m1, infoG3.m3, m1Info, m3Info);
			debugger;
			if (res){
				//debugger;
				//res.setHeader("Access-Control-Allow-Origin", "*");
				//res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
				//res.setHeader({ 'Content-Type': 'text/html; charset=utf-8' });
				//res.statusCode = 200;
				res.writeHeader(200, { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin' : '*', 'Access-Control-Allow-Headers' : 'Origin, X-Requested-With, Content-Type, Accept'});
				res.write('<h3 style="color: #AD8700; margin: 0;"><a target="_parent" href="' + Mdata.url + '">Commande re&ccedil;ue.</a></h3>');
			}
			tl.sendMessage( res, InfoArr[3], InfoArr[5], Mdata.Mbody, Mdata.url);
			}
		});
	}	

  } catch (err) {
	  console.log('Error writeToSheet End Node' + err.message);
	  throw err;
  }
}

function cbWriteSheet(err, infoVal, res, infoG3, callBack){
    if (err) { 
		infoBup[infoBup.length] = infoG3;
		console.log('Error cbWriteSheet: ' + err.message);
		tl.logFile('Error cbWriteSheet: ' + err.message);
		if (err.message == 'invalid_request')
			getNewToken(res);  // For getting new TOKEN
		return false;
    }else{  
		tl.logFile(JSON.stringify(infoVal));
		if (callBack)
			callBack(infoBup);
		return true;
	}
}  

/**
 * Get Sheet Info
 */
function getSheetInfo(infoG3, res) {
var InfoArr = infoG3.InfoArr;
var infoVal = eval(JSON.stringify(infoG3.InfoArr));

  try {
	var sheets = google.sheets('v4');
	var options = {
	  auth: authObj,
	  spreadsheetId: "1B6seaxE--ew4wLVbjT6H4Peub8rKMDFBQL_9CZpmNe0",
	  range: InfoArr[2]
	};  
	sheets.spreadsheets.values.get(options, function(err, result) {
		//debugger;
    if (err) { 
		console.log('Error getSheetInfo: ' + err.message);
		getNewToken(res);  // For getting new TOKEN
    }else{  
		console.log("Lecture:" + InfoArr[2] + JSON.stringify(result.values));
		tl.logFile("Lecture:" + InfoArr[2] + JSON.stringify(result.values));
		res.statusCode = 200;
		res.setHeader('Content-type', 'text/plain');
		res.end(JSON.stringify(infoVal));
	}
  });
  } catch (err) {
	  console.log('Error getSheetInfo End Node' + err.message);
	  throw err;
  }
}  

function getNewCode(req, res, url_parts){
var param = url_parts.query;
var laDate = new Date();
var saveBup = ((infoBup.length > 0) ? true:false);

if (param.code != null){
	console.log(req.headers.host + "   getNewCode= " + param.code);
	authObj.getToken(param.code, function(err, token) {
	  if (err) {
		console.log('Error while trying to retrieve access token: ', err.message);
	  }else{
	  laDate.setTime(token.expiry_date);
	  tl.logFile("Token ending: " + token.expiry_date + " = " + laDate.toLocaleString("en-CA", {hour12: false}));
	  authObj.credentials = token;
	  storeToken(token);
	  //debugger;
	  if (infoBup.length != 0){
		 writeToSheet(infoBup[infoBup.length-1], req, res, loadinfoBup);
	  }
	  }
	});
}
if (!saveBup){
	res.statusCode = 200;
	res.setHeader('Content-type', 'text/plain');
	res.end();
}

}
 
function loadinfoBup(iBup){
	if (iBup.length != 0){
		iBup.splice(iBup.length-1, 1);
	}
	if (iBup.length != 0){
		tl.logFile("Récupération: " + iBup.length);
		writeToSheet(iBup[iBup.length-1], false, false, loadinfoBup);	
	}
}


/* END Google Sheet */
