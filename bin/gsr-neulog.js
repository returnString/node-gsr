#!/usr/bin/env node
'use strict';

const co = require('co');
const { NeuLogGsr } = require('../');
const { port, interval } = require('yargs')
	.option('port', {
		alias: 'p',
	})
	.option('interval', {
		alias: 'i',
		default: 100,
		number: true,
	})
	.argv;

co(function*()
{
	const loggerOptions = { interval };
	const logger = port ? new NeuLogGsr(port, loggerOptions) : yield NeuLogGsr.find(loggerOptions);

	console.log('timestamp,offset,value');
	logger.on('data', (value, timestamp, offset) =>
	{
		console.log(`${timestamp},${offset},${value}`);
	});

	logger.start();
}).catch(err => console.error(err.stack));
