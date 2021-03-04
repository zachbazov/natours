const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DB_URL
    .replace(/<DB_USER>|<DB_PASS>|<DB_CLUSTER>|<DB_NAME>/gi, (arg) => {
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

const server = app.listen(process.env.PORT, 
    () => console.log(`PORT: ${process.env.PORT}\nENVIRONMENT: ${app.get('env')}`)
);

process.on('unhandledRejection', (err) => {
    console.log(`[unhandledRejection] [${err.name}]`, err.message);
    server.close(() => process.exit(1));
});
