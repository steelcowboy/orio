/* Table of contents
 *  - Flowchart Components
 *  - Menu View Components
 */

/* Flowchart Components */
var startYear = 2015;

function newYearComponent(id, yearTitle, year = startYear) {
    return `
        <div class="year" id="${id}" name="${year}">
            <div class="head">
                <h2>${yearTitle}</h2>
            </div>
            <div class="quarter-holder">
                ${newQuarterComponent("Fall", year)}
                ${newQuarterComponent("Winter", year+1)}
                ${newQuarterComponent("Spring", year+1, /* lastQuarter */ true)}
            </div>
        </div>
    `;
}

function newQuarterComponent(season, year, lastQuarter = false) {
    var quarter =  `
        <div class="quarter" name="${season} ${year}">
            <div class="add-block-button">
                <p>&plus; Add</p>
            </div>
            <div class='quarter-head'>
                <h4 class="season">${season}</h4>
                <h4 class="quarter-unit-count"></h4>
            </div>
        </div>
    `;
    if (!lastQuarter) {
        quarter = quarter.concat(`<div class="quarter-divider"></div>`);
    }
    return quarter;
}

function newBlockComponent(block_metadata, course_data) {
    var course_type = block_metadata.course_type.toLowerCase().split(' ').join("-");
    return `
        <div class="block-outline show-block">
            <div class="edit-block-button" onclick="select(this)">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${course_data._id}" value="${course_data.units}">
                ${newBlockCourseDataView(course_data)}
            </div>
        </div>
    `;
}

function newBlockCourseDataView(course_data) {
    return `
        <div class="ribbon"></div>
        <div class="block-title">
            <h6>${course_data.title}</h6>
        </div>
        <div class="block-catalog">
            <h5 class="block-catalog-info">${course_data.department} ${course_data.course_number} (${course_data.units})</h5>
        </div>
        <div class="course-info" onclick="popupCourseInfo('${course_data.title}', '${course_data.description}', '${course_data.prereqs}', '${course_data.department}', '${course_data.course_number}')">?</div>
    `;
}

function newMultiBlockComponent(block_metadata, course_data) {
    var fullTitle = ``;
    var numCourses = course_data.length;
    var course_type = block_metadata.course_type.toLowerCase().split(' ').join("-");
    var block = `
        <div class="block-outline show-block">
            <div class="edit-block-button" onclick="select(this)">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${course_data[0]._id}" value="${course_data.units}">
                <div class="ribbon"></div>
                <div class="block-title">
                    <h6>Choose</h6>
                </div>
                <div class="block-catalog" style="margin-top: -1.5em">
        `;
    course_data.forEach(function(val, index) {
        if (index == 0 && numCourses == 2) {
            block = block.concat(`<h5 class="course-catalog-title">${val.department} ${val.course_number}</h5><h5>or</h5>`);
        } else {
            block = block.concat(`<h5 class="course-catalog-title">${val.department} ${val.course_number}</h5>`);
        }
        
    });
    block = block.concat(`
                </div>
                <div class="course-specify-button" onclick="openMultiCourseSelector(this.parentNode)">+</div>
            </div>
        </div>
    `);
    return block;
}

function newElectiveBlockComponent(block_metadata) {
    var course_type = block_metadata.course_type.toLowerCase().split(' ').join("-");
    return `
        <div class="block-outline show-block">
            <div class="edit-block-button" onclick="select(this)">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" value=0>
                <div class="ribbon"></div>
                <div class="block-title">
                    <h6>${block_metadata.elective_title}</h6>
                </div>
                <div class="block-catalog">
                    <h5>(4)</h5>
                </div>
            </div>
        </div>
    `;
}

/* Menu Views */ 
function newChartBrowserView() {
    var view = "<h2 class='modal-header slide-in-right'>New Flowchart</h2>";
    $.each(availableCharts, function(index, value) {
        var major = value;
        major = major.split('_').join(" ");
        if (major != $(".degree-name").text()) {
            view = view.concat("<h3 class='menu-option slide-in-right' id='"+value+"' onclick='changeStockFlowchart(this.id)'>"+major+"</h3>");
        }
    });
    return view;
}

function newMultiCourseSelectorView(courseNames) {
    var view = '';
    var id = courseNames[0];
    courseNames.forEach(function(course, index) {
        if (index > 0) {
            var courseUrl = course.split(' ').join('/');
            view = view.concat(`
                <h3 class="menu-option slide-in-right" onclick="replaceBlock('${id}', '${courseUrl}')">${course}
                    <i class="material-icons">keyboard_arrow_right</i>
                </h3>
            `);
        }
    });
    return view;
}

function newUtilitiesView() {
    return `
        <h2 class="modal-header slide-in-right">Degree Information</h2>
        <h3 class="menu-option slide-in-right" onclick="showCurriculumSheet()">Get Curriculum Sheet
            <i class="material-icons">keyboard_arrow_right</i>
        </h3>
        <h4 class="modal-sub-header">Completed Units</h4>
        <h4 class="modal-statistic" id="ge-count">GE's: ${completedGECount}</h4>
        <h4 class="modal-statistic" id="support-count">Support: ${completedSupportCount}</h4>
        <h4 class="modal-statistic" id="major-count">Major: ${completedMajorCount}</h4>
    `;
}

function newLoginView() {
    return `
        <h2 class="modal-header slide-in-right">Log In</h2>
        <form class="slide-in-right" id="login-form" action="javascript:submitLoginInfo()">
            <input id="login-username" type="text" placeholder="Username" required">
            <input id="login-password" type="password" placeholder="Password" required">
        </form>
        <button type="button" class="slide-in-right" onclick="submitLoginInfo()">Submit</button>
    `;
}


function newSettingsView(val) {
    return `
        <h2 class="modal-header slide-in-right">Settings</h2>
        <h3 class="menu-option slide-in-right" id="toggle-summerQuarter">Summer Quarter
            <label class="switch">
                <input type="checkbox" ${val}>
                <div class="toggle round" onclick="changeSetting('summerQuarter', this)"></div>
            </label>
        </h3>
        <h3 class="menu-option slide-in-right" id="year-selector" onclick="changeWindow(this.id);">Choose Start Year
            <i class="material-icons">keyboard_arrow_right</i>
        </h3>
    `;
}

function newYearSelectorView() {
    var element =  `
        <h2 class="modal-header slide-in-right">Choose Start Year</h2>
    `;
    var date = new Date();
    var year = date.getFullYear();
    for(i = 2020; i >= year-4; i--){
        element = element.concat(`<h3 class="menu-option slide-in-right" value="${i}" onclick="changeStartYear(this)">${i}</h3>`);
    }
    return element;
}







