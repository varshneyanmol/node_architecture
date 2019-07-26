const redis = require('redis');
const util = require('util');
const RedisEvent = require('./RedisEvent');

const redisURI = 'redis://35.200.131.140:2222';
const redisClientListner = redis.createClient(redisURI);
// const redisClientScheduler = redis.createClient(redisURI);


function run() {
    const redisEvent = new RedisEvent(redisClientListner);
    redisEvent.subscribeToEvents([redisEvent.events.EXPIRED, redisEvent.events.EXPIRE, redisEvent.events.DEL, redisEvent.events.SET]);
    redisEvent.register(redisEvent.events.EXPIRED, 'hello', function() {
        console.log('KEY HELLO EXPIRED....');
    });

    redisEvent.register(redisEvent.events.SET, 'hello', function() {
        console.log('KEY HELLO SET....');
    });

    redisEvent.register(redisEvent.events.SET, 'he+', function(key) {
        console.log('KEY '+ key +' SET FROM PATTERN....');
    }, true);

    // redisEvent.register(redisEvent.events.SET, 'hello', function() {
    //     console.log('KEY HELLO SET HANDLER 2....');
    // });
    //
    //
    // redisEvent.register(redisEvent.events.DEL, 'hello', function() {
    //     console.log('KEY HELLO DELETED....');
    // });
    //
    // redisEvent.register(redisEvent.events.EXPIRE, 'hello', function() {
    //     console.log('KEY HELLO SET EXPIRE....');
    // });
    //
    // redisEvent.register(redisEvent.events.SET, 'h', function() {
    //     console.log('KEY H SET EXPIRE....');
    // });
    //
    // redisEvent.register(redisEvent.events.SET, 'k', function() {
    //     console.log('KEY K SET EXPIRE....');
    // });
}
run();

// redisClient.get = util.promisify(redisClient.get);
// redisClient.hget = util.promisify(redisClient.hget);
// redisClient.set = util.promisify(redisClient.set);
// redisClient.hset = util.promisify(redisClient.hset);
// redisClient.setnx = util.promisify(redisClient.setnx);
// redisClient.getset = util.promisify(redisClient.getset);
// redisClient.quit = util.promisify(redisClient.quit);

module.exports = {
    redisClientListner
};