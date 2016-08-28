'use strict';

function nodeCB(resolve, reject, resolveData)
{
	return (err, ...args) =>
	{
		if (err) return reject(err);

		if (resolveData !== undefined)
		{
			return resolve(resolveData);
		}
		else
		{
			return resolve(...args);
		}
	};
}

function raceResolve(promises)
{
	return Promise.all(promises.map((promise) =>
	{
		return promise.then(val => Promise.reject(val), err => Promise.resolve(err));
	})).then(errs => Promise.reject(new Error(`All promises failed: ${errs.join(', ')}`)), val => Promise.resolve(val));
}

function parseDuration(str)
{
	const regex = /(\d+)(ms|s|m|h|d)/;
	const matches = str.match(regex);
	if (!matches)
	{
		throw new Error(`"${str}" does not match ${regex.source}`);
	}

	const [ unused, durationStr, unit ] = matches;
	let duration = parseInt(durationStr);

	/* eslint-disable no-fallthrough */
	switch (unit)
	{
		case 'd': duration *= 24;
		case 'h': duration *= 60;
		case 'm': duration *= 60;
		case 's': duration *= 1000;
	}
	/* eslint-enable no-fallthrough */

	return duration;
}

module.exports = {
	nodeCB,
	raceResolve,
	parseDuration,
};