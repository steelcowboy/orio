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

function toggleSuperSenior(toggle) {
    var value = !($(toggle).find("input").prop('checked'));
    if (value) {
        localStorage.superSenior = true;
    } else {
        $("#5-tab").addClass("hidden");
        localStorage.removeItem('superSenior');
        checkWindowSize();
    }
    loadTasks();
}

function userConfigExists() {
    if (Object.keys(userConfig).length === 0 && userConfig.constructor === Object) {
        return false;
    }
    return true;
}

function guestConfigExists() {
    if (Object.keys(guestConfig).length === 0 && guestConfig.constructor === Object) {
        return false;
    }
    return true;
}

function changeStartYear(yearItem, chartBrowser) {
    startYear = parseInt($(yearItem).text());
    if (userConfigExists()) {
        userConfig.start_year = startYear;
        if (!chartBrowser) {
            sendUserConfig();
        }
    } else if (guestConfig) {
        guestConfig.startYear = startYear;
        localStorage.guestConfig = JSON.stringify(guestConfig);
    }

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
    getCurrentQuarter();
}

function sendUserConfig(chartName = null) {
    var url = `${apiURL}users/${username}/config`;
    var data = JSON.stringify(userConfig);
    var request = $.post({
        contentType: "application/json",
        url: url,
        data: data
    });

    request.done(function(){
        if (chartName) {
            loadChart(chartName, /* userChart */ true);
        }
    });

    request.fail(function(response){
        console.log("->", userConfig);
        console.log(`error sending config to ${url}`);
        console.log(response)
    });
}
