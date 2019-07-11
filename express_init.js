var app = require('express')();
require('./register/database_connection');
require('./register/cache');
var user = require('./routes/user');
var constant = require('./routes/constant');


process.on('SIGINT', () => {
    console.log(`[Worker ${process.pid}]: Received SIGINT. Press Control-D to exit.`);
});


process.on('message', async function (message) {
    if (message.command && message.command === 'POPULATE_REDIS') {
        console.log(`[Worker ${process.pid}]: command ${message.command} from ${message.from}`);
        try {
            await populateRedis();
            process.send({from: process.pid, command: "POPULATE_REDIS_SUCCESS"})

        } catch(err) {
            process.send({from: process.pid, command: "POPULATE_REDIS_FAILED"})
        }
    }

    if (message === 'shutdown') {
        console.log(`[Worker ${process.pid}]:-------RECEIVED SHUTDOWN COMMAND--------`);
    }
});

function populateRedis() {
    return require('./services/redis_populate')();
}

app.use('/user', user);
app.use('/constant', constant);
app.get('/', (req, res) => {
    res.send(`Worker ${process.pid} served your request`);
});

app.get('/d', (req, res) => {
    res.send(`Worker ${process.pid} served your request and d is ${apiKeys.d}`);
});

app.get('/e', (req, res) => {
    res.send(`Worker ${process.pid} served your request and e is ${apiKeys.e}`);
});

app.get('/setd', (req, res) => {
    apiKeys.d += 1;
    res.send(`Worker ${process.pid} served your request and d is set to ${apiKeys.d}`);
});

app.get('/sete', (req, res) => {
    apiKeys.e = parseInt(req.query.e, 10);
    res.send(`Worker ${process.pid} served your request and e is set to ${apiKeys.e}`);
});

app.listen(4545, function() {
    console.log(`[Worker ${process.pid}]: listening`);
});
