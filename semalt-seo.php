<?php

/**
 * Semalt SEO
 *
 * @link              https://semalt.com
 * @since             1.0.0
 * @package           Semalt_Seo
 * @copyright    Copyright (C) 2019, Semalt SEO - company@semalt.com
 *
 * @wordpress-plugin
 * Plugin Name:       Semalt SEO
 * Description:       Semalt SEO plugin helps to track Google positions on the SERP, define and explore pages that bring traffic to a website, reveal the competitors, and reduce the load time of a web source. Semalt SEO helps to optimize your website and improve its load time and performance. We speed up a website by means of image optimization.
 * Version:           1.0.4
 * Requires at least: 5.1
 * Requires PHP:      7.2
 * Author:            Semalt
 * Author URI:        https://semalt.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       semalt-seo
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define ('SEMALT_SEO_PATH', plugin_dir_path( __FILE__ ));
define ('SEMALT_SEO_URL', plugin_dir_url( __FILE__ ));

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'SEMALT_SEO_VERSION', '1.0.4' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-semalt-seo-activator.php
 */
function activate_semalt_seo() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-semalt-seo-activator.php';
	Semalt_Seo_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-semalt-seo-deactivator.php
 */
function deactivate_semalt_seo() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-semalt-seo-deactivator.php';
	Semalt_Seo_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_semalt_seo' );
register_deactivation_hook( __FILE__, 'deactivate_semalt_seo' );

/* register semalt schedule */
add_filter( 'cron_schedules', 'semalt_seo_add_cron_schedule' );
function semalt_seo_add_cron_schedule( $schedules ) {
    $schedules['every_minute'] = array(
        'interval' => 60,
        'display'  => esc_html__( 'Every minute' ), );
    return $schedules;
}

add_action('wp_dashboard_setup', 'semalt_seo_dashboard_widgets');
function semalt_seo_dashboard_widgets() {
    global $wp_meta_boxes;
    wp_add_dashboard_widget('custom_help_widget', 'Semalt SEO', 'semalt_seo_get_personal_manager');
}

function semalt_seo_get_personal_manager() {
    $token = 'av7Tdfo9fsACfhKqLi3ZfyIkshRwJrR7';
    $domain = $_SERVER['SERVER_NAME'];
    $url = 'https://supersemalt.com/api/domain-manager?domain=' . $domain . '&token=' . $token . '&withDefault=1';

    $manager_information_json = wp_remote_retrieve_body( wp_remote_get( $url ) );
    $manager_information = json_decode($manager_information_json);

    $msg =  '<h3>Welcome to Semalt SEO plugin.</h3>';
    $msg .= '<h3>Get in touch with us! We are always happy to assist you!</h3>';

    if (@$manager_information->res) {
        $managerName = $manager_information->res->managerName;
        $managerPhoto = $manager_information->res->photo;
        $managerPosition = $manager_information->res->position;
        $managerSkype = $manager_information->res->skype;
        $managerPhone = $manager_information->res->phone;
        $managerEmail = $manager_information->res->email;

        $msg .= '<div class="semalt-widget-wrapper">';
        if ($managerPhoto) {
            $msg .= '<div class="semalt-widget-image-wrapper"><img src="' . $managerPhoto . '" alt=""></div>';
        }
            $msg .= '<div class="semalt-widget-info-name">
                        <div class="fullName">';
                if ($managerName) {
                    $msg .= '<p class="name">' . $managerName . '</p>';
                }
                if ($managerPosition) {
                    $msg .= '<p data-ll="5582" class="position">' . $managerPosition . '</p>';
                }

                $msg .= '</div>
                <div class="contacts">';

                if ($managerSkype) {
                    $msg .= '<p class="skype"><a href="skype:' . $managerSkype . '?call">' . $managerSkype . '</a></p>';
                }
                if ($managerPhone) {
                    $msg .= '<a href="tel:' . $managerPhone . '" class="phone">' . $managerPhone . '</a>';
                }
                if ($managerEmail) {
                    $msg .= '<a target="_blank" href="mailto:' . $managerEmail . '" class="mail">' . $managerEmail . '</a>';
                }
        $msg .= '</div> </div> </div>';
    }

    echo $msg;
}


/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-semalt-seo.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */

function run_semalt_seo() {
	$plugin = new Semalt_Seo();
	$plugin->run();
}

run_semalt_seo();
