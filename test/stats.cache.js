'use strict';

let chai = require('chai');
let expect = chai.expect;
const statsCacheLayer = require('../cache/stats.cache');
const QueryFilter = require('../converter/filter');

describe('Get redis stat', () => {
    it('should use redis cache', () => {
        let kpi = {
            _id: 1
        };
        let queryFilter = new QueryFilter();
        statsCacheLayer.set(kpi, queryFilter, 10);
        statsCacheLayer.get(kpi, queryFilter).then((cachedValue) => {
            expect(cachedValue).to.be.equal(10);
        });
    });
    it('should not use redis cache when fresh is requested', () => {
        let kpi = {
            _id: 1
        };
        let queryFilter = new QueryFilter('fresh=true');
        statsCacheLayer.set(kpi, queryFilter, 10);
        statsCacheLayer.get(kpi, queryFilter).then((cachedValue) => {
            expect(cachedValue).to.be.equal(null);
        });
    });
});