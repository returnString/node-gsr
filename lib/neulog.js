'use strict';

const SerialPort = require('serialport');
const { connectBuffer, connectAckBuffer, requestBuffer, stx } = require('./neulog_protocol');
const EventEmitter = require('events');

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
	constructor(port, options = { interval: 100 })
	{
		super();

		this.options = options;
		this.serial = new SerialPort(port, {
			baudRate: 115200,
			stopBits: 2,
			dataBits: 8,
			autoOpen: false,
			parser: (emitter, buffer) =>
			{
				const currentParser = this.connected ? this.delimitedParser : this.connectParser;
				currentParser(emitter, buffer);
			},
		});

		this.delimitedParser = SerialPort.parsers.byteDelimiter([ stx ] );
		this.connectParser = SerialPort.parsers.byteLength(7);
		
		this.connected = false;

		this.serial.on('data', (chunk) =>
		{
			if (this.connected)
			{
				this.onDataReceived(chunk);
			}
			else
			{
				this.onAckReceived(chunk);
			}
		});
	}

	start()
	{
		this.serial.open(() =>
		{
			this.serial.write(connectBuffer);
		});
	}

	onAckReceived(chunk)
	{
		const message = chunk.slice(0, connectAckBuffer.length);
		if (!message.equals(connectAckBuffer))
		{
			throw new Error(`Got incorrect ack msg: ${message}`);
		}

		this.connected = true;

		setInterval(() =>
		{
			this.serial.write(requestBuffer);
		}, this.options.interval);
	}

	onDataReceived(chunk)
	{
		if (chunk.length !== 8)
		{
			return;
		}

		const result = getResultValue(chunk.slice(3, chunk.length - 2));
		this.emit('data', result, Date.now());
	}
}

module.exports = NeuLogGsr;