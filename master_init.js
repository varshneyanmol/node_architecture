const cluster = require('cluster');

const masterIdentity = "[Master " + process.pid + "]:";
function sendToWorker(worker, command) {
    worker.send({
        from: "master",
        command: command
    });
}

console.log(`${masterIdentity} cluster master is running with process id ${process.pid}...`);

const numWorkers = require('os').cpus().length;
console.log(`${masterIdentity} number of workers: ${numWorkers}`);

let workers = [];

function startOtherWorkers() {
    for (let i = 1; i < numWorkers; i++) {
        spawn(i);
    }
}

function initStuff(worker) {
    sendToWorker(worker, "POPULATE_REDIS");
}

function processWorkerCommand(message) {
    if (message.command) {
        console.log(`${masterIdentity} received command "${message.command}" from ${message.from}`);
    }
    switch (message.command) {
        case 'SHUTDOWN_CLEANUP_SUCCESS':
            this.disconnect();
            break;

        case 'SHUTDOWN_CLEANUP_FAILED':
            break;

        case 'POPULATE_REDIS_SUCCESS':
            startOtherWorkers();
            // here process.send() works only with pm2
            process.send('ready');
            break;

        case 'POPULATE_REDIS_FAILED':
            initStuff(this);
            break;

        case undefined:
            break;

        default:
            console.log(`${masterIdentity} command "${message.command}" not recognised from ${message.from}`);
    }
}

function spawn(i, isMain) {
    workers[i] = cluster.fork();

    workers[i].on('online', function () {
        console.log(`${masterIdentity} worker ${this.process.pid} is online`);

        this.on('message', function(message) {
            processWorkerCommand.call(this, message);
        });


        /*this.on('message', function (message) {
            if (message.command === 'SHUTDOWN_CLEANUP_SUCCESS') {
                console.log(`${masterIdentity} received command ${message.command} from worker ${this.process.pid}`);
                this.disconnect();
            }
        });*/

        if (isMain) {
            initStuff(this);
            /*this.on('message', function (message) {
                if (message.command === 'POPULATE_REDIS_SUCCESS') {
                    console.log(`[Master]: command ${message.command} from worker ${this.process.pid}`);
                    startOtherWorkers();
                    // process.send() works only with pm2
                    process.send('ready');

                } else if (message.command === 'POPULATE_REDIS_FAILED') {
                    console.log(`[Master]: command ${message.command} from worker ${this.process.pid}`);
                    initStuff(this);
                }

            });*/
        }
    });

    workers[i].on('exit', function (code, signal) {
        console.log(`${masterIdentity} worker ${this.process.pid} died with code ${code} and signal ${signal}`);
        if (!this.exitedAfterDisconnect) {
            console.log(`${masterIdentity} spawning a replacement of dead worker ${this.process.pid}`);
            spawn(i);

        } else {
            console.log(`${masterIdentity} worker ${this.process.pid} died intentionally`);
        }
    });
}

spawn(0, true);

// In windows environment, pm2 spawns terminals each attached to one node child process.
// In linux environment, no such behaviour is found
// when pm2 sends kill commands, it sends 'SIGINT' signal to all the running node process be it master or child.
// SIGINT and all these signals are sent only in linux environment
process.on('SIGINT', function () {
    console.log(`${masterIdentity} -------RECEIVED INTERRUPT SIGNAL--------`);
    const maxWorkerTime = 3000;
    for (let i = 0; i < workers.length; i++) {
        // workers[i].disconnect();
        sendToWorker(workers[i], 'SHUTDOWN_CLEANUP');
        // workers[i].send({from: "master", command: "SHUTDOWN_CLEANUP"});


        setTimeout(function () {
            if (!workers[i].isDead()) {
                console.log(`${masterIdentity} worker ${workers[i].process.pid} still alive after ${maxWorkerTime}ms. Sending SIGKILL to kill it forcefully...`);
                workers[i].kill('SIGKILL');
            }
        }, maxWorkerTime);
    }

    setInterval(() => {
        let allDone = true;
        for (let i = 0; i < workers.length; i++) {
            if (!workers[i].isDead()) {
                allDone = false;
                break;
            }
        }

        console.log(`${masterIdentity} all workers terminated: ${allDone}`);
        if (allDone) {
            console.log(`${masterIdentity} exiting...`);
            process.exit(0);
        }

    }, 100);

});
