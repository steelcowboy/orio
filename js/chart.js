var tabIndex = 1,
    savedFlags = [],
    savedEdits = [],
    completedUnits = {ge: 0, support: 0, major: 0};

$(document).on('click', '.tab', function() {
    $(".block").removeClass("show-block");
    newTabIndex = parseInt($(this).attr("id"));
    $(".year").removeClass("slide-in-left");
    $(".year").removeClass("slide-in-right");
    if (newTabIndex > tabIndex) {
        $("#year"+newTabIndex).addClass("slide-in-right");

    } else {
        $("#year"+newTabIndex).addClass("slide-in-left");
    }
    tabIndex = newTabIndex;
})

$('.block-menu-button').on('click', function() {
    var blockId = parseInt($(this).parent().attr("id"));
    toggleBlockMenu(blockId);
});

function getLastChart() {
//    var savedChart = localStorage.getItem("savedChart");
//    /* TODO: Add localstorage*/
//    savedChart = savedChart.split(" ").join("_");
//    loadChart(savedChart);
}

function loadChart(chartName) {
    var title,
        request;
    title = chartName.split('_').join(" ");
    request = $.get({
        url: apiURL+"stock_charts/15-17/"+chartName,
        timeout: 10000,
    });
    request.done(function(data) {
        $(".logo-container").fadeOut("fast");
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
    })
}


function setupChart(title) {
    $(".header-title").text(title);
    $(".block, .degree-path h2").removeClass("hide-block");
    $(".block").remove();
    $(".add-block-button").hide();
}


function parseData(data, title) {
    var block,
        blockSpot,
        i = 0,
        id = 0;
    setupChart(title);
    $.each(data, function(key, data) {
        block = newBlock(key, data, i);
        blockSpot = $(".year-holder").children().eq(block.year-1).children().eq(1).children().eq(block.quarter);
        addBlock(block, blockSpot, key);
    });
}

function newBlock(key, data, index) {
    var id,
        block,
        type,
        block_type = data.course_type,
        catalog_type = data.catalog,
        credit_type = data.credits,
        ge_type = data.ge_type,
        quarter = data.time[1];

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
        default:
            console.log("NO QUARTER");
            break;
    }

    switch(block_type) {
        case 'Free Elective':
            type = "free-class";
            break;
        case 'General Ed':
            type = "general-class";
            break;
        case 'Support':
            type = "support-class";
            break;
        case 'Minor':
            type = "minor-class";
            break;
        case 'Major':
            type = "major-class";
            break;
        case 'Concentration':
            type = "concentration-class";
            break;
        default:
            type = "blank";
    }

    ge_type = (ge_type ? ""+ge_type+"" : "");
    id = key;

    block = {block_type:type, title:data.title, year:data.time[0], quarter:quarter, id:id, index:index, course_type:data.course_type, catalog_type:data.catalog, credit_type:data.credits,
    ge_type:block_type}

    return block;
}

function addBlock(data, quarter, id) {
    var element =  `
        <div class="block show-block ${data.block_type}" id="${id}-block" name="${data.ge_type}" value="${data.credit_type}">
            <div class="delete-block">
                <i class="material-icons" id="${id}mark-complete" onclick="editBlock(this.id)">mode_edit</i>
            </div>
            <div class="ribbon"></div>
            <div class="block-title">
                <h6>${data.title}</h6>
            </div>
            <div class="block-catalog">
                <h5>${data.catalog_type} (${data.credit_type})</h5>
            </div>
        </div>
    `;
    quarter.append(element);
}

