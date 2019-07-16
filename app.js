const cluster = require('cluster');

if (cluster.isMaster) {
    require('./master_init');
} else {
    require('./express_init');
}