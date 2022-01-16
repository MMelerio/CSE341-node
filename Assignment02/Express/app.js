const express = require('express');

const app = express();

/*
app.use((req, res, next) => {
    console.log('First Middleware');
    next();
});

app.use((req, res, next) => {
    console.log('Second Middleware');
    res.send('<p>Second Middleware</p>')
});
*/

app.use('/users', (req, res, next) => {
    console.log('/users');
    res.send('<p>This should appear only in /users</p>')
});

app.use('/', (req, res, next) => {
    console.log('/');
    res.send('<p>This should appear only in /</p>')
});

app.listen(3000);