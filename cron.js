const mongoose = require('mongoose');
const config = require('config');
const cron = require('node-cron');

const scheduleConverter = require('./converter/schedule');

const statsCrawler = require('./services/statsCrawler.service');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';
const isTesting = process.env.NODE_ENV === 'test';

/** Connect to the database */
mongoose.connect(`${config.get('db.host')}/${config.get('db.db_name')}`, { useNewUrlParser: true });

if(!isProduction && !isTesting) {
    mongoose.set('debug', true);
}

// Start rabbitmq producers
const Producer = require('./producers/index');
Producer.start();

//Models & routes
require('./models/Kpis');
require('./models/Stats');

cron.schedule('0 * * * * *', () => {
    const activeSchedulers = scheduleConverter.getActiveSchedulers();
    statsCrawler.crawl(activeSchedulers).then((promise) => {
        return promise;
    }).then(() => {
        console.log("Crawl finished");
    })
});
