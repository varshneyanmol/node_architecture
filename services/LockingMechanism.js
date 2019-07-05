class LockingMechanism {
    constructor(redisClient) {
        this.redis = redisClient;
    }

    _makeKey(key) {
        return "lock-" + key;
    }

    _getTimeOut(ttl) {
        return new Date().getTime() + ttl;
    }

    lock(key, ttl = 5000) {
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

    retryableLock(params) {

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
                        // this means transaction was aborted because
                        this.redis.unwatch();
                        return resolve(0);
                    }
                    return resolve(result[0]);
                });
        });
    }
}

module.exports = LockingMechanism;
