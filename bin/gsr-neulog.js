#!/usr/bin/env node
'use strict';

const co = require('co');
const { NeuLogGsr } = require('../');
const { parseDuration } = require('../lib/utils');

const { port, interval, duration } = require('yargs')
	.option('port', {
		alias: 'p',
	})
	.option('interval', {
		alias: 'i',
		default: '100ms',
		coerce: parseDuration,
	})
	.option('duration', {
		alias: 'd',
		coerce: parseDuration,
	})
	.argv;

function *main()
{
	const loggerOptions = { interval };
	const logger = port ? new NeuLogGsr(port, loggerOptions) : yield NeuLogGsr.find(loggerOptions);

	console.log('timestamp,offset,value');
	logger.on('data', (value, timestamp, offset) =>
	{
		console.log(`${timestamp},${offset},${value}`);
	});

	logger.start();

	if (duration)
	{
		setTimeout(() =>
		{
			logger.stop();
		}, duration);
	}
}

co(main).catch(err => { console.error(err.stack); process.exit(1); });
