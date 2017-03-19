const express = require('express');
const app = express();
const loadMiddleware = require('../../index.js');
app.use(loadMiddleware());

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000);
console.log('listening for port 3000');