// @ts-check

const express = require('express');
const config = require('./config');
const proxy = require('http-proxy-middleware');

const app = express();
app.all('*', getProxy());

function getProxy() {
	return proxy({
		target: config.destination,
		changeOrigin: true,
		followRedirects: true,
		secure: true
	});
}

module.exports = {
	proxy: app
}