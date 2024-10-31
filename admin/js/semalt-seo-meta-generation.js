(function ( $) {
    var canBeLoaded = false;

    $(document).ready(function() {
        $('#title-auto-generation-update-btn').click(function () {
            $('#title-auto-generation-update-btn .fa.fa-spinner').css('display', 'inline-block');
            var params = {
                'action': 'semalt_seo_title_auto_generation_update',
                update: true
            }
            try {
                $.ajax({
                    async: true,
                    url: semalt_ajax_title_generation_object.ajax_url,
                    type: 'POST',
                    data: params,
                    dataType: "json",
                    beforeSend: function( xhr ){
                        canBeLoaded = false;
                    },
                    success: function(resp) {
                        if (resp) {

                            setTimeout(function(){
                                $('.title-generation-upd-st-success').css('display', 'block');
                                $('#title-auto-generation-update-btn .fa.fa-spinner').css('display', 'none');
                            }, 1);
                            canBeLoaded = true;
                        }
                    },
                    error: function (err) {
                        $('.title-generation-upd-st-fail').css('display', 'block');
                        console.log(err);
                        return;
                    }
                });
            } catch (e) {
                console.error(e);
                return;
            }
        });
    });

})( jQuery );
