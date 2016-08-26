#!/usr/bin/env node
'use strict';

const { NeuLogGsr } = require('../');
const [ port, interval = 100 ] = process.argv.slice(2);

if (!port)
{
	return console.error('Please supply the path to a serial port');
}

const logger = new NeuLogGsr(port, { interval });
logger.on('data', (value, timestamp) =>
{
	console.log(value, timestamp);
});

logger.start();