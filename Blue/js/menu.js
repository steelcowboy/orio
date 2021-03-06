function changeStockFlowchart(newMajor, startYear = null) {
    $(".block-outline").addClass("hide-block");
    changeWindow("chart-namer", "Give It a Name", newMajor);
}

function saveChartInfo(newMajor) {
    var chartName = $("#chart-name-input").val();
    if (userConfigExists()) {
        userConfig.charts[`${chartName}`] = newMajor;
        userConfig.active_chart = chartName;
        postChart(newMajor, chartName);
    } else {
        console.log('here');
        if (!guestConfig) {
            guestConfig = {charts: {}};
        }
        guestConfig.charts[`${chartName}`] = newMajor;
        guestConfig.active_chart = chartName;
        localStorage.guestConfig = JSON.stringify(guestConfig);
    }
}

function openMenu() {
    closeSiteNav();
    if (menuStack.length > 0) {
        $(".back-button").show();
    };

    $(".welcome-container").addClass("fade-white");
    $("#edit-flowchart").addClass("unclickable");
    $(".header").addClass("shrink-header");
    $("#menu-button").addClass("open").removeClass("closed");
    $(".menu-modal").removeClass("slide-out-left");

    $(".popup-message").remove();
    $(".menu-modal, .disabled").show();
}

function closeMenu() {
    closeSiteNav();
    $("#menu-button").removeClass("open").addClass("closed");
    $(".checked").removeClass("checked");
    $("#edit-flowchart").removeClass("unclickable");
    $(".header").removeClass("shrink-header");
    $(".menu-modal").addClass("slide-out-left");
    $(".menu-modal, .popup-message, .disabled, .back-button, .block-menu").fadeOut("fast");
}

function changeWindow(target, title=null, optionalData = null) {
    var element = "";
    var currentWindow = $(".menu-modal").children();
    var view = currentWindow;

    if (title != null) {
        element = `<h2 class="modal-header slide-in-right">${title}</h2>`;
    }
    switch(target) {
        case "chart-browser":
            view = newChartBrowserView();
            break;
        case "chart-namer":
            view = newChartNamerView(optionalData);
            break;
        case "chart-year-browser":
            view = newYearSelectorView(/* chartBrowser */ true);
            break;
        case "user-chart-browser":
            view = newUserChartBrowserView();
            break;
        case "utilities-browser":
            view = newUtilitiesView();
            break;
        case "login-button":
            view = newLoginView();
            break;
        case "signup-button":
            view = newSignupView();
            break;
        case "settings-button":
            view = newSettingsView();
            break;
        case "login-button":
            view = newLoginView();
            break;
        case "department-selector":
            view = newDepartmentSelectorView(optionalData);
            break;
        case "course-selector":
            view = newCourseSelectorView();
            break;
        case "multi-course-selector":
            view = newMultiCourseSelectorView(optionalData);
            break;
        case "year-selector":
            view = newYearSelectorView();
            break;
        case "about":
            view = newAboutView();
            break;
                 }
    $(".back-button").show();
    element = element.concat(view);
    $(".menu-modal").empty().append(element);
    menuStack.push(currentWindow.toArray());
}

function popStack() {
    var window = menuStack.pop();
    $(".menu-modal").html(window);
    $(".menu-modal").children().addClass("slide-in-left");
    if (menuStack.length == 0) {
        $(".back-button").fadeOut("fast");
    }
    setupAutocomplete();
}

function emptyStack() {
    var view;
    while (menuStack.length > 0) {
        view = menuStack.pop();
    }
    $(".menu-modal").html(view);
    $(".back-button").fadeOut("fast");
}

function fetchCharts() {
    $(".menu-modal").empty().append("<h2 class='modal-header slide-in-right'>New Flowchart</h2>");
    if (!availableCharts) {
        $(".menu-modal").append(`<h3 class="menu-option slide-in-right">Couldn't Get Majors</h3>`);
    }
    $.each(availableCharts, function(index, value) {
        var major = value;
        major = major.split('_').join(" ");
        if (major != $(".degree-name").text()) {
            $(".menu-modal").append("<h3 class='menu-option slide-in-right' id='"+value+"' onclick='changeStockFlowchart(this.id)'>"+major+"</h3>");
        }
    });
}

function showCurriculumSheet() {
    var major = $(".header-title").text();
    major = major.split(' ').join("%20");
    var url = "https://flowcharts.calpoly.edu/downloads/curric/15-17."+major+".pdf";
    console.log(url);
    closeMenu();
    $(".external-site-modal").show();
    var element =
        `<object data="${url}" type="application/pdf" width="100%" height="100%">
            <p>Hmm.. There doesn't seem to be a curriculum sheet available</p>
        </object>`
    $(".site-container").html(element);

}

function getUserCharts() {
    $("#submit-progress, .login-error-text, #login-button").addClass("hidden");
    $("#logout-button").removeClass("hidden").html(`Log Out (${username}) <i class="material-icons">keyboard_arrow_right</i>`);

    if (userConfig.charts) {
        $("#user-chart-browser").removeClass("hidden");
        if (userConfig.active_chart) {
            $(".welcome-container").addClass("fade-white");
            loadChart(userConfig.active_chart, /* userChart */ true);
        }
    } else {
        console.log("No saved charts");
    }
}
