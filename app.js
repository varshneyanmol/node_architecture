const cluster = require('cluster');

if (cluster.isMaster) {
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

            if (message.command === 'SHUTDOWN_CLEANUP_SUCCESS') {
                console.log(`[Master]: command ${message.command} from worker ${this.process.pid}`);
                this.disconnect();
            }

            if (isMain) {
                initStuff(this);
                this.on('message', function (message) {
                    if (message.command === 'POPULATE_REDIS_SUCCESS') {
                        console.log(`[Master]: command ${message.command} from worker ${this.process.pid}`);
                        startOtherWorkers();
                        // process.send() works only with pm2
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
            if (!this.exitedAfterDisconnect) {
                console.log(`[Master]: Spawning a replacement of dead worker ${this.process.pid}`);
                spawn(i)
            } else {
                console.log(`[Master]: Worker ${this.process.pid} died intentionally`);
            }
        });
    }

    spawn(0, true);


    // In windows environment, pm2 spawns terminals each attached to one node child process.
    // In linux environment, no such behaviour is found
    // when pm2 sends kill commands, it sends 'SIGINT' signal to all the running node process be it master or child.
    // SIGINT and all these signals are sent only in linux environment

    process.on('SIGINT', function () {
        console.log('[Master]-------RECEIVED INTERRUPT SIGNAL--------');
        for (let i = 0; i < workers.length; i++) {
            // workers[i].disconnect();
            workers[i].send({from: "master", command: "shutdown_cleanup"});

            setTimeout(function () {
                if (!workers[i].isDead()) {
                    console.log(`[Master]: Worker ${workers[i].process.pid} still alive after 5000ms. Sending SIGKILL to kill it forcefully...`)
                    workers[i].kill('SIGKILL');
                }
            }, 3000);
        }

        setInterval(() => {
            let allDone = true;
            for (let i = 0; i < workers.length; i++) {
                if (!workers[i].isDead()) {
                    allDone = false;
                    break;
                }
            }

            console.log('[Master]: ALL DONE: ' + allDone);
            if (allDone) {
                process.exit(0);
            }

        }, 100);

    });

} else {
    require('./express_init');
}