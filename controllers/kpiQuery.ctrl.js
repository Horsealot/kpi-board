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

        try {
            const statsPromises = new Array();
            const kpis = await Kpis.find({'owner.type': owner.type, 'owner.id': owner.id});
            const processPromises = kpis.map((kpi) => {
                statsPromises.push((callback) => {
                    StatsService.get(kpi, queryFilter).then(() => {
                        callback();
                    });
                });
            });
            async.parallel(processPromises, () => {
                return res.sendStatus(200);
            });
        } catch (err) {
            return res.sendStatus(400);
        }
    },
    getKpi: async (req, res) => {
        const {body: {category}} = req;
        const {params: {id}} = req;
        let dbCategory = await models.ToolCategories.findOne({where: {id: id}});
        if(!dbCategory) {
            return res.sendStatus(404);
        }
        if (dbCategory.SquadId) {
            if(!UserRole.isSuperAdmin(req.user) && !(await models.UserSquads.findOne({where: {UserId: req.user.id, SquadId: dbCategory.SquadId, role: 'ADMIN'}}))) {
                return res.sendStatus(403);
            }
            if(!(await models.Squads.findOne({where: {id: dbCategory.SquadId}}))) {
                return res.sendStatus(404);
            }
            if(category.squadId && (await models.Squads.findOne({where: {id: category.SquadId}}))) {
                dbCategory.SquadId = category.squadId;
            }
            dbCategory.UserId = null;
        } else {
            if(dbCategory.UserId && dbCategory.UserId !== req.user.id) {
                return res.sendStatus(403);
            }
            dbCategory.UserId = req.user.id;
            dbCategory.SquadId = null;
        }
        dbCategory.name = category.name;
        dbCategory.order = category.order;

        return dbCategory.save().then(() => {
            res.json({category: dbCategory.toJSON()});
        }).catch(() => {
            res.sendStatus(400)
        });
    }
};

module.exports = self;