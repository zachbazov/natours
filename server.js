const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = require('./app');

// Uncaught Exception Error
process.on('uncaughtException', (err) => {
    console.log(`[UncaughtException] 💥 [${err.name}]`, err.message);
    process.exit(1);
});

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
    .then(() => console.log('DATABASE: 🟢'));

const server = app.listen(process.env.PORT, 
    () => console.log(`PORT: ${process.env.PORT}\nENVIRONMENT: ${app.get('env')}`)
);

// Unhandled Rejection Error
process.on('unhandledRejection', (err) => {
    console.log(`[UnhandledRejection] 💥 [${err.name}]`, err.message);
    // Optional: crashing the server.
    server.close(() => process.exit(1));
});

// SIGTERM - A signal that used to cause a problem to really stop running.
process.on('SIGTERM', () => {
    console.log('[SIGTERM] 💥 received, shutting down...');
    server.close(() => console.log('[SIGTERM] 💥 process terminated.'));
});