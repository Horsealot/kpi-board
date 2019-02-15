const kpiCommandController = require('./../controllers/kpiCommand.ctrl');
const auth = require('./tools/auth');

module.exports = (router) => {
    router.post('/kpis', auth.required, (req, res, next) => {
        kpiCommandController.postKpi(req, res, next);
    });
    router.post('/kpis/:id', auth.required, (req, res, next) => {
        kpiCommandController.updateKpi(req, res, next);
    });
};