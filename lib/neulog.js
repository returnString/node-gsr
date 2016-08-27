'use strict';

const SerialPort = require('serialport');
const EventEmitter = require('events');
const { nodeCB, raceResolve } = require('./utils');
const { GsrConnectFailedError, GsrAckFailedError, GsrInvalidChunkError } = require('./errors');
const co = require('co');

const stx = 85;
const requestBytes = [ stx, 16, 1, 49, 0, 0, 0 ];
requestBytes.push(requestBytes.reduce((a, b) => a + b) % 256);
const requestBuffer = Buffer.from(requestBytes);
const connectAckBuffer = Buffer.from('OK-V');
const connectBuffer = Buffer.from('UNeuLog!');

function getResultChar(n)
{
	switch (n)
	{
		case 10: return '.';
		case 11: return '+';
		case 12: return '-';
		default: return n;
	}
}

function getResultValue(resultSlice)
{
	let num = '';
	for (const i of resultSlice)
	{
		num += getResultChar(Math.floor(i / 16));
		num += getResultChar(i % 16);
	}

	return parseFloat(num);
}

class NeuLogGsr extends EventEmitter
{
	static find(options)
	{
		return co(function*()
		{
			const results = yield new Promise((resolve, reject) => SerialPort.list(nodeCB(resolve, reject)));
			const connectionAttempts = results.map((portData) =>
			{
				return new Promise((resolve, reject) =>
				{
					const logger = new NeuLogGsr(portData.comName, options);
					logger.once('error', reject);
					logger.connect(nodeCB(resolve, reject, logger));
				});
			});

			return raceResolve(connectionAttempts);
		});
	}

	constructor(port, options = { interval: 100 })
	{
		super();

		this.port = port;
		this.options = options;
		this.connected = false;
		this.emitData = false;
		this.dataParser = SerialPort.parsers.byteLength(8);
		this.connectParser = SerialPort.parsers.byteLength(7);

		this.serial = new SerialPort(port, {
			baudRate: 115200,
			stopBits: 2,
			dataBits: 8,
			autoOpen: false,
			parser: (emitter, buffer) => 
			{
				const currentParser = this.connected ? this.dataParser : this.connectParser;
				currentParser(emitter, buffer);
			},
		});

		this.serial.on('data', (chunk) =>
		{
			if (this.connected)
			{
				if (this.emitData)
				{
					this.onDataReceived(chunk);
				}
			}
			else
			{
				this.onAckReceived(chunk);
			}
		});
	}

	connect(cb)
	{
		this.serial.open((err) =>
		{
			if (err) return cb(err);

			let eventSent = false;
			this.once('connect', () =>
			{
				if (!eventSent)
				{
					eventSent = true;
					return cb();
				}
			});

			setTimeout(() =>
			{
				if (!eventSent)
				{
					eventSent = true;
					return cb(new GsrConnectFailedError(this.port));
				}
			}, 2000);

			this.serial.write(connectBuffer);
		});
	}

	start()
	{
		this.emitData = true;

		if (!this.connected)
		{
			this.connect((err) =>
			{
				if (err) return this.onError(err);
			});
		}
	}

	onError(err)
	{
		const handled = this.emit('error', err);
		if (!handled)
		{
			throw err;
		}
	}

	onAckReceived(chunk)
	{
		const message = chunk.slice(0, connectAckBuffer.length);
		if (!message.equals(connectAckBuffer))
		{
			return this.onError(new GsrAckFailedError(this.port, connectAckBuffer, message));
		}

		this.connected = true;
		this.emit('connect');

		setInterval(() =>
		{
			this.serial.write(requestBuffer);
		}, this.options.interval);
	}

	onDataReceived(chunk)
	{
		if (chunk.length !== 8 || chunk[0] !== stx)
		{
			return this.onError(new GsrInvalidChunkError(this.port, chunk));
		}

		const result = getResultValue(chunk.slice(4, chunk.length - 1));

		const timestamp = Date.now();
		if (this.startTime === undefined)
		{
			this.startTime = timestamp;
		}

		const offset = timestamp - this.startTime;
		this.emit('data', result, timestamp, offset);
	}
}

module.exports = NeuLogGsr;