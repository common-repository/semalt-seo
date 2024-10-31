(function ( $) {

    let domain;
    let startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');
    let threeMonthAgoDate = moment().subtract(3, 'month').format('YYYY-MM-DD');
    let currentDate = moment().format('YYYY-MM-DD');
    let canBeLoaded = true;
    let allowScrollLoad = false;
    let scrollCounter = 0;
    let isShowedBestPagesChart = true;
    let isShowedSelectedPagesChart = true;
    let chart;
    let chart2;

    window.onbeforeunload = function () {
        localStorage.removeItem('semalt_seo_selected_se');
        localStorage.removeItem('semalt_bp_selected_pages');
        localStorage.removeItem('semalt_bp_offset');
        localStorage.removeItem('semalt_bp_top_filter');
        localStorage.removeItem('semalt_bp_filter_url');
        localStorage.removeItem('semalt_bp_selected_pages_keywords_stat_chart_scale');
        localStorage.removeItem('semalt_bp_pos_filter');
    };

    $(document).ready(function () {
        $('#semalt-seo-header-edit-domain-btn').click(function() {
            $('.semalt-seo-header-current-domain-block').hide();
            $('.semalt-seo-header-edit-domain-block').show();
        });
        $('#semalt-seo-header-cancel-domain-changing-btn').click(function() {
            $('.semalt-seo-header-current-domain-block').show();
            $('.semalt-seo-header-edit-domain-block').hide();
        });
        $('#semalt-seo-header-save-new-domain-btn').click(function() {
            if ($('#semalt-seo-header-edit-domain-input').val().length > 0) {
                if (localStorage.getItem('semalt_current_domain')) {
                    localStorage.removeItem('semalt_current_domain');
                }
                localStorage.setItem('semalt_current_domain', $('#semalt-seo-header-edit-domain-input').val());
                domain = localStorage.getItem('semalt_current_domain');
                $('#semalt-seo-header-current-domain').text(domain);
                get_se_list();
            } else {
                alert('Enter your domain to input field');
                return;
            }
            $('.semalt-seo-header-current-domain-block').show();
            $('.semalt-seo-header-edit-domain-block').hide();
        });

        if (localStorage.getItem('semalt_current_domain')) {
            domain = localStorage.getItem('semalt_current_domain');
        } else {
            domain = window.location.hostname;
        }
        $('#semalt-seo-header-current-domain').text(domain);

        enablePreloaderBestPagesChart();

        get_se_list();

        $("#se-select-apply-btn").click(function () {
            let selected_se = $('#search-engine').children('option:selected').val();
            if (!selected_se) {
                return false;
            }
            localStorage.setItem('semalt_seo_selected_se', selected_se);
            remove_all_in_tbody();
            setTimeout(function () {
                get_dynamics_data('update');
                get_best_pages_on_top();
            }, 500);
        });

        $('#dynamics-scale-filter .scale-tab-item').click(function () {
            if ( !$(this).hasClass('active')) {
                $('#dynamics-scale-filter .scale-tab-item').removeClass('active');
                $(this).addClass('active');
                $('#difference-top-scale-filter .scale-tab-item').toggleClass('active');
                let scale = $(this).text().toLowerCase();
                localStorage.setItem('semalt_seo_best_pages_chart_scale', scale);
                get_dynamics_data('update');
            }
        });

        $('#difference-top-scale-filter .scale-tab-item').click(function () {
            if ( !$(this).hasClass('active') ) {
                $('#difference-top-scale-filter .scale-tab-item').removeClass('active');
                $(this).addClass('active');
                $('#dynamics-scale-filter .scale-tab-item').toggleClass('active');
                let scale = $(this).text().toLowerCase();
                localStorage.setItem('semalt_seo_best_pages_chart_scale', scale);
                get_dynamics_data('update');
            }
        });

        $('#bp-difference-summary-btn.btn').click(function() {
            if ( !$(this).hasClass('active') ) {
                $('.chart-filter-block .btn').removeClass('active');
                $(this).addClass('active');
                $('.top-list').css('opacity', '1');
            }
        });

        $('#bp-difference-diagram-btn.btn').click(function() {
            if ( !$(this).hasClass('active') ) {
                $('.chart-filter-block .btn').removeClass('active');
                $(this).addClass('active');

                $('.top-list').css('opacity', '.1');
            }
        });

        /* Competitors in Google TOP - Date range fitler */
        var start = moment().subtract(6, 'days');
        var end = moment();

        function cb(start, end) {
            $('#best-pages-daterange-inner span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        $('#best-pages-daterange-inner').daterangepicker({
            alwaysShowCalendars: true,
            startDate: start,
            endDate: end,
            minDate: '10/24/2017',
            maxDate: moment(),
            showDropdowns: true,
            autoApply: false,
            autoUpdateInput: false,
            expanded: true,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, cb);
        cb(start, end);

        $('#daterange-btn').on('apply.daterangepicker', function(ev, picker) {
            $('.calendar').hide();
        });
        $('.ranges ul li').on("click",function() {
            $('.calendar').show();
        });

        $('#best-pages-daterange-inner').on('apply.daterangepicker', function(ev, picker) {
            localStorage.removeItem('semalt_bp_offset');
            scrollCounter = 0;
            startDate = picker.startDate.format('YYYY-MM-DD');
            endDate = picker.endDate.format('YYYY-MM-DD');
            remove_all_in_tbody();
            setTimeout(function () {
                get_best_pages_on_top();
            }, 500);
        });
        /* END: Competitors in Google TOP - Date range filter*/

        /* Pages on TOP Select */
        $('#best-pages-filter-select-top-count').change(function () {
            let selected = $(this).find(':selected').val();
            localStorage.removeItem('semalt_bp_offset');
            localStorage.setItem('semalt_bp_top_filter', selected);
            remove_all_in_tbody();
            scrollCounter = 0;
            setTimeout(function() {
                get_best_pages_on_top();
            }, 500);
        });
        /* END: Pages on TOP Select */

        /* Pages on TOP - URL filter */
        $('#bp-url-filter-input').focus(function () {
            $('#bp-url-filter-block').show();
        });
        $('#bp-url-filter-input').keyup(function() {
            if ($(this).val().length > 0) {
                if ($('#bp-filter-url-apply-btn').hasClass('disallow')) {
                    $('#bp-filter-url-apply-btn').removeClass('disallow');
                }
            } else {
                if (!$('#bp-filter-url-apply-btn').hasClass('disallow')) {
                    $('#bp-filter-url-apply-btn').addClass('disallow');
                }
            }
        });

        $(document).on('click', function (e) {
            if ($(e.target).closest("#bp-url-filter-wrapper").length === 0) {
                $("#bp-url-filter-block").hide();
            }
        });

        $('#bp-filter-url-apply-btn').click(function() {
            if ($('#bp-url-filter-input').val().length > 0) {
                let inputKeyword = $('#bp-url-filter-input').val();
                localStorage.setItem('semalt_bp_filter_url', inputKeyword);
                localStorage.removeItem('semalt_bp_offset');
                remove_all_in_tbody();
                get_best_pages_on_top();
                $("#bp-url-filter-block").hide();
            }
        });

        $('#bp-filter-url-reset-btn').click(function() {
            localStorage.removeItem('semalt_bp_filter_url');
            localStorage.removeItem('semalt_bp_offset');
            $('#bp-url-filter-input').val('');
            setTimeout(function () {
                remove_all_in_tbody();
                get_best_pages_on_top();
            }, 500);
            $("#bp-url-filter-block").hide();
        });
        /* END: Pages on TOP - URL filter */

        /* Best Pages, Selected pages dynamics - scale filter */
        $('.best-pages-keywords-stat-filter .scale-tab-item').click(function () {
            if ( !$(this).hasClass('active') ) {
                enablePreloaderSelectedPagesChart();
                $('.best-pages-keywords-stat-filter .scale-tab-item').removeClass('active');
                $(this).addClass('active');
                let scale = $(this).text().toLowerCase();
                localStorage.setItem('semalt_bp_selected_pages_keywords_stat_chart_scale', scale);
                setTimeout(function () {
                    get_selected_pages_dynamics_data();
                }, 500);
            }
        });
        /* END: Best Pages, Selected pages dynamics - scale filter */

        /* Set max selected checkbox in table */
        $(document).on('change', '.checkbox-tbl', function() {
            let limit = 5;
            let changed_page = $(this).val();
            if( $('.checkbox-tbl:checked').length > limit) {
                alert('You can select a maximum of 5 pages.\nPlease uncheck some URLs to add another pages to the comparison.');
                this.checked = false;
                return;
            }

            if ($(this).prop('checked') == true) {
                let selected_pages = JSON.parse(localStorage.getItem('semalt_bp_selected_pages'));
                let hash;
                let params = {
                    url: 'https://semalt.net/api/v1/serp/set/hash/',
                    type: 'POST',
                    data: { value: changed_page }
                };
                // on preloader
                enablePreloaderSelectedPagesChart();

                setTimeout(function(){
                    $.ajax({
                        url: params.url,
                        type: params.type,
                        data: params.data,
                        dataType: "json",
                        async: true,
                        success: function(resp) {
                            if (resp.result) {
                                hash = resp.result;
                                selected_pages.push({ key: hash, value: changed_page });

                                selected_pages = JSON.stringify(selected_pages);
                                localStorage.removeItem('semalt_bp_selected_pages');
                                localStorage.setItem('semalt_bp_selected_pages', selected_pages);
                            }
                            get_selected_pages_dynamics_data();
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            // alert(xhr.status);
                            // alert(thrownError);
                        }
                    });
                }, 500);
            } else {
                let selected_pages = JSON.parse(localStorage.getItem('semalt_bp_selected_pages'));
                let unchecked_key;
                selected_pages.map(function(item, index) {
                    if (item.value == changed_page) {
                        unchecked_key = index;
                    }
                });
                selected_pages.splice(unchecked_key, 1);
                selected_pages = JSON.stringify(selected_pages);
                localStorage.removeItem('semalt_bp_selected_pages');
                localStorage.setItem('semalt_bp_selected_pages', selected_pages);
                // on preloader
                setTimeout(function() {
                    get_selected_pages_dynamics_data();
                }, 500);
            }
        });
        /* End: set max selected checkbox in table */

        /* Selecbox for select top count, selected pages  */
        $('#bp-dynamics-filter-select-top-for-selected-pages').change(function () {
            enablePreloaderSelectedPagesChart();
            let selected = $(this).find(':selected').val();
            localStorage.setItem('semalt_bp_dynamics_top_filter_for_selected_pages', selected);
            setTimeout(function () {
                get_selected_pages_dynamics_data();
            }, 500);
        });
        /* END: selectbox for select top count */

        /* Pages on TOP Select pos-filter */
        $('#best-pages-on-top-filter-pos').change(function () {
            $('.preloader-best-pages-table').css('display', 'block');
            let selected = $(this).find(':selected').val();
            localStorage.removeItem('semalt_bp_offset');
            localStorage.setItem('semalt_bp_pos_filter', selected);
            remove_all_in_tbody();
            setTimeout(function() {
                get_best_pages_on_top();
            }, 500);
        });
        /* END: Pages on TOP Select pos-filter */
    });

    function get_se_list() {
        let request_data = {
            date: endDate,
            site: domain,
            all: 1
        };
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/top-se/',
            type: 'GET',
            data: request_data
        };
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: false,
            beforeSend: function( xhr ){
                canBeLoaded = false;
                enablePreloaderSelectedPagesChart();
            },
            success: function(resp) {
                if (resp.error) {
                    set_msg_to_chart('#best_pages_dynamics');
                    $('.best-pages-preloader-chart').css('display', 'none');
                    clear_best_pages_difference();
                    $('.preloader-best-pages-difference-top').css('display', 'none');
                    set_msg_to_chart('#best_pages_selected_pages_chart');
                    disablePreloaderSelectedPagesChart(0);
                    remove_all_in_tbody();
                    insert_msg_into_table('#best-pages-table');
                    $('.preloader-best-pages-table').css('display', 'none');
                }
                if(resp.result.top_se.length > 0) {
                        let top_se_list = resp.result.top_se;
                        // find top se
                        let top_se_cnt = top_se_list[0].cnt;
                        let top_se_id = top_se_list[0].id;
                        $('#search-engine').children().remove();
                        $.each(top_se_list, function (key, item) {
                            // continue find top_se
                            if (item.cnt > top_se_cnt) {
                                top_se_cnt = item.cnt;
                                top_se_id = item.id;
                            }
                            $('#search-engine').append($("<option></option>")
                                .attr({value: item.id, cnt: item.cnt})
                                .text(item.domain + ' (' + item.lang + ')' + ' - ' + item.country));
                        });
                        localStorage.setItem('semalt_seo_selected_se', top_se_id);
                        get_dynamics_data();
                        get_best_pages_on_top();
                } else {
                    // set msg for - Best pages over time -
                    setTimeout(function(){
                        set_msg_to_chart('#best_pages_dynamics');
                        isShowedBestPagesChart = false;
                        // $('.best-pages-preloader-chart').css('display', 'none');
                        clear_best_pages_difference();
                        disablePreloaderBestPagesChart(0);

                        $('.preloader-best-pages-difference-top').css('display', 'none');
                        isShowedSelectedPagesChart = false;
                        set_msg_to_chart('#best_pages_selected_pages_chart');
                        disablePreloaderSelectedPagesChart(0);
                    }, 1000);
                    remove_all_in_tbody();
                    // set msg for - Pages on TOP -
                    insert_msg_into_table('#best-pages-table');
                    $('.preloader-best-pages-table').css('display', 'none');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                set_msg_to_chart('#best_pages_dynamics');
                disablePreloaderBestPagesChart(0);
                // set msg for - Difference -
                clear_best_pages_difference();
                // set msg for - Selected pages keywords stats -
                set_msg_to_chart('#best_pages_selected_pages_chart');
                disablePreloaderSelectedPagesChart(0);
                remove_all_in_tbody();
                // set msg for - Pages on TOP -
                insert_msg_into_table('#best-pages-table');
                $('.preloader-best-pages-table').css('display', 'none');
            }
        });
    }

    function get_dynamics_data(update) {
        let request_data = {
            site: domain,
        }
        if (localStorage.getItem('semalt_seo_selected_se')) {
            request_data.se = localStorage.getItem('semalt_seo_selected_se');
        } else {
            return false;
        }
        if (localStorage.getItem('semalt_seo_best_pages_chart_scale')) {
            request_data.scale = localStorage.getItem('semalt_seo_best_pages_chart_scale');
        } else {
            request_data.scale = 'month';
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/best-pages/dynamics/',
            type: 'GET',
            data: request_data
        };

        enablePreloaderBestPagesChart();
        $('.dynamics .no-data-found-chart').remove();
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: true,
            success: function(resp) {
                // hide preloader
                setTimeout(function() {
                    if (resp.result.series) {
                        draw_chart(resp.result.series);
                        set_difference_tops_data(resp.result.series);
                        isShowedBestPagesChart = true;
                    } else {
                        set_msg_to_chart('#dynamics-scale-filter');
                    }
                }, 500);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                isShowedBestPagesChart = false;
                clear_best_pages_difference();
                set_msg_to_chart('#dynamics-scale-filter');
                disablePreloaderBestPagesChart(0);
            }
        });
    }

    function set_difference_tops_data(series) {
        let top_keywords = [1,3,10,30,50,100];
        $.each(top_keywords, function (key, value) {
            let count = series[key].data.length;
            let current;
            let prev;
            current = series[key].data[count-1][1];
            prev = series[key].data[count-2][1];
            let avg = current - prev;
            avg = avg > 0 ? '+' + avg : avg;
            let top_kw_color = avg > 0 ? 'green bold' : ((avg == 0) ? '' : 'red bold');
            let arrow_style = avg > 0 ? 'arrow-up' : ((avg == 0) ? 'arrow-default' : 'arrow-down');
            let arrow_color = avg > 0 ? 'arrow-up-color' : ((avg == 0) ? 'arrow-default-color' : 'arrow-down-color');
            $('#semalt-keywords-count-top' + value).text(numberWithSpaces(current));
            $('#semalt-increase-count-top' + value).text(numberWithSpaces(avg));
            if (!$('#semalt-increase-count-top' + value).hasClass(top_kw_color)) {
                $('#semalt-increase-count-top' + value).removeClass().addClass(top_kw_color + ' bold');
            }
            if (!$('#semalt-arrow-style-top' + value).hasClass(arrow_style)) {
                $('#semalt-arrow-style-top' + value).removeClass().addClass(arrow_style);
            }
            if (!$('#semalt-arrow-color-top' + value).hasClass(arrow_color)) {
                $('#semalt-arrow-color-top' + value).removeClass().addClass(arrow_color);
            }
        });
        setTimeout(function() {
            $('.preloader-best-pages-difference-top').css('display', 'none');
            $('.top-list').css('opacity', '1');
        }, 500);
    }

    function clear_best_pages_difference() {
        let top_keywords = [1,3,10,30,50,100];
        $.each(top_keywords, function (key, value) {
            $('#semalt-keywords-count-top' + value).text(numberWithSpaces(0));
            $('#semalt-increase-count-top' + value).text(numberWithSpaces(0));
            if (!$('#semalt-increase-count-top' + value).hasClass('')) {
                $('#semalt-increase-count-top' + value).removeClass().addClass('bold');
            }
            if (!$('#semalt-arrow-style-top' + value).hasClass('arrow-default')) {
                $('#semalt-arrow-style-top' + value).removeClass().addClass('arrow-default');
            }
            if (!$('#semalt-arrow-color-top' + value).hasClass('arrow-default-color')) {
                $('#semalt-arrow-color-top' + value).removeClass().addClass('arrow-default-color');
            }
        });
        setTimeout(function() {
            $('.preloader-keywords-top').css('display', 'none');
            $('.top-list').css('opacity', '1');
        }, 500);
    }

    function draw_chart (data) {

        if (chart != undefined)
            chart.destroy();

        const colors = ['#B71C1C', '#0288D1', '#27A69A', '#7E4CAF', '#FF5722', '#04C38B'];

        var datasets = data.map(function(object, index) {
            let newObj = {
                backgroundColor: colors[index],
                borderColor: colors[index],
                borderCapStyle: 'butt',
                pointRadius: 1,
                pointHitRadius: 3,
                pointHoverRadius: 3,
                borderWidth: 2,
                lineTension: 0,
                fill: false,
                label: object.name,
                data: object.data.map(function(arr) {
                    let datetime = moment(arr[0]).format('YYYY-MM-DD');
                    return {
                        x: datetime,
                        y: arr[1]
                    }
                })
            }
            return newObj;
        });

        let options = {
            animation: {
                duration: 0
            },
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom',
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            tooltips: {
                mode: 'index',
                axis: 'x',
                intersect: false,
                backgroundColor: "#FEFEFE",
                titleFontColor: '#000',
                borderColor: '#CACED5',
                borderWidth: 1,
                xPadding: 25,
                yPadding: 25,
                titleMarginBottom: 10,
                position: 'nearest',
                callbacks: {
                    label: function(tooltipItem, myData) {
                        var label = myData.datasets[tooltipItem.datasetIndex].label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += numberWithSpaces(parseInt(tooltipItem.value)) + ' pages';
                        return label;
                    },
                    labelTextColor: function(tooltipItem, chart) {
                        return '#000';
                    },
                    title: function(tooltipItem, data) {
                        return 'Pages on TOP on ' + moment(tooltipItem[0].label, 'YYYY-MM-DD').format('ll');
                    }
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    gridLines: {
                        display: false,
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20,
                        maxRotation: 0
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Pages on TOP',
                        fontColor: '#A5B5CB'
                    }
                }]
            },
        };

        Chart.defaults.LineWithLine = Chart.defaults.line;
        Chart.controllers.LineWithLine = Chart.controllers.line.extend({
            draw: function(ease) {
                Chart.controllers.line.prototype.draw.call(this, ease);

                if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                    var activePoint = this.chart.tooltip._active[0],
                        ctx = this.chart.ctx,
                        x = activePoint.tooltipPosition().x,
                        topY = this.chart.scales['y-axis-0'].top,
                        bottomY = this.chart.scales['y-axis-0'].bottom;

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, topY);
                    ctx.lineTo(x, bottomY);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#EAF0F4';
                    ctx.stroke();
                    ctx.restore();
                }
            }
        });

        var ctx = document.getElementById('best_pages_dynamics_canvas').getContext('2d');
        chart = new Chart(ctx, {
            type: 'LineWithLine',
            data: {
                datasets: datasets,
            },
            options: options
        });

        setTimeout(function () {
            disablePreloaderBestPagesChart();
            isShowedBestPagesChart = true;
        }, 500);
    }

    function set_msg_to_chart(anchor) {
        let msg = '<div class="no-data-found-chart" style="text-align: center;"><h2>No relevant data found.</h2><p>There seems to be no relevant data for your request.</p></div>';
        $(msg).insertAfter(anchor);
    }

    function get_selected_pages_dynamics_data() {
        let keys;
        let request_data = {
            site: domain,
        }
        if (localStorage.getItem('semalt_bp_selected_pages')) {
            let json_selected_pages = localStorage.getItem('semalt_bp_selected_pages');
            let selected_pages_arr = JSON.parse(json_selected_pages);
            keys = selected_pages_arr.map(function(item) {
                return item.key;
            }).join(',');
            request_data.keys = keys;
        }
        if (localStorage.getItem('semalt_seo_selected_se')) {
            request_data.se = localStorage.getItem('semalt_seo_selected_se');
        } else {
            return false;
        }
        if (localStorage.getItem('semalt_bp_selected_pages_keywords_stat_chart_scale')) {
            request_data.scale = localStorage.getItem('semalt_bp_selected_pages_keywords_stat_chart_scale');
        } else {
            request_data.scale = 'month';
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/best-pages/keywords-dynamics/',
            type: 'POST',
            data: request_data
        };
        $('.dynamics-second .no-data-found-chart').remove();
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: true,
            beforeSend: function(xhr) {
                enablePreloaderSelectedPagesChart();
            },
            success: function(resp) {
                // hide preloader
                setTimeout(function() {
                    if (resp.result.series) {
                        isShowedSelectedPagesChart = true;

                        let selected_pages_top;
                        if (localStorage.getItem('semalt_bp_dynamics_top_filter_for_selected_pages')) {
                            selected_pages_top = 'series_' + localStorage.getItem('semalt_bp_dynamics_top_filter_for_selected_pages');
                        } else {
                            selected_pages_top = 'series_100';
                        }
                        draw_selected_pages_chart(resp.result[selected_pages_top]);
                    }
                }, 500);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                isShowedSelectedPagesChart = false;
                disablePreloaderSelectedPagesChart(0);
                set_msg_to_chart('#best_pages_selected_pages_chart');
            }
        });
    }

    function draw_selected_pages_chart(data) {

        if (chart2 != undefined)
            chart2.destroy();

        const colors = ['#B71C1C', '#0288D1', '#27A69A', '#7E4CAF', '#FF5722', '#04C38B'];

        var datasets = data.map(function(object, index) {
            let newObj = {
                backgroundColor: colors[index],
                borderColor: colors[index],
                borderCapStyle: 'butt',
                pointRadius: 1,
                pointHitRadius: 3,
                pointHoverRadius: 3,
                borderWidth: 2,
                lineTension: 0,
                fill: false,
                label: object.name,
                data: object.data.map(function(arr) {
                    let datetime = moment(arr[0]).format('YYYY-MM-DD');
                    return {
                        x: datetime,
                        y: arr[1]
                    }
                })
            }
            return newObj;
        });

        let options = {
            animation: {
                duration: 0
            },
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true,
                position: 'bottom',
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            tooltips: {
                mode: 'index',
                axis: 'x',
                intersect: false,
                backgroundColor: "#FEFEFE",
                titleFontColor: '#000',
                borderColor: '#CACED5',
                borderWidth: 1,
                xPadding: 25,
                yPadding: 25,
                titleMarginBottom: 10,
                position: 'nearest',
                callbacks: {
                    label: function(tooltipItem, myData) {
                        var label = myData.datasets[tooltipItem.datasetIndex].label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += numberWithSpaces(parseInt(tooltipItem.value)) + ' keywords';
                        return label;
                    },
                    labelTextColor: function(tooltipItem, chart2) {
                        return '#000';
                    },
                    title: function(tooltipItem, data) {

                        let topN = 100;
                        if (localStorage.getItem('semalt_bp_top_filter')) {
                            topN = localStorage.getItem('semalt_bp_top_filter');
                        }
                        return 'Keywords on TOP ' + topN + ' on ' + moment(tooltipItem[0].label, 'YYYY-MM-DD').format('ll');
                    }
                }
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'linear',
                    gridLines: {
                        display: false,
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20,
                        maxRotation: 0
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Number of Keywords',
                        fontColor: '#A5B5CB'
                    }
                }]
            },
        };

        Chart.defaults.LineWithLine = Chart.defaults.line;
        Chart.controllers.LineWithLine = Chart.controllers.line.extend({
            draw: function(ease) {
                Chart.controllers.line.prototype.draw.call(this, ease);

                if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
                    var activePoint = this.chart.tooltip._active[0],
                        ctx = this.chart.ctx,
                        x = activePoint.tooltipPosition().x,
                        topY = this.chart.scales['y-axis-0'].top,
                        bottomY = this.chart.scales['y-axis-0'].bottom;

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, topY);
                    ctx.lineTo(x, bottomY);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#EAF0F4';
                    ctx.stroke();
                    ctx.restore();
                }
            }
        });

        var ctx = document.getElementById('best_pages_selected_pages_chart_canvas').getContext('2d');
        chart2 = new Chart(ctx, {
            type: 'LineWithLine',
            data: {
                datasets: datasets,
            },
            options: options
        });

        setTimeout(function () {
            disablePreloaderSelectedPagesChart();
        }, 500);
    }

    function get_best_pages_on_top() {
        let request_data = {
            site: domain,
            size: 40,
            offset: 0,
            range: startDate + '_' + endDate,
            mode: 'range'
        }
        if (startDate === endDate) {
            request_data.sort_type = '-pos0';
        } else {
            request_data.sort_type = '-pos1';
        }
        if (localStorage.getItem('semalt_seo_selected_se')) {
            request_data.se = localStorage.getItem('semalt_seo_selected_se');
        } else {
            return false;
        }
        if (localStorage.getItem('semalt_bp_pos_filter')) {
            request_data.pos_filter = localStorage.getItem('semalt_bp_pos_filter');
        } else {
            request_data.pos_filter = 'all';
        }
        if (localStorage.getItem('semalt_bp_top_filter')) {
            request_data.top_filter = localStorage.getItem(('semalt_bp_top_filter'));
        } else {
            request_data.top_filter = 100;
        }
        if (localStorage.getItem('semalt_bp_filter_url')) {
            request_data.page_filter_type = 'match';
            request_data.page_filter = localStorage.getItem('semalt_bp_filter_url');
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/best-pages/list/',
            type: 'GET',
            data: request_data
        };
        remove_all_in_tbody();
        $('.no-data-found').remove();
        $('.no-data-found-chart').remove();
        $('.preloader-best-pages-table').css('display', 'block');
        // Enable preloader for "selected pages" dynamic
        enablePreloaderSelectedPagesChart();
        scrollCounter = 0;
        allowScrollLoad = false;
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: true,
            success: function(resp) {
                // hide preloader
                setTimeout(function() {
                    if (resp.result && resp.result.total > 0) {
                        let json_selected_pages = JSON.stringify(resp.result.selected_pages);
                        localStorage.setItem('semalt_bp_selected_pages', json_selected_pages);
                        set_total_count_of_websites_in_table_head(resp.result.total);
                        insert_semalt_best_pages_into_table(resp.result.pages);
                        get_selected_pages_dynamics_data();
                    } else {
                        set_total_count_of_websites_in_table_head(0);
                        insert_msg_into_table('#best-pages-table');
                        $('.preloader-best-pages-table').css('display', 'none');
                        set_msg_to_chart('#best_pages_selected_pages_chart');
                        disablePreloaderSelectedPagesChart(0);
                    }
                    scrollCounter = 0;
                    allowScrollLoad = true;
                }, 500);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $('.preloader-best-pages-table').css('display', 'none');
                set_msg_to_chart('#best_pages_selected_pages_chart');
                disablePreloaderSelectedPagesChart(0);
                insert_msg_into_table('#best-pages-table');
            }
        });
    }

    function remove_all_in_tbody() {
        $("#best-pages-table tbody").find("tr:gt(0)").remove();
    }

    function set_total_count_of_websites_in_table_head(count) {
        $("#totalCount").text('Pages (' + count + ')');
        $("#totalCount").attr('data-attr', count);
    }

    function insert_msg_into_table (anchor) {
        $('.no-data-found').remove();
        let msg = '<div class="no-data-found"><h2>No relevant data found.</h2><p>There seems to be no relevant data for your request.</p></div>';
        $(msg).insertAfter(anchor);
    }

    function insert_semalt_best_pages_into_table(pages, lastId) {
        $('.no-data-found').remove();
        // set current date in thead
        if (startDate === endDate) {
            $('.bp-end-date').text(moment(endDate, 'YYYY-MM-DD').format('MMM D'));
            $('.bp-start-date').hide();
        } else {
            $('.bp-start-date').show();
            $('.bp-start-date').text(moment(startDate, 'YYYY-MM-DD').format('MMM D'));
            $('.bp-end-date').text(moment(endDate, 'YYYY-MM-DD').format('MMM D'));
        }
        let selected_pages;
        if (localStorage.getItem('semalt_bp_selected_pages')) {
            let json_selected_pages = localStorage.getItem('semalt_bp_selected_pages');
            let selected_pages_arr = JSON.parse(json_selected_pages);
            selected_pages = selected_pages_arr.map(function(item) {
                return item.value;
            });
        }
        let table = $('#best-pages-table').children('tbody');
        let newIdVal;
        if (!lastId) {
            lastId = 0;
        }
        for (let i = 0; i <= pages.length - 1; i++) {
            newIdVal = parseInt(lastId) + i + 1;
            let page;
            let ckeckboxValue;
            if (!pages[i].page) {
                page = domain;
                ckeckboxValue = domain;
            } else {
                page = '/' + pages[i].page;
                ckeckboxValue = pages[i].page;
            }
            let tdId = '<td class="id center">' + newIdVal + '.</td>';
            let isChecked = '';
            if ((selected_pages.indexOf(pages[i].page) !== -1) || selected_pages.indexOf(page) !== -1) {
                isChecked = 'checked';
            }
            let checkBox = '<input class="checkbox-tbl" ' + isChecked + ' type="checkbox" value="' + ckeckboxValue + '">';
            let tdWebsite = '<td> ' + checkBox + '<a href="http://' + domain + '/' +pages[i].page + '" target="_blank">' + page + '</a></td>';
            let tdPos1 = '<td class="center">' + pages[i].data[0].count + '</td>';
            let tdPos2;
            let appendStr;
            let sup;
            if (startDate != endDate) {
                sup = pages[i].data[1].count - pages[i].data[0].count;
            } else {
                sup = pages[i].data[0].count;
            }
            let sup_color;
            if (sup > 0) { sup_color = 'green bold'; } else if ( sup == 0 ) { sup_color = ''; } else { sup_color = 'red bold'; }
            if (sup > 0) { sup = '+' + sup; } else if ( sup == 0 ) { sup = ''; }
            if (startDate === endDate) {
                appendStr = '<tr>' + tdId + tdWebsite + tdPos1 + '</tr>';
            } else {
                tdPos2 = '<td class="center">' + pages[i].data[1].count + '<sup class="' + sup_color + '">' + sup + '</sup></td>';
                appendStr = '<tr>' + tdId + tdWebsite + tdPos1 + tdPos2 + '</tr>';
            }
            table.append(appendStr);
        }
        $('.preloader-best-pages-table').css('display', 'none');
    }

    function numberWithSpaces(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function enablePreloaderBestPagesChart() {
        let top = 70;
        let top2 = 255;
        if (isShowedBestPagesChart) { top = 270; top2 = 670; }

        $('#best_pages_dynamics').css('opacity', '.1');
        $('.best-pages-difference .top-list').css('opacity', '.1');

        $('.best-pages-preloader-chart').css({"position":"absolute","top":top+"px","margin":"0px 48%","display":"block"});
        $('.preloader-best-pages-difference-top').css({"position":"absolute","top":top2+"px","margin":"0px 48%","display":"block"});
    }
    function disablePreloaderBestPagesChart(height) {
        let h = 400;
        if (height >= 0) {
            h = height;
        }
        $('#best_pages_dynamics').css({'height':h+'px','opacity':'1'});
        $('.best-pages-preloader-chart').css('display','none');

        $('.best-pages-difference .top-list').css('opacity', '1');
        $('.preloader-best-pages-difference-top').css('display', 'none');
    }

    // section 3
    function enablePreloaderSelectedPagesChart() {
        $('#best_pages_selected_pages_chart').css('opacity', '.1');
        let top = 60;
        if (isShowedSelectedPagesChart) { top = 240; }
        $('.best-pages-selected-pages-preloader-chart').css({"position":"absolute","top":top+"px","margin":"0px 48%","display":"block"});
    }
    function disablePreloaderSelectedPagesChart(height) {
        let h = 400;
        if (height >= 0) {
            h = height;
        }
        $('#best_pages_selected_pages_chart').css({'height':h+'px','opacity':'1'});
        $('.best-pages-selected-pages-preloader-chart').css("display","none");
    }

    $(window).scroll(function () {
        scrollCounter++;
        if($(window).scrollTop() == $(document).height() - $(window).height()) {
            if (scrollCounter < 5) { return; }
            if (allowScrollLoad == true) {
                $('.preloader-best-pages-table').css('display', 'true');
                let lastId = $('#best-pages-table tbody tr:last-child td:first-child').text();
                let kwTotalCount = $('#totalCount').attr('data-attr');
                if (parseInt(lastId) === parseInt(kwTotalCount)) {
                    return;
                }
                let defaultOffset = 40;
                let size = 40;
                let request_data = {
                    site: domain,
                    size: size,
                    offset: 0,
                    range: startDate + '_' + endDate,
                    mode: 'range'
                }
                if (startDate === endDate) {
                    request_data.sort_type = '-pos0';
                } else {
                    request_data.sort_type = '-pos1';
                }
                if (localStorage.getItem('semalt_bp_pos_filter')) {
                    request_data.pos_filter = localStorage.getItem('semalt_bp_pos_filter');
                } else {
                    request_data.pos_filter = 'all';
                }
                if (localStorage.getItem('semalt_bp_offset')) {
                    request_data.offset = localStorage.getItem('semalt_bp_offset');
                } else {
                    localStorage.setItem('semalt_bp_offset', defaultOffset);
                    request_data.offset = localStorage.getItem('semalt_bp_offset');
                }
                if (localStorage.getItem('semalt_seo_selected_se')) {
                    request_data.se = localStorage.getItem('semalt_seo_selected_se');
                } else {
                    return false;
                }
                if (localStorage.getItem('semalt_bp_top_filter')) {
                    request_data.top_filter = localStorage.getItem(('semalt_bp_top_filter'));
                } else {
                    request_data.top_filter = 100;
                }
                if (localStorage.getItem('semalt_bp_filter_url')) {
                    request_data.page_filter_type = 'match';
                    request_data.page_filter = localStorage.getItem('semalt_bp_filter_url');
                }
                let params = {
                    url: 'https://semalt.net/api/v1/serp/get/best-pages/list/',
                    type: 'GET',
                    data: request_data
                };
                // show preloader
                $('.preloader-best-pages-table').css('display', 'block');
                allowScrollLoad = false;
                setTimeout(function() {
                    $.ajax({
                        url: params.url,
                        type: params.type,
                        data: params.data,
                        dataType: "json",
                        async: true,
                        success: function(resp) {
                            if (resp.result != null && resp.result.total > 0) {
                                allowScrollLoad = true;

                                insert_semalt_best_pages_into_table(resp.result.pages, lastId);

                                if (resp.result.pages.length == size) {
                                    let offset = localStorage.getItem('semalt_bp_offset');
                                    let newOffset = parseInt(offset) + parseInt(size);
                                    localStorage.setItem('semalt_bp_offset', newOffset );
                                }
                            }
                            $('.preloader-best-pages-table').css('display', 'none');
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            $('.preloader-best-pages-table').css('display', 'none');
                        }
                    });
                }, 500);
            }
        }
    });

})( jQuery );
