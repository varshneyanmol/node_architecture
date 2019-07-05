const redis = require('redis');
const util = require('util');

const redisURI = 'redis://35.200.131.140:2222';
const redisClient = redis.createClient(redisURI);

redisClient.get = util.promisify(redisClient.get);
redisClient.hget = util.promisify(redisClient.hget);
redisClient.set = util.promisify(redisClient.set);
redisClient.hset = util.promisify(redisClient.hset);
redisClient.setnx = util.promisify(redisClient.setnx);
redisClient.getset = util.promisify(redisClient.getset);

module.exports = redisClient;