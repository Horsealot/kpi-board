'use strict';

let mongoose = require('mongoose');

let Kpis = require('./../models/Kpis');
let Stats = require('./../models/Stats');
const KpisModel = mongoose.model('Kpis');
const StatsModel = mongoose.model('Stats');

const httpService = require('./../services/http.service');
const notificationProducer = require('./../producers/notifications');

class LinkCrawler {
    constructor(kpi) {
        this.kpi = kpi;
    }

    crawl() {
        return this.crawlWithRetries();
    };

    async crawlWithRetries() {
        let retries = 0;
        while (true) {
            try {
                return await this.singleCrawl();
            } catch (error) {
                if (this.kpi.inError) {
                    // TODO Notify alert
                } else if (retries >= 2) {
                    notificationProducer.kpiInError(this.kpi);
                    this.kpi.inError = true;
                    this.kpi.lastUpdate = new Date();
                    await this.kpi.save();
                    throw error;
                }
                retries++;
            }
        }
    }

    async singleCrawl() {
        if(!this.kpi.source.resource) {
            throw new Error('Invalid source');
        }
        let response;
        try {
            response = await httpService.get(this.kpi.source.resource, {});
        } catch(err) {
            throw new Error('Invalid resource');
        }
        const data = await httpService.extractData(response.data, this.kpi.source.target);
        if(data === null || data === undefined || !data.length) {
            throw new Error('Invalid target');
        }
        let stat = new StatsModel({
            value: Number(data),
            date: new Date(),
            kpi: this.kpi._id
        });
        const previousData = await StatsModel.findOne({kpi: this.kpi._id}).sort({date: -1});
        stat.updateFromPrevious(previousData);

        this.kpi.inError = false;
        this.kpi.lastUpdate = new Date();
        return this.kpi.save().then(() => {
            return stat.save();
        })
    };
}

module.exports = LinkCrawler;