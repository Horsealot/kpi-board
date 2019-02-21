let mongoose = require('mongoose');
let KpisModel = require('./../models/Kpis');
const Kpis = mongoose.model('Kpis');

const self = {
    postKpi: async (req, res) => {
        const loggedOwner = {
            type: req.payload.type,
            id: req.payload.id,
        };
        if (!loggedOwner.type || !loggedOwner.id) {
            return res.sendStatus(403);
        }

        const {body: {source, name, type, schedule, postCalculation, owner}} = req;
        if (!source || !name || !type || !schedule) {
            return res.sendStatus(422);
        }

        let kpi = new Kpis({
            source, name, type, schedule, postCalculation
        });
        if(owner) {
            kpi.owner = owner;
        }

        kpi.save().then((kpi) => {
            return res.json({kpi: kpi.toJSON()});
        }).catch((err) => {
            return res.status(400).json({
                error: err.message
            })
        });
    },
    updateKpi: async (req, res) => {
        const owner = {
            type: req.payload.type,
            id: req.payload.id,
        };
        if (!owner.type || !owner.id) {
            return res.sendStatus(403);
        }
        const kpiId = req.params.id;
        const {body: {source, name, type, schedule, postCalculation}} = req;
        Kpis.findOne({_id: kpiId}).then((kpi) => {
            if (!kpi) {
                return res.sendStatus(404);
            }
            if (kpi.owner.id && kpi.owner.type && (kpi.owner.type !== owner.type || kpi.owner.id !== owner.id)) {
                return res.sendStatus(403);
            }
            kpi.update({
                source, name, type, schedule, postCalculation
            });

            kpi.save().then((kpi) => {
                return res.json({kpi: kpi.toJSON()});
            }).catch((err) => {
                return res.status(400).json({
                    error: err.message
                })
            });
        }).catch((err) => {
            res.status(400).json(err);
        })
    }
};

module.exports = self;