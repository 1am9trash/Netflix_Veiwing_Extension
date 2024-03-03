export function filterItems(data) {
    return data.viewedItems.map(item => ({
        movieID: item.movieID,
        title: item.title,
        date: item.date,
        bookmark: item.bookmark,
        country: item.country,
        duration: item.duration,
        deviceType: item.deviceType,
        series: item.series ? item.series : -1
    }));
}

export function calculateTotalWatchTime(records) {
    return records.reduce((acc, record) => acc + record.bookmark, 0);
}

export function calculateDevice(records) {
    const deviceTypes = new Set();

    records.forEach(record => {
        deviceTypes.add(record.deviceType);
    });

    return deviceTypes.size;
}

export function calculateLongestSingleDayWatch(records) {
    const watchTimeByDate = new Map();

    records.forEach(record => {
        const startDate = new Date(record.date);
        const endDate = new Date(record.date + record.bookmark * 1000);
        
        const startKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1)}-${String(startDate.getDate())}`;
        const endKey = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1)}-${String(endDate.getDate())}`;

        if (startKey !== endKey) {
            const secondsTillMidnight = (new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1) - startDate) / 1000;
            watchTimeByDate.set(startKey, (watchTimeByDate.get(startKey) || 0) + secondsTillMidnight);
            
            const secondsAfterMidnight = (endDate - new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)) / 1000;
            watchTimeByDate.set(endKey, (watchTimeByDate.get(endKey) || 0) + secondsAfterMidnight);
        } else {
            watchTimeByDate.set(startKey, (watchTimeByDate.get(startKey) || 0) + record.bookmark);
        }
    });

    let longestWatch = { date: null, duration: 0 };
    for (let [date, duration] of watchTimeByDate.entries()) {
        if (duration > longestWatch.duration) {
            longestWatch = { date, duration };
        }
    }

    return { 
        date: longestWatch.date, 
        time: longestWatch.duration
    };
}

export function calculateMonthlyWatchTime(records) {
    if (records.length === 0) {
        return {};
    }

    const dates = records.map(record => new Date(record.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    let currentMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const monthlyWatchTime = {};
    while (currentMonth <= maxDate) {
        const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
        monthlyWatchTime[yearMonth] = 0;
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    records.forEach(record => {
        const date = new Date(record.date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyWatchTime[yearMonth] += record.bookmark;
    });

    return Object.entries(monthlyWatchTime).sort((a, b) => a[0].localeCompare(b[0]));
}

export function calculateWeeklyWatchTime(records) {
    let weeklyWatchTime = new Array(7).fill(0);

    records.forEach(record => {
        let startTime = new Date(record.date);
        let currentDay = startTime.getDay();
        let duration = record.bookmark;

        const endOfDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate() + 1);
        let remainingTime = parseInt((endOfDay - startTime) / 1000);

        while (duration > 0) {
            weeklyWatchTime[currentDay] += Math.min(remainingTime, duration);
            duration -= Math.min(remainingTime, duration);
            currentDay = (currentDay + 1) % 7;
        }
    });

    return weeklyWatchTime;
}

export function calculateHourlyWatchTime(records) {
    let hourlyWatchTime = new Array(24).fill(0);

    records.forEach(record => {
        let startTime = new Date(record.date);
        let currentHour = startTime.getHours();
        let duration = record.bookmark;

        while (duration > 0) {
            hourlyWatchTime[currentHour] += Math.min(3600, duration);
            duration -= 3600;
            currentHour = (currentHour + 1) % 24;
        }
    });

    return hourlyWatchTime;
}

export function calculateSeriesTime(records) {
    const seriesStats = {};

    records.forEach(item => {
        const seriesKey = item.series.toString();

        if (!seriesStats[seriesKey]) {
            seriesStats[seriesKey] = {
                count: 0,
                totalTime: 0
            };
        }
        seriesStats[seriesKey].count += 1;
        seriesStats[seriesKey].totalTime += item.bookmark;
    });

    return seriesStats;
}

export function getStatistics(records) {
    const totalWatchTime = calculateTotalWatchTime(records);
    const seriesStats = calculateSeriesTime(records);
    const longestDayWatchTime = calculateLongestSingleDayWatch(records);
    const deviceCount = calculateDevice(records);

    let seriesCount = 0;
    let seriesEpisodeCount = 0;
    let seriesWatchTime = 0;

    Object.keys(seriesStats).forEach(seriesKey => {
        if (seriesKey !== "-1") {
            seriesCount += 1;
            seriesEpisodeCount += seriesStats[seriesKey].count;
            seriesWatchTime += seriesStats[seriesKey].totalTime;
        }
    });

    return {
        totalCount: records.length,
        totalWatchTime: totalWatchTime,
        seriesCount: seriesCount,
        seriesEpisodeCount: seriesEpisodeCount,
        seriesWatchTime: seriesWatchTime,
        movieCount: seriesStats["-1"] ? seriesStats["-1"].count : 0,
        movieWatchTime: seriesStats["-1"] ? seriesStats["-1"].totalTime : 0,
        longestDay: longestDayWatchTime.date,
        longestDayWatchTime: longestDayWatchTime.time,
        deviceCount: deviceCount
    };
}