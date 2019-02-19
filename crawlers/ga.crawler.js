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

class GoogleAnalyticsCrawler {
    constructor(kpi) {
        this.kpi = kpi;
    }
    async crawl() {
        try {
            await jwt.authorize();
        } catch (err) {
            throw new Error('Google Analytics ERROR > ' + err);
        }

        try {
            const result = await google.analytics('v3').data.ga.get({
                'auth': jwt,
                'ids': 'ga:' + this.kpi.source.view,
                'start-date': 'today',
                'end-date': 'today',
                'metrics': this.kpi.source.target
            });

            const statVal = result.data.rows[0][0];
            let stat = new StatsModel({
                value: Number(statVal),
                date: new Date(),
                kpi: this.kpi._id
            });

            const previousData = await StatsModel.findOne({kpi: this.kpi._id}).sort({date: -1});
            stat.updateFromPrevious(previousData);

            this.kpi.inError = false;
            this.kpi.lastUpdate = new Date();
            return this.kpi.save().then(() => {
                return stat.save();
            });
        } catch (err) {
            notificationProducer.kpiInError(this.kpi);
            this.kpi.inError = true;
            this.kpi.lastUpdate = new Date();
            await this.kpi.save();
            throw error;
        }
    }
}

module.exports = GoogleAnalyticsCrawler;