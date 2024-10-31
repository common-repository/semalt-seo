<?php

/**
 * Fired when the plugin is uninstalled.
 *
 * When populating this file, consider the following flow
 * of control:
 *
 * - This method should be static
 * - Check if the $_REQUEST content actually is the plugin name
 * - Run an admin referrer check to make sure it goes through authentication
 * - Verify the output of $_GET makes sense
 * - Repeat with other user roles. Best directly by using the links/query string parameters.
 * - Repeat things for multisite. Once for a single site in the network, once sitewide.
 *
 * This file may be updated more in future version of the Boilerplate; however, this is the
 * general skeleton and outline for how the file should work.
 *
 * For more information, see the following discussion:
 * https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/pull/123#issuecomment-28541913
 *
 * @link       https://semalt.com
 * @since      1.0.0
 *
 * @package    Semalt_Seo
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

drop_table_semalt_titles();
drop_table_semalt_seo_cdn();

delete_option('semalt_cron_status');
delete_option('semalt_option_cdn_auth_key');
delete_option('semalt_option_cron_image_optimization');
delete_option('semalt_option_image_alt_title_generation');
delete_option('semalt_option_cron_image_optimization_sizes');
delete_option('semalt_option_image_alt_title_disable_update_existing');


function drop_table_semalt_seo_cdn() {
    global $table_prefix, $wpdb;
    $table_name = $table_prefix . 'semalt_seo_cdn';

    $sql = "DROP TABLE IF EXISTS `{$table_name}`;";
    $wpdb->query($sql);

    if ($wpdb->last_error) {
        echo $wpdb->last_error;
    }
}

function drop_table_semalt_titles() {
    global $table_prefix, $wpdb;
    $table_name = $table_prefix . 'semalt_seo_titles';

    $sql = "DROP TABLE IF EXISTS `{$table_name}`;";
    $wpdb->query($sql);

    if ($wpdb->last_error) {
        echo $wpdb->last_error;
    }
}
