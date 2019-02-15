'use strict';

const readline = require('readline');
const mongoose = require('mongoose');

let Kpis = require('./../models/Kpis');
const KpisModel = mongoose.model('Kpis');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let newKpi = new KpisModel({owner: {}, source: {}});

const askForParam = (question, param, authorizedValues) => {
    return new Promise((resolve) => {
        rl.question(`${question} [${authorizedValues}] :\n`, (answer) => {
            if(param.split('.').length > 1) {
                newKpi[param.split('.')[0]][param.split('.')[1]] = answer;
            } else {
                newKpi[param] = answer;
            }
            resolve();
        })
    })
};

const main = async () => {
    await askForParam('KPI Name', 'name', 'String');
    await askForParam('KPI Type', 'type', 'number,percentage');
    await askForParam('KPI Schedule', 'schedule', '1s,15s,30s,1m,5m,15m,30m,1h,2h,12h,1d');
    await askForParam('KPI Source type', 'source.type', 'link,ga,mixpanel');
    await askForParam('KPI Source resource', 'source.resource', 'String');
    await askForParam('KPI Source target', 'source.target', 'String');
    await askForParam('KPI Owner type', 'owner.type', 'user,squad');
    await askForParam('KPI Owner id', 'owner.id', 'String');

    return newKpi.save().then(() => {
        console.log(`New kpi saved !`);
        rl.close();
    }).catch((err) => {
        console.log(`ERROR > Bad values ${err}`);
        rl.close();
    });
    // try {
    //     console.log(newKpi);
    //     await save();
    //     console.log(`New kpi saved !`);
    //     rl.close();
    // } catch (err) {
    //     console.log(`ERROR > Bad values ${err}`);
    //     rl.close();
    // }
};

main();