const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../model/user-model');
const Tour = require('../../model/tour-model');
const Review = require('../../model/review-model');

dotenv.config({ path: './config.env' });

const db = process.env.DB_URL.replace(
    /<DB_USER>|<DB_PASS>|<DB_CLUSTER>|<DB_NAME>/gi, (arg) => {
        return {
            '<DB_USER>': process.env.DB_USER,
            '<DB_PASS>': process.env.DB_PASS,
            '<DB_CLUSTER>': process.env.DB_CLUSTER,
            '<DB_NAME>': process.env.DB_NAME,
        }[arg]
    }
);

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DATABASE: CONNECTED'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const importData = async () => {
    try {
        await User.create(users, {validateBeforeSave: false});
        await Tour.create(tours);
        await Review.create(reviews);
        console.log('data has been loaded.');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await User.deleteMany();
        await Tour.deleteMany();
        await Review.deleteMany();
        console.log('data has been deleted.');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
