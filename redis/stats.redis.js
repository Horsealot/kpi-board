const redis = require("redis");
const client = redis.createClient();
const {promisify} = require('util');
const getAsync = promisify(client.get).bind(client);

const self = {
    get: async (kpi, query) => {
        let cache = await getAsync(self.getKey(kpi, query));
        if(cache) {
            cache = JSON.parse(cache);
            if(!query.getFreshness() || cache.date > query.getFreshness()) {
                return cache.data;
            }
        }
        return null;
    },
    set: (kpi, query, stats) => {
        client.set(self.getKey(kpi, query), JSON.stringify(stats));
    },
    getKey: (kpi, query) => {
        return kpi._id + '-' + query.serialize();
    }
};

module.exports = self;