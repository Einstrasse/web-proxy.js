const http = require('http');
const https = require('https');
const express = require('express');
const app = express();
const port = 3000;
const DEST = "http://notion.so";
let getRequest = (reqUrl, callback) => {
	let url = new URL(reqUrl);
	let client = '';
	console.log(url.protocol);
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
				console.log(Object.keys(res));
				console.log(res.statusCode);
				break;
			case 3:
				let location = res.headers.location;
				console.log(`Redirection to ...${location}`);
				console.log(Object.keys(res));
				getRequest(location);
				break;
			default:
				console.log(`Status Code is ${statusCode}`);
				break;
		}
		
	});
};
app.get('/*', (req, res) => {
	let path = req.path;
	let userAgent = req.headers['user-agent'];
	getRequest(`${DEST}${path}`);
	res.send("doing...!");
})

app.listen(port, () => {
  console.log(`Proxy app listening at http://localhost:${port}`);
})
