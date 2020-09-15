const http = require('http');
const https = require('https');
const express = require('express');
const app = express();
const port = 3000;
const DEST = "http://notion.so";
let getRequest = (reqUrl, callback) => {
	console.log(`GET ${reqUrl}`);
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
		path: url.pathname,
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
				console.log(`Redirection to ...${location}`);
				getRequest(location, callback);
				break;
			default:
				console.log(`Status Code is ${statusCode}`);
				break;
		}
		
	}).on('error', (e) => {
		console.error(e);
	});
};
let postRequest = (reqUrl, callback) => {
	console.log(`POST ${reqUrl}`);
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
		method: "POST",
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
				console.log(`Redirection to ...${location}`);
				getRequest(location, callback);
				break;
			default:
				console.log(`Status Code is ${statusCode}`);
				break;
		}
		
	}).on('error', (e) => {
		console.error(e);
	});
};
app.get('*', (req, res) => {
	let path = req.path;
	let userAgent = req.headers['user-agent'];
	getRequest(`${DEST}${path}`, (d) => {
		d.pipe(res);
	});
	
});
app.post('*', (req, res) => {
	let path = req.path;
	postRequest(`${DEST}${path}`, (d) => {
		d.pipe(res);
	});
});

app.listen(port, () => {
  console.log(`Proxy app listening at http://localhost:${port}`);
})
