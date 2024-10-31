<?php

/**
 * Fired during plugin activation
 *
 * @link       https://semalt.com
 * @since      1.0.0
 *
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/includes
 * @author     Semalt SEO <company@semalt.com>
 */
class Semalt_Seo_Activator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {
	    self::add_option_cdn_auth_key_on_activate_plugin();
        self::create_table_semalt_seo_cdn();
        self::add_index_to_semalt_seo_cdn();

        // Temporarily deactivated
//        self::create_table_semalt_titles();
//        self::add_index_to_semalt_table();
//        self::insert_titles_to_semalt_table_on_activate_plugin();
	}

	/* Semalt: image compresssion */
	public static function add_option_cdn_auth_key_on_activate_plugin() {

        $json = wp_remote_retrieve_body( wp_remote_get( 'https://api.jetpic.net/auth' ) );
        $obj = json_decode($json);
        if ($obj->key) {
            if (!get_option('semalt_option_cdn_auth_key')) {
                add_option('semalt_option_cdn_auth_key', $obj->key);
            } else {
                update_option('semalt_option_cdn_auth_key', $obj->key);
            }
        } else {
            echo 'Error receiving the API key, please try to restart the plugin.';
            wp_die();
        }
    }

    public static function create_table_semalt_seo_cdn() {
        global $table_prefix, $wpdb;

        $table_name = $table_prefix . 'semalt_seo_cdn';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE `{$table_name}` (";
        $sql .= "`id` int(191) NOT NULL AUTO_INCREMENT, ";
        $sql .= "`original` varchar(255) NOT NULL, ";
        $sql .= "`cdn_compressed` varchar(255) NOT NULL, ";
        $sql .= "`cdn_webp_compressed` varchar(255) NOT NULL, ";
        $sql .= "`parent_id` int(1) DEFAULT 0 NOT NULL, ";
        $sql .= "`st` int(1) DEFAULT 1 NOT NULL, ";
        $sql .= "PRIMARY KEY (id)";
        $sql .= ") $charset_collate; ";

        require_once( ABSPATH . '/wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    public static function add_index_to_semalt_seo_cdn() {
        global $table_prefix, $wpdb;

        $table_name = $table_prefix . 'semalt_seo_cdn';

        $sql = "ALTER TABLE `{$table_name}` ADD INDEX(`id`); ";
        $wpdb->query($sql);
        $sql2 = "ALTER TABLE `{$table_name}` ADD INDEX(`original`); ";
        $wpdb->query($sql2);
        $sql3 = "ALTER TABLE `{$table_name}` ADD INDEX(`cdn_compressed`); ";
        $wpdb->query($sql3);
        $sql4 = "ALTER TABLE `{$table_name}` ADD INDEX(`cdn_webp_compressed`); ";
        $wpdb->query($sql4);
        $sql5 = "ALTER TABLE `{$table_name}` ADD INDEX(`parent_id`);";
        $wpdb->query($sql5);
        $sql6 = "ALTER TABLE `{$table_name}` ADD INDEX(`st`);";
        $wpdb->query($sql6);
    }
    /* End: semalt image compression */

    /* Semalt META generation */
    public static function create_table_semalt_titles() {
        global $table_prefix, $wpdb;

        $table_name = $table_prefix . 'semalt_seo_titles';
        $charset_collate = $wpdb->get_charset_collate();

        if($wpdb->get_var( "show tables like {$table_name}" ) != $table_name) {
            $sql = "CREATE TABLE `{$table_name}` (";
            $sql .= "`id` varchar(191) NOT NULL, ";
            $sql .= "`title` varchar(255) NOT NULL, ";
            $sql .= "`url` varchar(255) NOT NULL, ";
            $sql .= "`st` int(1) DEFAULT 1 NOT NULL, ";
            $sql .= "PRIMARY KEY(id)";
            $sql .= ") $charset_collate; ";

            require_once( ABSPATH . '/wp-admin/includes/upgrade.php' );
            dbDelta( $sql );
        }
    }

    public static function add_index_to_semalt_table() {
        global $table_prefix, $wpdb;

        $table_name = $table_prefix . 'semalt_seo_titles';

        $sql = "ALTER TABLE `{$table_name}` ADD INDEX(`title`); ";
        $wpdb->query($sql);
        $sql1 = "ALTER TABLE `{$table_name}` ADD INDEX(`url`); ";
        $wpdb->query($sql1);
        $sql2 = "ALTER TABLE `{$table_name}` ADD INDEX(`st`);";
        $wpdb->query($sql2);
    }

    public static function insert_titles_to_semalt_table_on_activate_plugin() {
        require_once SEMALT_SEO_PATH . 'includes/class-semalt-seo-meta-scraper.php';
        $MetaScraper = new Semalt_SEO_Meta_Scraper();
        $MetaScraper->truncateTableBeforeInsert();
        $MetaScraper->insertTitleListToDataBase();
    }
    /* End: semalt META generation */

}
