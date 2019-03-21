'use strict';

const moment = require("moment");

let chai = require('chai');
let expect = chai.expect;
const gaConverter = require('../converter/ga.converter');

describe('schedule converter', () => {

    it('should throw on an empty period', () => {
        expect(() => {gaConverter.getParameters()}).to.throw;
    });
    it('should throw on an invalid period', () => {
        expect(() => {gaConverter.getParameters('1da')}).to.throw;
    });
    it('should work on days', () => {
        expect(gaConverter.getParameters('1d')['start-date']).to.be.equal(moment().subtract(1, 'days').format('YYYY-MM-DD'));
        expect(gaConverter.getParameters('7d')['start-date']).to.be.equal(moment().subtract(7, 'days').format('YYYY-MM-DD'));
        expect(gaConverter.getParameters('30d')['start-date']).to.be.equal(moment().subtract(30, 'days').format('YYYY-MM-DD'));
        expect(gaConverter.getParameters('32d')['start-date']).to.be.equal(moment().subtract(32, 'days').format('YYYY-MM-DD'));
    });
    it('should work on months', () => {
        expect(gaConverter.getParameters('1M')['start-date']).to.be.equal(moment().subtract(1, 'months').format('YYYY-MM-DD'));
        expect(gaConverter.getParameters('7M')['start-date']).to.be.equal(moment().subtract(7, 'months').format('YYYY-MM-DD'));
        expect(gaConverter.getParameters('12M')['start-date']).to.be.equal(moment().subtract(12, 'months').format('YYYY-MM-DD'));
    });
    it('should work on year', () => {
        expect(gaConverter.getParameters('1y')['start-date']).to.be.equal(moment().subtract(1, 'years').format('YYYY-MM-DD'));
        expect(gaConverter.getParameters('7y')['start-date']).to.be.equal(moment().subtract(7, 'years').format('YYYY-MM-DD'));
        expect(gaConverter.getParameters('12y')['start-date']).to.be.equal(moment().subtract(12, 'years').format('YYYY-MM-DD'));
    });
});