'use strict';

const LinkCrawler = require('./link.crawler');
const GoogleAnalyticsCrawler = require('./ga.crawler');
const MixpanelCrawler = require('./mixpanel.crawler');

module.exports = {
    get: (kpi) => {
        switch (kpi.source.type) {
            case 'link':
                return new LinkCrawler(kpi);
            case 'ga':
                return new GoogleAnalyticsCrawler(kpi);
            case 'mixpanel':
                return new MixpanelCrawler(kpi);
        }
        throw new Error('Unknown type');
    }
};