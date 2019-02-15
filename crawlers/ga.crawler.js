'use strict';

class GoogleAnalyticsCrawler {
    constructor(kpi) {
        this.kpi = kpi;
    }
    crawl() {
        console.log('GoogleAnalyticsCrawler > crawl');
    }
}

module.exports = GoogleAnalyticsCrawler;