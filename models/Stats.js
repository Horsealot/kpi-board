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


StatsSchema.methods.updateFromPrevious = function(previous) {
    if(this.type === 'sum') {
        this.delta = this.value;
        if(previous) {
            this.value = previous.value + this.value;
        }
    } else if(previous) {
        this.delta = this.value - previous.value;
    }
};

StatsSchema.methods.toJSON = function() {
    if(this.delta) {
        return {
            _id: this._id.toString(),
            value: this.value,
            delta: this.delta,
            date: this.date.toISOString(),
        }
    }
    return {
        _id: this._id.toString(),
        value: this.value,
        date: this.date.toISOString(),
    }
};

mongoose.model('Stats', StatsSchema);