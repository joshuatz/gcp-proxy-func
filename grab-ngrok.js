// @ts-check
const fs = require('fs');
const http = require('http');

// Query ngrok local API
http.get('http://127.0.0.1:4040/api/tunnels', (res) => {

	let data = '';
	res.on('data', (chunk) => {
		console.log(chunk);
		data += chunk;
	});

	res.on('end', () => {
		// Extract public URL
		const publicUrl = /public_url":\s*"(https[^"]+)/.exec(data)[1];

		// Update config.js file
		const configText = `
module.exports = {
	destination: '${publicUrl}'
}
`;
		fs.writeFileSync('./config.js', configText);
		console.log('config updated!');
		return true;
	});
});