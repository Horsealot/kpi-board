const mongoose = require('mongoose');
require('./../models/Kpis');
require('./../models/Stats');
const Kpis = mongoose.model('Kpis');
const Stats = mongoose.model('Stats');

const statsCache = require('../cache/stats.cache');

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
            return Stats.find({...query.generateQuery(), kpi: kpi._id});
        }).then((stats) => {
            if(!cached) {
                statsCache.set(kpi, query, stats);
                stats = stats.map((stat) => stat.toJSON())
            }
            return {
                kpi,
                stats
            };
        });
    }
};

module.exports = self;