'use strict';

let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let mongoose = require('mongoose');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

const testData = require('./data.json');

const QueryFilter = require('./../converter/filter');
const statsService = require('./../services/statsQuery.service');
const statsRedis = require('./../redis/stats.redis');

describe('StatsQuery service', () => {
    let kpiId;
    let stubSandbox;
    let savedTestData;
    beforeEach((done) => { //Before each test we empty the database
        stubSandbox = sinon.createSandbox();
        StatsModel.deleteMany({}, (err) => {
        }).then(() => {
            return KpisModel.deleteMany({});
        }).then(() => {
            const kpi = new KpisModel(testData.kpi);
            return kpi.save();
        }).then((kpi) => {
            kpiId = kpi._id;
            savedTestData = testData.stats.map((stat) => {
                stat.date = new Date(stat.date);
                stat.kpi = kpi._id;
                return new StatsModel(stat);
            });
            return StatsModel.insertMany(savedTestData);
        }).then(() => {
            done();
        })
    });

    afterEach(function () {
        stubSandbox.restore();
    });
    it('should get stats', (done) => {
        KpisModel.findOne({name: 'KPI name'}).then((kpi) => {
            statsService.get(kpi, new QueryFilter('startDate=2019-01-01T10:00:00Z,endDate=2019-01-01T18:00:00Z')).then((result) => {
                expect(result).to.be.a('object');
                result.should.have.property('kpi');
                result.should.have.property('stats');
                result.stats.should.be.a('array');

                // savedTestData.forEach((stat) => {
                //     result.stats.should.deep.include(stat.toJSON());
                // });
                done();
            })
        });
    });
    it('should get stats', (done) => {
        sinon.stub(statsRedis, "get").returns(new Promise(function(resolve) {
            resolve([{value: 2, date: "2019-10-01T12:00:00.000Z"}]);
        }));
        KpisModel.findOne({name: 'KPI name'}).then((kpi) => {
            statsService.get(kpi, new QueryFilter('startDate=2019-01-01T10:00:00Z,endDate=2019-01-01T18:00:00Z')).then((result) => {
                expect(result).to.be.a('object');
                result.should.have.property('kpi');
                result.should.have.property('stats');
                result.stats.should.be.a('array');
                result.stats.should.deep.include({value: 2, date: "2019-10-01T12:00:00.000Z"});
                done();
            })
        });
    });
});