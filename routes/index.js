const kpiCommand = require('./kpiCommand');
const kpiQuery = require('./kpiQuery');

module.exports = (router) => {
    kpiCommand(router);
    kpiQuery(router);
};