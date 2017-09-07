$(document).on('click', '.add-block-button', function() {
    if (!$(this).parent().hasClass("appending") || menuStack.length == 0) {
        emptyStack();
        $(".quarter").removeClass("appending");
        $(this).parent().addClass("appending");
        showCourseSelector();
    } else {
        openMenu();
    }
});

function setupBuilder() {
    var yearComponents = `
        ${newYearComponent("year1", "Freshman", startYear, true)}
        ${newYearComponent("year2", "Sophomore", startYear + 1, true)}
        ${newYearComponent("year3", "Junior", startYear + 2, true)}
        ${newYearComponent("year4", "Senior", startYear + 3, true)}
    `;
    $(".year-holder").append(yearComponents);
    $(".welcome-container").fadeOut("fast");
    if (!$("#chart-builder").hasClass("building")) {
        $("#chart-builder").addClass("building");
        $(".header-title").text("New Flowchart");
        $(".year-holder").empty().append(
            yearComponents
        );
    }
    checkWindowSize();
    closeMenu();
}

function showCourseSelector() {
    changeWindow("department-selector", "Departments");
    setupAutocomplete();
    openMenu();
}

function setupAutocomplete() {
    $( "#departmentSearch" ).autocomplete({
        source: departments,
        appendTo: ".menu-modal",
        select: function(event, ui) {
            fetchDepartmentCourses(ui.item.label);
            $( "#departmentSearch" ).autocomplete( "destroy" );
            $(".department-item").fadeIn("slow");
        },
        response: function( event, ui ) {
            $(".department-item").hide();
        }
    });
}

function newDepartmentSelectorView() {
    var element = "";
    var uiWidget = `
        <div class = "ui-widget menu-option slide-in-right">
            <input class="input-field" id ="departmentSearch" placeholder="Search" maxlength="4">
        </div>`
    element = element.concat(uiWidget);
    $.each(departments, function(index, value) {
        element = element.concat(`<h3 class="menu-option department-item slide-in-right" name="${value}" onclick="fetchDepartmentCourses(this)">${value}</h3>`);
    });
    return element;
}

function newCourseSelectorView() {
    var element = "";
    $.each(departmentCourses, function(index, value) {
        if (index > 0) {
            element = element.concat(`<h3 class="menu-option course-item slide-in-right" 
             name="${departmentCourses[0] /* Department Name */}/${value}" onclick="fetchCourse(this)">${value}</h3>`);
        }
    });
    return element;
}

function fetchDepartments() {
    var deps = [];
    var request = $.get({
        url: apiURL+"courses"
    });
        
    request.done(function(data) { 
        data.departments.forEach(function(value) {
            departments.push(value);
        });
    });
}

function fetchDepartmentCourses(location) {
    var dept = $(location).find(".department-specifier-input").val();
    var numInput = $(location).parent().find(".number-specifier-input");
//    var nums = testAjax(dept);
//    numInput.autocomplete({
//        source: nums,
//    });
}
//
//    function testAjax(dept) {
//        var result= [];
//        $.ajax({
//            url: `${apiURL}courses/${dept}`,
//            async: false,  
//            success:function(data) {
//                result = data; 
//            }
//        });
//        return result;
//    }

function fetchCourse(courseItem) {
    var courseName = $(courseItem).attr("name");
    var request = $.get({
        url: `${apiURL}courses/${courseName}`
    });
        
    request.done(function(data) { 
        appendBlock(data, courseName);
    });
    
    closeMenu();
}

function addCourseSpecifier(addComponent) {
    var numCourses = parseInt($(addComponent).find(".add-block-input").val());
    var quarter = $(addComponent).parent(".quarter");
    for (var i=0; i<numCourses && i < 8; i++) {
        quarter.append(newCourseSpecifierComponent());
    }
    $(".department-specifier-input").autocomplete({
        source: departments,
    });
}

function fetchFullCourse(location) {
    var dept = $(location).find(".department-specifier-input").val().toUpperCase();
    var num = $(location).find(".number-specifier-input").val();
    var serialized = `${dept}/${num}`;
    var courseType = $(location).find(".course-type-dropdown").val();

    var request = $.get({
        url: `${apiURL}courses/${serialized}`
    });
        
    request.done(function(data) { 
        var block = newBlockComponent(/* block_data */ {course_type: courseType}, data);
        $(location).replaceWith(block);
    });
}