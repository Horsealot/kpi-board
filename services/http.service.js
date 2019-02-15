'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const self = {
    get: async (link, options) => {
        return await axios.get(link, options);
    },
    extractData: (content, target) => {
        const $ = cheerio.load(content);
        return $(target).text();
    }
};

module.exports = self;