const redisClient = require('./redis_connection');
const LockingMechanism = require('./LockingMechanism');

const lm = new LockingMechanism(redisClient);
module.exports = lm;
