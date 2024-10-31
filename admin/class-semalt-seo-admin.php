<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://semalt.com
 * @since      1.0.0
 *
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/admin
 * @author     Semalt SEO <company@semalt.com>
 */
class Semalt_Seo_Admin
{

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string $plugin_name The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string $version The current version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version The version of this plugin.
     * @since    1.0.0
     */


    private $response;

    public function __construct($plugin_name, $version)
    {

        $this->plugin_name = $plugin_name;
        $this->version = $version;

    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_styles()
    {

        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in Semalt_Seo_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The Semalt_Seo_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */

        wp_enqueue_style($this->plugin_name, plugin_dir_url(__FILE__) . 'css/semalt-seo-admin.css', array(), $this->version, 'all');

        wp_enqueue_style('semalt-seo-fontawesome', 'https://use.fontawesome.com/releases/v5.7.1/css/all.css', array(), $this->version, false);

        wp_enqueue_style('semalt-seo-daterangepicker', plugin_dir_url(__FILE__) . 'css/libs/daterangepicker.css', array(), $this->version, false);

    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts()
    {
        /**
         * This function is provided for demonstration purposes only.
         *
         * An instance of this class should be passed to the run() function
         * defined in Semalt_Seo_Loader as all of the hooks are defined
         * in that particular class.
         *
         * The Semalt_Seo_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
         */

        wp_enqueue_script('semalt-seo-momentjs', plugin_dir_url(__FILE__) . 'js/libs/moment.min.js', array('jquery'), $this->version, false);
        wp_enqueue_script('semalt-seo-date-fns', plugin_dir_url(__FILE__) . 'js/libs/date-fns.js', array('jquery'), $this->version, false);

        wp_enqueue_script($this->plugin_name, plugin_dir_url(__FILE__) . 'js/semalt-seo-admin.js', array('jquery'), $this->version, false);

        wp_enqueue_script('semalt-seo-chartjs', plugin_dir_url(__FILE__) . 'js/libs/chartjs.min.js', array('semalt-seo-momentjs') );

        wp_enqueue_script('semalt-seo-daterangepicker', plugin_dir_url(__FILE__) . 'js/libs/daterangepicker.min.js', array('jquery'), $this->version, false);

        if (isset($_GET['page']) && ($_GET['page'] == 'semalt-seo')) {
            wp_enqueue_script('semalt-seo-ajax-kw', plugin_dir_url(__FILE__) . 'js/semalt-seo-ajax-kw-on-top.js', array('jquery'), $this->version, false);
            wp_localize_script('semalt-seo-ajax-kw', 'semalt_ajax_kw_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'offset'=> 40) );
        }

        if (isset($_GET['page']) && ($_GET['page'] == 'competitors')) {
            wp_enqueue_script('semalt-seo-competitors', plugin_dir_url(__FILE__) . 'js/semalt-seo-competitors.js', array('jquery'), $this->version, false);
            wp_localize_script('semalt-seo-competitors', 'semalt_competitors_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'offset'=> 40) );
        }

        if (isset($_GET['page']) && ($_GET['page'] == 'best-pages')) {
            wp_enqueue_script('semalt-seo-best-pages', plugin_dir_url(__FILE__) . 'js/semalt-seo-best-pages.js', array('jquery'), $this->version, false);
            wp_localize_script('semalt-seo-best-pages', 'semalt_best_pages_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'offset'=> 40) );
        }

        if (isset($_GET['page']) && ($_GET['page'] == 'meta-generation')) {
            wp_enqueue_script('semalt-seo-ajax-meta-generation', plugin_dir_url(__FILE__) . 'js/semalt-seo-meta-generation.js', array('jquery'), $this->version, false);
            wp_localize_script('semalt-seo-ajax-meta-generation', 'semalt_ajax_title_generation_object', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ));
        }

        if (isset($_GET['page']) && ($_GET['page'] == 'pagespeed-boost')) {
            wp_enqueue_script('semalt-seo-ajax-pagespeed-boost', plugin_dir_url(__FILE__) . 'js/semalt-seo-pagespeed-boost.js', array('jquery'), $this->version, false);

            /*
             * Get current status for optimization images
             * */
            $semalt_option_cron_enable = 'disabled';
            if (get_option('semalt_option_cron_image_optimization')) {
                $semalt_option_cron_enable = get_option('semalt_option_cron_image_optimization');
            }
            /*
             * Get current status of optimization sizes for images
             * */
            $semalt_optimization_image_sizes = 'disabled';
            if (get_option('semalt_option_cron_image_optimization_sizes')) {
                $semalt_optimization_image_sizes = get_option('semalt_option_cron_image_optimization_sizes');
            }
            /*
             * Get current status of automatic generation of alt and title for images
             * */
            $semalt_option_alt_title_generation_status = 'disabled';
            if (get_option('semalt_option_image_alt_title_generation')) {
                $semalt_option_alt_title_generation_status = get_option('semalt_option_image_alt_title_generation');
            }

            $semalt_option_image_alt_title_disable_update_existing = 'disabled';
            if (get_option('semalt_option_image_alt_title_disable_update_existing')) {
                $semalt_option_image_alt_title_disable_update_existing = get_option('semalt_option_image_alt_title_disable_update_existing');
            }

            wp_localize_script('semalt-seo-ajax-pagespeed-boost', 'semalt_ajax_pagespeed_boost_object',
                array(
                    'ajax_url' => admin_url( 'admin-ajax.php' ),
                    'semalt_option_cron_imgage_optimization'=> $semalt_option_cron_enable,
                    'semalt_option_cron_imgage_optimization_sizes'=> $semalt_optimization_image_sizes,
                    'semalt_option_alt_title_generation_status' => $semalt_option_alt_title_generation_status,
                    'semalt_option_image_alt_title_disable_update_existing' => $semalt_option_image_alt_title_disable_update_existing
                )
            );
        }
        wp_enqueue_script('semalt-seo-main-js', plugin_dir_url(__FILE__) . 'js/semalt-seo-main.js', array('jquery'), $this->version, false);
    }

    public function semalt_ajax_title_generation_update()
    {
        if ($_POST['update']) {

            require_once SEMALT_SEO_PATH . 'includes/class-semalt-seo-meta-scraper.php';
            $MetaScraper = new Semalt_SEO_Meta_Scraper();
            $MetaScraper->truncateTableBeforeInsert();
            $MetaScraper->insertTitleListToDataBase();

            $response = ['status' => true];
            echo json_encode($response);
            wp_die();
        } else {
            $error_response = ['status' => false];
            echo json_encode($error_response);
            wp_die();
        }
    }

    public function semalt_ajax_pagesped_bost_images_form_callback() {
        if ( !$_POST['image_optimization'] || !$_POST['image_optimization_sizes'] || !$_POST['image_alt_title_generation'] ) {
            $response = ['error' => 'Missed one or more mandatory parameters'];
        } else {

            if ($_POST['image_optimization'] == 'true') {

                if (!wp_next_scheduled('cron_semalt_seo_every_minute_image_optimization')) {
                    wp_schedule_event(time(), 'every_minute', 'cron_semalt_seo_every_minute_image_optimization');
                }

                if (!get_option('semalt_option_cron_image_optimization')) {
                    add_option('semalt_option_cron_image_optimization', 'enabled');
                } else {
                    update_option('semalt_option_cron_image_optimization', 'enabled');
                }
                $response[] = ['image_optimization' => 'enabled'];

            } else {
                wp_clear_scheduled_hook('cron_semalt_seo_every_minute_image_optimization');
                update_option('semalt_option_cron_image_optimization', 'disabled');

                $response[] = ['image_optimization' => 'disabled'];
            }

            if ($_POST['image_optimization_sizes'] == 'true') {
                if (!get_option('semalt_option_cron_image_optimization_sizes')) {
                    add_option('semalt_option_cron_image_optimization_sizes', 'enabled');
                } else {
                    update_option('semalt_option_cron_image_optimization_sizes', 'enabled');
                }
                $response[] = ['image_optimization_sizes' => 'enabled'];
            } else {
                update_option('semalt_option_cron_image_optimization_sizes', 'disabled');
                $response[] = ['image_optimization_sizes' => 'disabled'];
            }

            if ($_POST['image_alt_title_generation'] == 'true') {
                if (!get_option('semalt_option_image_alt_title_generation')) {
                    add_option('semalt_option_image_alt_title_generation', 'enabled');
                } else {
                    update_option('semalt_option_image_alt_title_generation', 'enabled');
                }
                $response[] = ['image_alt_title_generation' => 'enabled'];
            } else {
                update_option('semalt_option_image_alt_title_generation', 'disabled');
                $response[] = ['image_alt_title_generation' => 'disabled'];
            }

            if ($_POST['image_disable_update_existing_alt_title'] == 'true') {
                if (!get_option('semalt_option_image_alt_title_disable_update_existing')) {
                    add_option('semalt_option_image_alt_title_disable_update_existing', 'enabled');
                } else {
                    update_option('semalt_option_image_alt_title_disable_update_existing', 'enabled');
                }
                $response[] = ['image_disable_update_existing_alt_title' => 'enabled'];
            } else {
                update_option('semalt_option_image_alt_title_disable_update_existing', 'disabled');
                $response[] = ['image_disable_update_existing_alt_title' => 'disabled'];
            }
        }

        echo json_encode($response);
        wp_die();
    }

    public function cron_semalt_seo_every_minute_image_optimization_callback()
    {
        require_once SEMALT_SEO_PATH . 'includes/class-semalt-seo-image-optimization.php';
        $ImageOptimization = new Semalt_SEO_Image_Optimization();

        if (!get_option('semalt_cron_status')) {
            $ImageOptimization->runCronImageOptimization();
        } else {
            $status = get_option('semalt_cron_status');

            if ($status == 'completed') {
                $ImageOptimization->runCronImageOptimization();
            }
        }
    }

    public function semalt_setup_menu()
    {
        add_menu_page('Semalt SEO', 'Semalt SEO', 'manage_options', 'semalt-seo', array($this, 'keywords_on_top_page'), plugin_dir_url(__FILE__) . 'img/favicon-semalt.ico', "25.22");
    }

    public function semalt_setup_submenu()
    {
        add_submenu_page('semalt-seo', 'Keywords on TOP - Semalt SEO', 'Keywords on TOP', 'manage_options', 'semalt-seo', array($this, 'keywords_on_top_page'));
        add_submenu_page('semalt-seo', 'Best Pages - Semalt SEO', 'Best Pages', 'manage_options', 'best-pages', array($this, 'best_pages_page'));
        add_submenu_page('semalt-seo', 'Competitors - Semalt SEO', 'Competitors', 'manage_options', 'competitors', array($this, 'competitors_page'));
//        add_submenu_page('semalt-seo', 'Meta Generation - Semalt SEO', 'Meta Generation', 'manage_options', 'meta-generation', array($this, 'meta_generation_page'));
        add_submenu_page('semalt-seo', 'Pagespeed Boost - Semalt SEO', 'Pagespeed Boost', 'manage_options', 'pagespeed-boost', array($this, 'pagespeed_boost_page'));
    }

    public function keywords_on_top_page()
    {
        if (!current_user_can('manage_options'))
        {
            wp_die( __('You do not have sufficient permissions to access this page.') );
        }
        require_once plugin_dir_path( __FILE__ ) . 'pages/semalt-seo-keywords-on-top.php';
    }

    public function best_pages_page()
    {
        if (!current_user_can('manage_options'))
        {
            wp_die( __('You do not have sufficient permissions to access this page.') );
        }
        require_once plugin_dir_path( __FILE__ ) . 'pages/semalt-seo-best-pages.php';
    }

    public function competitors_page()
    {
        if (!current_user_can('manage_options'))
        {
            wp_die( __('You do not have sufficient permissions to access this page.') );
        }
        require_once plugin_dir_path( __FILE__ ) . 'pages/semalt-seo-competitors.php';
    }

    public function meta_generation_page()
    {
        if (!current_user_can('manage_options'))
        {
            wp_die( __('You do not have sufficient permissions to access this page.') );
        }
        require_once plugin_dir_path( __FILE__ ) . 'pages/semalt-seo-meta-generation.php';
    }

    public function pagespeed_boost_page() {
        if (!current_user_can('manage_options'))
        {
            wp_die( __('You do not have sufficient permissions to access this page.') );
        }
        require_once plugin_dir_path( __FILE__ ) . 'pages/semalt-seo-pagespeed-boost.php';
    }
}
