'use strict';

const config = require('config');
const { google } = require('googleapis');
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
const jwt = new google.auth.JWT(config.get('ga.client_email'), null, config.get('ga.private_key'), scopes);

const mongoose = require('mongoose');
require('./../models/Stats');
const Stats = mongoose.model('Stats');

module.exports = {
    getData: async (kpi) => {
        const result = await google.analytics('v3').data.ga.get({
            'auth': jwt,
            'ids': 'ga:' + kpi.source.view,
            'start-date': '30daysAgo',
            'end-date': 'today',
            'dimensions': 'ga:date',
            'metrics': kpi.source.target
        });

        return result.data.rows.map((dataArray) => {
            dataArray[0] = "" + dataArray[0];
            const year = dataArray[0].substring(0,4);
            const month = dataArray[0].substring(4,6);
            const day = dataArray[0].substring(6,8);
            return new Stats({date: Date.parse(year + "-" + month + "-" + day), value: dataArray[1]});
        });
    }
};