class LockingMechanism {

    // pass-in the redis-client object
    constructor(redisClient) {
        this.redis = redisClient;
    }

    _makeKey(key) {
        return "lock-" + key;
    }

    _getTimeOut(ttl) {
        return new Date().getTime() + ttl;
    }

    lock(key, ttl = 300) {
        return new Promise(async (resolve, reject) => {
            if (typeof key !== 'string') {
                return reject({name: "key error", message: "key must be string"});
            }

            //tryToLock will be 1/0. if 0, lock is already acquired by some other process
            const lockKey = this._makeKey(key);
            let lockTimeOut = this._getTimeOut(ttl);

            const tryToLock = await this.redis.setnx(lockKey, lockTimeOut);
            console.log("SETNX: " + tryToLock);
            if (tryToLock === 1) {
                this.redis.watch(lockKey);
                return resolve(1);
            }

            // redis.get() returns value stored at key OR null.
            const currentLockTimestamp = await this.redis.get(lockKey);
            console.log('currentLockTimestamp: ' + currentLockTimestamp);

            // if currentLockTimestamp = null, "if" statement below will not be executed
            if (currentLockTimestamp && currentLockTimestamp >= new Date().getTime()) {
                // lock is laready acquired by some other process
                return resolve(0);
            }

            // lock was acquired by some other process, but it has been timed out because of:
            // 1. either process too long than its estimated time or,
            // 2. process crashed
            // so, overwrite this lock with current value
            lockTimeOut = this._getTimeOut(ttl);
            const prevLockTimeStamp = await this.redis.getset(lockKey, lockTimeOut);
            if (prevLockTimeStamp && prevLockTimeStamp >= new Date().getTime()) {
                // some other process acquired the lock before it's getset
                return resolve(0);
            }

            // lock acquired successfully
            this.redis.watch(lockKey);
            return resolve(1);
        });
    }

    _sleep(milliseconds) {
        return new Promise((resolve, reject) => setTimeout(resolve, milliseconds));
    }

    retryableLock(key, ttl = 300, retryAfter = 100, maxAttempts = 0) {
        return new Promise(async (resolve, reject) => {
            const keepRetrying = maxAttempts < 1;
            let attempts = 0;

            while(keepRetrying || (attempts < maxAttempts)) {
                console.log('Attempt to Lock: ' + attempts);
                let result;
                try {
                    result = await this.lock(key, ttl);
                } catch(err) { return reject(err); }

                if (result === 1) {
                    return resolve(1);
                }
                attempts++;
                await this._sleep(retryAfter);
            }
            resolve(0);
        });
    }

    unlock(key) {
        return new Promise((resolve, reject) => {
            console.log("UNLOCKING THE KEY");
            if (typeof key !== 'string') {
                return reject({name: "key error", message: "key must be string"});
            }

            const lockKey = this._makeKey(key);

            this.redis
                .multi()
                .del(lockKey)
                .exec((err, result) => {
                    if (err) {
                        return reject(err);
                    }

                    console.log("UNLOCK TRANSACTION RESULT: " + JSON.stringify(result));
                    if (result === null) {
                        // this means transaction was aborted because some other process modified the lock-key value.
                        // It means some other process has the lock currently.
                        return resolve(0);
                    }
                    // "result" will be an array as it is result of exec command which executes all the command in the transaction
                    //  and returns the result of all those commands in an array.
                    // Since we have only "del" command in this transaction, result array size will be 1.
                    // Value at result[0] will be the number of keys deleted as a result of del command.
                    return resolve(result[0]);
                });
        });
    }
}

module.exports = LockingMechanism;
