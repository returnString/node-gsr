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
These examples require you to know which serial port your hardware is connected to.
We'll use COM3 as a consistent example here.
TODO: Auto-detection of hardware. 

## Scripts
You can retrieve GSR data inside your own Node.js scripts and apps.
```javascript
const { NeuLogGsr } = require('gsr');
const logger = new NeuLogGsr('COM3');

logger.on('data', (value, timestamp) =>
{
	console.log(value, timestamp);
});

logger.start();
```

## CLI
As a quick start, you can use the bundled CLI scripts to generate CSV data.
You get the absolute/relative timestamps and the value in μS.
```
> gsr-neulog -p COM3 > experiment.csv # ctrl-c to stop recording
^C
> head experiment.csv
1472222326269,0,1.6368
1472222326368,99,1.6364
1472222326468,199,1.6379
1472222326569,300,1.6346
1472222326669,400,1.6302
1472222326768,499,1.6291
```
