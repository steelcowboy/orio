var apiURL = "https://ssh.marshhouse.tech:5500/",
    menuStack = [], // Stores the state of each menu view when a new view is 
    availableCharts = [],
    departments = [],
    departmentCourses = [];
var completedGECount = 0;
var completedSupportCount = 0;
var completedMajorCount = 0;
var savedChartBuilder;
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
    fetchDepartments();
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

$(document).on('click', '.close-popup-message', function() {
    $(".popup-message").remove();
    closeMenu();
})

function popupMessage(title, message, dismiss=false, postNote=false) {
    console.log(title, message);
    var element = 
        `<div class="popup-message z-depth-5">
            <h2 class="popup-title">${title}</h2>
            <h3 class="popup-body">`+message+`</h3>
            <h4 class="popup-ps">${postNote ? postNote : ""}</h4>
            <h4 class="close-popup-message ${dismiss ? "" : "hidden"}">Okay</h4>
         </div>`;
    $(".disabled").show();
    $("body").append(element);
}