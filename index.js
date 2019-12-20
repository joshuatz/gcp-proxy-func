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
		/**
		 * @param {import('http').ClientRequest} proxyReq
		 * @param {import('http').IncomingMessage} req
		 * @param {import('http').ServerResponse} res
		 */
		onProxyReq: (proxyReq, req, res) => {
			/**
			 * @type {null | undefined | object}
			 */
			// @ts-ignore
			const body = req.body;
			// Restream parsed body before proxying
			// https://github.com/http-party/node-http-proxy/blob/master/examples/middleware/bodyDecoder-middleware.js
			if (!body || !Object.keys(body).length) {
				return;
			}
			const contentType = proxyReq.getHeader('Content-Type');
			let contentTypeStr = Array.isArray(contentType) ? contentType[0] : contentType.toString();
			// Grab 'application/x-www-form-urlencoded' out of 'application/x-www-form-urlencoded; charset=utf-8'
			contentTypeStr = contentTypeStr.match(/^([^;]*)/)[1];

			let bodyData;
			if (contentTypeStr === 'application/json') {
				bodyData = JSON.stringify(body);
			}

			if (contentTypeStr === 'application/x-www-form-urlencoded') {
				bodyData = queryString.stringify(body);
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