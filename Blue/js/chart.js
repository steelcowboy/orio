var tabIndex = 1;
var savedFlags = [];
var savedEdits = [];
var userChartNames = [];
var completedUnits = {ge: 0, support: 0, major: 0};

function changeTab(tabId) {
    $(".block-outline").removeClass("show-block");
    $(".year").removeClass("slide-in-left slide-in-right");
    newTabIndex = parseInt(tabId);

    var newClass = newTabIndex > tabIndex ? "slide-in-right" : "slide-in-left";
    $("#year"+newTabIndex).addClass(newClass);

    tabIndex = newTabIndex;
}

function getCurrentQuarter() {
    var currentSeason = getCurrentSeason();
    $(".quarter").removeClass("current-quarter");
    $(".quarter").each(function() {
        if ($(this).attr("name") == currentSeason) {
            $(this).addClass("current-quarter");
        }
    })
}

function getLastChart() {
    //localStorage.removeItem('guestConfig');
    if (localStorage.userConfig) {
        userConfig = JSON.parse(localStorage.userConfig);
        username = userConfig.username.split('-')[1];
        getUserCharts();
    } else {
        guestConfig = localStorage.guestConfig;
        if (guestConfig) {
            $(".welcome-container").hide();
            loadChart(guestConfig.active_chart);
        }
    }
}

function setupChartComponents() {
    var yearComponents = `
        ${newYearComponent("year1", "Freshman", startYear)}
        ${newYearComponent("year2", "Sophomore", startYear + 1)}
        ${newYearComponent("year3", "Junior", startYear + 2)}
        ${newYearComponent("year4", "Senior", startYear + 3)}
    `;
    if (localStorage.superSenior) {
        $("#5-tab").removeClass("hidden");
        yearComponents = yearComponents.concat(`${newYearComponent("year5", "Super Senior", startYear + 4)}`);
    }
    $(".year-holder").empty().append(yearComponents);
    checkWindowSize();
}

function loadChart(chartName, userChart = false) {
    var title;
    var request;

    closeMenu();
    emptyStack();

    var url = userChart ? `${apiURL}users/${username}/charts/${chartName}` :
     `${apiURL}stock_charts/15-17/${chartName}`;
    title = chartName.split('_').join(" ");

    request = $.get({
        url: url,
        timeout: 10000,
    });

    request.done(function(data) {
        $(".welcome-container").fadeOut("fast");
        setupChartComponents();
        parseData(data, title);
        getSavedFlags();
        calculateUnits();
        chartLoaded = true;
        checkWindowSize();
        setActiveChart(chartName);
        $(".chart-menu-open-button").removeClass('hidden');
    });

    request.fail(function() {
        var title = "Oops",
            message = "It looks like the server isn't responding. Please try again in a little bit.";
        popupMessage(title, message);
    });
}

function setActiveChart(chartName) {
    userConfig.active_chart = chartName;
    localStorage.userConfig = JSON.stringify(userConfig);
}

function getSavedFlags() {
    savedFlags = localStorage.savedFlags ? JSON.parse(localStorage.savedFlags) : [];

    savedFlags.forEach(function(flagInfo) {
        $("#"+flagInfo.id).addClass(flagInfo.flag);
    });
}

function setupChart(title) {
    $(".header-title").text(title);
    $(".block, .degree-path h2").removeClass("hide-block");
    $(".block-outline").remove();
}

function parseData(data, title) {
    var blockData;
    var blockSpot;
    var i = 0;
    var id = 0;
    setupChart(title);

    $.each(data, function(key, value) {
        var quarter;
        var blockLocation
        var block_metadata = value.block_metadata;
        var course_data = value.course_data;
        console.log(key, block_metadata.catalog_id);

        blockLocation = parseBlockLocation(block_metadata);
        quarter = $(".year-holder").children().eq(blockLocation[1]-1).children().eq(1).children(".quarter").eq(blockLocation[0]);

        if (course_data && course_data.length) {
            quarter.append(newMultiBlockComponent(block_metadata, course_data));
        } else if (course_data) {
            quarter.append(newBlockComponent(block_metadata, course_data, null, key));
        } else {
            quarter.append(newElectiveBlockComponent(block_metadata));
        }
    });
    $(".quarter").append(`<div class="add-block-button"><i class="large material-icons">add</i></div>`);
}

