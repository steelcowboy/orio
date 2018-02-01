/* Table of contents
 *  - Flowchart Components
 *  - Menu View Components
 */

/* Flowchart Components */

function newYearComponent(id, yearTitle, year = startYear, chartBuilder=false) {
    summerQuarter = localStorage.summerQuarter ? true : false;
    var component = `
        <div class="year" id="${id}" name="${year}">
            <div class="head">
                <h2>${yearTitle}</h2>
            </div>
            <div class="quarter-holder">
                ${newQuarterComponent("Fall", year, false, chartBuilder)}
                ${newQuarterComponent("Winter", year+1, false, chartBuilder)}
                ${newQuarterComponent("Spring", year+1, /* lastQuarter */ summerQuarter ? false : true, chartBuilder)}
        `;
        if (summerQuarter) {
            component = component.concat(`${newQuarterComponent("Summer", year+1, /* lastQuarter */ true, chartBuilder)}`);
        }
    component = component.concat(`
            </div>
        </div>
    `);
    return component;
}

function newQuarterComponent(season, year, lastQuarter = false, chartBuilder=false) {
    var currentSeason = getCurrentSeason();
    var quarterSeason = `${season} ${year}`;
    var quarter =  `
        <div class="quarter ${quarterSeason == currentSeason ? "current-quarter" : ''}" name="${quarterSeason}">
            <div class='quarter-head'>
                <h4 class="season">${season}</h4>
                <h4 class="quarter-unit-count"></h4>
            </div>
            ${chartBuilder ? newChartBuilderAddComponent() : ""}
        </div>
    `;
    if (!lastQuarter) {
        quarter = quarter.concat(`<div class="quarter-divider"></div>`);
    }
    return quarter;
}

function newBlockComponent(block_metadata, course_data, course_type = null, id = null) {
    if (!course_type) {
        course_type = block_metadata ? block_metadata.course_type.toLowerCase().split(' ').join("-") : "major";
    }
    return `
        <div class="block-outline show-block">
            <div class="edit-block-button" onclick="select(this)">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${id}" value="${course_data.units}" data-courseType="${course_type}">
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
            <h5 class="block-catalog-info">${course_data.dept} ${course_data.course_number} (${course_data.units})</h5>
        </div>
        <div class="course-info" onclick="popupCourseInfo('${course_data.title}', '${course_data.description}', '${course_data.prereqs}', '${course_data.dept}', '${course_data.course_number}')">?</div>
    `;
}

