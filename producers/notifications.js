const producer = require('./index');
const config = require('config');

const queue = config.get('rabbitmq.queue_prefix') + "notifications";

module.exports = {
    kpiInError: (kpi) => {
        producer.publish(queue, {
            type: 'kpi',
            payload: {
                type: 'kpi_error',
                kpi: {
                    id: kpi._id,
                    name: kpi.name,
                    date: kpi.lastUpdate,
                }
            }
        });
    },
};