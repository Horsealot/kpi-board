const mongoose = require('mongoose');

const { Schema } = mongoose;

const StatsSchema = new Schema({
    value: Number,
    delta: Number,
    date: Date,
    kpi: {
        type: Schema.Types.ObjectId,
        ref: 'Kpis'
    }
});

mongoose.model('Stats', StatsSchema);