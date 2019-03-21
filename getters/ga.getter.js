'use strict';

let mongoose = require('mongoose');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

const config = require('config');
const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
const notificationProducer = require('./../producers/notifications');
const jwt = new google.auth.JWT(config.get('ga.client_email'), null, config.get('ga.private_key'), scopes);

const gaConverter = require('./../converter/ga.converter');

class GoogleAnalyticsGetter {
    constructor(kpi, query) {
        this.kpi = kpi;
        this.query = query;
    }
    async get() {
        try {
            await jwt.authorize();
        } catch (err) {
            throw new Error('Google Analytics ERROR > ' + err);
        }

        const result = await google.analytics('v3').data.ga.get({
            ...this.query.toGoogleAnalytic(),
            // ...gaConverter.getParameters(this.kpi.schedule),
            'auth': jwt,
            'ids': 'ga:' + this.kpi.source.view,
            'dimensions': 'ga:date',
            'metrics': this.kpi.source.target
        });

        return result.data.rows.map((dataArray) => {
            dataArray[0] = "" + dataArray[0];
            const year = dataArray[0].substring(0,4);
            const month = dataArray[0].substring(4,6);
            const day = dataArray[0].substring(6,8);
            return new StatsModel({date: Date.parse(year + "-" + month + "-" + day), value: dataArray[1]});
        });
    }
}

module.exports = GoogleAnalyticsGetter;