function newMultiBlockComponent(block_metadata, course_data) {
    var fullTitle = ``;
    var numCourses = course_data.length;
    var course_type = block_metadata.course_type.toLowerCase().split(' ').join("-");
    var id = '';
    course_data.forEach(function(val, index) {
        id = id.concat(`${index > 0 ? '-' : ''}${val._id}`);
    });
    var block = `
        <div class="block-outline show-block">
            <div class="edit-block-button" onclick="select(this)">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${id}" value="${course_data[0].units}">
                <div class="ribbon"></div>
                <div class="block-title">
                    <h6>Choose</h6>
                </div>
                <div class="block-catalog" style="margin-top: -1.5em">
        `;
    course_data.forEach(function(val, index) {
        if (index == 0 && numCourses == 2) {
            block = block.concat(`<h5 class="course-catalog-title">${val.dept} ${val.course_number}</h5><h5>or</h5>`);
        } else {
            block = block.concat(`<h5 class="course-catalog-title">${val.dept} ${val.course_number}</h5>`);
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
    var title = block_metadata.elective_title ? block_metadata.elective_title :
     block_metadata.course_type;
    return `
        <div class="block-outline show-block">
            <div class="edit-block-button" onclick="select(this)">
                <i class="material-icons">check</i>
            </div>
            <div class="block ${course_type}" id="${block_metadata._id}" value="4">
                <div class="ribbon"></div>
                <div class="block-title">
                    <h6>${title}</h6>
                </div>
                <div class="block-catalog">
                    <h5>(4)</h5>
                </div>
                <div class="course-specify-button" onclick="openCourseSelector(this.parentNode)">+</div>
            </div>
        </div>
    `;
}

/* Chart Builder Components */

function newChartBuilderAddComponent() {
    return `
        <div class="add-block-count-container show-block">
            <div class="input-field col s6">
                <input type="text" class="add-block-input" maxlength="1" placeholder="# Courses">
            </div>
            <div class="add-block-amount-button" onclick="addCourseSpecifier(this.parentNode)">
                <i class="material-icons">add</i>
            </div>
        </div>
    `;
}

function newCourseSpecifierComponent() {
    var component =  `
        <div class="course-specifier-container show-block">
            <div class="course-specifier-input-container">
                <div class="input-field col s6">
                    <input type="text" class="department-specifier-input" placeholder="DEPT" onchange="fetchFullCourse(this.parentNode)">
                </div>
                <div class="input-field col s6">
                    <input type="text" class="number-specifier-input" placeholder="#">
                </div>
            </div>
            <select class="course-type-dropdown">
    `;
    course_types.forEach(function(course_type) {
        component = component.concat(`<option value="${course_type}">${course_type}</option>`)
    });

    component = component.concat (
        `</select>
            <div class="add-course-button" onclick="fetchFullCourse(this.parentNode)">
                <i class="material-icons">add</i>
            </div>
        </div>
    `);
    return component;
}

/* Menu Views */
function newChartBrowserView() {
    var view = "<h2 class='modal-header slide-in-right'>New Flowchart</h2>";
    $.each(availableCharts, function(index, value) {
        var major = value;
        major = major.split('_').join(" ");
        if (major != $(".degree-name").text()) {
            view = view.concat(`<h3 class="menu-option slide-in-right" id="${value}" onclick="changeStockFlowchart(this.id)">${major}</h3>`);
        }
    });
    return view;
}

function newChartNamerView(newMajor) {
    return `
        <form class="menu-form slide-in-right" id="chart-name-form">
            <div class="input-field col s6">
                <input id="chart-name-input" type="text" class="validate">
                <label for="chart-name-input">Chart Name</label>
            </div>
            <button type="button" class="slide-in-right" onclick="saveChartInfo('${newMajor}')">Submit</button>
        </form>
    `;
}

function newUserChartBrowserView() {
    var view = `<h2 class="modal-header slide-in-right">Your Charts</h2>`;
    if (Object.keys(userConfig.charts).length === 0 && userConfig.charts.constructor === Object) {
        view = view.concat(`
            <h3 class="menu-option slide-in-right" onclick="changeWindow('chart-year-browser')">New Flowchart
                <i class="material-icons">keyboard_arrow_right</i>
            </h3>
        `);
    }
    $.each(userConfig.charts, function(index, value) {
        view = view.concat(`
            <h3 class="menu-option slide-in-right" name="${value}" onclick="loadChart('${index}', true)">${index}
                <i class="material-icons">keyboard_arrow_right</i>
            </h3>
        `);
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
        <h3 class="menu-option slide-in-right ${$(".header-title").text() == 'New Flowchart' ? 'hidden' : ''}" onclick="showCurriculumSheet()">Get Curriculum Sheet
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
        <div class="login-img-container">
            <img class="school-logo login-img slide-in-right" src="img/school_logos/cpslo.png">
        </div>
        <form class="menu-form slide-in-right" id="login-form" action="javascript:login()">
            <div class="input-field col s6">
                <input id="login-username" type="text" class="validate">
                <label for="login-username">Username</label>
            </div>
            <div class="input-field col s6">
                <input id="login-password" type="password" class="validate">
                <label for="login-password">Password</label>
            </div>
            <p class="login-error-text slide-in-right hidden">Incorrect Username or Password</p>
            <button type="button" class="slide-in-right" onclick="login()">Submit</button>
            <div class="progress-bar hidden" id="submit-progress">
                <div class="indeterminate"></div>
            </div>
        </form>
        <h3 class="menu-option slide-in-right" id="toggle-rememberMe">Remember
            <label class="switch">
                <input type="checkbox" ${localStorage.rememberMe ? 'checked' : ''}>
                <div class="toggle round"></div>
            </label>
        </h3>
    `;
}

function newSettingsView(val) {
    return `
        <h2 class="modal-header slide-in-right">Settings</h2>
        <h3 class="menu-option slide-in-right" id="toggle-summerQuarter">Summer Quarter
            <label class="switch">
                <input type="checkbox" ${localStorage.summerQuarter ? 'checked' : ''}>
                <div class="toggle round" onclick="toggleSummerQuarter(this.parentNode)"></div>
            </label>
        </h3>
        <h3 class="menu-option slide-in-right" id="toggle-superSenior">Five Years
            <label class="switch">
                <input type="checkbox" ${localStorage.superSenior ? 'checked' : ''}>
                <div class="toggle round" onclick="toggleSuperSenior(this.parentNode)"></div>
            </label>
        </h3>
        <h3 class="menu-option slide-in-right" id="year-selector" onclick="changeWindow(this.id);">Starting Year
            <i class="material-icons">keyboard_arrow_right</i>
        </h3>
        <h3 class="menu-option slide-in-right" id="about" onclick="changeWindow(this.id);">About
            <i class="material-icons">keyboard_arrow_right</i>
        </h3>
    `;
}

function newYearSelectorView(chartBrowser = false) {
    var element =  `
        <h2 class="modal-header slide-in-right">Starting Year</h2>
    `;
    var date = new Date();
    var year = date.getFullYear();
    for(i = (new Date()).getFullYear()+1; i >= year-6; i--){
        element = element.concat(`<h3 class="menu-option slide-in-right" value="${i}" onclick="changeStartYear(this, '${chartBrowser ? true : false}')">${i}</h3>`);
    }
    return element;
}

function newAboutView() {
    return `
        <div class="menu-logo-container slide-in-right">
            <div class="logo menu-logo">
                <div class="logo-letter">
                    <div id="top-f"></div>
                    <div id="bottom-f"></div>
                </div>
                <div class="bottom-text">flowchamp</div>
            </div>
        </div>
        <h3 class="modal-sub-header">FlowChamp was created to make college planning easier and more connected.</h3>
        <h3 class="modal-sub-header">Development of this project was done by two students attending Cal Poly.</h3>
        <h3 class="menu-option slide-in-right" onclick="openUrlInNewTab('http://devjimheald.com')">Jim Heald (Backend)
            <i class="material-icons">open_in_new</i>
        </h3>
        <h3 class="menu-option slide-in-right" onclick="openUrlInNewTab('http://tannerv.com')">Tanner Villarete (Frontend)
            <i class="material-icons">open_in_new</i>
        </h3>
    `
}


