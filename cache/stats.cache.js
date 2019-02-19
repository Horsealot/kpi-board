const redis = require("redis");
const client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

const self = {
    get: async (kpi, query) => {
        let cache = await getAsync(self.getKey(kpi, query));
        if(cache !== null && !query.fresh) {
            cache = JSON.parse(cache);
            return cache;
        }
        return null;
    },
    set: (kpi, query, stats) => {
        client.set(self.getKey(kpi, query), JSON.stringify(stats), 'EX', 60);
    },
    del: (kpi, query, stats) => {
        client.del(self.getKey(kpi, query), JSON.stringify(stats));
    },
    getKey: (kpi, query) => {
        return kpi._id + '-' + query.serialize();
    }
};

module.exports = self;