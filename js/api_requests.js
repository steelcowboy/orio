var API = {
    url: '/api/cpslo',
    failed_auths: 0,
    departments: [],
    departmentCourses: [],
    departmentCourseTitles: [],

    authorize: (options) => {
        options.type = 'POST';
        options.url = `${API.url}/authorize`;
        options.contentType = 'application/json';

        API.newRequest(options)
            .done(function(config) {
                User.logged_in = true;
                API.mergeGuestCharts(config);
                User.update(config);
                Menu.init();
            }).fail(function() {
                User.logged_in = false;
                API.failed_auths += 1;
                if (API.failed_auths == 3) {
                    alert("Careful, one more try before you get locked out for 30 mins!");
                }
                $('.login-error-text').removeClass('hidden');
                $('#submit-progress').addClass('hidden');
            });
    },

    mergeGuestCharts: (config) => {
        var guestConfig = User.data();
        if (guestConfig.charts && guestConfig.username === 'cpslo-guest') {
            var username = config.username.split('-')[1];
            config.active_chart = guestConfig.active_chart;

            $.each(guestConfig.charts, function(key, value) {
                API.importChart(value, key, username, true);
                config.charts[key] = value;
            });
            return true;
        }
        return false;
    },

    logout: () => {
        var options = {
            type: 'POST',
            url: `${API.url}/users/${User.username()}/logout`,
        };

        API.newRequest(options)
            .done(function() {
                User.remove();
            });
    },

    stockCharts: () => {

    },

    importChart: (major, name, username, login) => {
        username = username ? username : User.username();
        var options = {
            type: 'POST',
            url: `${API.url}/users/${username}/import`,
            contentType: 'application/json',
            data: JSON.stringify({
                "target": major,
                "year": "15-17",
                "destination": name
            }),
        };

        API.newRequest(options)
            .done(function(response) {
                if (!login) {
                    Menu.init();
                }
            }).fail(function(response) {
                console.log(response);
            });
    },

    loginStatus: () => {
        var options = {
            type: 'GET',
            url: `${API.url}/users/${User.username()}`,
        };

        API.newRequest(options)
            .done(function(response) {
                User.logged_in = true;
                Chart.init();
                Menu.init();
            }).fail(function(response) {
                User.logged_in = false;
                changeWindow('login-button');
                Menu.open();
            });
    },

    getUserConfig: () => {
        var options = {
            type: 'GET',
            url: `${API.url}/users/${User.username()}/config`,
        }

        API.newRequest(options)
            .done(function(config) {
                User.logged_in = true;
                User.update(config);
                $("#login-button").addClass('hidden');
                $("#logout-button").removeClass("hidden");
            });
    },

    updateUserConfig: (newConfig) => {
        var username = newConfig.username.split('-')[1];
        var options = {
            type: 'POST',
            url: `${API.url}/users/${username}/config`,
            contentType: 'application/json',
            data: JSON.stringify(newConfig),
        };

        API.newRequest(options)
            .done(function(response) {
                Chart.init();
            });
    },

    userCharts: () => {

    },

    addCourseToChart: (data) => {
        var course_data = data.course_data;
        var block_metadata = data.block_metadata;

        if (User.logged_in) {
            console.log(block_metadata);
            console.log("Course not actually added. This endpoint is disabled");
            API.newRequest({
                type: 'POST',
                url: `${API.url}/users/${User.username()}/charts/${User.getActiveChart()}`,
                contentType: 'application/json',
                data: JSON.stringify(block_metadata),
            }).done(function(response) {
                data.block_metadata._id = response._id;
                Chart.pendingBlocks = [];
                Chart.pendingBlocks.push(data);
                Chart.update();
            });
        }
    },

    deleteChart: (name) => {
        var options = {
            type: 'DELETE',
            url: `${API.url}/users/${User.username()}/charts/${name}`
        };
        var request = API.newRequest(options);
    },

    getCourseById: () => {

    },

    updateCourse: data => {
        var block_metadata = data.block_metadata;
        var id = block_metadata._id;
        var options = {
            type: 'PUT',
            url: `${API.url}/users/${User.username()}/charts/${User.getActiveChart()}/${id}`,
            contentType: 'application/json',
            data: JSON.stringify(block_metadata),
        }
        API.newRequest(options)
            .done(function(response) {
                console.log(response);
            })
            .fail(function(response) {
                console.log('Unable to update course');
                console.log(response);
            });
    },

    deleteCourse: (chart, courseId) => {
        var options = {
            type: 'DELETE',
            url: `${API.url}/users/${User.username()}/charts/${chart}/${courseId}`,
        };
        API.newRequest(options)
            .done(function(response) {
                console.log("Course Deleted!", response);
            }).fail(function(response) {
                console.log(response);
            });
    },

    getDepartments: () => {
        API.newRequest({
            type: 'GET',
            url: `${API.url}/courses`,
        }).done(function(departments) {
            API.departments = departments.departments;
        });
    },

    getCoursesByDepartment: DEPT => {
        API.newRequest({
            type: 'GET',
            url: `${API.url}/catalog/${DEPT}`,
        }).done(function(courses) {
            API.departmentCourses = courses;
            MenuView.populate('menu-course', courses);
        });
    },

    getBlockMetadata(block, course_data) {
        if (!course_data) {
            return {};
        }
        block = $(`#${course_data._id}`);
        var year = block.closest('.year').attr('value');
        var season = block.closest('.quarter').attr('value');
        var course_type = !$('.appending').length ?
            $('.block.replaceable').attr('class').split(' ')[1] : "blank";
        var id = course_data && course_data.length ? course_data[0]._id : course_data._id;

		return {
            course_type: course_type,
            department: course_data.dept,
            flags: [],
            ge_type: [],
            notes: 'Course added by user',
            time: [parseInt(year), season],
        }
    },

    newRequest: options => {
        return $.ajax({
            type: options.type,
            url: options.url,
            contentType: options.contentType,
            data: options.data,
            beforeSend: options.beforeSend,
        });
    },
}
