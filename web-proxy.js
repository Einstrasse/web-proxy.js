const http = require('http');
const https = require('https');
const express = require('express');
const { assert } = require('console');
const app = express();
const port = 3000;
const hostname = `http://localhost:${port}`;
let DEST = "http://naver.com";
const getBody = require('raw-body');

if (process.argv.length > 2) {
	DEST = process.argv[2];
}

let getRequest = (req, callback) => {

	let reqUrl = req._url ? req._url : `${DEST}${req.url}`;
	console.log(`[1] GET ${reqUrl}`);

	let url = new URL(`${reqUrl}`);
	
	let client = '';
	if (url.protocol === 'http:') {
		client = http;
	} else if (url.protocol === 'https:') {
		client = https;
	} else {
		throw new Error("Unsupported protocol scheme");
	}
	client.get({
		hostname: url.hostname,
		port: url.port,
		path: url.pathname + url.search,
		headers: req.headers,
		agent: false
	}, (res)=> {
		let statusCode = res.statusCode;
		switch(parseInt(statusCode/100)) {
			case 2:
				console.log("Success Response!");
				callback(res);
				break;
			case 3:
				let location = res.headers.location;
				if (url.search) {
					location += url.search;
				}
				console.log(`Redirection from ${reqUrl} to ... ${location}`);
				var redirUrl = new URL(location);
				
				getRequest({
					// _url: redirUrl.pathname + redirUrl.search,
					_url: location,
				}, callback);
				break;
			default:
				console.log(`Status Code is ${statusCode}`);
				callback(res);
				break;
		}
		
	}).on('error', (e) => {
		console.error(e);
	});
};
let postRequest = (req, callback) => {
	let reqUrl = `${DEST}${req.url}`;
	let method = req.method;
	console.log(`[2] ${method} ${reqUrl}`);
	console.log(`data = '${JSON.stringify(data)}'`);
	let url = new URL(reqUrl);
	let client = '';
	if (url.protocol === 'http:') {
		client = http;
	} else if (url.protocol === 'https:') {
		client = https;
	} else {
		throw new Error("Unsupported protocol scheme");
	}
	client.request({
		hostname: url.hostname,
		port: url.port,
		path: url.pathname,
		method: method,
		headers: req.headers,
		agent: false
	}, (res)=> {
		let statusCode = res.statusCode;
		switch(parseInt(statusCode/100)) {
			case 2:
				console.log("Success Response!");
				callback(res);
				break;
			case 3:
				let location = res.headers.location;
				console.log(`Redirection from ${reqUrl} to ... ${location}`);
				var redirUrl = new URL(location);
				postRequest({
					// _url: redirUrl.pathname + redirUrl.search,
					_url: location,
					method: method
				}, callback);
				break;
			default:
				console.log(`Status Code is ${statusCode}`);
				callback(res);
				break;
		}
		
	}).on('error', (e) => {
		console.error(e);
	});
};
app.get('*', (req, res) => {
	getRequest(req, (d) => {
		d.pipe(res);
	});
	
});
app.all('*', (req, res) => {
	postRequest(req, (d) => {
		d.pipe(res);
	});
});

app.listen(port, () => {
	console.log(`Proxy app is listening at ${hostname} forwarding to ${DEST}`);
});