var year = 1;
function toggleEditMode() {
    if(!($(".block").hasClass("editable"))) {
        $(".base").addClass("base-editable");
        $(".edit-palette").removeClass("hidden");
//        $(".add-block-button").show();
        $(".edit-button").text("check");
        setupSortable(".block",  ".block-option-container, .delete-block, .quarter-head",
                      ".quarter, .block-drop");
        $(".block").addClass("editable");
    }
    else {
        $(".base").removeClass("base-editable");
        $(".edit-palette").addClass("hidden");
        $(".block").removeClass("editable");
        $(".edit-button").text("mode_edit");
        $(".quarter").sortable({
            disabled: true,
        });
        $(".block").removeClass("selected-block");
        $(".add-block-button").hide();
    }
    calculateUnits();

}

$(document).on('click', '.editable', (function() {
    if (!$(this).hasClass("selected-block")) {
        $(this).addClass("selected-block");
    } else {
        $(this).removeClass("selected-block");
    }
}));

$(".color-choice").click(function() {
    var selectedBlocks = $(document).find(".selected-block");
    selectedBlocks.removeClass("general-class support-class ge-class free-class concentration-class free-class major-class minor-class");
    selectedBlocks.addClass($(this).attr("id"));
});

function setupSortable(items, cancel, connectWith) {
    $(".quarter").sortable({
        items: items,
        revert: true,
        scroll: false,
        disabled: false,
        cancel: cancel,
        connectWith: connectWith,
        helper: function (e, item) {
            if(!item.hasClass('checked'))
               item.addClass('checked');
            var elements = $('.checked').clone();
            elements.addClass("dragging");
            var helper = $('<ul/>');
            item.siblings('.checked').addClass('hidden');
            return helper.append(elements);
        },

        /* Start function is used to center div on mouse pointer */
        start: function(e, ui) {
            var elements = ui.item.siblings('.checked.hidden');
            var marginsToSet = ui.item.data().sortableItem.margins;
            ui.item.css('margin-left', marginsToSet.left);
            ui.item.css('margin-top', marginsToSet.top);
            ui.item.data('items', elements);
        },

        receive: function(e, ui) {
            ui.item.before(ui.item.data('items'));
        },

        stop: function(e, ui) {
            ui.item.css('margin', '.5em auto');
            ui.item.siblings('.checked').removeClass('hidden');
            $('.checked .block-select').prop("checked", false);
            $('.checked').removeClass('checked');
            calculateUnits();
        },
    }).disableSelection();
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
        })
        $(this).children(".quarter-head").children(".quarter-unit-count").text(`[${unitCount}]`);
    });
    $("#ge-count").text("GE's: " + completedGECount);
    $("#support-count").text("Support: " + completedSupportCount);
    $("#major-count").text("Major: " + completedMajorCount);
}

function addFlag(id, remove=false) {
    var blockId = parseInt(id),
        option = id.replace(/[0-9]/g, ''),
        blockEl = $("#"+blockId+"-block"),
        type = blockEl.attr("name"),
        value = parseInt(blockEl.attr("value")),
        flag = {id:blockId, flag:option, courseType:type, value:value};

    if (remove) {
        blockEl = $(document).find(".selected-block");
        blockEl.css({
            visibility: 'hidden',
            display: 'block'
            }).slideUp("fast", function() {
            blockEl.remove();
        });
    } else {
        checkExistingFlag(blockEl, option, flag);
    }
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
    displayToast(className, removing);
}

function displayToast(option, removing) {
    var message;
    switch(option) {
        case 'mark-complete':
            message = "Marked as complete";
            break;
        case 'mark-in-progress':
            message = "Marked as in-progress";
            break;
        case 'mark-next-quarter':
            message = "Marked for next quarter";
            break;
        case 'mark-retake':
            message = "Marked as retake";
            break;
                 }
    message = removing ? "Removed mark" : message;
    Materialize.toast(message, 1000);
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
    var selectedBlocks = $(document).find(".selected-block");
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
    })
}

function closeSiteNav() {
    $(".external-site-modal").fadeOut("fast");
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
//            console.log("User's charts:");
//            console.log(data);
//        });
//    }
//}

function alertClassInfo(block_id) {
    alert("This will give class info! Block " + block_id + " was clicked!");
}
