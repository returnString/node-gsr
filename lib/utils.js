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

module.exports = {
	nodeCB,
	raceResolve,
};