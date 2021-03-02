const express = require('express');
const compression = require('compression');

const app = express();

app.use(compression());

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
    });
});

module.exports = app;
