module.exports = {
    apps: [{
        name: "dummy-app",
        script: "app.js",
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000
    }]
};