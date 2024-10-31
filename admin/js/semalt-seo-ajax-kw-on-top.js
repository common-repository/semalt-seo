(function ( $) {

    let domain;
    let startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');
    let canBeLoaded = true;
    let allowScrollLoad = false;
    let scrollCounter = 0;
    let chart;

    window.onbeforeunload = function () {
        localStorage.removeItem('semalt_kw_offset');
        localStorage.removeItem('semalt_seo_selected_se');
        localStorage.removeItem('semalt_rankings_top_filter');
        localStorage.removeItem('semalt_kw_on_top_rankings_filter_keyword');
        localStorage.removeItem('semalt_kw_on_top_rankings_filter_url');
    };

    $(document).ready(function() {
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
        get_se_list();
        /* Dynamics - scale filter */
        $('#dynamics-scale-filter .scale-tab-item').click(function () {

            if ( !$(this).hasClass('active') ) {
                $('#dynamics-scale-filter .scale-tab-item').removeClass('active');
                $(this).addClass('active');
                let scale = $(this).text().toLowerCase();
                let params = {
                    'scale': scale
                }
                get_charts_data(scale);
            }
        });
        /* END: Dynamics - scale filter */

        /* Keywords on TOP - scale filter */
        $('#keywords-top-scale-filter .scale-tab-item').click(function () {
            if ( !$(this).hasClass('active') ) {
                $('#keywords-top-scale-filter .scale-tab-item').removeClass('active');
                $(this).addClass('active');
                let scale = $(this).text().toLowerCase();
                let params = {
                    'scale': scale
                }
                get_keywords_on_top(scale);
            }
        });
        /* END: Keywords on TOP - scale filter */

        /* Rankings - Get report Modal */
        let modal = document.getElementById('rankings-report-modal');
        $('#rankings-get-report-btn').click(function () {
            modal.style.display = 'block';
            $('html, body').css('overflow', 'hidden');
        });
        $('#rankings-report-modal .close').click(function () {
            modal.style.display = 'none';
            $('html, body').css('overflow', 'auto');
        });
        $('.report-cancel-btn').click(function () {
            modal.style.display = 'none';
            $('html, body').css('overflow', 'auto');
        });
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
                $('html, body').css('overflow', 'auto');
            }
        }
        // change active class
        $('.format-pdf-btn').click(function () {
            if ( !$('.format-pdf-btn').hasClass('active') ) {
                $(this).addClass('active');
                $('.format-csv-btn').removeClass('active');
            }
        });
        $('.format-csv-btn').click(function () {
            if ( !$('.format-csv-btn').hasClass('active') ) {
                $(this).addClass('active');
                $('.format-pdf-btn').removeClass('active');
            }
        });
        // set default settings on open modal
        $('#rankings-get-report-btn').click(function () {
            // set default format - PDF
            if ( !$('.format-pdf-btn').hasClass('active') ) {
                $('.format-pdf-btn').addClass('active');
                $('.format-csv-btn').removeClass('active');
            }
            // set default - Full Report
            if ( $('#rankings-report-radio-full').is(':checked') === false ) {
                $('#rankings-report-radio-full').prop('checked', true);
                $('#rankings-report-radio-keywords').prop('checked', false);
            }
            // change default format on change full report to keywords and remove opacity
            $('#rankings-report-radio-keywords').click(function () {
                $('#rankings-report-number-of-keywords').prop("disabled", false);
                $('#rankings-report-number-of-keywords').css('opacity', 1);
            });
            $('.rankings-report-radio-full-report-block').click(function () {
                $('#rankings-report-number-of-keywords').prop("disabled", true);
                $('#rankings-report-number-of-keywords').css('opacity', 0.5);
            });
            if ( $('#rankings-report-radio-full').is(':checked') != false ) {
                $('#rankings-report-number-of-keywords').prop("disabled", true);
                $('#rankings-report-number-of-keywords').css('opacity', 0.5);
            }
            // Action on click to download button
            $('.report-download-btn').click(function () {
                alert('download');
            });
        });
        /* END: Rankings - Get report Modal */

        /* Rankigs - Date range fitler */
        var start = moment().subtract(1, 'days');
        var end = moment();

        function cb(start, end) {
            $('#keywords-daterange-inner span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }
        $('#keywords-daterange-inner').daterangepicker({
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
        $('#keywords-daterange-inner').on('apply.daterangepicker', function(ev, picker) {
            if (!localStorage.getItem('semalt_seo_selected_se')) { return; }
            localStorage.removeItem('semalt_kw_offset');
            $('.preloader-keywords-table').css('display', 'block');
            startDate = picker.startDate.format('YYYY-MM-DD');
            endDate = picker.endDate.format('YYYY-MM-DD');
            remove_all_in_tbody();
            setTimeout(function () {
                get_rankings_data();
            }, 500);
        });
        /* END: Rankings - Date range filter*/

        /* Rankings - keywords filter */
        $('#rankings-keyword-filter-input').focus(function () {
            $('#rankings-keyword-filter-block').show();
        });

        $('#rankings-keyword-filter-input').keyup(function() {
            if ($(this).val().length > 0) {
                if ($('#rankings-filter-kw-apply-btn').hasClass('disallow')) {
                    $('#rankings-filter-kw-apply-btn').removeClass('disallow');
                }
            } else {
                if (!$('#rankings-filter-kw-apply-btn').hasClass('disallow')) {
                    $('#rankings-filter-kw-apply-btn').addClass('disallow');
                }
            }
        });

        $(document).on('click', function (e) {
            if ($(e.target).closest("#rankings-keyword-filter-wrapper").length === 0) {
                $("#rankings-keyword-filter-block").hide();
            }
        });

        $('#rankings-filter-kw-apply-btn').click(function() {
            if ($('#rankings-keyword-filter-input').val().length > 0) {
                let inputKeyword = $('#rankings-keyword-filter-input').val();
                localStorage.setItem('semalt_kw_on_top_rankings_filter_keyword', inputKeyword);
                localStorage.removeItem('semalt_kw_offset');
                remove_all_in_tbody();
                get_rankings_data();
                $("#rankings-keyword-filter-block").hide();
            }
        });

        $('#rankings-filter-kw-reset-btn').click(function() {
            localStorage.removeItem('semalt_kw_on_top_rankings_filter_keyword');
            localStorage.removeItem('semalt_kw_offset');
            $('#rankings-keyword-filter-input').val('');
            remove_all_in_tbody();
            get_rankings_data();
            $("#rankings-keyword-filter-block").hide();
        });
        /* END: Rankings - keywords filter */

        /* Rankings - URL filter */
        $('#rankings-url-filter-input').focus(function () {
            $('#rankings-url-filter-block').show();
        });

        $('#rankings-url-filter-input').keyup(function() {
            if ($(this).val().length > 0) {
                if ($('#rankings-filter-url-apply-btn').hasClass('disallow')) {
                    $('#rankings-filter-url-apply-btn').removeClass('disallow');
                }
            } else {
                if (!$('#rankings-filter-url-apply-btn').hasClass('disallow')) {
                    $('#rankings-filter-url-apply-btn').addClass('disallow');
                }
            }
        });

        $(document).on('click', function (e) {
            if ($(e.target).closest("#rankings-url-filter-wrapper").length === 0) {
                $("#rankings-url-filter-block").hide();
            }
        });

        $('#rankings-filter-url-apply-btn').click(function() {
            if ($('#rankings-url-filter-input').val().length > 0) {
                let inputKeyword = $('#rankings-url-filter-input').val();
                localStorage.setItem('semalt_kw_on_top_rankings_filter_url', inputKeyword);
                localStorage.removeItem('semalt_kw_offset');
                remove_all_in_tbody();
                setTimeout(function() {
                    get_rankings_data();
                }, 500);
                $("#rankings-url-filter-block").hide();
            }
        });

        $('#rankings-filter-url-reset-btn').click(function() {
            localStorage.removeItem('semalt_kw_on_top_rankings_filter_url');
            localStorage.removeItem('semalt_kw_offset');
            $('#rankings-url-filter-input').val('');
            remove_all_in_tbody();
            setTimeout(function() {
                get_rankings_data();
            }, 500);
            $("#rankings-url-filter-block").hide();
        });
        /* END: Rankings - URL filter */

        /* Rankings - Select Top keywords count */
        $('#keyword-filter-select-top-count').change(function () {
            let selected = $(this).find(':selected').val();
            localStorage.removeItem('semalt_kw_offset');
            localStorage.setItem('semalt_rankings_top_filter', selected);
            remove_all_in_tbody();
            scrollCounter = 0;
            setTimeout(function () {
                get_rankings_data(selected);
            }, 500);
        });
        /* END: Rankings - Select Top keywords count */

        /* SE SELECT BUTTON */
        $("#se-select-apply-btn").click(function () {
            $('.scale-tab-item').removeClass('active');
            $('#dynamics-scale-filter .scale-tab-item:first').addClass('active');
            $('#keywords-top-scale-filter .scale-tab-item:first').addClass('active');
            let selected_se = $('#search-engine').children('option:selected').val();
            if (selected_se) {
                localStorage.setItem('semalt_seo_selected_se', selected_se);
            } else { return; }
            $('.preloader-keywords-table').css('display', 'block');
            let lastId = $('#rankings-table tbody tr:last-child td:first-child').text();
            localStorage.removeItem('semalt_kw_offset');
            setTimeout(function () {
                get_rankings_data();
                $('#keywords_dynamics').css('height', '400px');
                get_charts_data();
                // Update Keywords on TOP
                $('.top-list').css('opacity', '.1');
                remove_all_in_tbody();
                get_keywords_on_top();
            }, 500);
        });
        /* END: SE SELECT BUTTON */
    });

    function get_se_list() {
        let request_data = {
            date: endDate,
            site: domain,
            all: 1
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/top-se/',
            type: 'GET',
            data: request_data,
        }
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: false,
            success: function(resp) {
                if (resp.error) {
                    set_msg_to_chart();
                    clear_keywords_on_top();
                    $('.preloader-keywords-table').css('display', 'none');
                    remove_all_in_tbody();
                    insert_msg_into_table();
                }
                if(resp.result.top_se.length > 0) {
                    let top_se_list = resp.result.top_se;
                    // find top se
                    let top_se_cnt = top_se_list[0].cnt;
                    let top_se_id = top_se_list[0].id;
                    $('#search-engine').children().remove();
                    $.each(top_se_list, function (key, item) {
                        if (item.cnt > top_se_cnt) {
                            top_se_cnt = item.cnt;
                            top_se_id = item.id;
                        }
                        $('#search-engine').append($("<option></option>")
                            .attr({value: item.id, cnt: item.cnt})
                            .text(item.domain + ' (' + item.lang + ')' + ' - ' + item.country ));
                    });
                    if (top_se_id) {
                        localStorage.setItem('semalt_seo_selected_se', top_se_id);
                        get_charts_data();
                        get_keywords_on_top();
                        get_rankings_data();
                    }
                } else {
                    set_msg_to_chart();
                    clear_keywords_on_top();
                    $('.preloader-keywords-table').css('display', 'none');
                    // Clear rankings and set msg
                    remove_all_in_tbody();
                    insert_msg_into_table();
                }
            },
        });
    }

    function get_charts_data(scale) {
        let request_data = {
            site: domain,
            mode: 'range'
        };
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/chart/',
            type: 'GET',
            data: request_data,
        };
        if (!localStorage.getItem('semalt_seo_selected_se')) { return; }
        let selected_se = localStorage.getItem('semalt_seo_selected_se');
        if (selected_se) { request_data.se = selected_se; }
        if (scale) { request_data.scale = scale; }
        $('.no-data-found').remove();

        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            beforeSend: function( xhr ){
                $('#keywords_dynamics').css('opacity', '.1');
                $('.preloader-chart').css({"position":"absolute","top":"240px","margin":"0px 48%","display":"block"});
            },
            success: function(resp) {
                if (resp.result.series) {
                    draw_chart(resp.result.series);
                } else {
                    $('.preloader-chart').css('display', 'none');
                    $('#keywords_dynamics').css('opacity', '1');
                    set_msg_to_chart();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $('.preloader-chart').css('display', 'none');
                $('#keywords_dynamics').css('opacity', '1');
                set_msg_to_chart();
            }
        });
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
                        label += numberWithSpaces(parseInt(tooltipItem.value)) + ' keywords';
                        return label;
                    },
                    labelTextColor: function(tooltipItem, chart) {
                        return '#000';
                    },
                    title: function(tooltipItem, data) {
                        return 'Keywords in TOP on ' + moment(tooltipItem[0].label, 'YYYY-MM-DD').format('ll');
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
                        labelString: 'Number of keywords',
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

        var ctx = document.getElementById('keywords_dynamics_canvas').getContext('2d');
        chart = new Chart(ctx, {
            type: 'LineWithLine',
            data: {
                datasets: datasets,
            },
            options: options
        });

        setTimeout(function () {
            $('.preloader-chart').css('display', 'none');
            $('#keywords_dynamics').css({'opacity':'1','height':'400px'});
        }, 500);
    }

    function get_keywords_on_top(scale) {
        let request_data = {
            site: domain,
            mode: 'range'
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/chart/',
            type: 'GET',
            data: request_data
        };
        if (!localStorage.getItem('semalt_seo_selected_se')) { return; }
        let selected_se = localStorage.getItem('semalt_seo_selected_se');
        if (selected_se) { request_data.se = selected_se; }
        if (scale) { request_data.scale = scale; }
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            beforeSend: function( xhr ){
                $('.top-list').css('opacity', '.1');
                $('.preloader-keywords-top').css({"position":"absolute","top":"670px","margin":"0px 48%","display":"block"});
            },
            success: function(resp) {
                if (resp.result.series) {
                    update_keywords_on_top(resp.result.series, scale);
                } else {
                    $('.preloader-keywords-top').css('display', 'none');
                    $('.top-list').css('opacity', '1');
                    clear_keywords_on_top();
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $('.preloader-keywords-top').css('display', 'none');
                $('.top-list').css('opacity', '1');
                clear_keywords_on_top();
            }
        });
    }

    function update_keywords_on_top(series, scale) {
        let top_keywords = [1,3,10,30,50,100];
        $.each(top_keywords, function (key, value) {
            let count = series[key].data.length;
            let current;
            let prev;
            if (scale == undefined || scale == 'default') {
                current = series[key].data[count-1][1];
                prev = series[key].data[0][1];
            } else {
                current = series[key].data[count-1][1];
                prev = series[key].data[count-2][1];
            }
            let avg = current - prev;
            avg = avg > 0 ? '+' + avg : avg;
            let top_kw_color = avg > 0 ? 'green bold' : ((avg == 0) ? '' : 'red bold');
            let arrow_style = avg > 0 ? 'arrow-up' : ((avg == 0) ? 'arrow-default' : 'arrow-down');
            let arrow_color = avg > 0 ? 'arrow-up-color' : ((avg == 0) ? 'arrow-default-color' : 'arrow-down-color');
            let title = 'TOP ' + value;
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
            $('.preloader-keywords-top').css('display', 'none');
            $('.top-list').css('opacity', '1');
        }, 500);
    }

    function clear_keywords_on_top() {
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

    function get_rankings_data(top_filter = '') {
        let request_data = {
            site: domain,
            size: 40,
            offset: 0,
            sort_type: '-pos2',
            uniq: 0,
            // mode: 'range',
            range: startDate + '_' + endDate
        }
        if (startDate != endDate) {
            request_data.mode = 'compare';
        }
        if (!localStorage.getItem('semalt_seo_selected_se')) { return; }
        if (localStorage.getItem('semalt_seo_selected_se')) {
            request_data.se = localStorage.getItem('semalt_seo_selected_se');
        }
        if (localStorage.getItem('semalt_kw_on_top_rankings_filter_keyword')) {
            request_data.kw_filter_type = 'match';
            request_data.kw_filter = localStorage.getItem('semalt_kw_on_top_rankings_filter_keyword');
        }
        if (localStorage.getItem('semalt_kw_on_top_rankings_filter_url')) {
            request_data.page_filter_type = 'match';
            request_data.page_filter = localStorage.getItem('semalt_kw_on_top_rankings_filter_url');
        }
        if (top_filter) {
            request_data.top_filter = top_filter;
        } else if (localStorage.getItem('semalt_rankings_top_filter')) {
            request_data.top_filter = localStorage.getItem(('semalt_rankings_top_filter'));
        } else {
            request_data.top_filter = 100;
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/keywords/',
            type: 'GET',
            data: request_data
        }
        allowScrollLoad = false;
        scrollCounter = 0;
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            beforeSend: function( xhr ){
                remove_all_in_tbody();
                $('.no-data-found').remove();
                $('.preloader-keywords-table').css('display', 'block');
            },
            success: function(resp) {
                setTimeout(function() {
                    if (resp.result.total > 0) {
                        set_total_count_of_keywords_in_table_head(resp.result.total);
                        insert_semalt_kw_into_table(resp.result.rows);
                    } else {
                        set_total_count_of_keywords_in_table_head(0);
                        insert_msg_into_table();
                    }
                    $('.preloader-keywords-table').css('display', 'none');
                    scrollCounter = 0;
                    allowScrollLoad = true;
                }, 500);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $('.preloader-keywords-table').css('display', 'none');
                insert_msg_into_table();
            }
        });
    }

    function set_total_count_of_keywords_in_table_head(count) {
        $("#totalCount").text('Keywords (' + count + ')');
        $("#totalCount").attr('data-attr', count);
    }

    function remove_all_in_tbody() {
        $("#rankings-table tbody").find("tr:gt(0)").remove();
    }

    function insert_semalt_kw_into_table(keywords, lastId) {
        $('.no-data-found').remove();
        // set current date in thead
        if (startDate === endDate) {
            $('.rankings-end-date').text(moment(endDate, 'YYYY-MM-DD').format('MMM D'));
            $('.rankings-start-date').hide();
        } else {
            $('.rankings-start-date').show();
            $('.rankings-start-date').text(moment(startDate, 'YYYY-MM-DD').format('MMM D'));
            $('.rankings-end-date').text(moment(endDate, 'YYYY-MM-DD').format('MMM D'));
        }
        // end
        let table = $('#rankings-table').children('tbody');
        let newIdVal;
        let urlName;
        if (!lastId) {
            lastId = 0;
        }
        for (let i = 0; i <= keywords.length-1; i++) {
            newIdVal = parseInt(lastId) + i + 1;
            urlName = keywords[i].url == '' ? domain : '/' + keywords[i].url;
            let sup = keywords[i].pos[0] - keywords[i].pos[1];
            let sup_color;
            if (sup > 0) { sup_color = 'green bold'; } else if ( sup == 0 ) { sup_color = ''; } else { sup_color = 'red bold'; }
            if (sup > 0) { sup = '+' + sup; } else if ( sup == 0 ) { sup = ''; }
            let tdId = '<td class="id center">' + newIdVal + '.</td>';
            let tdKeyword = '<td>' + keywords[i].kw + '</td>';
            let tdGoogle = '<td class="center"><a href="https://www.google.com/search?q=' + keywords[i].kw + '&hl=all&start=0&gws_rd=cr" target="_blank"><img class="google_icon" src="https://theeasygadgets.com/wp-content/plugins/semalt-seo/admin/img/google.svg"></a></td>';
            let tdUrl = '<td><a href="http://' + domain + '/' + keywords[i].url + '" target="_blank">' + urlName + '</a></td>';
            let tdPos1 = '<td class="center">' + keywords[i].pos[0] + '</td>';
            let tdPos2;
            let tdSearches;
            let appendStr;
            if (startDate === endDate) {
                tdSearches = '<td class="center">' + keywords[i].pos[1] + '</td>';
                appendStr = '<tr>' + tdId + tdKeyword + tdGoogle + tdUrl + tdPos1 + tdSearches +'</tr>';
            } else {
                tdPos2 = '<td class="center">' + keywords[i].pos[1] + '<sup class="' + sup_color + '">' + sup + '</sup></td>';
                tdSearches = '<td class="center">' + keywords[i].pos[2] + '</td>';
                appendStr = '<tr>' + tdId + tdKeyword + tdGoogle + tdUrl + tdPos1 + tdPos2 + tdSearches +'</tr>';
            }
            table.append(appendStr);
        }
    }

    function set_msg_to_chart() {
        $('#keywords_dynamics').css('height', '0');
        $('.no-data-found').remove();
        let msg = '<div class="no-data-found"><h2>No relevant data found.</h2><p>There seems to be no relevant data for your request.</p></div>';
        $(msg).insertAfter('#keywords_dynamics');
        $('.preloader-chart').css('display', 'none');
    }

    function insert_msg_into_table () {
        let msg = '<div class="no-data-found"><h2>No relevant data found.</h2><p>There seems to be no relevant data for your request.</p></div>';
        $(msg).insertAfter('#rankings-table');
    }

    $(window).scroll(function () {
        scrollCounter++;
        if($(window).scrollTop() == $(document).height() - $(window).height()) {
            if (scrollCounter < 5) { return; }
            if (allowScrollLoad == true) {
                let lastId = $('#rankings-table tbody tr:last-child td:first-child').text();
                let kwTotalCount = $('#totalCount').attr('data-attr');
                if (parseInt(lastId) === parseInt(kwTotalCount)) { return; }
                let defaultOffset = 40;
                let size = 40;
                let request_data = {
                    site: domain,
                    size: size,
                    sort_type: '-pos2',
                    mode: 'range',
                    uniq: 0,
                    range: startDate + '_' + endDate
                }
                if (localStorage.getItem('semalt_kw_offset')) {
                    request_data.offset = localStorage.getItem('semalt_kw_offset');
                } else {
                    localStorage.setItem('semalt_kw_offset', defaultOffset);
                    request_data.offset = localStorage.getItem('semalt_kw_offset');
                }
                if (localStorage.getItem('semalt_kw_on_top_rankings_filter_keyword')) {
                    request_data.kw_filter_type = 'match';
                    request_data.kw_filter = localStorage.getItem('semalt_kw_on_top_rankings_filter_keyword');
                }
                if (!localStorage.getItem('semalt_seo_selected_se')) { return; }
                let selected_se = localStorage.getItem('semalt_seo_selected_se');
                if (selected_se) {
                    request_data.se = selected_se;
                }
                if (localStorage.getItem('semalt_rankings_top_filter')) {
                    request_data.top_filter = localStorage.getItem('semalt_rankings_top_filter');
                } else {
                    request_data.top_filter = 100;
                }
                let params = {
                    url: 'https://semalt.net/api/v1/serp/get/keywords/',
                    type: 'GET',
                    data: request_data
                }
                $('.preloader-keywords-table').css('display', 'block');
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
                                insert_semalt_kw_into_table(resp.result.rows, lastId);
                                if (resp.result.rows.length == size) {
                                    let offset = localStorage.getItem('semalt_kw_offset');
                                    let newOffset = parseInt(offset) + parseInt(size);
                                    localStorage.setItem('semalt_kw_offset', newOffset );
                                }
                            }
                            $('.preloader-keywords-table').css('display', 'none');
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            $('.preloader-keywords-table').css('display', 'none');
                        }
                    });
                }, 500);
            }
        }
    });

    function numberWithSpaces(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
})( jQuery );
