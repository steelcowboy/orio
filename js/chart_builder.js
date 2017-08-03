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

$(document).on('click', '.department-item', function() {
    fetchDepartmentCourses($(this).attr("name"));
//    changeWindow($(".menu-modal").children(), "course-selector", $(this).attr("name"));
});

$(document).on('click', '.course-item', function() {
    fetchCourse($(this).attr("name"));
    closeMenu();
});

function setupBuilder() {
    if (!$("#chart-builder").hasClass("building")) {
        $("#chart-builder").addClass("building");
        $(".header-title").text("New Flowchart");
        $(".quarter").each(function(index, element) {
            $(this).find(".quarter-unit-count").text("[0]");
            $(this).fadeOut("fast", function() {
                $(".add-block-button").show();
                $(this).fadeIn("fast");
            });
        });
        $(".block").fadeOut("fast", function() {
            $(".block").remove();
        });
    }
}

function showCourseSelector() {
    changeWindow($(".menu-modal").children(), "department-selector", "Departments");
    setAutocomplete();
    openMenu();
}

function setAutocomplete() {
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
        <div class = "ui-widget list-item slide-in-right">
            <input class="input-field" id ="departmentSearch" placeholder="Search" maxlength="4">
        </div>`
    element = element.concat(uiWidget);
    $.each(departments, function(index, value) {
        element = element.concat(`<h3 class="list-item department-item slide-in-right" name="${value}">${value}</h3>`);
    });
    return element;
}

function newCourseSelectorView() {
    var element = "";
    $.each(departmentCourses, function(index, value) {
        if (index > 0) {
            element = element.concat(`<h3 class="list-item course-item slide-in-right" 
             name="${departmentCourses[0] /* Department Name */}/${value}">${value}</h3>`);
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

function fetchDepartmentCourses(department) {
    departmentCourses = [];
    var request = $.get({
        url: `${apiURL}courses/${department}`
    });
        
    request.done(function(data) { 
        departmentCourses.push(department);
        data.courses.forEach(function(value) {
            departmentCourses.push(value);
        });
    });
    request.then(function() {
        changeWindow($(".menu-modal").children(), "course-selector", department);
    })
}

function fetchCourse(title) {
    var request = $.get({
        url: `${apiURL}courses/${title}`
    });
        
    request.done(function(data) { 
        appendBlock(data, title);
    });
}

function appendBlock(data, title) {
    var catalogNum = title.split("/").join(" ");
    console.log(data, title);
    var prereqs = data.prereqs ? data.prereqs : "None";
    var block_type = "support-class",
        id = 0,
        ge_type = "support-class";
     var element =  `
        <div class="block show-block ${block_type}" id="${id}-block" name="${ge_type}" value="${data.units}">
            <div class="delete-block">
                <p id="${id}delete-block" onclick="addFlag(this.id)">&times;</p>
                <i class="material-icons" id="${id}mark-complete" onclick="editBlock(this.id)">mode_edit</i>
            </div>
            <div class="ribbon"></div>
            <div class="block-title">
                <h6>${data.title}</h6>
            </div>
            <div class="block-catalog">
                <h5>${catalogNum} (${data.units})</h5>
            </div>
            <div class="course-info" onclick="popupMessage('${data.title}', '${data.description}', 'true', '${"Prereqs: "+prereqs}')">?</div>
            <div class="block-option-container">
                <i class="material-icons" id="${id}mark-complete" onclick="addFlag(this.id)">done</i>
                <i class="material-icons" id="${id}mark-retake" onclick="addFlag(this.id)">settings_backup_restore</i>
                <i class="material-icons" id="${id}mark-next-quarter" onclick="addFlag(this.id)">call_made</i>
                <i class="material-icons" id="${id}mark-in-progress" onclick="addFlag(this.id)">schedule</i>
            </div>
        </div>
    `;
    $(element).appendTo(".appending");
    calculateUnits();
}


















