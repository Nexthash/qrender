const express = require('express');
const app = express();
const loadMiddleware = require('../../index.js');
app.use(loadMiddleware());

app.get('/*', (req, res) => {
    console.log(__dirname);
    res.sendFile(__dirname + '/index.html');
});

app.listen(8080);
console.log('listening for port 8080');