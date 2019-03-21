'use strict';

const moment = require("moment");

class Filter {
    constructor(query) {
        this.fresh = false;
        const filters = query ? query.split(',') : [];
        filters.forEach((filter) => {
            const queryFilter = filter.split('=');
            if(queryFilter.length > 1) {
                this[queryFilter[0].trim()] = queryFilter[1].trim();
            }
        });
    }

    generateQuery() {
        let query = {};
        if(this.startDate) {
            query.date = {
                ...query.date,
                $gte: this.startDate
            };
        }
        if(this.endDate) {
            query.date = {
                ...query.date,
                $lte: this.endDate
            };
        }
        return query;
    }

    serialize() {
        return `startDate:${this.startDate},endDate:${this.endDate}`;
    }

    toGoogleAnalytic() {
        return {
            'start-date': moment(this.startDate).format("YYYY-MM-DD"),
            'end-date': moment(this.endDate).format("YYYY-MM-DD"),
        };
    }
}

module.exports = Filter;