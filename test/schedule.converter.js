'use strict';

let chai = require('chai');
let expect = chai.expect;
const scheduleConverter = require('../converter/schedule');

describe('schedule converter', () => {
    // it('should convert seconds', () => {
    //     expect(scheduleConverter.toScheduler('1s')).to.be.equal("* * * * * *");
    //     expect(scheduleConverter.toScheduler('10s')).to.be.equal("*/10 * * * * *");
    //     expect(scheduleConverter.toScheduler('15s')).to.be.equal("*/15 * * * * *");
    //     expect(scheduleConverter.toScheduler('20s')).to.be.equal("*/20 * * * * *");
    //     expect(scheduleConverter.toScheduler('30s')).to.be.equal("*/30 * * * * *");
    //     expect(scheduleConverter.toScheduler('40s')).to.be.equal("*/40 * * * * *");
    // });
    // it('should convert minutes', () => {
    //     expect(scheduleConverter.toScheduler('1m')).to.be.equal("0 * * * * *");
    //     expect(scheduleConverter.toScheduler('10m')).to.be.equal("0 */10 * * * *");
    //     expect(scheduleConverter.toScheduler('15m')).to.be.equal("0 */15 * * * *");
    //     expect(scheduleConverter.toScheduler('20m')).to.be.equal("0 */20 * * * *");
    //     expect(scheduleConverter.toScheduler('30m')).to.be.equal("0 */30 * * * *");
    //     expect(scheduleConverter.toScheduler('40m')).to.be.equal("0 */40 * * * *");
    // });
    // it('should convert hours', () => {
    //     expect(scheduleConverter.toScheduler('1h')).to.be.equal("0 0 * * * *");
    //     expect(scheduleConverter.toScheduler('3h')).to.be.equal("0 0 */3 * * *");
    //     expect(scheduleConverter.toScheduler('6h')).to.be.equal("0 0 */6 * * *");
    //     expect(scheduleConverter.toScheduler('12h')).to.be.equal("0 0 */12 * * *");
    //     expect(scheduleConverter.toScheduler('20h')).to.be.equal("0 0 */20 * * *");
    // });
    // it('should convert days', () => {
    //     expect(scheduleConverter.toScheduler('1d')).to.be.equal("0 0 4 * * *");
    //     expect(scheduleConverter.toScheduler('3d')).to.be.equal("0 0 4 */3 * *");
    //     expect(scheduleConverter.toScheduler('6d')).to.be.equal("0 0 4 */6 * *");
    //     expect(scheduleConverter.toScheduler('12d')).to.be.equal("0 0 4 */12 * *");
    //     expect(scheduleConverter.toScheduler('20d')).to.be.equal("0 0 4 */20 * *");
    // });
    // it('should convert months', () => {
    //     expect(scheduleConverter.toScheduler('1M')).to.be.equal("0 0 4 1 * *");
    //     expect(scheduleConverter.toScheduler('3M')).to.be.equal("0 0 4 1 */3 *");
    //     expect(scheduleConverter.toScheduler('6M')).to.be.equal("0 0 4 1 */6 *");
    //     expect(scheduleConverter.toScheduler('12M')).to.be.equal("0 0 4 1 */12 *");
    // });

    it('should take current date if not provided', () => {
        expect(scheduleConverter.getActiveSchedulers()).not.to.throw;
    });
    it('should work for midnight', () => {
        const testedDate = new Date('01/01/2019 00:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1d');
    });
    it('should work for 1 min', () => {
        const testedDate = new Date('01/01/2019 00:01:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 5 min', () => {
        const testedDate = new Date('01/01/2019 00:05:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 15 min', () => {
        const testedDate = new Date('01/01/2019 00:15:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 30 min', () => {
        const testedDate = new Date('01/01/2019 00:30:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 45 min', () => {
        const testedDate = new Date('01/01/2019 00:45:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 1 hour', () => {
        const testedDate = new Date('01/01/2019 01:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 2 hours', () => {
        const testedDate = new Date('01/01/2019 02:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 3 hours', () => {
        const testedDate = new Date('01/01/2019 03:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 4 hours', () => {
        const testedDate = new Date('01/01/2019 04:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 8 hours', () => {
        const testedDate = new Date('01/01/2019 08:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 12 hours', () => {
        const testedDate = new Date('01/01/2019 12:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.not.deep.include('1d');
    });
    it('should work for 24 hours', () => {
        const testedDate = new Date('01/01/2019 24:00:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.be.a('array');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('5m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('15m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('30m');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('2h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('12h');
        expect(scheduleConverter.getActiveSchedulers(testedDate)).to.deep.include('1d');
    });
    it('should work for random 3min', () => {
        const testedDate = new Date('01/01/2019 00:03:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate))
            .to.be.a('array')
            .to.deep.include('1m')
            .to.not.deep.include('5m')
            .to.not.deep.include('15m')
            .to.not.deep.include('30m')
            .to.not.deep.include('1h')
            .to.not.deep.include('2h')
            .to.not.deep.include('12h')
            .to.not.deep.include('1d');
    });
    it('should work for random 17min', () => {
        const testedDate = new Date('01/01/2019 00:17:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate))
            .to.be.a('array')
            .to.deep.include('1m')
            .to.not.deep.include('5m')
            .to.not.deep.include('15m')
            .to.not.deep.include('30m')
            .to.not.deep.include('1h')
            .to.not.deep.include('2h')
            .to.not.deep.include('12h')
            .to.not.deep.include('1d');
    });
    it('should work for random 34min', () => {
        const testedDate = new Date('01/01/2019 00:34:00');
        expect(scheduleConverter.getActiveSchedulers(testedDate))
            .to.be.a('array')
            .to.deep.include('1m')
            .to.not.deep.include('5m')
            .to.not.deep.include('15m')
            .to.not.deep.include('30m')
            .to.not.deep.include('1h')
            .to.not.deep.include('2h')
            .to.not.deep.include('12h')
            .to.not.deep.include('1d');
    });
});