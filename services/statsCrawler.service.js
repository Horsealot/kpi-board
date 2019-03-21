const mongoose = require('mongoose');
require('./../models/Kpis');
const Kpis = mongoose.model('Kpis');
const async = require('promise-async');
const CrawlerFactory = require('./../crawlers/factory');

const self = {
    crawl: async (schedulers) => {
        let processors = new Array();
        const kpis = await Kpis.find({crawled: true, schedule: {$in: schedulers}});
        for(let i = 0; i<kpis.length; i++) {
            self.crawlKpi(kpis[i]);
        }
    },
    crawlKpi: (kpi) => {
        const crawler = CrawlerFactory.get(kpi);
        crawler.crawl();
    }
};

module.exports = self;