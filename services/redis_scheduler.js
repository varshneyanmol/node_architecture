const RedisScheduler = require('redis-scheduler');
const redisScheduler = new RedisScheduler({
    host: "35.200.131.140",
    port: 2222
});


var expirationTime = 1000;

function eventTriggered(err, key) {
    console.log(key + ' triggered');
}

redisScheduler.schedule({
    key: 'test-key', expire: expirationTime, handler: eventTriggered}, function (err) {
    // Schedule set
});

redisScheduler.addHandler({
    key: 'test-key', handler: function () {
        console.log('another event');
    }
});

redisScheduler.reschedule({key: 'test-key', expire: 3000}, function () {
    console.log('rescheduled');
});

redisScheduler.cancel({key: 'test-key'}, function () {
    console.log('canceled');
});