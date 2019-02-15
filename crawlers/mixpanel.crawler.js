'use strict';

class MixpanelCrawler {
    constructor(kpi) {
        this.kpi = kpi;
    }
    crawl() {
        console.log('MixpanelCrawler > crawl');
    }
}

module.exports = MixpanelCrawler;