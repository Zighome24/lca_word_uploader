'use strict';

const express = require('express');
const api = require('./driveAPI');

const PORT = 12345;
const HOST = '127.0.0.1';

//App
const app = express();



app.get('/', (req, res)=> {
    api.getEverything();
    res.send('Hello world\n');
});

app.listen(PORT, HOST);
console.log('Running on http://%s:%d', HOST, PORT);