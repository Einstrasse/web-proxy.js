const http = require('http');
const https = require('https');
const express = require('express');
const app = express();
const port = 3000;
const hostname = `http://localhost:${port}`;
let DEST = "http://notion.so";

let getRequest = (reqUrl, callback) => {
	console.log(`[1] GET ${reqUrl}`);
	let url = new URL(reqUrl);
	let client = '';
	if (url.protocol === 'http:') {
		client = http;
	} else if (url.protocol === 'https:') {
		client = https;
	}
	client.get({
		hostname: url.host,
		port: url.port,
		path: url.pathname + url.search,
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
				getRequest(location, callback);
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
let postRequest = (reqUrl, method, callback) => {
	console.log(`[2] ${method} ${reqUrl}`);
	let url = new URL(reqUrl);
	let client = '';
	if (url.protocol === 'http:') {
		client = http;
	} else if (url.protocol === 'https:') {
		client = https;
	}
	client.request({
		hostname: url.host,
		port: url.port,
		path: url.pathname,
		method: method,
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
				postRequest(location, method, callback);
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
	let path = req.path;
	let url = req.url;
	let userAgent = req.headers['user-agent'];
	getRequest(`${DEST}${url}`, (d) => {
		d.pipe(res);
	});
	
});
app.all('*', (req, res) => {
	let path = req.path;
	let method = req.method;
	postRequest(`${DEST}${path}`, method, (d) => {
		d.pipe(res);
	});
});

app.listen(port, () => {
	console.log(`Proxy app is listening at ${hostname}`);
})