function parseBlockLocation(block_metadata) {
    var course_type = block_metadata.course_type.toLowerCase().split(' ').join("-");
    var quarter = block_metadata.time[1];

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
    return [quarter, block_metadata.time[0]];
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

function openCourseSelector(block) {
    var id = $(block).attr("id");
    emptyStack();
    changeWindow("department-selector", "Departments", id) ;
    openMenu();
    $(".block").removeClass('replaceable');
    $(block).addClass('replaceable');
}

function openMultiCourseSelector(block) {
    emptyStack();
    openMenu();
    var id = $(block).attr("id");
    var courseList = [];
    courseList.push(id);
    $("#" + id + " .course-catalog-title").each(function() {
        courseList.push($(this).text());
    });

    changeWindow('multi-course-selector', "Choose a Course", courseList);
}

function replaceBlock(blockId, courseUrl) {
    var request = $.get({
        url: `${apiURL}courses/${courseUrl}`
    });

    request.done(function(data) {
        $("#"+blockId).html(newBlockCourseDataView(data));
        $("#"+blockId).attr("id", data._id);
    });

    closeMenu();
}

function openEditMode() {
    var chartContainer = $(".base");
    var block = $(".block-outline");

    if (!chartContainer.hasClass("base-editing")) {
        block.removeClass("show-block");
        chartContainer.addClass("base-editing");
        setupSortable(".block-outline",  ".block-option-container, .delete-block, .quarter-head, .edit-block-button", ".quarter, .block-drop");
        $(".chart-menu-open-button").addClass('hidden');
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
    $(".edit-container").fadeOut("fast");
    $(".quarter").sortable("destroy");
    $(".chart-menu-open-button").removeClass('hidden');


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
            item.addClass("selected-block");
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
            calculateUnits();
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
        var blocks = $(this).children(".block-outline").children(".block");
        blocks.each(function() {
            value = parseInt($(this).attr("value"));
            if (value) {
                unitCount += value;
                if ($(this).hasClass("general-ed mark-complete")) {
                    completedGECount += value;
                } else if ($(this).hasClass("support mark-complete")) {
                    completedSupportCount += value;
                } else if ($(this).hasClass("major mark-complete")) {
                    completedMajorCount += value;
                }
            }
        });
        $(this).children(".quarter-head").children(".quarter-unit-count").text(`${unitCount} units`);
    });

    $("#ge-count").text("GE's: " + completedGECount);
    $("#support-count").text("Support: " + completedSupportCount);
    $("#major-count").text("Major: " + completedMajorCount);
}

function deleteSelectedBlocks() {
    var selectedBlocks = $(".selected-block").eq(0);
    var id = selectedBlocks.children(".block").attr("id");
    selectedBlocks.css({
        visibility: 'hidden',
        display: 'block'
    }).slideUp("fast", function() {
        deleteCourse(id);
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

function popupCourseInfo(title, description, prereqs, dept, num) {
    var element =
        `<div class="popup-message z-depth-5">
            <h2 class="popup-title">${title}</h2>
            <div class="popup-description-container">
                <h3 class="popup-body">`+description+`</h3>
            </div>
            <h4 class="popup-ps">Prereqs: ${prereqs ? prereqs : "none"}</h4>
            <div class="popup-button-container">
                <h4 class="close-popup-message" onclick="closePopupMessage()">Okay</h4>
                <h4 class="close-popup-message" onclick="window.open('http://polyratings.com/search.php?type=Class&terms=${dept}+${num}&format=long&sort=rating');">PolyRatings</h4>
            </div>
         </div>`;
    $(".disabled").show();
    $("body").append(element);
}


function addBlockFlag(flagId) {
    var selectedBlocks = $(".selected-block");

    selectedBlocks.removeClass("mark-complete mark-retake mark-next-quarter mark-in-progress");
    selectedBlocks.each(function(key, block) {
        block = $(block).children(".block");
        var blockId = block.attr("id");
        var flagOption = flagId.replace(/[0-9]/g, '');
        var courseType = block.attr("data-courseType");
        var value = parseInt(block.attr("value"));
        var flag = {id: blockId, flag: flagOption, courseType: courseType, value: value};

        checkExistingFlag(block, flagOption, flag);
        $(this).addClass(flagId);
    });
    displayFlagMessage(flagId, false);
    toggleFlagPalette(true);
}

function checkExistingFlag(block, flagOption, flag) {
    savedFlags.forEach(function(flagInfo, key) {
        if (flagInfo.id == flag.id) {
            savedFlags.splice(key, 1);
        }
    });

    if (block.parent(".block-outline").hasClass(flagOption)) {
        block.parent(".block-outline").removeClass(flagOption);
        if (flagOption == "mark-complete") {
            updateUnitCount(block, flagOption);
        }
    } else {
        block.parent(".block-outline").removeClass("mark-complete mark-in-progress mark-next-quarter mark-retake");
        block.parent(".block-outline").addClass(flagOption);
        savedFlags.push(flag);
    }

    localStorage.savedFlags = JSON.stringify(savedFlags);
}

function displayFlagMessage(option, removing) {
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

function toggleChartMenu() {
    var chartMenu = $(".chart-menu");
    var openChartMenuButton = $(".chart-menu-open-button");
    if (chartMenu.hasClass('hidden')) {
        chartMenu.removeClass('hidden');
        openChartMenuButton.addClass('active-button');
    } else {
        chartMenu.addClass('hidden');
        openChartMenuButton.removeClass('active-button');
    }
}
