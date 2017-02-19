"use strict";

const sut = require("../index");
const assert = require("chai").assert;

const retryCountDefault = 10;

describe("promised-retry tests", () => {
    it("module returns a function as default", done => {
        assert.equal(typeof(sut), "function");
        done();
    });

    it("with successful promise input, returns resolved promise", done => {
        sut(() => Promise.resolve())
            .then(() => done())
            .catch(() => done(new Error("This should resolve")));
    });

    it(`with rejectedPromise and no options, retries ${retryCountDefault} times`, done => {
        let attemptCount = 0;
        const errorPromise = () => {
            attemptCount++;
            return Promise.reject();
        };

        sut(errorPromise)
            .then(() => done(new Error("This should be rejected")))
            .catch(() => {
                assert.isOk(attemptCount === retryCountDefault);
                done();
            });
    });

    it(`with rejectedPromise and maxAttmps set to 2, retries 2 times`, done => {
        let attemptCount = 0;
        const errorPromise = () => {
            attemptCount++;
            return Promise.reject();
        };
        const maxAttemptsTest = 2;

        sut(errorPromise, { maxAttempts: maxAttemptsTest })
            .then(() => done(new Error("This should be rejected")))
            .catch(() => {
                assert.isOk(attemptCount === maxAttemptsTest);
                done();
            });
    });

    it("with rejectedPromise and fixed delay, delay is respected", done => {
        let startTime = Date.now();
        const retryTimeoutInMs = 10;

        sut(() => Promise.reject(), { retryTimeout: retryTimeoutInMs })
            .then(() => done(new Error("This should be rejected")))
            .catch(() => {
                let totalTime = Date.now() - startTime;
                totalTime *= 1.1;
                assert.isOk(totalTime > (retryCountDefault * retryTimeoutInMs));
                done();
            });
    });

    it("with rejectedPromise and multiplied delay, delay is respected", done => {
        let startTime = Date.now();
        const retryTimeoutInMs = 2;

        sut(() => Promise.reject(), {
            maxAttempts: 4,
            retryTimeout: retryTimeoutInMs,
            timeoutMultiplier: 2
        })
            .then(() => done(new Error("This should be rejected")))
            .catch(() => {
                let totalTime = Date.now() - startTime;
                totalTime *= 1.1;
                assert.isOk(totalTime > Math.pow(retryTimeoutInMs, 4));
                done();
            });
    });

    it('retryCheck is passedError', done => {
        let errorMessage = "BOOOOOM";
        const shouldRetry = err => {
            assert.equal(err, errorMessage);
            return false;
        };

        sut(() => Promise.reject(errorMessage), { retryCheck: shouldRetry })
            .catch(() => done());
    });


    it(`with rejectedPromise and retryCheck not passing, does not retry`, done => {
        let attemptCount = 0;
        const errorPromise = () => {
            attemptCount++;
            return Promise.reject();
        };

        const shouldRetry = () => false;

        sut(errorPromise, { retryCheck: shouldRetry })
            .then(() => done(new Error("This should be rejected")))
            .catch(() => {
                assert.isOk(attemptCount === 1);
                done();
            });
    });

    it(`with rejectedPromise and retryCheck is passing, retries up to maxAttempts`, done => {
        let attemptCount = 0;
        const errorPromise = () => {
            attemptCount++;
            return Promise.reject();
        };

        const shouldRetry = () => true;
        const maxAttempts = 3;
        const timeout = 0;

        sut(errorPromise, {
            retryTimeout: timeout,
            maxAttempts: maxAttempts,
            retryCheck: shouldRetry
        })
            .then(() => done(new Error("This should be rejected")))
            .catch(() => {
                assert.isOk(attemptCount === maxAttempts);
                done();
            });
    });
});