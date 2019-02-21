//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../server');
let mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

chai.use(chaiHttp);

function generateTestJwt(content) {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({...content, exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}

//Our parent block
describe('Kpi', () => {
    beforeEach((done) => { //Before each test we empty the database
        StatsModel.deleteMany({}, (err) => {
        }).then(() => {
            return KpisModel.deleteMany({});
        }).then(() => {
            done();
        })
    });

    /*
    * Test the /POST /kpis route
    */
    describe('/POST /kpis', () => {
        it('should not accept a POST when not identified', (done) => {
            chai.request(server)
                .post('/api/kpis')
                .send({})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a POST with a wrong JWT', (done) => {
            let body = {
                email: "test@testuser.com"
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer Dsdqdsdqdsqdq')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a POST with a JWT missing details', (done) => {
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: '.label.oas3',
                },
                get: '.label.oas3',
                name: 'Kpi name',
                type: 'link',
                refreshPeriod: '1h',
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
        it('should not accept a POST with missing informations', (done) => {
            let body = {
                source: {
                    type: 'link',
                    selector: ''
                },
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(422);
                    done();
                });
        });
        it('should not accept a POST with wrong source type', (done) => {
            let body = {
                source: {
                    type: 'badtype',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d'
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.error.should.be.eql('Kpis validation failed: source.type: `badtype` is not a valid enum value for path `source.type`.');
                    done();
                });
        });
        it('should not accept a POST with wrong type', (done) => {
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'badtype',
                schedule: '1d'
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.error.should.be.eql('Kpis validation failed: type: `badtype` is not a valid enum value for path `type`.');
                    done();
                });
        });
        it('should not accept a POST with owner type', (done) => {
            let body = {
                owner: {
                    type: 'user'
                },
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'badtype',
                schedule: '1d'
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.error.should.be.eql('Kpis validation failed: type: `badtype` is not a valid enum value for path `type`.');
                    done();
                });
        });
        it('should not accept a POST with wrong schedule', (done) => {
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1da'
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.error.should.be.eql('Kpis validation failed: schedule: `1da` is not a valid enum value for path `schedule`.');
                    done();
                });
        });
        it('should accept a POST with an owner', (done) => {
            let body = {
                owner: {type: 'user', id: '2'},
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d'
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.kpi.should.be.a('object');
                    res.body.kpi.should.have.property('id');
                    res.body.kpi.should.have.property('name').eql(body.name);
                    res.body.kpi.should.have.property('type').eql(body.type);
                    res.body.kpi.should.have.property('schedule').eql(body.schedule);
                    res.body.kpi.should.have.property('source');
                    res.body.kpi.source.should.be.a('object');
                    res.body.kpi.source.should.have.property('type').eql(body.source.type);
                    res.body.kpi.source.should.have.property('resource').eql(body.source.resource);
                    res.body.kpi.source.should.have.property('target').eql(body.source.target);
                    res.body.kpi.should.have.property('owner');
                    res.body.kpi.owner.should.be.a('object');
                    res.body.kpi.owner.should.have.property('type').eql('user');
                    res.body.kpi.owner.should.have.property('id').eql('2');
                    KpisModel.findOne({_id: res.body.kpi.id}).then((kpi) => {
                        expect(kpi).to.be.a('object');
                        kpi = kpi.toJSON();
                        kpi.should.have.property('name').eql(body.name);
                        kpi.should.have.property('type').eql(body.type);
                        kpi.should.have.property('schedule').eql(body.schedule);
                        kpi.should.have.property('source');
                        kpi.source.should.be.a('object');
                        kpi.source.should.have.property('type').eql(body.source.type);
                        kpi.source.should.have.property('resource').eql(body.source.resource);
                        kpi.source.should.have.property('target').eql(body.source.target);
                        kpi.should.have.property('owner');
                        kpi.owner.should.be.a('object');
                        kpi.owner.should.have.property('type').eql('user');
                        kpi.owner.should.have.property('id').eql('2');
                        done();
                    });
                });
        });
        it('should accept a POST wihout an owner', (done) => {
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d'
            };
            chai.request(server)
                .post('/api/kpis')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.kpi.should.be.a('object');
                    res.body.kpi.should.have.property('id');
                    res.body.kpi.should.have.property('name').eql(body.name);
                    res.body.kpi.should.have.property('type').eql(body.type);
                    res.body.kpi.should.have.property('schedule').eql(body.schedule);
                    res.body.kpi.should.have.property('source');
                    res.body.kpi.source.should.be.a('object');
                    res.body.kpi.source.should.have.property('type').eql(body.source.type);
                    res.body.kpi.source.should.have.property('resource').eql(body.source.resource);
                    res.body.kpi.source.should.have.property('target').eql(body.source.target);
                    res.body.kpi.should.have.property('owner');
                    res.body.kpi.owner.should.be.a('object');
                    expect(res.body.kpi.owner.type).to.be.undefined;
                    expect(res.body.kpi.owner.id).to.be.undefined;
                    KpisModel.findOne({_id: res.body.kpi.id}).then((kpi) => {
                        expect(kpi).to.be.a('object');
                        kpi = kpi.toJSON();
                        kpi.should.have.property('name').eql(body.name);
                        kpi.should.have.property('type').eql(body.type);
                        kpi.should.have.property('schedule').eql(body.schedule);
                        kpi.should.have.property('source');
                        kpi.source.should.be.a('object');
                        kpi.source.should.have.property('type').eql(body.source.type);
                        kpi.source.should.have.property('resource').eql(body.source.resource);
                        kpi.source.should.have.property('target').eql(body.source.target);
                        kpi.should.have.property('owner');
                        kpi.owner.should.be.a('object');
                        expect(kpi.owner.type).to.be.undefined;
                        expect(kpi.owner.id).to.be.undefined;
                        done();
                    });
                });
        });
    });

    /*
    * Test the /POST /kpis/:id route
    */
    describe('/POST /kpis/:id', () => {
        it('should not accept a POST when not identified', (done) => {
            chai.request(server)
                .post('/api/kpis/507f1f77bcf86cd799439011')
                .send({})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a POST with a wrong JWT', (done) => {
            let body = {
                email: "test@testuser.com"
            };
            chai.request(server)
                .post('/api/kpis/507f1f77bcf86cd799439011')
                .set('Authorization', 'Bearer Dsdqdsdqdsqdq')
                .send(body)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should not accept a POST with a JWT missing details', (done) => {
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: '.label.oas3',
                },
                get: '.label.oas3',
                name: 'Kpi name',
                type: 'link',
                refreshPeriod: '1h',
            };
            chai.request(server)
                .post('/api/kpis/507f1f77bcf86cd799439011')
                .set('Authorization', 'Bearer ' + generateTestJwt({}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });
        it('should not accept a POST with unknown id', (done) => {
            let body = {
                source: {
                    type: 'link',
                    selector: ''
                },
            };
            chai.request(server)
                .post('/api/kpis/507f1f77bcf86cd799439011')
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
        it('should not accept a POST with wrong source type', (done) => {
            const newKpi = new KpisModel({
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d',
                owner: {type: 'user', id: '2'}
            });
            let body = {
                source: {
                    type: 'badtype',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d'
            };
            newKpi.save().then((kpi) => {
                chai.request(server)
                    .post('/api/kpis/' + kpi._id)
                    .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                    .send(body)
                    .end((err, res) => {
                        res.body.error.should.be.eql('Kpis validation failed: source.type: `badtype` is not a valid enum value for path `source.type`.');
                        res.should.have.status(400);
                        done();
                    });
            });
        });
        it('should not accept a POST with wrong type', (done) => {
            const newKpi = new KpisModel({
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d',
                owner: {type: 'user', id: '2'}
            });
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/2',
                    target: 'a.2',
                },
                name: 'KPI name 2',
                type: 'badtype',
                schedule: '1h'
            };
            newKpi.save().then((kpi) => {
                chai.request(server)
                    .post('/api/kpis/' + kpi._id)
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.kpi.should.be.a('object');
                    res.body.kpi.should.have.property('id');
                    res.body.kpi.should.have.property('name').eql(body.name);
                    res.body.kpi.should.have.property('type').eql(newKpi.type);
                    res.body.kpi.should.have.property('schedule').eql(body.schedule);
                    res.body.kpi.should.have.property('source');
                    res.body.kpi.source.should.be.a('object');
                    res.body.kpi.source.should.have.property('type').eql(body.source.type);
                    res.body.kpi.source.should.have.property('resource').eql(body.source.resource);
                    res.body.kpi.source.should.have.property('target').eql(body.source.target);
                    res.body.kpi.should.have.property('owner');
                    res.body.kpi.owner.should.be.a('object');
                    res.body.kpi.owner.should.have.property('type').eql('user');
                    res.body.kpi.owner.should.have.property('id').eql('2');
                    KpisModel.findOne({_id: res.body.kpi.id}).then((kpi) => {
                        expect(kpi).to.be.a('object');
                        kpi = kpi.toJSON();
                        kpi.should.have.property('name').eql(body.name);
                        kpi.should.have.property('type').eql(newKpi.type);
                        kpi.should.have.property('schedule').eql(body.schedule);
                        kpi.should.have.property('source');
                        kpi.source.should.be.a('object');
                        kpi.source.should.have.property('type').eql(body.source.type);
                        kpi.source.should.have.property('resource').eql(body.source.resource);
                        kpi.source.should.have.property('target').eql(body.source.target);
                        kpi.should.have.property('owner');
                        kpi.owner.should.be.a('object');
                        kpi.owner.should.have.property('type').eql('user');
                        kpi.owner.should.have.property('id').eql('2');
                        done();
                    });
                });
            });
        });
        it('should not accept a POST with wrong schedule', (done) => {
            const newKpi = new KpisModel({
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d',
                owner: {type: 'user', id: '2'}
            });
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/2',
                    target: 'a.2',
                },
                name: 'KPI name 2',
                type: 'number',
                schedule: '1da'
            };
            newKpi.save().then((kpi) => {
                chai.request(server)
                    .post('/api/kpis/' + kpi._id)
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.body.error.should.be.eql('Kpis validation failed: schedule: `1da` is not a valid enum value for path `schedule`.');
                    res.should.have.status(400);
                    done();
                });
            });
        });
        it('should accept a POST', (done) => {
            const newKpi = new KpisModel({
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d',
                owner: {type: 'user', id: '2'}
            });
            let body = {
                source: {
                    type: 'link',
                    resource: 'https://swagger.io/docs/specification/data-models/enums/',
                    target: 'a',
                },
                name: 'KPI name',
                type: 'number',
                schedule: '1d'
            };
            newKpi.save().then((kpi) => {
                chai.request(server)
                    .post('/api/kpis/' + kpi._id)
                .set('Authorization', 'Bearer ' + generateTestJwt({type: 'user', id: '2'}))
                .send(body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.kpi.should.be.a('object');
                    res.body.kpi.should.have.property('id');
                    res.body.kpi.should.have.property('name').eql(body.name);
                    res.body.kpi.should.have.property('type').eql(body.type);
                    res.body.kpi.should.have.property('schedule').eql(body.schedule);
                    res.body.kpi.should.have.property('source');
                    res.body.kpi.source.should.be.a('object');
                    res.body.kpi.source.should.have.property('type').eql(body.source.type);
                    res.body.kpi.source.should.have.property('resource').eql(body.source.resource);
                    res.body.kpi.source.should.have.property('target').eql(body.source.target);
                    res.body.kpi.should.have.property('owner');
                    res.body.kpi.owner.should.be.a('object');
                    res.body.kpi.owner.should.have.property('type').eql('user');
                    res.body.kpi.owner.should.have.property('id').eql('2');
                    KpisModel.findOne({_id: res.body.kpi.id}).then((kpi) => {
                        expect(kpi).to.be.a('object');
                        kpi = kpi.toJSON();
                        kpi.should.have.property('name').eql(body.name);
                        kpi.should.have.property('type').eql(body.type);
                        kpi.should.have.property('schedule').eql(body.schedule);
                        kpi.should.have.property('source');
                        kpi.source.should.be.a('object');
                        kpi.source.should.have.property('type').eql(body.source.type);
                        kpi.source.should.have.property('resource').eql(body.source.resource);
                        kpi.source.should.have.property('target').eql(body.source.target);
                        kpi.should.have.property('owner');
                        kpi.owner.should.be.a('object');
                        kpi.owner.should.have.property('type').eql('user');
                        kpi.owner.should.have.property('id').eql('2');
                        done();
                    });
                });
            });
        });
    });
});