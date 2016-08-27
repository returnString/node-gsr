'use strict';

class GsrError extends Error
{
	constructor(port, message)
	{
		super(`${port}: ${message}`);
		this.name = this.constructor.name;
		this.port = port;
		Error.captureStackTrace(this, this.constructor);
	}
}

class GsrConnectFailedError extends GsrError
{
	constructor(port)
	{
		super(port, 'Connection attempt failed');
	}
}

class GsrAckFailedError extends GsrError
{
	constructor(port, expected, actual)
	{
		super(port, `Ack failed: expected ${expected}, got ${actual}`);
	}
}

class GsrInvalidChunkError extends GsrError
{
	constructor(port, chunk)
	{
		super(port, `Invalid chunk received: ${chunk}`);
	}
}

module.exports = {
	GsrError,
	GsrConnectFailedError,
	GsrAckFailedError,
	GsrInvalidChunkError,
};