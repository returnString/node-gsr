# node-gsr
Tools for collecting galvanic skin response data in realtime using Node.js.

# Requirements
Uses Node 6.x. Tested on Windows, needs confirmation for Linux/OSX.

Supported hardware:
- [NeuLog](https://neulog.com/gsr/)

# Installation
For a specific project:
```
npm install gsr --save
```

Globally, for the CLI tools:
```
npm install gsr -g
```

# Usage
## Scripts
You can retrieve GSR data inside your own Node.js scripts and apps.

You can choose to use a specific port, but the static `NeuLogGsr.find` is also available.
It will query all serial ports for connected hardware, returning the first device that responds.

```javascript
const { NeuLogGsr } = require('gsr');
const co = require('co');

const needsSpecificLogger = true; // try changing me!

function *getLogger()
{
	if (needsSpecificLogger)
	{
		return new NeuLogGsr('COM3'); // this value depends on your configuration
	}
	else
	{
		return yield NeuLogGsr.find();
	}
}

function *main()
{
	const logger = yield getLogger();

	logger.on('data', (value, timestamp) =>
	{
		console.log(value, timestamp);
	});

	logger.start();
}

co(main);
```

## CLI
As a quick start, you can use the bundled CLI scripts to generate CSV data.
You get the absolute/relative timestamps and the value in μS.

As with the scripts, you can use a specific port (with `-p` or `--port`).
If omitted, it will search through all connected devices and try connecting until one succeeds.
```
> gsr-neulog > experiment.csv # ctrl-c to stop recording
^C
> head experiment.csv
1472222326269,0,1.6368
1472222326368,99,1.6364
1472222326468,199,1.6379
1472222326569,300,1.6346
1472222326669,400,1.6302
1472222326768,499,1.6291
```
