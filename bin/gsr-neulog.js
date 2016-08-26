#!/usr/bin/env node
'use strict';

const { NeuLogGsr } = require('../');
const { port, interval } = require('yargs')
	.option('port', {
		alias: 'p',
		required: true,
	})
	.option('interval', {
		alias: 'i',
		default: 100,
		number: true,
	})
	.argv;

const logger = new NeuLogGsr(port, { interval });
logger.on('data', (value, timestamp, offset) =>
{
	console.log(`${timestamp},${offset},${value}`);
});

logger.start();