const bases = [
    's','m','h','d','M','dw'
];
const periodsFill = [
    '0','0','4','1','1','7'
];

module.exports = {
    // toScheduler: (refresh) => {
    //     if(!refresh || refresh.length < 2) {
    //         throw new Error("Invalid refresh format");
    //     }
    //     const scheduleBase = bases.indexOf(refresh[refresh.length - 1]);
    //     if(scheduleBase < 0) {
    //         throw new Error("Invalid refresh format");
    //     }
    //     const period = parseInt(refresh.substring(0, refresh.length - 1));
    //     const cronPeriod = (period === 1) ? '*' : '*/' + period;
    //     switch(scheduleBase) {
    //         case 0:
    //             return `${cronPeriod} * * * * *`;
    //         case 1:
    //             return `${periodsFill[0]} ${cronPeriod} * * * *`;
    //         case 2:
    //             return `${periodsFill[0]} ${periodsFill[1]} ${cronPeriod} * * *`;
    //         case 3:
    //             return `${periodsFill[0]} ${periodsFill[1]} ${periodsFill[2]} ${cronPeriod} * *`;
    //         case 4:
    //             return `${periodsFill[0]} ${periodsFill[1]} ${periodsFill[2]} ${periodsFill[3]} ${cronPeriod} *`;
    //         case 5:
    //             return `${periodsFill[0]} ${periodsFill[1]} ${periodsFill[2]} * * ${cronPeriod}`;
    //     }
    //     return base;
    // },
    getActiveSchedulers: (now) => {
        if(!now) {
            now = new Date();
        }
        let schedulers = new Array('1m');
        if(now.getMinutes() % 5 === 0) schedulers.push('5m');
        if(now.getMinutes() % 15 === 0) schedulers.push('15m');
        if(now.getMinutes() % 30 === 0) schedulers.push('30m');
        if(now.getMinutes() === 0) {
            schedulers.push('1h');
            if(now.getHours() % 2 === 0) schedulers.push('2h');
            if(now.getHours() % 12 === 0) schedulers.push('12h');
            if(now.getHours() === 0) schedulers.push('1d');
        }
        return schedulers;
    }
};