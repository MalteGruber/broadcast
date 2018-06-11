
/*
Malte Gruber 2018
BOILERPLATE FOR GETTING STARTED:
------------------------------------------------------
var b=require("./broadcast.js")
b.startWithName("Some client name")
b.setOnConnectListener(function(){});
b.setOnDisonnectListener(function(){})
b.setOnReadyListener(function(){
	b.broadcast({hej:"HEELOO :D "});
});
b.setOnMessageListener(function(msg){
	console.log("GOT MESSAGE",msg);
})
-------------------------------------------------------
*/



/*
In common folder: npm init, npm link
In client folder (The one that uses common): npm link name-of-file
*/


var WebSocketClient = require('websocket').client;
var ip = require("ip");
var systemName="NO SYSTEM NAME SET!";
var forceOff=false;


var version = "1.0.0 2018-02-07"

/*Helper functions*/

function getUTC(){
	return parseInt(new Date().getTime()/1000);
}

function isJsonString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

/*On offline handling*/

var bootTime=getUTC();


function onOffline(){
	if(onDisconnectListener)
		onDisconnectListener();
	var retryTime=10000;
	console.log(("Could not connect, trying again in "+retryTime+" ms").yellow)
	setTimeout(function(){init()},retryTime)
}

function onMessage(msg){


	if(msg.mute && msg.who===systemName){
		sendWs(systemName+" is no longer listening!!")
		forceOff=true;
		console.log("This subsystem is now off".underline.red)

	}
	if(msg.unmute && msg.who===systemName &&forceOff){
		sendWs(systemName+" is now listening!")
		forceOff=false;
		console.log("This subsystem is now on".underline.green)
	}

	if(forceOff){
		console.log("Is off, ignoring message".red,JSON.stringify(msg).blue)
		return;
	}
	console.log(msg)
	if(msg.poke){
		sendHeartbeat();
	}
	if(onMessageListener)
		onMessageListener(msg);

}

function sendHeartbeat(){
	var datetime = new Date().toJSON().slice(0,10) 
	+ " " + new Date(new Date()).toString().split(' ')[4];
	if(connection)
		sendWs( systemName+" ip="+ip.address()+" @ "+datetime);

}


function startHeartBeats(){
	setInterval(function(){
		sendHeartbeat();
	}, 120*1000)

}


const path = require('path');
function resolveHome(filepath) {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}

/*Websocket stuff*/
var fs = require('fs');
var serverAddressFile="~/websocket_address.ip";
var serverAddress="ws://youraddresshere.cow:9001";
var connection=null;

try{
	serverAddress = fs.readFileSync(resolveHome(serverAddressFile), 'utf8');
	serverAddress=serverAddress.replace("\n","");

} catch(e){

	console.log(e)
	console.error("ERROR! Please specify an IP address in a text file at "+path);

	console.error("The file should contain an address in the following format:");
	console.error("ws://123.321.123.321:9400");
	console.error("OBS! Do not add a new line character at the end of the address!");
}
//serverAddress="ws://123.321.123.321:9400"
var client = new WebSocketClient();

client.on('connectFailed', function(error) {
	onOffline();
	console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(c) {
	connection=c;
	console.log('connected to ws server.'.green);
	sendHeartbeat();
	if(onConnectListener)
		onConnectListener();
	if(onReadyListener)
		onReadyListener();
	onReadyListener=null;

	connection.on('error', function(error) {
		onOffline();
		console.log("Connection Error: " + error.toString());
	});

	connection.on('close', function() {
		onOffline();
		console.log('Connection Closed');
	});

	connection.on('message', function(message) {
		if (message.type === 'utf8') {
        //    console.log("Received: '" + message.utf8Data + "'");
        if(isJsonString(message.utf8Data)){


        	onMessage(JSON.parse(message.utf8Data));
        }else{
        	console.log("nonJSON: ".dim+message.utf8Data.dim);
        }
    }
});

});

var colors = require('colors');
 

function init(){
	console.log(("Connecting to ws server "+serverAddress+"...").yellow)
//	onOffline();
	startHeartBeats();
	client.connect(serverAddress);	
}

function sendWs(msg){

if(forceOff){
	console.log("IS MUTED, CANNOT SEND ".red,msg)
}else{
	console.log("Sending ".blue,msg.green);
		connection.sendUTF(msg);



}

}
/*Callbacks*/
var onConnectListener=null;
var onDisconnectListener=null;
var onMessageListener=null;
var onReadyListener=null;

/*Public methods*/
exports.broadcast=function(msg){
	//console.log(JSON.stringify(msg))
	if(msg.length){
		for (var i=0;i<msg.length;i++) {
			sendWs(JSON.stringify(msg[i]))
		}
	}else{
		sendWs(JSON.stringify(msg))
	}
}


exports.setOnConnectListener=function(l){
	onConnectListener=l;
}
exports.setOnDisonnectListener=function(l){
	onDisconnectListener=l;
}
exports.setOnMessageListener=function(l){
	onMessageListener=l;
}
exports.setOnReadyListener=function(l){
	onReadyListener=l;
}
exports.startWithName=function(name){
	systemName=name;

	console.log("|=============================================|".rainbow)
	console.log("       Version".rainbow,version.bgBlack)
	console.log("|=============================================|".rainbow)
	console.log("Starting server with name ".blue,('"'+systemName+'"').green)
	init();
}





/*Uncomment if you dont want the program to execute the server*/