var tabIndex = 1;
var completedUnits = {ge: 0, support: 0, major: 0};

var Chart = {
    courses: [],
    ge_areas: ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B6', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'],
    ge_count: 0,
    pendingBlocks: {},
    course_list: [],
    inBuildMode: false,

    init: (options) => {
        var startYear = ChartUpdater.getStartYear();
        var numYears = localStorage.superSenior ? 5 : 4;
        var titles = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'SuperSenior'];
        Chart.clear();
        this.inBuildMode = (options && options.inBuildMode);

        for (var i=0; i<numYears; i++) {
            var yearOptions = {
                title: titles[i],
                year: startYear+i,
                yearSpan: `(${(startYear + i)}-${(startYear + i+1).toString().substr(-2)})`,
                id: `year${i+1}`,
                showSummerQuarter: localStorage.summerQuarter == "true",
                value: i+1,
            }
            Year.init(yearOptions);
        }
        checkWindowSize();

        if (this.inBuildMode) {
            Chart.hideWelcome();
            $('.quarter').append(`<div class="add-block-button">&plus;</div>`);
        } else {
            var charts = User.getCharts();
            if (!jQuery.isEmptyObject(charts))
                Chart.get();
        }
    },

    get: () => {
        var title = User.getActiveChart();
        var major = User.getActiveMajor()
        var url = User.chartUrl(title);

        $.get({
            url: url,
            timeout: 10000,
        }).done(function(data) {
            Chart.hideWelcome();
            Chart.parse(data);
        }).fail(function() {
            popupMessage('Oops', 'Server crapped out');
        });
    },

    parse: (data) => {
        var seasons = ['Fall', 'Winter', 'Spring', 'Summer'];

        $.each(data, function(key, value) {
            var year = value.block_metadata.time[0];
            var quarter = seasons.indexOf(value.block_metadata.time[1]);
            var dest = $('.year-holder').children().eq(year-1).children()
                .eq(1).children('.quarter').eq(quarter);

            value.block_metadata = value.block_metadata ? value.block_metadata : {};
            var block_metadata = value.block_metadata;
            var course_data = value.course_data;
            var className = block_metadata ?
                block_metadata.course_type.toLowerCase().split(' ').join('-') : '';

            Block.init({
                destination: dest,
                header: Block.getHeader(block_metadata, course_data),
                data: value,
                contents: Block.getSubtitle(value),
                className: className,
                id: key,
                hasCourseData: !!(course_data),
            });
        });
        $('.quarter').append(`<div class="add-block-button">&plus;</div>`);
        ChartUpdater.countUnits();
    },

    hideWelcome: () => {
        $('.welcome-container').fadeOut('fast');
        $('.floating-plus-button').show();
    },

    showWelcome: () => {
        $('.welcome-container').show();
    },

    update: (options) => {
        $.each(Chart.pendingBlocks, function(index, data) {
            var block_metadata = data.block_metadata;
            var course_data = data.course_data;
            var id = options && options.userAdded ?
                block_metadata.catalog_id : block_metadata._id;
            var block = $(`#${id}`).parent();

            var year = block.closest('.year').attr('value');
            var season = block.closest('.quarter').attr('value');

            block_metadata.time = [parseInt(year), season];
            if (course_data) {
                course_data.time = [parseInt(year), season];
            }
            block.data(data);

            if (User.logged_in) {
                API.updateCourse(data);
            }
        });
    },

    clear: () => {
        $('.year-holder').empty();
        $('.header-title').text('Welcome');
        Chart.showWelcome();
        Chart.ge_count = 0;
    },

    tab: (tabId) => {
        $(".block-outline").removeClass("show-block");
        $(".year").removeClass("slide-in-left slide-in-right");
        newTabIndex = parseInt(tabId);

        var newClass = newTabIndex > tabIndex ? "slide-in-right" : "slide-in-left";
        $("#year"+newTabIndex).addClass(newClass);

        tabIndex = newTabIndex;
    },

    setCurrentQuarter: () => {
        var currentSeason = getCurrentSeason();
        $(".quarter").removeClass("current-quarter");
        $(".quarter").each(function() {
            if ($(this).attr("name") == currentSeason) {
                $(this).addClass("current-quarter");
            }
        });
    },

    remove: (name, major) => {
        var config = User.data();

        if (User.logged_in) {
            API.deleteChart(name);
        }
        delete config.charts[name];
        var newActive = Object.keys(config.charts)[0];
        config.active_chart = newActive ? newActive : '';
        User.update(config);
        Menu.reloadCharts();
    },

    deleteCourses: () => {
        var chart = User.getActiveChart();
        $('.selected-block .block').each(function() {
            if (User.logged_in && !Chart.inBuildMode) {
                API.deleteCourse(chart, $(this).attr('id'));
            }
        });
        ChartEditor.deleteSelectedBlocks();
    },

    getGeArea: () => {
        if (Chart.ge_count == Chart.ge_areas.length) {
            Chart.ge_count = 0;
        }
        return Chart.ge_areas[Chart.ge_count++];
    },

    markReplace: el => {
        var block = $(el).closest('.block-outline');
        block.addClass('replaceable');
        $('.selected-block').removeClass('selected-block');
    },

    addCourse: (id) => {
        var course_data = $(`#${id}`).data();
        id = id.split('-')[0];
        var year = $('.appending').closest('.year').attr('value');
        var season = $('.appending').attr('value');
        var time = [parseInt(year), season];
        var course_type = !$('.appending').length ?
            $('.replaceable').attr('class').split(' ')[1] : "blank";
        var data = {
            block_metadata: {
                course_type: course_type,
                department: course_data.dept,
                flags: [],
                ge_type: [],
                time: time,
                notes: 'Course added by user',
                catalog_id: id,
            },
            course_data: course_data
        }

        if ($('.replaceable').length) {
            var block = $('.replaceable');
            ChartEditor.replaceBlock(block, course_data);
        } else {
            Block.init({
                destination: $('.appending'),
                initType: 'append',
                header: Block.getHeader(data.block_metadata, data.course_data),
                data: data,
                contents: Block.getSubtitle(data),
                className: 'blank',
                id: id,
            });

            API.addCourseToChart(data);
            Menu.close();
        }
    },

    enterBuilder: () => {
        Chart.init({
            inBuildMode: true,
        });
        Chart.inBuildMode = true;
        Menu.close();
        ChartEditor.edit();
    },
}
