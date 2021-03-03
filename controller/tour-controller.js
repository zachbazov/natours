const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(
        `${__dirname}/../dev-data/data/tours-simple.json`
    )
);

exports.checkID = (req, res, next, val) => {
    console.log(`Tour id is ${val}`);
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'failure',
            message: 'Invalid ID',
        });
    }
    next();
};

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price)
        return res.status(404).json({
            status: 'failure',
            message: 'Missing name or price.',
        });
    next();
};

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours,
    });
};

exports.getTour = (req, res) => {
    // req.params - an object which automatically assigns the value to a parameter.
    //console.log(req.params);

    // converts string to number
    const id = req.params.id * 1;
    const tour = tours.find((el) => el.id === id);

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
};

exports.createTour = (req, res) => {
    //console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;

    // Creates a new object by merging two existing objects together.
    const newTour = Object.assign(
        { id: newId },
        req.body
    );

    tours.push(newTour);

    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour,
                },
            });
        }
    );
};

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            tour: 'updatedTour',
        },
    });
};

exports.deleteTour = (req, res) => {
    // 204 - no content
    res.status(204).json({
        status: 'success',
        data: null,
    });
};
