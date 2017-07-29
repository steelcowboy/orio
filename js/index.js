var apiURL = "https://ssh.marshhouse.tech:5500/",
    menuStack = [], // Stores the state of each menu view when a new view is 
    availableCharts = [];
//var userName;
//var loggedIn = false;
//var signupURL = "";
//var userCharts = [];

$(document).ready(function() {
    $(".option-modal, .disabled").hide();
    checkWindowSize();
    $('#menu-button').click(function(){
        if (!$(this).hasClass("open")) {
            $(this).addClass('open');
            openMenu();
        } else {
            $(this).removeClass('open');
            closeMenu();
        }
    });
});

function loadTasks() {
    getLastChart();
    getSettings();
    getAvailableCharts();
}

$.ajaxSetup({
    beforeSend:function() {
        $(".loading").addClass("progress-bar");
    },
    complete:function() {
        $(".progress-bar").removeClass("progress-bar");
    }
});

function getAvailableCharts() {
    var request = $.get({
        url: apiURL+"stock_charts/15-17"
    });
        
    request.done(function(data) {  
        availableCharts = [];
        $.each(data.charts, function(index, value) {   
            availableCharts.push(value);
        });
    });
}

function checkWindowSize() {
    if ($(window).width() <= 900){	
		$('ul.tabs').tabs();
	} else {
        $("body").addClass("desktop");
        $(".year").show();
    }
}

function popupMessage(title, message) {
    var element = 
        `<div class="disabled permanent"></div>
         <div class="popup-message">
            <h1 class="popup-title">${title}</h1>
            <h3>${message}</h3>
         </div>`;
    $(".base").append(element).hide().fadeIn("fast");
}