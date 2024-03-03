import * as netflix from "./netflix.js";
import * as draw from "./draw.js";


document.getElementById("loadDataButton").addEventListener("click", function() {
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("chartContainer").style.display = "none";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var activeTab = tabs[0];
        if (activeTab.url.includes("netflix.com")) {
            fetch("https://www.netflix.com/api/shakti/mre/viewingactivity?pg=0&pgsize=1000000")
                .then(response => response.json())
                .then(data => netflix.filterItems(data))
                .then(data => {
                    const statistics = netflix.getStatistics(data);
                    const monthlyWatchTime = netflix.calculateMonthlyWatchTime(data);
                    const weeklyWatchTime = netflix.calculateWeeklyWatchTime(data);
                    const hourlyWatchTime = netflix.calculateHourlyWatchTime(data);

                    var info = "";
                    info += "<tr><td class='label'>Total Time:</td><td>"
                        + parseInt(statistics.totalWatchTime / 3600) + " hours "
                        + parseInt(statistics.totalWatchTime / 60) % 60 + " minutes"
                        + "</td></tr>";
                    info += "<tr><td class='label'>TV Shows:</td><td>" 
                        + statistics.seriesCount + " series, "
                        + statistics.seriesEpisodeCount + " episodes, "
                        + parseInt(statistics.seriesWatchTime / 3600) + " hours "
                        + parseInt(statistics.seriesWatchTime / 60) % 60 + " minutes"
                        + "</td></tr>";
                    info += "<tr><td class='label'>Movies:</td><td>"
                        + statistics.movieCount + " movies, "
                        + parseInt(statistics.movieWatchTime / 3600) + " hours "
                        + parseInt(statistics.movieWatchTime / 60) % 60 + " minutes"
                        + "</td></tr>";
                    info += "<tr><td class='label'>Longest Day:</td><td>"
                        + parseInt(statistics.longestDayWatchTime / 3600) + " hours "
                        + parseInt(statistics.longestDayWatchTime / 60) % 60 + " minutes"
                        + " at " + statistics.longestDay
                        + "</td></tr>";
                    info += "<tr><td class='label'>Device Used:</td><td>"
                        + statistics.deviceCount
                        + "</td></tr>";
                    document.getElementById("statistics").innerHTML = info;

                    draw.drawMonthlyWatchTimeChart(monthlyWatchTime);
                    draw.drawWeeklyWatchTimeChart(weeklyWatchTime);
                    draw.drawHourlyWatchTimeChart(hourlyWatchTime);
                })
                .then(_ => {
                    document.getElementById("chartContainer").style.display = "block";
                })
                .catch(error => {
                    document.getElementById("errorMessage").style.display = "block";
                    console.error("Error:", error)
                });

        } else {
            document.getElementById("errorMessage").style.display = "block";
        }
    });
});