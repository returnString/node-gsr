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
As a quick start, you can use the bundled CLI scripts to test. You should see something like this:
```
> gsr-neulog -p COM3 -o csv
0.0001 1472168867665
0.0001 1472168867765
0.0001 1472168867865
0.0001 1472168867964
0.0001 1472168868064
...
```
