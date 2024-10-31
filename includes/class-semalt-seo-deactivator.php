<?php

/**
 * Fired during plugin deactivation
 *
 * @link       https://semalt.com
 * @since      1.0.0
 *
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/includes
 * @author     Semalt SEO <company@semalt.com>
 */
class Semalt_Seo_Deactivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
        self::removeCronEventHourlyImageOptimization();
	}

    public static function removeCronEventHourlyImageOptimization() {
        wp_clear_scheduled_hook('cron_semalt_seo_every_minute_image_optimization');
        update_option('semalt_option_cron_image_optimization', 'disabled');
        update_option('semalt_option_cron_image_optimization_sizes', 'disabled');
        update_option('semalt_cron_status', 'completed');
    }
}
