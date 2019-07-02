const cluster = require('cluster');
const {apiKeys} = require('./constants');

if (cluster.isMaster) {
    console.log(`Cluster Master is running with id ${process.pid}`);

    const numWorkers = require('os').cpus().length;
    console.log("Number of workers: " + numWorkers);

    let workers = [];

    function spawn(i) {
        workers[i] = cluster.fork();

        workers[i].on('online', function() {
            console.log(`Worker ${workers[i].process.pid} is online`);
        });

        workers[i].on('exit', function(code, signal) {
            console.log(`Worker ${workers[i].process.pid} died with ${code} and signal ${signal}`);
            console.log('Spawning a new worker');
            spawn(i);
        });
    }

    for (let i = 0; i < numWorkers; i++) {
        spawn(i);
    }

} else {
    var app = require('express')();
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
        console.log(`Worker ${process.pid} is listening to all incoming requests`);
    });
}