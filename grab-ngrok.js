// @ts-check
const fs = require('fs');
const http = require('http');

const ngrokErr = new Error('Could not parse Ngrok response. Is Ngrok running? Is port 4040 being blocked?');

// Query ngrok local API
const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {

	let data = '';
	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		// Extract public URL
		try {
			const ngrokTunnelInfo = JSON.parse(data);
			// Assume first tunnel
			const publicUrl = ngrokTunnelInfo.tunnels[0].public_url;
			// Update config.js file
			const configText = `
module.exports = {
	destination: '${publicUrl}'
}
`;
				fs.writeFileSync('./config.js', configText);
				console.log('config updated!');
				return publicUrl;
		} catch (e) {
			throw ngrokErr;
		}
	});
});

req.on('error', (err) => {
	throw ngrokErr;
})