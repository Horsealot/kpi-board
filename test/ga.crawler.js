'use strict';

let chai = require('chai');
let expect = chai.expect;
let should = chai.should()
const GACrawler = require('../crawlers/ga.crawler');
let sinon = require('sinon');
let mongoose = require('mongoose');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

const config = require('config');
const { google } = require('googleapis');
const analytics = google.analytics('v3');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
const jwt = new google.auth.JWT(config.get('ga.client_email'), null, config.get('ga.private_key'), scopes);

const httpService = require('./../services/http.service');
const notificationProducer = require('./../producers/notifications');

describe('GoogleAnalytics Crawler', () => {
    let stubSandbox;
    let kpiId;
    beforeEach((done) => { //Before each test we empty the database
        stubSandbox = sinon.createSandbox();
        StatsModel.deleteMany({}, (err) => {
        }).then(() => {
            return KpisModel.deleteMany({});
        }).then(() => {
            const kpi = new KpisModel({
                source: {
                    type: 'ga',
                    target: 'ga:pageviews',
                    view: '94620685'
                },
                name: 'Google Analytics',
                type: 'number',
                schedule: '1d',
                owner: {type: 'user', id: '2'}
            });
            return kpi.save();
        }).then((kpi) => {
            kpiId = kpi._id;
            done();
        })
    });

    afterEach(function () {
        stubSandbox.restore();
    });
    it('should crawl a stat', (done) => {
        const jwtStub = stubSandbox.stub(jwt, "authorize").returns();
        const gaStub = stubSandbox.stub(analytics.data.ga, "get").returns(new Promise(function(resolve, reject) {
            resolve({data: {rows: [[1]]}});
        }));
        KpisModel.findOne({name: 'Google Analytics'}).then((kpi) => {
            const gaCrawler = new GACrawler(kpi);

            gaCrawler.crawl().then((stat) => {
                StatsModel.findOne({kpi: kpiId, _id: stat._id}).then((stat) => {
                    expect(stat).to.be.a('object');

                    stat = stat.toJSON();
                    stat.should.have.property('value');
                    stat.should.not.have.property('delta');

                    // expect(httpServiceStub.calledOnce).to.be.true;
                    // httpServiceStub.resetHistory();
                    done();
                });
            });
        });
    });
    it('should crawl a stat and record a delta', (done) => {
        const jwtStub = stubSandbox.stub(jwt, "authorize").returns();
        const gaStub = stubSandbox.stub(analytics.data.ga, "get").returns(new Promise(function(resolve, reject) {
            resolve({data: {rows: [[1]]}});
        }));
        KpisModel.findOne({name: 'Google Analytics'}).then((kpi) => {
            const gaCrawler = new GACrawler(kpi);

            const stat1 = new StatsModel({
                value: 10,
                date: new Date('2019-01-01 12:00:00'),
                kpi: kpi._id
            });
            const stat2 = new StatsModel({
                value: 3,
                date: new Date('2019-01-01 10:00:00'),
                kpi: kpi._id
            });

            stat1.save().then(() => {
                return stat2.save();
            }).then((kpi) => {
                return gaCrawler.crawl();
            }).then((stat) => {
                StatsModel.findOne({kpi: kpiId, _id: stat._id}).then((stat) => {
                    expect(stat).to.be.a('object');

                    stat = stat.toJSON();
                    stat.should.have.property('value');
                    stat.should.have.property('delta').eql(stat.value - 10);

                    // expect(httpServiceStub.calledOnce).to.be.true;
                    // httpServiceStub.resetHistory();
                    done();
                });
            });
        });
    });
});