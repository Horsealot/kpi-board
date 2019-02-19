'use strict';

let chai = require('chai');
let sinon = require('sinon');
const notificationsProducer = require('../producers/notifications');
const producer = require('../producers/index');

describe('Notifications producer', () => {
    let stubSandbox;
    beforeEach((done) => { //Before each test we empty the database
        stubSandbox = sinon.createSandbox();
        done();
    });

    afterEach(function () {
        stubSandbox.restore();
    });

    it('should produce a notification event', (done) => {
        let publisherSpy = stubSandbox.stub(producer, "publish").returns(true);
        notificationsProducer.kpiInError({});
        sinon.assert.calledOnce(publisherSpy);
        done();
    });
});