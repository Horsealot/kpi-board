const mongoose = require('mongoose');
require('./../models/Kpis');
const Kpis = mongoose.model('Kpis');
const async = require('promise-async');
const CrawlerFactory = require('./../crawlers/factory');

const self = {
    crawl: (schedulers) => {
        let processors = new Array();
        Kpis.find({schedule: {$in: schedulers}}).then((kpis) => {
            kpis.forEach((kpi) => {
                processors.push((callback) => {
                    self.crawlKpi(kpi);
                    callback();
                });
            });
        });
        return async.parallel(processors);
    },
    crawlKpi: (kpi) => {
        const crawler = CrawlerFactory.get(kpi);
        crawler.crawl();
    }
};

module.exports = self;