'use strict';

const stx = 85;
const requestBytes = [ stx, 16, 1, 49, 0, 0, 0 ];
requestBytes.push(requestBytes.reduce((a, b) => a + b) % 256);

module.exports = {
	stx,
	requestBuffer: Buffer.from(requestBytes),
	connectAckBuffer: Buffer.from('OK-V'),
	connectBuffer: Buffer.from('UNeuLog!'),
};