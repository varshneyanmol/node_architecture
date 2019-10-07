// const cluster = require('cluster');
//
// if (cluster.isMaster) {
//     require('./master_init');
// } else {
//     require('./express_init');
// }

// var cluster = require('cluster')
//     , app = require('./demo');
//
// cluster('./demo')
//     .listen(3000);

// cluster('./demo')
//     .use(cluster.logger('logs'))
//     .use(cluster.stats())
//     .use(cluster.pidfiles('pids'))
//     .use(cluster.cli())
//     .use(cluster.repl(8888))
//     .listen(3000);


var cluster = require('cluster-mode');
var config = {
    max: 2 // start the application with 8 workers
};
cluster.start(config, function () {
    // cluster process is ready
});


