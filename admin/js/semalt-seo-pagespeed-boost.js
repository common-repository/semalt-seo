(function($) {

    $(document).ready(function() {

        if ( semalt_ajax_pagespeed_boost_object.semalt_option_cron_imgage_optimization == 'enabled' ) {
            $('#enable-cron-image-optimization').attr('checked','checked');
        }
        if ( semalt_ajax_pagespeed_boost_object.semalt_option_cron_imgage_optimization_sizes == 'enabled' ) {
            $('#enable-cron-image-optimization-sizes').attr('checked','checked');
        }
        if ( semalt_ajax_pagespeed_boost_object.semalt_option_alt_title_generation_status == 'enabled') {
            $('#enable-auto-generation-alt-title').attr('checked','checked');
        }

        if ( semalt_ajax_pagespeed_boost_object.semalt_option_image_alt_title_disable_update_existing == 'enabled' ) {
            $('#disable-update-existing-alt-title').attr('checked','checked');
        }

        $('ul.tabs li').click(function(){
            var tab_id = $(this).attr('data-tab');
            $('ul.tabs li').removeClass('current');
            $('.tab-content').removeClass('current');
            $(this).addClass('current');
            $("#"+tab_id).addClass('current');
        });

        /* Image Optimization send form */
        $('#semalt-image-optimization-send-form').click(function() {
            let params = {
                'action': 'semalt_seo_pagespeed_boost_image_optimization_form',
            };
            if ($("#enable-cron-image-optimization").is(":checked")) {
                params.image_optimization = true; } else { params.image_optimization = false; }

            if ($("#enable-cron-image-optimization-sizes").is(":checked")) {
                params.image_optimization_sizes = true; } else { params.image_optimization_sizes = false; }

            if ($("#enable-auto-generation-alt-title").is(":checked")) {
                params.image_alt_title_generation = true; } else { params.image_alt_title_generation = false; }

            if ($("#disable-update-existing-alt-title").is(":checked")) {
                params.image_disable_update_existing_alt_title = true; } else { params.image_disable_update_existing_alt_title = false; }

            try {
                $.ajax({
                    async: true,
                    url: semalt_ajax_pagespeed_boost_object.ajax_url,
                    type: 'POST',
                    data: params,
                    dataType: "json",
                    success: function (resp) {
                        if (resp) {
                            $(".semalt-seo-msg-success").show();
                            setTimeout(function() { $(".semalt-seo-msg-success").hide(); }, 2000);
                        } else {
                            console.log('Error sending the form.');
                        }
                    },
                });
            } catch (e) {
                console.log(e);
                return;
            }
        });
        /* END: send form */
    });

})( jQuery );
