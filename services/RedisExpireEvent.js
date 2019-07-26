class RedisExpireEvent extends require('./RedisEvent'){
    constructor(redisClientListener, redisClientScheduler, db = 0) {
        super(redisClientListener, db);
        this.scheduler = redisClientScheduler;
    }


}

module.exports = RedisExpireEvent;