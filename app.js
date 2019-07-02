const cluster = require('cluster');

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

    app.listen(4545, function() {
        console.log(`Worker ${process.pid} is listening to all incoming requests`);
    });
}