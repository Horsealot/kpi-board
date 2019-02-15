'use strict';

class Filter {
    constructor(query) {
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

    getFreshnessLimit() {
        if(!this.freshness) return null;
        return null;
    }

    serialize() {
        return `startDate:${this.startDate},endDate:${this.endDate}`;
    }
}

module.exports = Filter;