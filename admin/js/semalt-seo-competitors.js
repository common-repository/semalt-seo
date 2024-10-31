(function ( $) {
    let domain;
    let startDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    let endDate = moment().format('YYYY-MM-DD');
    let threeMonthAgoDate = moment().subtract(3, 'month').format('YYYY-MM-DD');
    let currentDate = moment().format('YYYY-MM-DD');
    let canBeLoaded = true;
    let allowScrollLoad = false;
    let scrollCounter = 0;
    let isShowedSharedKeywordsDynamics = true;
    let chart;

    window.onbeforeunload = function () {
        localStorage.removeItem('semalt_competitors_offset');
        localStorage.removeItem('semalt_seo_selected_se');
        localStorage.removeItem('semalt_competitors_top_filter');
        localStorage.removeItem('semalt_competitors_dynamics_top_filter');
        localStorage.removeItem('semalt_competitors_selected_domains');
        localStorage.removeItem('semalt_competitors_filter_domain');
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
        // set preloader for shared keywords
        $('.shared-list').css('opacity', '.1');
        $('.preloader-shared-keywords').css({"position":"absolute","top":"30px","margin":"0px 48%","display":"block"});
        get_se_list();

        /* SE SELECT BUTTON */
        $("#se-select-apply-btn").click(function () {
            let selected_se = $('#search-engine').children('option:selected').val();
            localStorage.setItem('semalt_seo_selected_se', selected_se);
            get_competitors_rank();
            // Update Shared Keywords
            $('.preloader-shared-keywords').css({"position":"absolute","top":"30px","margin":"0px 48%","display":"block"});
            $('.shared-list').css('opacity', '.1');

            enablePreloaderSharedKeywordsDinamics();

            $('.preloader-competitors-table').css('display', 'block');
            setTimeout(function() {
                get_shared_keywords();
                get_competitors_in_google_top();
            }, 500);
        });
        /* END: SE SELECT BUTTON */

        /* Competitors - Select Top keywords count */
        $('#competitors-filter-select-top-count').change(function () {
            $('.no-data-found').remove();
            $('.preloader-competitors-table').css('display', 'block');
            let selected = $(this).find(':selected').val();
            localStorage.removeItem('semalt_competitors_offset');
            localStorage.setItem('semalt_competitors_top_filter', selected);
            remove_all_in_tbody();
            scrollCounter = 0;
            setTimeout(function() {
                get_competitors_in_google_top();
            }, 500);
        });
        /* END: Competitors - Select Top keywords count */

        /* Competitors Dynamics - Select Top keywords count */
        $('#competitors-dynamics-filter-select-top-count').change(function () {
            let selected = $(this).find(':selected').val();
            localStorage.setItem('semalt_competitors_dynamics_top_filter', selected);
            get_charts_data();
        });
        /* END: Competitors Dynamics - Select Top keywords count */

        /* Competitors in Google TOP - Date range fitler */
        var start = moment().subtract(6, 'days');
        var end = moment();

        function cb(start, end) {
            $('#competitors-daterange-inner span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }

        $('#competitors-daterange-inner').daterangepicker({
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

        $('#competitors-daterange-inner').on('apply.daterangepicker', function(ev, picker) {
            $('.no-data-found').remove();
            $('.preloader-competitors-table').css('display', 'block');
            localStorage.removeItem('semalt_competitors_offset');
            scrollCounter = 0;
            startDate = picker.startDate.format('YYYY-MM-DD');
            endDate = picker.endDate.format('YYYY-MM-DD');
            remove_all_in_tbody();
            setTimeout(function () {
                get_competitors_in_google_top();
            }, 500);
        });
        /* END: Competitors in Google TOP - Date range filter*/

        /* Rankings - keywords filter */
        $('#competitors-domain-filter-input').focus(function () {
            $('#competitors-domain-filter-block').show();
        });

        $('#competitors-domain-filter-input').keyup(function() {
            if ($(this).val().length > 0) {
                if ($('#competitors-filter-domain-apply-btn').hasClass('disallow')) {
                    $('#competitors-filter-domain-apply-btn').removeClass('disallow');
                }
            } else {
                if (!$('#competitors-filter-domain-apply-btn').hasClass('disallow')) {
                    $('#competitors-filter-domain-apply-btn').addClass('disallow');
                }
            }
        });

        $(document).on('click', function (e) {
            if ($(e.target).closest("#competitors-domain-filter-wrapper").length === 0) {
                $("#competitors-domain-filter-block").hide();
            }
        });

        $('#competitors-filter-domain-apply-btn').click(function() {
            if ($('#competitors-domain-filter-input').val().length > 0) {
                let inputKeyword = $('#competitors-domain-filter-input').val();
                localStorage.setItem('semalt_competitors_filter_domain', inputKeyword);
                localStorage.removeItem('semalt_kw_offset');
                remove_all_in_tbody();
                get_competitors_in_google_top();
                $("#competitors-domain-filter-block").hide();
            }
        });

        $('#competitors-filter-domain-reset-btn').click(function() {
            $('.no-data-found').remove();
            localStorage.removeItem('semalt_competitors_filter_domain');
            localStorage.removeItem('semalt_kw_offset');
            $('#competitors-domain-filter-input').val('');
            remove_all_in_tbody();
            get_competitors_in_google_top();
            $("#competitors-domain-filter-block").hide();
        });
        /* END: Rankings - keywords filter */

        /* Set max selected checkbox in table */
        $(document).on('change', '.checkbox-tbl', function() {
            let limit = 5;
            let changed_domain = $(this).val();
            if( $('.checkbox-tbl:checked').length > limit) {
                    alert('You can select a maximum of 5 pages.\nPlease uncheck some URLs to add another pages to the comparison.');
                    this.checked = false;
                    return;
                }
            if ($(this).prop('checked') == true) {
                let selected_domains = JSON.parse(localStorage.getItem('semalt_competitors_selected_domains'));
                let hash;
                let params = {
                    url: 'https://semalt.net/api/v1/serp/set/hash/',
                    type: 'POST',
                    data: { value: changed_domain }
                };
                $.ajax({
                    url: params.url,
                    type: params.type,
                    data: params.data,
                    dataType: "json",
                    async: true,
                    success: function(resp) {
                        if (resp.result) {
                            hash = resp.result;
                            selected_domains.push({ key: hash, value: changed_domain });

                            selected_domains = JSON.stringify(selected_domains);
                            localStorage.removeItem('semalt_competitors_selected_domains');
                            localStorage.setItem('semalt_competitors_selected_domains', selected_domains);
                        }
                        get_charts_data();
                    },
                });
            } else {
                let selected_domains = JSON.parse(localStorage.getItem('semalt_competitors_selected_domains'));
                let unchecked_key;
                selected_domains.map(function(item, index) {
                    if (item.value == changed_domain) {
                        unchecked_key = index;
                    }
                });
                selected_domains.splice(unchecked_key, 1);
                selected_domains = JSON.stringify(selected_domains);
                localStorage.removeItem('semalt_competitors_selected_domains');
                localStorage.setItem('semalt_competitors_selected_domains', selected_domains);
                get_charts_data();
            }
        });
        /* End: set max selected checkbox in table */
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
            data: request_data
        }
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: false,
            beforeSend: function(xhr) {
                $('.dynamics .no-data-found').remove();
                enablePreloaderSharedKeywordsDinamics();
                $('.preloader-competitors-table').css('display', 'block');
            },
            success: function(resp) {
                if (resp.error) {
                    $('.preloader-shared-keywords').css('display', 'none');
                    $('.shared-list').css('opacity', '1');
                    insert_msg_into_table();
                    set_msg_to_chart();
                    $('.preloader-competitors-table').css('display', 'none');
                    isShowedSharedKeywordsDynamics = false;
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
                    get_competitors_rank();
                    get_shared_keywords();
                    setTimeout(function () {
                        get_competitors_in_google_top();
                    }, 500);
                } else {
                    setTimeout(function() {
                        // disable preloader for - Shared keywords -
                        $('.preloader-shared-keywords').css('display', 'none');
                        $('.shared-list').css('opacity', 1);
                        clear_competitors_rank();
                        clear_shared_keywords();
                        // set msg and disable preloader for - Shared keywords dynamics -
                        set_msg_to_chart();
                        // set msg and disable preloader for - Competitors in Google TOP -
                        remove_all_in_tbody();
                        insert_msg_into_table();
                        $('.preloader-competitors-table').css('display', 'none');
                        isShowedSharedKeywordsDynamics = false;
                    }, 1000);
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $('.preloader-shared-keywords').css('display', 'none');
                $('.shared-list').css('opacity', '1');
                insert_msg_into_table();
                set_msg_to_chart();
                $('.preloader-competitors-table').css('display', 'none');
                isShowedSharedKeywordsDynamics = false;
            }
        });
    }

    function get_competitors_rank() {
        let request_data = {
            site: domain,
            sort_date: startDate
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/competitors/get-rank/',
            type: 'GET',
            data: request_data
        };
        let selected_se = localStorage.getItem('semalt_seo_selected_se');
        if (selected_se) {
            request_data.se = selected_se;
        } else { return; }
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: true,
            success: function(resp) {
                let rank = numberWithSpaces(resp.result.result.rank);
                let kwCount = numberWithSpaces(resp.result.result.kw);
                $("#semalt-rank-position-number").text(rank);
                $("#semalt-rank-keywords-count").text(kwCount);
            },
        });
    }

    function clear_competitors_rank() {
        $("#semalt-rank-position-number").text(0);
        $("#semalt-rank-keywords-count").text(0);
    }

    function get_shared_keywords() {
        let request_data = {
            site: domain,
            range: threeMonthAgoDate + '_' + currentDate,
            mode: 'range'
        };
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/competitors/tops/',
            type: 'GET',
            data: request_data
        };
        let selected_se = localStorage.getItem('semalt_seo_selected_se');
        if (selected_se) {
            request_data.se = selected_se;
        } else { return; }
        $('.shared-list').css('opacity', '.1');
        $('.preloader-shared-keywords').css({"position":"absolute","top":"30px","margin":"0px 48%","display":"block"});
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: true,
            success: function(resp) {
                update_shared_keywords(resp.result);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $('.preloader-shared-keywords').css('display', 'none');
                $('.shared-list').css('opacity', '1');
            }
        });
    }

    function update_shared_keywords(result) {
        let top_keywords = [1,3,10,30,50,100];
        $.each(top_keywords, function(key, value) {
            let current;
            let prev;
            let avg;
            current = result[1].data[key].competitors;
            prev = result[0].data[key].competitors;
            avg = prev - current;
            avg = avg > 0 ? '+' + avg : avg;
            let top_kw_color = avg > 0 ? 'green bold' : ((avg == 0) ? '' : 'red bold');
            let arrow_style = avg > 0 ? 'arrow-up' : ((avg == 0) ? 'arrow-default' : 'arrow-down');
            let arrow_color = avg > 0 ? 'arrow-up-color' : ((avg == 0) ? 'arrow-default-color' : 'arrow-down-color');
            $('#semalt-competitors-keywords-count-top' + value).text(numberWithSpaces(current));
            $('#semalt-competitors-increase-count-top' + value).text(numberWithSpaces(avg));
            if (!$('#semalt-competitors-increase-count-top' + value).hasClass(top_kw_color)) {
                $('#semalt-competitors-increase-count-top' + value).removeClass().addClass(top_kw_color + ' bold');
            }
            if (!$('#semalt-competitors-arrow-style-top' + value).hasClass(arrow_style)) {
                $('#semalt-competitors-arrow-style-top' + value).removeClass().addClass(arrow_style);
            }
            if (!$('#semalt-competitors-arrow-color-top' + value).hasClass(arrow_color)) {
                $('#semalt-competitors-arrow-color-top' + value).removeClass().addClass(arrow_color);
            }
        });
        setTimeout(function() {
            $('.preloader-shared-keywords').css('display', 'none');
            $('.shared-list').css('opacity', '1');
        }, 500);
    }

    function clear_shared_keywords() {
        let top_keywords = [1,3,10,30,50,100];
        $.each(top_keywords, function (key, value) {
            $('#semalt-competitors-keywords-count-top' + value).text(numberWithSpaces(0));
            $('#semalt-competitors-increase-count-top' + value).text(numberWithSpaces(0));
            if (!$('#semalt-competitors-increase-count-top' + value).hasClass('')) {
                $('#semalt-competitors-increase-count-top' + value).removeClass().addClass('bold');
            }
            if (!$('#semalt-competitors-arrow-style-top' + value).hasClass('arrow-default')) {
                $('#semalt-competitors-arrow-style-top' + value).removeClass().addClass('arrow-default');
            }
            if (!$('#semalt-competitors-arrow-color-top' + value).hasClass('arrow-default-color')) {
                $('#semalt-competitors-arrow-color-top' + value).removeClass().addClass('arrow-default-color');
            }
        });
        setTimeout(function() {
            $('.preloader-shared-keywords').css('display', 'none');
            $('.shared-list').css('opacity', '1');
        }, 500);
    }

    function get_charts_data() {
        let keys;
        let request_data = {
            site: domain,
            mode: 'range',
            date: currentDate,
        };
        if (localStorage.getItem('semalt_competitors_selected_domains')) {
            let json_selected_domains = localStorage.getItem('semalt_competitors_selected_domains');
            let selected_domains_arr = JSON.parse(json_selected_domains);
            keys = selected_domains_arr.map(function(item) {
                return item.key;
            }).join(',');
            request_data.keys = keys;
        }
        if (localStorage.getItem('semalt_seo_selected_se')) {
            request_data.se = localStorage.getItem('semalt_seo_selected_se');
        } else { return; }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/competitors/get-tops-by-competitors/',
            type: 'GET',
            data: request_data
        };
        enablePreloaderSharedKeywordsDinamics();
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: true,
            success: function(resp) {
                if (resp.result.results) {
                    isShowedSharedKeywordsDynamics = true;
                    draw_chart(resp.result.results);
                } else {
                    set_msg_to_chart();
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                isShowedSharedKeywordsDynamics = false;
                set_msg_to_chart();
            }
        });
    }

    function set_msg_to_chart() {
        // $('#shared_keywords_dynamics').css('height', '0');
        $('.dynamics .no-data-found').remove();
        let msg = '<div class="no-data-found"><h2>No relevant data found.</h2><p>There seems to be no relevant data for your request.</p></div>';
        $(msg).insertAfter('.competitors-dynamics-top-filter');
        disablePreloaderSharedKeywordsDinamics(0);
    }

    function draw_chart (data) {
        let dynamics_top_counter = 100;
        if (localStorage.getItem('semalt_competitors_dynamics_top_filter')) {
            dynamics_top_counter = localStorage.getItem('semalt_competitors_dynamics_top_filter');
        }
        data = data[dynamics_top_counter].map((el, i) => {
            return {
                ...el,
                marker : {
                    enabled : el.data.length === 1 ? true : false
                },
                colorIndex: i
            }
        });

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
                        let topN = 100;
                        if (localStorage.getItem('semalt_competitors_top_filter')) {
                            topN = localStorage.getItem('semalt_competitors_top_filter');
                        }
                        return 'Shared keywords on TOP ' + topN + ' on ' + moment(tooltipItem[0].label, 'YYYY-MM-DD').format('ll');
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
                    },
                    ticks: {
                        min: 0
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

        var ctx = document.getElementById('shared_keywords_dynamics_canvas').getContext('2d');
        chart = new Chart(ctx, {
            type: 'LineWithLine',
            data: {
                datasets: datasets,
            },
            options: options
        });

        setTimeout(function () {
            disablePreloaderSharedKeywordsDinamics();
        }, 500);
    }

    function remove_all_in_tbody() {
        $("#competitors-table tbody").find("tr:gt(0)").remove();
    }

    function get_competitors_in_google_top() {
        let request_data = {
            site: domain,
            size: 40,
            offset: 0,
            range: startDate + '_' + endDate
        }
        if (startDate == endDate) {
            request_data.sort_type = '-pos0';
        } else {
            request_data.sort_type = '-pos1';
        }
        let params = {
            url: 'https://semalt.net/api/v1/serp/get/competitors/list/',
            type: 'GET',
            data: request_data
        };
        if (localStorage.getItem('semalt_seo_selected_se')) {
            request_data.se = localStorage.getItem('semalt_seo_selected_se');
        } else { return; }
        if (localStorage.getItem('semalt_competitors_top_filter')) {
            request_data.top_filter = localStorage.getItem(('semalt_competitors_top_filter'));
        } else {
            request_data.top_filter = 100;
        }
        if (localStorage.getItem('semalt_competitors_filter_domain')) {
            request_data.site_filter_type = 'match';
            request_data.site_filter = localStorage.getItem('semalt_competitors_filter_domain');
        }
        remove_all_in_tbody();
        $('.no-data-found').remove();
        allowScrollLoad = false;
        scrollCounter = 0;
        $.ajax({
            url: params.url,
            type: params.type,
            data: params.data,
            dataType: "json",
            async: true,
            before: function(xhr) {
                $('.preloader-competitors-table').css('display', 'block');
            },
            success: function(resp) {
                // hide preloader
                setTimeout(function() {
                    if (resp.result != null) {
                        let json_selected_domains = JSON.stringify(resp.result.selected_comps);
                        localStorage.setItem('semalt_competitors_selected_domains', json_selected_domains);
                        set_total_count_of_websites_in_table_head(resp.result.total);
                        insert_semalt_competitors_into_table(resp.result.result);
                        get_charts_data();
                        $('.preloader-competitors-table').css('display', 'none');
                    } else {
                        set_total_count_of_websites_in_table_head(0);
                        insert_msg_into_table();
                        set_msg_to_chart();
                        $('.preloader-competitors-table').css('display', 'none');
                    }
                    scrollCounter = 0;
                    allowScrollLoad = true;
                }, 500);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                insert_msg_into_table();
                set_msg_to_chart();
                $('.preloader-competitors-table').css('display', 'none');
            }
        });
    }

    function insert_semalt_competitors_into_table(websites, lastId) {
        $('.no-data-found').remove();
        // set current date in thead
        if (startDate === endDate) {
            $('.competitors-end-date').text(moment(endDate, 'YYYY-MM-DD').format('MMM D'));
            $('.competitors-start-date').hide();
        } else {
            $('.competitors-start-date').show();
            $('.competitors-start-date').text(moment(startDate, 'YYYY-MM-DD').format('MMM D'));
            $('.competitors-end-date').text(moment(endDate, 'YYYY-MM-DD').format('MMM D'));
        }
        let selected_domains;
        if (localStorage.getItem('semalt_competitors_selected_domains')) {
            let json_selected_domains = localStorage.getItem('semalt_competitors_selected_domains');
            let selected_domains_arr = JSON.parse(json_selected_domains);
            selected_domains = selected_domains_arr.map(function(item) {
                return item.value;
            });
        }
        let table = $('#competitors-table').children('tbody');
        let newIdVal;
        if (!lastId) {
            lastId = 0;
        }
        for (let i = 0; i <= websites.length - 1; i++) {
            newIdVal = parseInt(lastId) + i + 1;
            let tdId = '<td class="id center">' + newIdVal + '.</td>';
            let isChecked = '';
            if (selected_domains.indexOf(websites[i].comp_site) !== -1) {
                isChecked = 'checked';
            }
            let checkBox = '<input class="checkbox-tbl" ' + isChecked + ' type="checkbox" value="'+websites[i].comp_site+'">';
            let tdWebsite = '<td> ' + checkBox + '<a href="http://' + websites[i].comp_site + '" target="_blank">' + websites[i].comp_site + '</a></td>';
            let tdPos1 = '<td class="center">' + websites[i].data[0].count + '</td>';
            let tdPos2;
            let appendStr;
            let sup;
            if (startDate === endDate) {
                sup = websites[i].data[0].count;
            } else {
                sup = websites[i].data[1].count - websites[i].data[0].count;
            }
            let sup_color;
            if (sup > 0) { sup_color = 'green bold'; } else if ( sup == 0 ) { sup_color = ''; } else { sup_color = 'red bold'; }
            if (sup > 0) { sup = '+' + sup; } else if ( sup == 0 ) { sup = ''; }
            if (startDate === endDate) {
                appendStr = '<tr>' + tdId + tdWebsite + tdPos1 + '</tr>';
            } else {
                tdPos2 = '<td class="center">' + websites[i].data[1].count + '<sup class="' + sup_color + '">' + sup + '</sup></td>';
                appendStr = '<tr>' + tdId + tdWebsite + tdPos1 + tdPos2 + '</tr>';
            }
            table.append(appendStr);
        }
    }

    $(window).scroll(function () {
        scrollCounter++;
        if($(window).scrollTop() == $(document).height() - $(window).height()) {
            if (scrollCounter < 5) { return; }
            if (allowScrollLoad == true) {
                let lastId = $('#competitors-table tbody tr:last-child td:first-child').text();
                let kwTotalCount = $('#totalCount').attr('data-attr');
                if (parseInt(lastId) === parseInt(kwTotalCount)) { return; }
                let defaultOffset = 40;
                let size = 40;
                let request_data = {
                    site: domain,
                    size: size,
                    offset: 0,
                    range: startDate + '_' + endDate
                }
                if (startDate == endDate) {
                    request_data.sort_type = '-pos0';
                } else {
                    request_data.sort_type = '-pos1';
                }
                if (localStorage.getItem('semalt_competitors_offset')) {
                    request_data.offset = localStorage.getItem('semalt_competitors_offset');
                } else {
                    localStorage.setItem('semalt_competitors_offset', defaultOffset);
                    request_data.offset = localStorage.getItem('semalt_competitors_offset');
                }
                if (localStorage.getItem('semalt_seo_selected_se')) {
                    request_data.se = localStorage.getItem('semalt_seo_selected_se');
                } else { return; }
                if (localStorage.getItem('semalt_competitors_top_filter')) {
                    request_data.top_filter = localStorage.getItem(('semalt_competitors_top_filter'));
                } else {
                    request_data.top_filter = 100;
                }
                if (localStorage.getItem('semalt_competitors_filter_domain')) {
                    request_data.site_filter_type = 'match';
                    request_data.site_filter = localStorage.getItem('semalt_competitors_filter_domain');
                }
                let params = {
                    url: 'https://semalt.net/api/v1/serp/get/competitors/list/',
                    type: 'GET',
                    data: request_data
                };
                $('.preloader-competitors-table').css('display', 'block');
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
                                insert_semalt_competitors_into_table(resp.result.result, lastId);
                                if (resp.result.result.length == size) {
                                    let offset = localStorage.getItem('semalt_competitors_offset');
                                    let newOffset = parseInt(offset) + parseInt(size);
                                    localStorage.setItem('semalt_competitors_offset', newOffset );
                                }
                            }
                            $('.preloader-competitors-table').css('display', 'none');
                        },
                        error: function(xhr, ajaxOptions, thrownError) {
                            $('.preloader-competitors-table').css('display', 'none');
                        }
                    });
                }, 500);
            }
        }
    });

    function set_total_count_of_websites_in_table_head(count) {
        $("#totalCount").text('Keywords (' + count + ')');
        $("#totalCount").attr('data-attr', count);
    }

    function insert_msg_into_table () {
        let msg = '<div class="no-data-found"><h2>No relevant data found.</h2><p>There seems to be no relevant data for your request.</p></div>';
        $(msg).insertAfter('#competitors-table');
    }

    function numberWithSpaces(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function enablePreloaderSharedKeywordsDinamics() {
        $('.no-data-found').remove();
        $('#shared_keywords_dynamics').css('opacity', '.1');
        var top = 50;
        if (isShowedSharedKeywordsDynamics) { top = 240; }
        $('.dynamics .preloader-chart').css({"position":"absolute","top":top+"px","margin":"0px 48%","display":"block"});
    }
    function disablePreloaderSharedKeywordsDinamics(height) {
        let h = 400;
        if (height >= 0) {
            h = height;
        }
        $('#shared_keywords_dynamics').css({'opacity':'1','height': h+'px'});
        $('.dynamics .preloader-chart').css("display","none");
    }

})( jQuery );
