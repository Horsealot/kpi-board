//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let sinon = require('sinon');
let chaiHttp = require('chai-http');
let server = require('../server');
let mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const notificationProducer = require('./../producers/notifications');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

const testData = require('./data.json');

chai.use(chaiHttp);

function generateTestJwt(content) {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({...content, exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}

//Our parent block
describe('Kpi Query', () => {
    let kpiId;
    let stubSandbox;
    let savedTestData;
    beforeEach((done) => { //Before each test we empty the database
        stubSandbox = sinon.createSandbox();
        StatsModel.deleteMany({}, (err) => {
        }).then(() => {
            return KpisModel.deleteMany({});
        }).then(() => {
            const kpi1 = new KpisModel(testData.kpis[0]);
            return kpi1.save();
        }).then((kpi) => {
            kpiId = kpi._id;
            savedTestData = testData.stats.map((stat) => {
                stat.date = new Date(stat.date);
                stat.kpi = kpi._id;
                return new StatsModel(stat);
            });
            return StatsModel.insertMany(savedTestData);
        }).then(() => {
            const kpi2 = new KpisModel(testData.kpis[1]);
            return kpi2.save();
        }).then((kpi) => {
            kpiId = kpi._id;
            savedTestData = testData.stats1.map((stat) => {
                stat.date = new Date(stat.date);
                stat.kpi = kpi._id;
                return new StatsModel(stat);
            });
            return StatsModel.insertMany(savedTestData);
        }).then(() => {
            const kpi3 = new KpisModel(testData.kpis[2]);
            return kpi3.save();
        }).then((kpi) => {
            kpiId = kpi._id;
            savedTestData = testData.stats2.map((stat) => {
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

    /*
    * Test the /GET /kpis route
    */
    describe('/GET /kpis', () => {
        it('should not accept a GET when not identified', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .send({})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a GET with a wrong JWT', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .set('Authorization', 'Bearer Dsdqdsdqdsqdq')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a GET with a JWT missing details', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({}))
                .send()
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
        it('should return 400 on a db error', (done) => {
            stubSandbox.stub(KpisModel, "find").withArgs({'owner.type': 'user', 'owner.id': '1'}).returns(new Promise(function(resolve) {
                throw new Error();
            }));
            chai.request(server)
                .get('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '1'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should return empty on an unknown user', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '1'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('kpis');
                    res.body.kpis.should.be.a('array').eql([]);
                    done();
                });
        });
        it('should return all kpis of a user with multiple kpis', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('kpis');
                    res.body.kpis.should.be.a('array');
                    res.body.kpis.should.have.length(2);
                    res.body.kpis[0].should.have.property('stats');
                    res.body.kpis[0].stats.should.be.a('array');
                    res.body.kpis[0].stats.should.have.length(8);
                    res.body.kpis[1].should.have.property('stats');
                    res.body.kpis[1].stats.should.be.a('array');
                    res.body.kpis[1].stats.should.have.length(9);
                    done();
                });
        });
        it('should return all kpis of a user with a single kpi', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '3'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('kpis');
                    res.body.kpis.should.be.a('array');
                    res.body.kpis.should.have.length(1);
                    res.body.kpis[0].should.have.property('stats');
                    res.body.kpis[0].stats.should.be.a('array');
                    res.body.kpis[0].stats.should.have.length(6);
                    done();
                });
        });
        it('should return all kpis of a user', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('kpis');
                    res.body.kpis.should.be.a('array');
                    res.body.kpis.should.have.length(2);
                    res.body.kpis[0].should.have.property('stats');
                    res.body.kpis[0].stats.should.be.a('array');
                    res.body.kpis[0].stats.should.have.length(8);
                    res.body.kpis[1].should.have.property('stats');
                    res.body.kpis[1].stats.should.be.a('array');
                    res.body.kpis[1].stats.should.have.length(9);
                    done();
                });
        });
        it('should return all kpis of a user and stats within a period', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .query({q: 'startDate=2019-01-01T11:59:00Z,endDate=2019-01-01T16:01:00Z'})
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('kpis');
                    res.body.kpis.should.be.a('array');
                    res.body.kpis.should.have.length(2);
                    res.body.kpis[0].should.have.property('stats');
                    res.body.kpis[0].stats.should.be.a('array');
                    res.body.kpis[0].stats.should.have.length(5);
                    res.body.kpis[1].should.have.property('stats');
                    res.body.kpis[1].stats.should.be.a('array');
                    res.body.kpis[1].stats.should.have.length(5);
                    done();
                });
        });
        it('should return all kpis of a user even if there is no stat within the period', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .query({q: 'startDate=2019-01-01T01:59:00Z,endDate=2019-01-01T02:01:00Z'})
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('kpis');
                    res.body.kpis.should.be.a('array');
                    res.body.kpis.should.have.length(2);
                    res.body.kpis[0].should.have.property('stats');
                    res.body.kpis[0].stats.should.be.a('array');
                    res.body.kpis[0].stats.should.have.length(0);
                    res.body.kpis[1].should.have.property('stats');
                    res.body.kpis[1].stats.should.be.a('array');
                    res.body.kpis[1].stats.should.have.length(0);
                    done();
                });
        });
        it('should return all kpis of a user with empty stats if the filter are not valid', (done) => {
            chai.request(server)
                .get('/api/kpis')
                .query({q: 'startDate=2019-01-01T05:59:00Z,endDate=2019-01-01T02:01:00Z'})
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('kpis');
                    res.body.kpis.should.be.a('array');
                    res.body.kpis.should.have.length(2);
                    res.body.kpis[0].should.have.property('stats');
                    res.body.kpis[0].stats.should.be.a('array');
                    res.body.kpis[0].stats.should.have.length(0);
                    res.body.kpis[1].should.have.property('stats');
                    res.body.kpis[1].stats.should.be.a('array');
                    res.body.kpis[1].stats.should.have.length(0);
                    done();
                });
        });
    });

    /*
    * Test the /GET /kpis/:id route
    */
    describe('/GET /kpis/:id', () => {
        it('should not accept a GET when not identified', (done) => {
            chai.request(server)
                .get('/api/kpis/5c48a820604151183a02e1d3')
                .send({})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a GET with a wrong JWT', (done) => {
            chai.request(server)
                .get('/api/kpis/5c48a820604151183a02e1d3')
                .set('Authorization', 'Bearer Dsdqdsdqdsqdq')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a GET with a JWT missing details', (done) => {
            chai.request(server)
                .get('/api/kpis/5c48a820604151183a02e1d3')
                .set('Authorization', 'Bearer ' + generateTestJwt({}))
                .send()
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
        it('should return 404 on an unknown KPI', (done) => {
            chai.request(server)
                .get('/api/kpis/5c48a820604151183a02e1d3')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '1'}))
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
        it('should return 403 on an unauthorized KPI', (done) => {
            KpisModel.findOne({'owner.id': 3}).then((kpi) => {
                chai.request(server)
                    .get('/api/kpis/' + kpi._id)
                    .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '1'}))
                    .send()
                    .end((err, res) => {
                        res.should.have.status(403);
                        done();
                    });
            });
        });
        it('should return all stats of a kpi', (done) => {
            KpisModel.findOne({'name': 'KPI name'}).then((kpi) => {
                chai.request(server)
                    .get('/api/kpis/' + kpi._id)
                    .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('kpi');
                        res.body.kpi.should.be.a('object');
                        res.body.kpi.should.have.property('stats');
                        res.body.kpi.stats.should.be.a('array');
                        res.body.kpi.stats.should.have.length(8);
                        done();
                    });
            });
        });
        it('should return an empty array of stats of a kpi if no stats are within the period', (done) => {
            KpisModel.findOne({'name': 'KPI name'}).then((kpi) => {
                chai.request(server)
                    .get('/api/kpis/' + kpi._id)
                    .query({q: 'startDate=2019-01-01T01:59:00Z,endDate=2019-01-01T03:01:00Z'})
                    .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('kpi');
                        res.body.kpi.should.be.a('object');
                        res.body.kpi.should.have.property('stats');
                        res.body.kpi.stats.should.be.a('array');
                        res.body.kpi.stats.should.have.length(0);
                        done();
                    });
            });
        });
    });

    // /*
    // * Test the /POST /kpis/:id route
    // */
    // describe('/POST /kpis/:id', () => {
    //     it('should not accept a POST when not identified', (done) => {
    //         chai.request(server)
    //             .post('/api/kpis/507f1f77bcf86cd799439011')
    //             .send({})
    //             .end((err, res) => {
    //                 res.should.have.status(401);
    //                 done();
    //             });
    //     });
    //     it('should not accept a POST with a wrong JWT', (done) => {
    //         let body = {
    //             email: "test@testuser.com"
    //         };
    //         chai.request(server)
    //             .post('/api/kpis/507f1f77bcf86cd799439011')
    //             .set('Authorization', 'Bearer Dsdqdsdqdsqdq')
    //             .send(body)
    //             .end((err, res) => {
    //                 res.should.have.status(401);
    //                 done();
    //             });
    //     });
    //     it('should not accept a POST with a JWT missing details', (done) => {
    //         let body = {
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/',
    //                 target: '.label.oas3',
    //             },
    //             get: '.label.oas3',
    //             name: 'Kpi name',
    //             type: 'link',
    //             refreshPeriod: '1h',
    //         };
    //         chai.request(server)
    //             .post('/api/kpis/507f1f77bcf86cd799439011')
    //             .set('Authorization', 'Bearer ' + generateTestJwt({}))
    //             .send(body)
    //             .end((err, res) => {
    //                 res.should.have.status(403);
    //                 done();
    //             });
    //     });
    //     it('should not accept a POST with unknown id', (done) => {
    //         let body = {
    //             source: {
    //                 type: 'link',
    //                 selector: ''
    //             },
    //         };
    //         chai.request(server)
    //             .post('/api/kpis/507f1f77bcf86cd799439011')
    //             .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
    //             .send(body)
    //             .end((err, res) => {
    //                 res.should.have.status(404);
    //                 done();
    //             });
    //     });
    //     it('should not accept a POST with wrong source type', (done) => {
    //         const newKpi = new KpisModel({
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/',
    //                 target: 'a',
    //             },
    //             name: 'KPI name',
    //             type: 'number',
    //             schedule: '1d',
    //             owner: {type: 'user', id: '2'}
    //         });
    //         let body = {
    //             source: {
    //                 type: 'badtype',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/',
    //                 target: 'a',
    //             },
    //             name: 'KPI name',
    //             type: 'number',
    //             schedule: '1d'
    //         };
    //         newKpi.save().then((kpi) => {
    //             chai.request(server)
    //                 .post('/api/kpis/' + kpi._id)
    //                 .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
    //                 .send(body)
    //                 .end((err, res) => {
    //                     res.body.error.should.be.eql('Kpis validation failed: source.type: `badtype` is not a valid enum value for path `source.type`.');
    //                     res.should.have.status(400);
    //                     done();
    //                 });
    //         });
    //     });
    //     it('should not accept a POST with wrong type', (done) => {
    //         const newKpi = new KpisModel({
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/',
    //                 target: 'a',
    //             },
    //             name: 'KPI name',
    //             type: 'number',
    //             schedule: '1d',
    //             owner: {type: 'user', id: '2'}
    //         });
    //         let body = {
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/2',
    //                 target: 'a.2',
    //             },
    //             name: 'KPI name 2',
    //             type: 'badtype',
    //             schedule: '1h'
    //         };
    //         newKpi.save().then((kpi) => {
    //             chai.request(server)
    //                 .post('/api/kpis/' + kpi._id)
    //                 .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
    //                 .send(body)
    //                 .end((err, res) => {
    //                     res.should.have.status(200);
    //                     res.body.should.be.a('object');
    //                     res.body.kpi.should.be.a('object');
    //                     res.body.kpi.should.have.property('id');
    //                     res.body.kpi.should.have.property('name').eql(body.name);
    //                     res.body.kpi.should.have.property('type').eql(newKpi.type);
    //                     res.body.kpi.should.have.property('schedule').eql(body.schedule);
    //                     res.body.kpi.should.have.property('source');
    //                     res.body.kpi.source.should.be.a('object');
    //                     res.body.kpi.source.should.have.property('type').eql(body.source.type);
    //                     res.body.kpi.source.should.have.property('resource').eql(body.source.resource);
    //                     res.body.kpi.source.should.have.property('target').eql(body.source.target);
    //                     res.body.kpi.should.have.property('owner');
    //                     res.body.kpi.owner.should.be.a('object');
    //                     res.body.kpi.owner.should.have.property('type').eql('user');
    //                     res.body.kpi.owner.should.have.property('id').eql('2');
    //                     KpisModel.findOne({_id: res.body.kpi.id}).then((kpi) => {
    //                         expect(kpi).to.be.a('object');
    //                         kpi = kpi.toJSON();
    //                         kpi.should.have.property('name').eql(body.name);
    //                         kpi.should.have.property('type').eql(newKpi.type);
    //                         kpi.should.have.property('schedule').eql(body.schedule);
    //                         kpi.should.have.property('source');
    //                         kpi.source.should.be.a('object');
    //                         kpi.source.should.have.property('type').eql(body.source.type);
    //                         kpi.source.should.have.property('resource').eql(body.source.resource);
    //                         kpi.source.should.have.property('target').eql(body.source.target);
    //                         kpi.should.have.property('owner');
    //                         kpi.owner.should.be.a('object');
    //                         kpi.owner.should.have.property('type').eql('user');
    //                         kpi.owner.should.have.property('id').eql('2');
    //                         done();
    //                     });
    //                 });
    //         });
    //     });
    //     it('should not accept a POST with wrong schedule', (done) => {
    //         const newKpi = new KpisModel({
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/',
    //                 target: 'a',
    //             },
    //             name: 'KPI name',
    //             type: 'number',
    //             schedule: '1d',
    //             owner: {type: 'user', id: '2'}
    //         });
    //         let body = {
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/2',
    //                 target: 'a.2',
    //             },
    //             name: 'KPI name 2',
    //             type: 'number',
    //             schedule: '1da'
    //         };
    //         newKpi.save().then((kpi) => {
    //             chai.request(server)
    //                 .post('/api/kpis/' + kpi._id)
    //                 .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
    //                 .send(body)
    //                 .end((err, res) => {
    //                     res.body.error.should.be.eql('Kpis validation failed: schedule: `1da` is not a valid enum value for path `schedule`.');
    //                     res.should.have.status(400);
    //                     done();
    //                 });
    //         });
    //     });
    //     it('should accept a POST', (done) => {
    //         const newKpi = new KpisModel({
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/',
    //                 target: 'a',
    //             },
    //             name: 'KPI name',
    //             type: 'number',
    //             schedule: '1d',
    //             owner: {type: 'user', id: '2'}
    //         });
    //         let body = {
    //             source: {
    //                 type: 'link',
    //                 resource: 'https://swagger.io/docs/specification/data-models/enums/',
    //                 target: 'a',
    //             },
    //             name: 'KPI name',
    //             type: 'number',
    //             schedule: '1d'
    //         };
    //         newKpi.save().then((kpi) => {
    //             chai.request(server)
    //                 .post('/api/kpis/' + kpi._id)
    //                 .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
    //                 .send(body)
    //                 .end((err, res) => {
    //                     res.should.have.status(200);
    //                     res.body.should.be.a('object');
    //                     res.body.kpi.should.be.a('object');
    //                     res.body.kpi.should.have.property('id');
    //                     res.body.kpi.should.have.property('name').eql(body.name);
    //                     res.body.kpi.should.have.property('type').eql(body.type);
    //                     res.body.kpi.should.have.property('schedule').eql(body.schedule);
    //                     res.body.kpi.should.have.property('source');
    //                     res.body.kpi.source.should.be.a('object');
    //                     res.body.kpi.source.should.have.property('type').eql(body.source.type);
    //                     res.body.kpi.source.should.have.property('resource').eql(body.source.resource);
    //                     res.body.kpi.source.should.have.property('target').eql(body.source.target);
    //                     res.body.kpi.should.have.property('owner');
    //                     res.body.kpi.owner.should.be.a('object');
    //                     res.body.kpi.owner.should.have.property('type').eql('user');
    //                     res.body.kpi.owner.should.have.property('id').eql('2');
    //                     KpisModel.findOne({_id: res.body.kpi.id}).then((kpi) => {
    //                         expect(kpi).to.be.a('object');
    //                         kpi = kpi.toJSON();
    //                         kpi.should.have.property('name').eql(body.name);
    //                         kpi.should.have.property('type').eql(body.type);
    //                         kpi.should.have.property('schedule').eql(body.schedule);
    //                         kpi.should.have.property('source');
    //                         kpi.source.should.be.a('object');
    //                         kpi.source.should.have.property('type').eql(body.source.type);
    //                         kpi.source.should.have.property('resource').eql(body.source.resource);
    //                         kpi.source.should.have.property('target').eql(body.source.target);
    //                         kpi.should.have.property('owner');
    //                         kpi.owner.should.be.a('object');
    //                         kpi.owner.should.have.property('type').eql('user');
    //                         kpi.owner.should.have.property('id').eql('2');
    //                         done();
    //                     });
    //                 });
    //         });
    //     });
    // });
});