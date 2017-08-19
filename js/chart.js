var tabIndex = 1;
var savedFlags = [];
var savedEdits = [];
var completedUnits = {ge: 0, support: 0, major: 0};

$(document).on('click', '.tab', function() {
    $(".block-outline").removeClass("show-block");
    $(".year").removeClass("slide-in-left slide-in-right");
    newTabIndex = parseInt($(this).attr("id"));
    
    if (newTabIndex > tabIndex) {
        $("#year"+newTabIndex).addClass("slide-in-right");
        
    } else {
        $("#year"+newTabIndex).addClass("slide-in-left");
    }
    tabIndex = newTabIndex;
})

function getLastChart() {
    var savedChart = localStorage.getItem("savedChart");
    if (savedChart) {
        $(".welcome-container").hide();
        loadChart(savedChart);
    }
}

function loadChart(chartName) {
    var title;
    var request;
    
    title = chartName.split('_').join(" ");
    
    request = $.get({
        url: apiURL+"stock_charts/15-17/"+chartName,
        timeout: 10000,
    });
    
    request.done(function(data) {
        localStorage.savedChart = chartName;
        $(".welcome-container").fadeOut("fast");
        parseData(data, title);
        getSavedFlags();
        calculateUnits();
    });
    
    request.fail(function() {
        var title = "Oops",
            message = "It looks like the server isn't responding. Please try again in a little bit.";
        popupMessage(title, message);
    });
}

function getSavedFlags() {
    if (localStorage.savedFlags) {
        savedFlags = JSON.parse(localStorage.savedFlags);
    }
    
    savedFlags.forEach(function(obj, num, arr) {
        $("#"+obj.id+"-block").addClass(obj.flag);
    });
}


function setupChart(title) {
    $(".header-title").text(title);
    $(".block, .degree-path h2").removeClass("hide-block");
    $(".block-outline").remove();
    $(".add-block-button").hide();
}


function parseData(data, title) {
    var blockData;
    var blockSpot;
    var i = 0;
    var id = 0;
    
    setupChart(title);
    
    $.each(data, function(key, data) {
        blockData = getBlockData(key, data, i);
        blockSpot = $(".year-holder").children().eq(blockData.year-1).children().eq(1).children(".quarter").eq(blockData.quarter);
        blockSpot.append(newBlockComponent(blockData, key));
    });
}

function getBlockData(key, data, index) {
    var course_type = data.course_type.toLowerCase().split(' ').join("-");
    var quarter = data.time[1];
    
    switch(quarter) {
        case 'Fall':
            quarter = 0;
            break;
        case 'Winter':
            quarter = 1;
            break;
        case 'Spring':
            quarter = 2;
            break;
        case 'Summer':
            quarter = 3;
            break;
    }
    
    return  {
        course_type:course_type, title:data.title, year:data.time[0], quarter:quarter,
        id:key, index:index, catalog_id:data.catalog, credit_size:data.credits, ge_type:data.course_type
    };
}

function newBlockComponent(data, id) {
    return `
        <div class="block-outline show-block">
            <div class="edit-block-button" onclick="select(this)">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${data.course_type}" id="${id}-block" name="${data.course_type}" value="${data.credit_size}">
                <div class="ribbon"></div>
                <div class="block-title">
                    <h6>${data.title}</h6>
                </div>
                <div class="block-catalog">
                    <h5>${data.catalog_id} (${data.credit_size})</h5>
                </div>
            </div>
        </div>
    `;
}

function select(editButton) {  
    $(editButton).parent().toggleClass("selected-block");
    
    openEditMode();
    
    $("#selected-count-container").text(`${countSelected()} selected`);
}

function countSelected() {
    var count = $(".selected-block").length;
    
    if (count == 0) {
        closeEditMode();
    }
    
    return count;
}

function openEditMode() {
    var chartContainer = $(".base");
    var block = $(".block-outline");
    
    if (!chartContainer.hasClass("base-editing")) {
        block.removeClass("show-block");
        chartContainer.addClass("base-editing");
        setupSortable(".block-outline",  ".block-option-container, .delete-block, .quarter-head, .edit-block-button", ".quarter, .block-drop");
        $(".menu-nav-buttons").hide();
        $(".edit-container").fadeIn("fast");
    }
    
    calculateUnits();
}

function closeEditMode() {
    var chartContainer = $(".base");
    
    chartContainer.removeClass("base-editing");
    $(".selected-block").removeClass("selected-block");
    $(".menu-nav-buttons").fadeIn();
    $(".edit-container").hide();
    $(".quarter").sortable("destroy");
    
    toggleColorPalette(true);
    toggleFlagPalette(true);
}

$(document).on('click', '.editable', (function() {
    if (!$(this).hasClass("selected-block")) {
        $(this).addClass("selected-block");
    } else {
        $(this).removeClass("selected-block");
    }
}));

function setupSortable(items, cancel, connectWith) {
    $(".quarter").sortable({
        items: items,
        scroll: false,
        cancel: cancel,
        connectWith: connectWith,
        
        start: function(e, ui) {
            $(this).sortable('instance').offset.click = {
                left: Math.floor(ui.helper.width() / 2),
                top: Math.floor(ui.helper.height() / 2)
            }
        },
        
        helper: function (event, item) {
            var $helper = $("<li class='sortable-helper'><ul></ul></li>");
            var $selected = $(".selected-block");
            var $cloned = $selected.clone();
            $helper.find("ul").append($cloned);
            $selected.hide();
            item.data("multi-sortable", $cloned);

            return $helper;
        },

        stop: function (event, ui) {
            var $cloned = ui.item.data("multi-sortable");
            ui.item.removeData("multi-sortable");
            ui.item.after($cloned);
            ui.item.siblings(":hidden").remove();
            ui.item.remove();
            $(".selected-block").removeClass("selected-block");
        },
        
        receive: function(e, ui) {
            ui.item.before(ui.item.data('items'));
        },
    }).disableSelection();
}

