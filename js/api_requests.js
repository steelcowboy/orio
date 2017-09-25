function login() {
    var loginForm = $("#login-form");
    var usernameEntered = $("#login-username").val();
    var password = $("#login-password").val();
    var remember = ($("#toggle-rememberMe").find("input").prop('checked'));
    var header = window.btoa(usernameEntered+":"+password);
    var data = JSON.stringify(remember ? {'remember': 'true'} : '');

    var request = $.ajax({
        type: "POST",
        url: apiURL+"authorize",
        contentType: 'application/json',
        data: data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + header);
            $("#submit-progress").removeClass("hidden");
        }
    });

    request.done(function(response) {
        emptyStack();
        userConfig = response;
        guestConfig = null;
        localStorage.removeItem('guestConfig');

        if (remember) {
            localStorage.userConfig = JSON.stringify(response);
        } else {
            localStorage.removeItem('userConfig');
        }
        username = response.username.split('-')[1];
        getUserCharts();
    });

    request.fail(function(jqXHR, textStatus, errorThrown) {
        $(".login-error-text").removeClass("hidden");
        $("#submit-progress").addClass("hidden");
    });
}

function logout() {
    var username = userConfig.username.split('-')[1];
    var url = `${apiURL}users/${username}/logout`;

    localStorage.removeItem('savedChart');
    localStorage.removeItem('userConfig');

    var request = $.post({
        url: url,
        success: function(result) {
            location.reload();
        },
        error: function() {
            location.reload();
        }
    });
}

function postChart(major, chartName) {
    var username = userConfig.username.split('-')[1];
    var url = `${apiURL}users/${username}/import`;
    var data = JSON.stringify({
        "target": major,
        "year": "15-17",
        "destination": chartName
    });
    var request = $.post({
        contentType: 'application/json',
        url: url,
        data: data
    });

    request.done(function(response) {
        console.log("Success!", response);
        sendUserConfig(chartName);
    });

    request.fail(function(response) {
        console.log(response);
    });
}

function deleteActiveChart() {
    if (userConfigExists()) {
        var username = userConfig.username.split('-')[1];
        var chart = userConfig.active_chart;
        var url = `${apiURL}users/${username}/charts/${chart}`;
        var request = $.ajax({
            type: 'DELETE',
            url: url,
            success: function(result) {
                console.log(result);
                userConfig = result;
                localStorage.userConfig = JSON.stringify(userConfig);
                $(".welcome-container").show();
                $(".header-title").text('Welcome');
                openMenu();
            }
        });
    } else {
        var activeChart = guestConfig.active_chart;
        guestConfig.active_chart = null;
        delete guestConfig.charts[activeChart];
        localStorage.guestConfig = JSON.stringify(guestConfig);
        $(".welcome-container").show();
        $(".header-title").text('Welcome');
        openMenu();

    }
}

function deleteCourse(courseId) {
    var chartName = userConfig.active_chart;
    var username = userConfig.username.split('-')[1];
    var request = $.ajax({
        type: "DELETE",
        url: `${apiURL}users/${username}/charts/${chartName}/${courseId}`,
    });

    request.done(function(response) {
        console.log("Deleted course", courseId);
    });
}
