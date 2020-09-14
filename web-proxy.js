const http = require('http');
const https = require('https');
const express = require('express');
const app = express();
const port = 3000;
const DEST = "http://notion.so";
let getRequest = (reqUrl, callback) => {
	console.log(`URL is ${reqUrl}`);
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
				callback(res);
				// res.on('data', (d) => {
				// 	// callback(d);
				// 	// process.stdout.write(d);
				// 	console.log('some data!');
				// });
				// res.on('close', () => {
				// 	console.log('send fin!');
				// })
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
app.get('/*', (req, res) => {
	let path = req.path;
	let userAgent = req.headers['user-agent'];
	getRequest(`${DEST}${path}`, (d) => {
		d.pipe(res);
	});
})

app.listen(port, () => {
  console.log(`Proxy app listening at http://localhost:${port}`);
})
