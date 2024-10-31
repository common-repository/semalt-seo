(function($) {
    $(document).ready(function () {
        $('#semalt-seo-header-edit-domain-input').keypress(function(e) {
            if (e.which == 13) {
                $('#semalt-seo-header-save-new-domain-btn').click();
            }
        });

    });
})( jQuery );
