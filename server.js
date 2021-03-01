const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DB_URL.replace(
    /<USER>|<PASS>|<CLUSTER>|<NAME>/gi,
    (arg) => {
        return {
            '<USER>': process.env.DB_USER,
            '<PASS>': process.env.DB_PASS,
            '<CLUSTER>': process.env.DB_CLUSTER,
            '<NAME>': process.env.DB_NAME,
        }[arg];
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

const server = app.listen(process.env.PORT, () =>
    console.log(`PORT: ${process.env.PORT}\nENVIRONMENT: ${app.get('env')}`)
);

process.on('unhandledRejection', (err) => {
    console.log(`[unhandledRejection] [${err.name}]`, err.message);
    server.close(() => process.exit(1));
});
