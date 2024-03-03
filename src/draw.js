export function drawMonthlyWatchTimeChart(monthlyWatchTime) {
    const ctxMonthly = document.getElementById("monthlyWatchTimeChart").getContext("2d");
    const labels = Object.keys(monthlyWatchTime).length ? monthlyWatchTime.map(item => item[0]) : [];
    const data = Object.keys(monthlyWatchTime).length ? monthlyWatchTime.map(item => item[1] / 3600) : [];

    new Chart(ctxMonthly, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Watch Time (hour)",
                data: data,
                fill: true,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }]
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        return parseFloat(tooltipItem.yLabel).toFixed(2);
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                },
                yAxes: [{
                    ticks: {
                        callback: function (value) {
                            return value.toFixed(2);
                        }
                    }
                }]
            }
        }
    });
}

export function drawWeeklyWatchTimeChart(weeklyWatchTime) {
    const ctxWeekly = document.getElementById("weeklyWatchTimeChart").getContext("2d");
    const data = weeklyWatchTime.map(value => (value / 3600).toFixed(2));

    new Chart(ctxWeekly, {
        type: "radar",
        data: {
            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            datasets: [{
                label: "Watch Time Weekly Distribution",
                data: data,
                fill: true,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 1,
                pointBackgroundColor: "rgb(255, 99, 132)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgb(255, 99, 132)"
            }]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: Math.max(...weeklyWatchTime)
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

export function drawHourlyWatchTimeChart(hourlyWatchTime) {
    const ctxHourly = document.getElementById("hourlyWatchTimeChart").getContext("2d");
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const sum = hourlyWatchTime.reduce((a, b) => a + b, 0)
    const percentage = hourlyWatchTime.map(value => (value / sum * 100).toFixed(2));

    new Chart(ctxHourly, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Watch Time Daily Distribution (%)",
                data: percentage,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1
            }]
        },
        options: {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        return parseFloat(tooltipItem.yLabel).toFixed(2) + "%";
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                },
                yAxes: [{
                    ticks: {
                        callback: function (value) {
                            return value.toFixed(2) + "%";
                        }
                    }
                }]
            }
        }
    });
}