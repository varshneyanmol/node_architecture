const cluster = require('cluster');

if (cluster.isMaster) {

    process.on('SIGINT', function () {
        console.log('[Master]-------RECEIVED INTERRUPT SIGNAL--------');
    });


    process.on('message', function (msg) {
        if (msg == 'shutdown') {
            console.log('[Master]-------RECEIVED SHUTDOWN COMMAND--------');
        }
    });

    console.log(`Cluster Master is running with id ${process.pid}`);

    const numWorkers = require('os').cpus().length;
    console.log("Number of workers: " + numWorkers);

    let workers = [];

    function startOtherWorkers() {
        for (let i = 1; i < numWorkers; i++) {
            spawn(i);
        }
    }

    function initStuff(worker) {
        worker.send({from: "master", command: "POPULATE_REDIS"});
    }

    function spawn(i, isMain) {
        workers[i] = cluster.fork();

        workers[i].on('online', function () {
            console.log(`[Master]: Worker ${this.process.pid} is online`);
            if (isMain) {
                initStuff(this);
                this.on('message', function (message) {
                    if (message.command === 'POPULATE_REDIS_SUCCESS') {
                        console.log(`[Master]: command ${message.command} from worker ${this.process.pid}`);
                        startOtherWorkers();
                        process.send('ready');

                    } else if (message.command === 'POPULATE_REDIS_FAILED') {
                        console.log(`[Master]: command ${message.command} from worker ${this.process.pid}`);
                        initStuff(this);
                    }
                });
            }
        });

        workers[i].on('exit', function (code, signal) {
            console.log(`[Master]: Worker ${this.process.pid} died with code ${code} and signal ${signal}`);
            console.log(`[Master]: Spawning a replacement of dead worker ${this.process.pid}`);
            spawn(i);
        });
    }

    spawn(0, true);

} else {
    require('./express_init');
}