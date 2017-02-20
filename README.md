[![Build Status](https://travis-ci.org/terodox/retry-promised.svg?branch=master)](https://travis-ci.org/terodox/retry-promised)

# retry-promised

A package to support retrying promises that allows deep inspection of the error to decide whether to retry or not.

## Usage

```javascript
const retryPromised = require("retry-promised");

const options = {
    maxAttempts: 5, // defaults to 10
    retryTimeout: 1000, // Time in milliseconds (defaults to zero)
    timeoutMultiplier: 2, // allows exponential back-off (defaults to 1)
    retryCheck: err => err.hasOwnProperty("code") && err.code == "TooManyRequests" // defaults to () => true
};

retryPromised(someThingThatReturnsAPromise(), options)
    .then(val => {
        console.log("Success:", val);
    })
    .catch(err => {
        console.log("Failed:", err);
    });
```