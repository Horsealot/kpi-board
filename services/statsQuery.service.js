const mongoose = require('mongoose');
require('./../models/Kpis');
require('./../models/Stats');
const Kpis = mongoose.model('Kpis');
const Stats = mongoose.model('Stats');

const statsRedis = require('./../redis/stats.redis');

const self = {
    get: (kpi, query) => {
        return statsRedis.get(kpi, query).then((cache) => {
            if(cache) {
                return cache;
            }
            return Stats.find({...query.generateQuery(), kpi: kpi._id});
        }).then((stats) => {
            return {
                kpi,
                stats
            };
        });
    }
};

module.exports = self;