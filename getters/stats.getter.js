'use strict';

let mongoose = require('mongoose');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

class StatsGetter {
    constructor(kpi, query) {
        this.kpi = kpi;
        this.query = query;
    }
    get() {
        return StatsModel.find({...this.query.generateQuery(), kpi: this.kpi._id});
    }
}

module.exports = StatsGetter;