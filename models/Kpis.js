const mongoose = require('mongoose');

const { Schema } = mongoose;

const modifiableFields = [
    'name',
    'schedule',
    'postCalculation',
    'source'
];

const KpisSchema = new Schema({
    source: {
        type: {
            type: String,
            enum: ['ga', 'link', 'mixpanel'],
            required: true
        },
        resource: {
            type: String,
            required: function() {
                return this.source.type === 'link';
            }
        },
        target: {
            type: String,
            required: true
        },
        view: {
            type: String,
            required: function() {
                return this.source.type === 'ga';
            }
        },
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['number', 'percentage', 'sum'],
        required: true
    },
    schedule: {
        type: String,
        required: true,
        enum: ['1s', '5s', '15s', '30s', '1m', '5m', '15m', '30m', '1h', '2h', '12h', '1d'],
    },
    inError: {
        type: Boolean,
        default: false
    },
    crawlable: {
        type: Boolean,
        default: false
    },
    owner: {
        type: {
            type: String
        },
        id: {
            type: String
        }
    },
    postCalculation: String,
    lastUpdate: Date
});

KpisSchema.methods.update = function(data) {
    for (let propName in data) {
        if (data.hasOwnProperty(propName) && (data[propName] === null || data[propName] === undefined)) {
            delete data[propName];
        }
    }
    for(const attribute in data) {
        if(data.hasOwnProperty(attribute) && modifiableFields.indexOf(attribute) >= 0) {
            const upperCaseAttribute = attribute.replace(/^\w/, c => c.toUpperCase());
            if(typeof this["set" + upperCaseAttribute] === 'function') {
                this["set" + upperCaseAttribute](data[attribute]);
            } else {
                this[attribute] = data[attribute];
            }
        }
    }
};

KpisSchema.methods.toJSON = function() {
    return {
        id: this._id,
        owner: this.owner,
        source: this.source,
        name: this.name,
        type: this.type,
        schedule: this.schedule,
        lastUpdate: this.lastUpdate,
        inError: this.inError,
        crawlable: this.crawlable
    }
};

mongoose.model('Kpis', KpisSchema);