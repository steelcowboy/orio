var savedSettings = localStorage.settings ? JSON.parse(localStorage.settings) : null;
var settings = savedSettings ? savedSettings : {summerQuarter: false};

function getSettings() {
    var settingsOptions = [
        'summerQuarter',
    ], 
        value;
    settingsOptions.forEach(function(setting) {
        value = JSON.parse(localStorage.getItem(setting));
        checkSetting(setting, value);
    });
}

function toggleSummerQuarter(toggle) {
    var value = !($(toggle).find("input").prop('checked'));
    if (value) {
        localStorage.summerQuarter = true;
    } else {
        localStorage.removeItem('summerQuarter');
    }
    loadTasks();
}

function changeStartYear(yearItem, chartBrowser) {
    startYear = parseInt($(yearItem).text());
    localStorage.setItem("startYear", startYear);
    
    if (chartBrowser == 'true') {
        changeWindow('chart-browser');
    } else {
        closeMenu();
        emptyStack();
    }
    $(".year").each(function(key, el) {
        $(this).attr("name", parseInt($(yearItem).text())+key);
    });
    $(".quarter").each(function(key, quarter) {
        var season = $(this).find(".season").text();
        var year = $(this).parent(".quarter-holder").parent(".year").attr("name");
        year = parseInt(year);
        if (season === 'Winter' || season === 'Spring') {
            year += 1;
        }
        $(this).attr("name", `${season} ${year}`);
    });
    getCurrentQuarter()
}
