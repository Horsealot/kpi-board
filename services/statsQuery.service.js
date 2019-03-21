const mongoose = require('mongoose');
require('./../models/Kpis');
require('./../models/Stats');
const Kpis = mongoose.model('Kpis');
const Stats = mongoose.model('Stats');

const statsCache = require('../cache/stats.cache');
const gaService = require('../services/ga.service');
const GetterFactory = require('./../getters/factory');

const self = {
    get: (kpi, query) => {
        let cached = false;
        return statsCache.get(kpi, query).then((cache) => {
            if(cache) {
                cached = true;
                return new Promise(function(resolve, reject) {
                    resolve(cache);
                });
            }

            const getter = GetterFactory.get(kpi, query);
            return getter.get();
            // crawler.crawl();
            // if(kpi.source.crawlable) {
            //
            // } else if(kpi.source.type === 'ga') {
            //
            //     return gaService.getData(kpi);
            // }
            // return Stats.find({...query.generateQuery(), kpi: kpi._id});
        }).then((stats) => {
            if(!cached) {
                statsCache.set(kpi, query, stats);
                stats = stats.map((stat) => stat.toJSON())
            }
            return {
                kpi,
                stats
            };
        }).catch((err) => {
            error: err
        });
    }
};

module.exports = self;