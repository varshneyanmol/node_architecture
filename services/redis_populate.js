const redis = require('./redis_connection');

function filterAndProcess(line) {
    line = line.trim().replace(/\s\s+/g, ' ');
    return line.startsWith('#')
        ? false
        : !line
            ? false
            : line.split(' ');
}

function populateRedis() {
    return new Promise((resolve, reject) => {
        const lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(__dirname + '/../cfg.txt')
        });
        lineReader.on('line', async function (line) {
            line = filterAndProcess(line);

            if (line) {
                try {
                    await redis.set(line[0], parseInt(line[1], 10));
                } catch (err) {
                    return reject(err);
                }
            }
        });

        lineReader.on('close', function () {
            resolve(1);
        });
    });
}

module.exports = populateRedis;