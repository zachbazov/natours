const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../model/tour-model');

dotenv.config({ path: './config.env' });

const db = process.env.DB_URL.replace(
    /<DB_USER>|<DB_PASS>|<DB_CLUSTER>|<DB_NAME>/gi,
    (arg) =>
        ({
            '<DB_USER>': process.env.DB_USER,
            '<DB_PASS>': process.env.DB_PASS,
            '<DB_CLUSTER>': process.env.DB_CLUSTER,
            '<DB_NAME>': process.env.DB_NAME,
        }[arg])
);

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DATABASE: CONNECTED'));

const tours = JSON.parse(
    fs.readFileSync(
        `${__dirname}/tours-simple.json`,
        'utf-8'
    )
);

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('data has been loaded.');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('data has been deleted.');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
