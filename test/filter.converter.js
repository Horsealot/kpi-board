'use strict';

let chai = require('chai');
const FilterConverter = require('../converter/filter');

describe('Filter converter', () => {
    it('should handle a startDate', () => {
        const filterConverter = new FilterConverter('startDate=2019-02-13T13:54:53Z');
        const query = filterConverter.generateQuery();
        query.should.be.a('object');
        query.should.have.property('date');
        query.date.should.be.a('object');
        query.date.should.have.property('$gte').eql('2019-02-13T13:54:53Z');
        query.date.should.not.have.property('$lte');
    });
    it('should handle a endDate', () => {
        const filterConverter = new FilterConverter('endDate=2019-02-13T13:54:53Z');
        const query = filterConverter.generateQuery();
        query.should.be.a('object');
        query.should.have.property('date');
        query.date.should.be.a('object');
        query.date.should.have.property('$lte').eql('2019-02-13T13:54:53Z');
        query.date.should.not.have.property('$gte');
    });
    it('should handle a both startDate and endDate', () => {
        const filterConverter = new FilterConverter('startDate=2019-02-10T13:54:53Z,endDate=2019-02-13T13:54:53Z');
        const query = filterConverter.generateQuery();
        query.should.be.a('object');
        query.should.have.property('date');
        query.date.should.be.a('object');
        query.date.should.have.property('$lte').eql('2019-02-13T13:54:53Z');
        query.date.should.have.property('$gte').eql('2019-02-10T13:54:53Z');
    });
});