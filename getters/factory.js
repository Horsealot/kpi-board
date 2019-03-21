'use strict';

const StatsGetter = require('./stats.getter');
const GoogleAnalyticsGetter = require('./ga.getter');

module.exports = {
    get: (kpi, query) => {
        if(kpi.crawlable) {
            return new StatsGetter(kpi, query);
        } else if(kpi.source.type === 'ga') {
            return new GoogleAnalyticsGetter(kpi, query);
        }
        throw new Error('Unknown type');
    }
};