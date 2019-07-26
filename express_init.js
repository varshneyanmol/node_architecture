var app = require('express')();
const {close} = require('./register/database_connection');
require('./register/cache');
var user = require('./routes/user');
var constant = require('./routes/constant');
const s = require('./services/redis_event_test');

const workerIdentity = "[Worker " + process.pid + "]:";

function sendToMaster(command) {
    process.send({
        from: process.pid,
        command: command
    });
}

process.on('SIGINT', () => {
    // PM2 sends SIGINT signal to all the running node processes... so catch that signal and ignore...
    // because master will send 'shutdown' message to its worker processes
    console.log(`${workerIdentity} Ignoring SIGINT signal...`);
});


process.on('message', async function (message) {
    if (message.command) {
        console.log(`${workerIdentity} received command "${message.command}" from ${message.from}`);
    }
    switch (message.command) {
        case 'POPULATE_REDIS':
            try {
                await populateRedis();
                sendToMaster("POPULATE_REDIS_SUCCESS");

            } catch (err) {
                sendToMaster("POPULATE_REDIS_FAILED");
            }
            break;

        case 'SHUTDOWN_CLEANUP':
            try {
                await shutdownCleanup();
                sendToMaster("SHUTDOWN_CLEANUP_SUCCESS");

            } catch (err) {
                sendToMaster("SHUTDOWN_CLEANUP_FAILED");
            }
            break;

        default:
            console.log(`${workerIdentity} command "${message.command}" not recognised`);
    }
});

/*
process.on('message', async function (message) {
    console.log(`[Worker ${process.pid}]: command ${message.command} from ${message.from}`);
    if (message.command && message.command === 'POPULATE_REDIS') {
        try {
            await populateRedis();
            process.send({from: process.pid, command: "POPULATE_REDIS_SUCCESS"})

        } catch (err) {
            process.send({from: process.pid, command: "POPULATE_REDIS_FAILED"})
        }
    }

    if (message.command === 'shutdown_cleanup') {
        shutdownCleanup();
    }
});
*/


async function shutdownCleanup() {
    return new Promise(async (resolve, reject) => {
        try {
            await close();
            console.log(`${workerIdentity} mongoose connection closed`);

            await require('./services/redis_connection').quit();
            console.log(`${workerIdentity} redis connection closed`);

            resolve(1);
        } catch (err) {
            console.log(`${workerIdentity} Error while closing connections: ` + err);
            reject(err);
        }
    });
}

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

app.listen(4545, function () {
    console.log(`[Worker ${process.pid}]: listening`);
});


