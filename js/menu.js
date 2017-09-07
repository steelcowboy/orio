function changeStockFlowchart(newMajor, startYear = null) {
    $(".block-outline").addClass("hide-block");
    localStorage.setItem("savedFlowChart", newMajor);
    loadChart(newMajor);
    closeMenu();
    emptyStack();
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
    var view;
    var currentWindow = $(".menu-modal").children();
    
    if (title != null) {
        element = `<h2 class="modal-header slide-in-right">${title}</h2>`;
    }
    switch(target) {
        case "chart-year-browser":
            view = newYearSelectorView(/* chartBrowser */ true);
            break;
        case "chart-browser":
            view = newChartBrowserView();
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
            view = newDepartmentSelectorView();
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
    var url = "http://flowcharts.calpoly.edu/downloads/curric/15-17."+major+".pdf";
    closeMenu();
    $(".external-site-modal").show();
    var element = 
        `<object data="${url}" type="application/pdf" width="100%" height="100%">
            <p>Hmm.. There doesn't seem to be a curriculum sheet available</p>
        </object>`
    $(".site-container").html(element);
    
}

/* Takes JSON and translates it into an HTML element */

function submitLoginInfo() {
    var loginForm = $("#login-form");
    var usernameEntered = $("#login-username").val();
    var password = $("#login-password").val();
    var header = window.btoa(usernameEntered+":"+password);
    
    var request = $.ajax({
        type: "GET",
        url: apiURL+"authorize",
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + header);
            $("#submit-progress").removeClass("hidden");
        },
    });

    request.done(function(response) {
        emptyStack();
        console.log(document.cookie);
        $("#login-username, #login-password").val("");
        $("#logout-button").removeClass("hidden");
        $("#submit-progress, .login-error-text, #login-button").addClass("hidden");
        getUserCharts();
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        $(".login-error-text").removeClass("hidden");
        $("#submit-progress").addClass("hidden");
    });
}

function getUserCharts() {
    var request = $.ajax({
        type: "GET",
        url: apiURL+"users/tvillare",
    });
    
    request.done(function(data) {
        console.log("User charts");
        console.log(data);
    });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    });
}