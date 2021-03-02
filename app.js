const express = require('express');
const compression = require('compression');
const fs = require('fs');

const app = express();

app.use(compression());

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours,
    });
});

module.exports = app;