function checkQuarterHeight() {
    var max = 0;
    
    $(".quarter").each(function() {
        max = (max == 0 || max < $(this).height()) ? $(this).height() : max;
    });
    
    $(".quarter").css("height", max+"px");
}

function calculateUnits() {
    var unitCount;
    var value;
    completedGECount = 0;
    completedSupportCount = 0;
    completedMajorCount = 0;
    
    $(".quarter").each(function() {
        unitCount = 0;
        $(this).children(".block").each(function() {
            value = parseInt($(this).attr("value"));
            unitCount += value;
            if ($(this).hasClass("general-class mark-complete")) {
                completedGECount += value;
            } else if ($(this).hasClass("support-class mark-complete")) {
                completedSupportCount += value;
            } else if ($(this).hasClass("major-class mark-complete")) {
                completedMajorCount += value;
            }
        });
        $(this).children(".quarter-head").children(".quarter-unit-count").text(`[${unitCount}]`);
    });
    
    $("#ge-count").text("GE's: " + completedGECount);
    $("#support-count").text("Support: " + completedSupportCount);
    $("#major-count").text("Major: " + completedMajorCount);
}

function deleteSelectedBlocks() {
    var selectedBlocks = $(".selected-block");
    
    selectedBlocks.css({
        visibility: 'hidden',
        display: 'block'
    }).slideUp("fast", function() {
        selectedBlocks.remove();
    });
    
    closeEditMode();
}

function changeSelectedBlockColor(colorItem) {
    var colorClass = $(colorItem).attr("id");
    var selectedBlocks = $(".selected-block .block");
    var colorPalette = $(".color-palette");
    
    selectedBlocks.removeClass("general-ed support free-class concentration major minor");
    selectedBlocks.addClass(colorClass);
    colorPalette.addClass("hidden");
}

function toggleColorPalette(toggleOff = false) {
    var colorPalette = $(".color-palette");
    var flagPalette = $(".flag-palette");
    
    if (colorPalette.hasClass("hidden")  && !toggleOff) {
        colorPalette.removeClass("hidden");
    } else {
        colorPalette.addClass("hidden");
    }
    
    flagPalette.addClass("hidden");
}

function toggleFlagPalette(toggleOff = false) {
    var colorPalette = $(".color-palette");
    var flagPalette = $(".flag-palette");
    
    if (flagPalette.hasClass("hidden") && !toggleOff) {
        flagPalette.removeClass("hidden");
    } else {
        flagPalette.addClass("hidden");
    }
    colorPalette.addClass("hidden");
}

function updateUnitCount(el, value) {
    var value = parseInt(el.attr("value")),
        type = el.attr("name");
    if (el.hasClass("mark-complete")) {
        value = -value;
    }
    switch(type) {
        case 'General Ed':
            completedGECount += value;
            break;
        case 'Support':
            completedSupportCount += value;
            break;
        case 'Major':
            completedMajorCount += value;
               }
    
    calculateUnits();
}

function editBlock(id) {
    var selectedBlocks = $(".selected-block");
    
    selectedBlocks.removeClass("mark-complete mark-retake mark-next-quarter mark-in-progress");
    selectedBlocks.each(function() {
        var blockId = parseInt(id),
            option = id.replace(/[0-9]/g, ''),
            blockEl = $("#"+blockId+"-block"),
            type = blockEl.attr("name"),
            value = parseInt(blockEl.attr("value")),
            flag = {id:blockId, flag:option, courseType:type, value:value};
        checkExistingFlag(blockEl, option, flag);
        $(this).addClass(id);
    });
    displayToast(id, false);
    toggleFlagPalette(true);
}

function checkExistingFlag(blockEl, className, flag) {
    var removing;
    savedFlags.forEach(function(obj, i) {
        if (obj.id == flag.id) {
            savedFlags.splice(i, 1);
        }
    });
    
    if (blockEl.hasClass(className)) {
        blockEl.removeClass(className);
        if (className == "mark-complete") {
            updateUnitCount(blockEl, className);
        }
        removing = true;
    } else {
        blockEl.removeClass("mark-complete mark-in-progress mark-next-quarter mark-retake");
        blockEl.addClass(className);
        savedFlags.push(flag);
    }
    
    localStorage.savedFlags = JSON.stringify(savedFlags);
    toggleFlagPalette();
}

function displayToast(option, removing) {
    var message;
    switch(option) {
        case 'mark-complete':
            message = "Flagged as complete";
            break;
        case 'mark-in-progress':
            message = "Flagged as in-progress";
            break;
        case 'mark-next-quarter':
            message = "Flagged for next quarter";
            break;
        case 'mark-retake':
            message = "Flagged as retake";
            break;
        case 'mark-none':
            message = "Removed flag";
            break;
                 }
    
    message = message;
    Materialize.toast(message, 2000);
}

//function getUserCharts() {
//    if (loggedIn) {
//        $("#login-button, #signup-button").hide();
//        var request = $.get({
//            url: API+userName+"/charts"
//        });
//
//        /* Successful response from the server */
//        request.done(function(data) {

//        });
//    }
//}