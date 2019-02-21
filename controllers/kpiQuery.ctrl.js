const async = require('async');
let mongoose = require('mongoose');
let KpisModel = require('./../models/Kpis');
let StatsService = require('./../services/statsQuery.service');
const Kpis = mongoose.model('Kpis');
const Filter = require('./../converter/filter');

const self = {
    getKpis: async (req, res) => {
        const owner = {
            type: req.payload.type,
            id: req.payload.id,
        };
        if(!owner.type || !owner.id) {
            return res.sendStatus(403);
        }
        const {query: {q}} = req;
        const queryFilter = new Filter(q);
        const response = [];

        try {
            const statsPromises = new Array();
            const kpis = await Kpis.find({$or: [{'owner.type': owner.type, 'owner.id': owner.id}, {'owner.type': {$exists: false}, 'owner.id': {$exists: false}}]});
            kpis.forEach((kpi) => {
                statsPromises.push((callback) => {
                    StatsService.get(kpi, queryFilter).then((data) => {
                        response.push(data);
                        callback();
                    });
                });
            });
            async.parallel(statsPromises, (err, results) => {
                return res.json({kpis: response});
            });
        } catch (err) {
            console.log(err);
            return res.sendStatus(400);
        }
    },
    getKpi: (req, res) => {
        const owner = {
            type: req.payload.type,
            id: req.payload.id,
        };
        if(!owner.type || !owner.id) {
            return res.sendStatus(403);
        }
        const {params: {id}} = req;
        if(!id) {
            return res.sendStatus(422);
        }

        const {query: {q}} = req;
        const queryFilter = new Filter(q);
        Kpis.findOne({_id: id}).then((kpi) => {
            if(!kpi) {
                return res.sendStatus(404);
            } else if(kpi.owner.id && kpi.owner.type && (kpi.owner.id !== owner.id || kpi.owner.type !== owner.type)) {
                return res.sendStatus(403);
            }
            StatsService.get(kpi, queryFilter).then((data) => {
                return res.json({kpi: data});
            }).catch((err) => {
                console.log(err);
                return res.sendStatus(400);
            });
        }).catch((err) => {
            console.log(err);
            return res.sendStatus(400);
        });
    }
};

module.exports = self;