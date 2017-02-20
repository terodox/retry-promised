"use strict";
module.exports = function(promiseToRetryFunction, options) {
    options = options || {};
    options.maxAttempts = options.hasOwnProperty('maxAttempts') ? options.maxAttempts : 10;
    options.retryTimeout = options.hasOwnProperty('retryTimeout') ? options.retryTimeout : 0;
    options.timeoutMultiplier = options.hasOwnProperty('timeoutMultiplier') ? options.timeoutMultiplier : 1;
    options.retryCheck = options.hasOwnProperty('retryCheck') ? options.retryCheck : () => true;

    let firstAttempt = true;
    const retry = (promiseFunc, remainingAttempts, waitTime) => {
        return new Promise((resolve, reject) => {
            remainingAttempts--;
            promiseFunc()
                .then(val => resolve(val))
                .catch(err => {
                    if(!options.retryCheck(err)) {
                        reject(err);
                    } else if(remainingAttempts > 0) {
                        if(!firstAttempt) {
                            waitTime *= options.timeoutMultiplier;
                        }
                        firstAttempt = false;
                        setTimeout(
                            () => resolve(retry(promiseFunc, remainingAttempts, waitTime)),
                            waitTime
                        );
                    } else {
                        reject(err);
                    }
                });
        });
    };

    return retry(promiseToRetryFunction, options.maxAttempts, options.retryTimeout);
};