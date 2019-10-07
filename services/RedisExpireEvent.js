const redisEventConstants = require('./redis_event_constants');

class RedisExpireEvent extends require('./RedisEvent') {
    constructor(redisClientListener, redisClientScheduler, db = 0) {
        super(redisClientListener, db);
        this.scheduler = redisClientScheduler;
        super.subscribeToEvents(redisEventConstants.EXPIRE)
    }

    _getMillis(expiration) {
        if (expiration instanceof Date) {
            var now = new Date().getTime();
            expiration = expiration.getTime() - now;
        }
        return expiration;
    };

    async schedule(key, ttl, handler) {
        try {
            const result = await this.scheduler.set(key, '', 'PX', this._getMillis(ttl));
            super.register(redisEventConstants.EXPIRE, key, handler);

        } catch (err) {
            throw err;
        }
    }
}

module.exports = RedisExpireEvent;