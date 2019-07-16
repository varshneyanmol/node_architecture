const cluster = require('cluster');

if (cluster.isMaster) {
    require('./master_init')(cluster);
} else {
    require('./express_init');
}