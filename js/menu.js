

/* User wants to change the current flowchart */
$(document).on('click', '.major-option', function() {
    var major = $(this).attr("value");
    $(".header .major-option").fadeIn("fast");
    $(".block, .degree-path h2").addClass("hide-block");
    localStorage.setItem("savedFlowChart", major);
    loadChart(major);
    closeMenu();
    popStack();
});

/* User wants to exit main menu */
$(document).on('click', '.disabled', function() {
    closeMenu();
});

$(document).on('click', '#chart-browser', function() {
    changeWindow($(".menu-modal").children(), $(this).attr("id"));
});

$(document).on('click', '#chart-builder', function() {
    setupBuilder();
    closeMenu();
});

$(document).on('click', '#utilities-browser', function() {
    changeWindow($(".menu-modal").children(), $(this).attr("id"));
});

$(document).on('click', '.back-button', function() {
    popStack();
});

$(document).on('click', '#login-button', function() {
    changeWindow($(".menu-modal").children(), $(this).attr("id"));
});

$(document).on('click', '#signup-button', function() {
    changeWindow($(".menu-modal").children(), $(this).attr("id"));
});

$(document).on('click', '#settings-button', function() {
    changeWindow($(".menu-modal").children(), $(this).attr("id"));
});

function openMenu() {
    closeSiteNav();
    if (menuStack.length > 0) {
        $(".back-button").show();
    };
    $(".welcome-container").addClass("fade-white");
    $(".popup-message").remove();
    $("#menu-button").addClass("open").removeClass("closed");
    $("#edit-flowchart").addClass("unclickable");
    $(".header").addClass("shrink-header");
    $(".menu-modal").removeClass("slide-out-left");
    $(".menu-modal, .disabled").show();
}

function closeMenu() {
    closeSiteNav();
    $("#menu-button").removeClass("open").addClass("closed");
    $(".checked").removeClass("checked");
    $("#edit-flowchart").removeClass("unclickable");
    $(".header").removeClass("shrink-header");
    $('.checked .block-select').prop("checked", false);
    $(".menu-modal").addClass("slide-out-left");
    $(".menu-modal, .popup-message, .disabled, .back-button, .block-menu").fadeOut("fast");
}

function changeWindow(current, target, title=null) {
    var element = "";
    var view;
    
    if (title != null) {
        element = `<h2 class="modal-header slide-in-right">${title}</h2>`;
    }
    switch(target) {
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
        case "department-selector":
            view = newDepartmentSelectorView();
            break;
        case "course-selector":
            view = newCourseSelectorView();
            break;
                 }
    $(".back-button").show();
    element = element.concat(view);
    $(".menu-modal").children().addClass("slide-in-left");
    $(".menu-modal").empty().append(element);
    menuStack.push(current.toArray());
}

function popStack() {
    var window = menuStack.pop();
    $(".menu-modal").html(window);
    if (menuStack.length == 0) {
        $(".back-button").fadeOut("fast");
    }
    setAutocomplete();
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
        $(".menu-modal").append(`<h3 class="major-option slide-in-right">Couldn't Get Majors</h3>`);
    }
    $.each(availableCharts, function(index, value) {   
        var major = value;
        major = major.split('_').join(" ");
        if (major != $(".degree-name").text()) {
            $(".menu-modal").append("<h3 class='major-option slide-in-right' value='"+value+"'>"+major+"</h3>");
        }
    });
}

function newChartBrowserView() {
    var element = "<h2 class='modal-header slide-in-right'>New Flowchart</h2>";
    if (!availableCharts) {
        element = element.concat("<h3 class='major-option slide-in-right'>Couldn't Get Majors</h3>");
    }
    $.each(availableCharts, function(index, value) {
        var major = value;
        major = major.split('_').join(" ");
        if (major != $(".degree-name").text()) {
            element = element.concat("<h3 class='major-option slide-in-right' value='"+value+"'>"+major+"</h3>");
        }
    });
    element = element.concat("<h3 class='list-item slide-in-right'>Don't see yours?</h3>");
    return element;
}

function newUtilitiesView() {
    var element = 
        `<h2 class="modal-header slide-in-right">Degree Information</h2>
        <h3 class="list-item slide-in-right" onclick="showCurriculumSheet()">Get Curriculum Sheet</h3>
        <h4 class="modal-sub-header">Completed Units</h4>
        <h4 class="modal-statistic" id="ge-count">GE's: ${completedGECount}</h4>
        <h4 class="modal-statistic" id="support-count">Support: ${completedSupportCount}</h4>
        <h4 class="modal-statistic" id="major-count">Major: ${completedMajorCount}</h4>`;
    return element;
}

function newLoginView() {
    var element = 
        `<h2 class="modal-header slide-in-right">Log In</h2>
        <form name="signup" class="slide-in-right" method="POST" action="">
            <input id="login-username" type="text" placeholder="Username" required">
            <input id="login-password" type="password" placeholder="Password" required">
        </form>
        <button type="button" class="slide-in-right">Submit</button>`;
    return element;
}

function newSignupView() {
    var element = 
        `<h2 class="modal-header slide-in-right">Sign up</h2>
        <form name="signup" class="slide-in-right" method="POST" action="">
            <input id="signup-username" type="text" placeholder="Username" required">
            <input id="signup-password" type="password" placeholder="Password" required">
        </form>
        <button type="button" class="slide-in-right">Submit</button>`;
    return element;
}

function newSettingsView(val) {
    var element = 
        `<h2 class="modal-header slide-in-right">Settings</h2>
        <h3 class="toggle-button slide-in-right" id="toggle-summerQuarter">Show Summer Quarter
            <label class="switch">
                <input type="checkbox" ${val}>
                <div class="toggle round" onclick="changeSetting('summerQuarter', this)"></div>
            </label>
        </h3>`;
    return element;
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
    var usernameEntered = $("#login-username").val();
    var password = $("#login-password").val();
    var header = window.btoa(usernameEntered+":"+password);
    console.log("Header: "+header);
    var request = $.ajax({
        type: "GET",
        url: apiURL+"/authorize",
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + header);
        },
    });

    request.done(function() {
        popStack();
        $("#signup-button, #login-button").hide();
        userName = usernameEntered;
        loggedIn = true;
        alert("Welcome, "+userName);
        getUserCharts();
    })

    request.fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        alert("Username or password may be incorrect :/")
    });
}

function submitSignupInfo() {
    var username = $("#signup-username").val();
    var password = $("#signup-password").val();
    var header = window.btoa(username+":"+password);
    console.log("Header: "+header);
    var request = $.ajax({
        type: "POST",
        url: apiURL+"/useradd",
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + header);
        },
    });

    request.done(function() {
        popStack();
        $("#signup-button, #login-button").hide();
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        if (errorThrown == "CONFLICT") {
            alert("'"+username +"' is taken. Please choose a different username.");
        }
    });
}

function validateForm(form) {
    var isValid = true;
    form.each(function() {
        if ( $(this).val() === '' )
            isValid = false;
    });
    return isValid;
}