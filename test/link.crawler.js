'use strict';

let chai = require('chai');
let expect = chai.expect;
let should = chai.should()
const LinkCrawler = require('../crawlers/link.crawler');
let sinon = require('sinon');
let mongoose = require('mongoose');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

const httpService = require('./../services/http.service');
const notificationProducer = require('./../producers/notifications');

describe('LinkCrawler', () => {
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
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'h1',
                },
                name: 'KPI name',
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
    it('should crawl a link', (done) => {
        const httpServiceStub = stubSandbox.stub(httpService, "get").returns(new Promise(function(resolve, reject) {
            resolve({data: "<html><body><h1>1</h1></body></html>"});
        }));
        KpisModel.findOne({name: 'KPI name'}).then((kpi) => {
            const linkCrawler = new LinkCrawler(kpi);

            linkCrawler.crawl().then((stat) => {
                StatsModel.findOne({kpi: kpiId, _id: stat._id}).then((stat) => {
                    expect(stat).to.be.a('object');

                    stat = stat.toJSON();
                    stat.should.have.property('value').eql(1);
                    stat.should.not.have.property('delta');

                    expect(httpServiceStub.calledOnce).to.be.true;
                    httpServiceStub.resetHistory();
                    done();
                });
            });
        });
    });
    it('should set the previous delta', (done) => {
        const httpServiceStub = stubSandbox.stub(httpService, "get").returns(new Promise(function(resolve, reject) {
            resolve({data: "<html><body><h1>1</h1></body></html>"});
        }));
        const stat1 = new StatsModel({
            value: 10,
            date: new Date('2019-01-01 12:00:00'),
            kpi: kpiId
        });
        const stat2 = new StatsModel({
            value: 3,
            date: new Date('2019-01-01 10:00:00'),
            kpi: kpiId
        });
        stat1.save().then(() => {
            return stat2.save();
        }).then(() => {
            return KpisModel.findOne({name: 'KPI name'});
        }).then((kpi) => {
            const linkCrawler = new LinkCrawler(kpi);

            linkCrawler.crawl().then((stat) => {
                StatsModel.findOne({kpi: kpiId, _id: stat._id}).then((kpi) => {
                    expect(kpi).to.be.a('object');

                    kpi = kpi.toJSON();
                    kpi.should.have.property('value').eql(1);
                    kpi.should.have.property('delta').eql(-9);

                    expect(httpServiceStub.calledOnce).to.be.true;
                    httpServiceStub.resetHistory();
                    done();
                });
            });
        });
    });
    it('should trigger an error when the target is not found and retried 3 times', (done) => {
        const httpServiceStub = stubSandbox.stub(httpService, "get").returns(new Promise(function(resolve, reject) {
            resolve({data: "<html><body><h1>1</h1></body></html>"});
        }));
        const notificationProducerStub = stubSandbox.stub(notificationProducer, "kpiInError").returns();
        KpisModel.findOne({name: 'KPI name'}).then((kpi) => {
            kpi.source.target = '.unknown-class';
            const linkCrawler = new LinkCrawler(kpi);

            linkCrawler.crawl().then(() => {
                expect(false).to.be.true;
                done();
            }).catch((err) => {
                console.log(err);
                expect(httpServiceStub.calledThrice).to.be.true;
                expect(notificationProducerStub.calledOnce).to.be.true;
                httpServiceStub.resetHistory();
                notificationProducerStub.resetHistory();
                expect(err.message).to.be.eql('Invalid target');
                KpisModel.findOne({_id: kpiId}).then((kpi) => {
                    expect(kpi).to.be.a('object');
                    kpi = kpi.toJSON();
                    kpi.should.have.property('inError').eql(true);
                    done();
                });
            });
        });
    });
});