const kpiQueryController = require('./../controllers/kpiQuery.ctrl');
const auth = require('./tools/auth');

module.exports = (router) => {
    router.get('/kpis', auth.required, (req, res, next) => {
        kpiQueryController.getKpis(req, res, next);
    });
    router.get('/kpis/:id', auth.required, (req, res, next) => {
        kpiQueryController.getKpi(req, res, next);
    });
};