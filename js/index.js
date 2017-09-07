const apiURL = "https://flowchamp.org/api/cpslo/"
//const apiURL = "http://127.0.0.1:4500/api/cpslo/";
const course_types = ['Major', 'Free Class', 'Support', 'General Ed', 'Minor', 'Concentration'];

var menuStack = [];
var availableCharts = [];
var departments = [];
var departmentCourses = [];
var completedGECount = 0;
var completedSupportCount = 0;
var completedMajorCount = 0;
var savedChartBuilder;
var startYear = localStorage.startYear ? parseInt(localStorage.startYear) : (new Date()).getFullYear();
    
$(document).ready(function() {
    checkWindowSize();
    $(".option-modal, .disabled, .edit-container").hide();
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

$.ajaxSetup({
    beforeSend:function() {
        $(".loading").addClass("progress-bar");
    },
    complete:function() {
        $(".loading").removeClass("progress-bar");
        $(".submit-loading").addClass("progress-bar").show();
    },
});


var resizeTimeout;
$(window).resize(function(){
  if(!!resizeTimeout){ clearTimeout(resizeTimeout); }
  resizeTimeout = setTimeout(function(){
    checkWindowSize();
  },200);
});

function loadTasks() {
    getLastChart();
    getAvailableCharts();
    fetchDepartments();
}

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
    if ($(window).width() <= 750){	
		$('ul.tabs').tabs();
        $("body").removeClass("desktop");
	} else {
        $("body").addClass("desktop");
        $(".year").show();
    }
}

function openUrlInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function closeSiteNav() {
    $(".external-site-modal").fadeOut("fast");
}

function closePopupMessage() {
    $(".popup-message").animate({
        opacity: 0,
        top: "-=150",
      }, 100, function() {
        $(this).remove();
      });
    closeMenu();
}

function popupMessage(title, message, dismiss=false, postNote=false) {
    var element = 
        `<div class="popup-message z-depth-5">
            <h2 class="popup-title">${title}</h2>
            <h3 class="popup-body">`+message+`</h3>
            <h4 class="popup-ps">${postNote ? postNote : ""}</h4>
            <h4 class="close-popup-message ${dismiss ? "" : "hidden"}" onclick="closePopupMessage()">Okay</h4>
         </div>`;
    $(".disabled").show();
    $("body").append(element);
}
