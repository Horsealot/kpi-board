'use strict';

const moment = require("moment");

const bases = [
    'd','M','y'
];
const basesDays = [
    'd','M','y'
];

module.exports = {
    getParameters: (period) => {
        if(!period || period.length < 2) {
            throw new Error("Invalid period format");
        }
        const base = bases.indexOf(period[period.length - 1]);
        if(base < 0) {
            throw new Error("Invalid refresh format");
        }
        const periodLength = parseInt(period.substring(0, period.length - 1));

        const endDate = new Date();
        let startDate = new Date();
        if(base === 0) {
            startDate = new Date(new Date().setDate(endDate.getDate() - periodLength));
        } else if(base === 1) {
            startDate = new Date(new Date().setMonth(endDate.getMonth() - periodLength));
        } else if(base === 2) {
            startDate = new Date(new Date().setFullYear(endDate.getFullYear() - periodLength));
        }

        return {
            'start-date': moment(startDate).format("YYYY-MM-DD"),
            'end-date': 'today',
        };
    }
};