// @ts-check
const express = require('express');
const config = require('./config');
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const queryString = require('querystring');

// Create proxy instance
const proxyInstance = getProxy();

const app = express();
app.use('/', proxyInstance);

// Optional: Support special POST bodies - requires restreaming (see below)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function getProxy() {
	return proxy(getProxyConfig());
}

/**
 * @returns {import('http-proxy-middleware').Config}
 */
function getProxyConfig() {
	return {
		target: config.destination,
		changeOrigin: true,
		followRedirects: true,
		secure: true,
		onProxyReq: (proxyReq, req, res, options) => {
			// Restream parsed body before proxying
			// https://github.com/http-party/node-http-proxy/blob/master/examples/middleware/bodyDecoder-middleware.js
			if (!req.body || !Object.keys(req.body).length) {
				return;
			}
			const contentType = proxyReq.getHeader('Content-Type');
			let bodyData;
			if (contentType === 'application/json') {
				bodyData = JSON.stringify(req.body);
			}

			if (contentType === 'application/x-www-form-urlencoded') {
				bodyData = queryString.stringify(req.body);
			}

			if (bodyData) {
				proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
				proxyReq.write(bodyData);
			}
		}
	};
}

module.exports = {
	proxy: app
}