'use strict';

let chai = require('chai');
let expect = chai.expect;
const crawlerFactory = require('../crawlers/factory');
const LinkCrawler = require('../crawlers/link.crawler');
const GoogleAnalyticsFactory = require('../crawlers/ga.crawler');
const MixpanelFactory = require('../crawlers/mixpanel.crawler');

describe('Crawler factory', () => {
    it('should return a LinkFactory', () => {
        expect(crawlerFactory.get({
            source: {
                type: 'link'
            }
        })).to.be.an.instanceof(LinkCrawler);
    });
    it('should return a GoogleAnalyticsFactory', () => {
        expect(crawlerFactory.get({
            source: {
                type: 'ga'
            }
        })).to.be.an.instanceof(GoogleAnalyticsFactory);
    });
    it('should return a MixpanelFactory', () => {
        expect(crawlerFactory.get({
            source: {
                type: 'mixpanel'
            }
        })).to.be.an.instanceof(MixpanelFactory);
    });
    it('should throw an error for an unknown type', () => {
        try {
            crawlerFactory.get({
                source: {
                    type: 'unknown'
                }
            });
            expect(false).to.be.true;
        } catch(error) {
            expect(true).to.be.true;
        }
    });
});