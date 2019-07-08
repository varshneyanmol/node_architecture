var app = require('express')();
require('./register/database_connection');
require('./register/cache');

var user = require('./routes/user');
var constant = require('./routes/constant');

app.use('/user', user);
app.use('/constant', constant);
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
