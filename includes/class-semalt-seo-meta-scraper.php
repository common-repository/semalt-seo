<?php

class Semalt_SEO_Meta_Scraper
{
    public $titleListUrl = 'http://wp.semalt.com/t.php';
    public $domain;
    private $titleList = [];
    private $tableName;
    private $wpdb;

    public function __construct()
    {
        $this->domain = $_SERVER['SERVER_NAME'];
        $this->getTitleList();

        global $table_prefix, $wpdb;

        $this->wpdb = $wpdb;
        $this->tableName = $table_prefix . 'semalt_seo_titles';
    }

    public function getTitleList() {
        $params = [
            'site' => $this->domain,
            'maxpos' => 101
        ];
        $uri = $this->titleListUrl . '?' . http_build_query($params) ;

        $response = wp_remote_retrieve_body( wp_remote_get( $uri ) );

        if ($response) {
            $this->titleList = json_decode($response);
        }
    }

    public function insertTitleListToDataBase() {
        $list = $this->titleList;
        $table = $this->tableName;
        $wpdb = $this->wpdb;
        if ($list) {

            foreach ($list as $item) {
                $id = md5($item->page);
                $query = "INSERT INTO `$table` (id, title, url, st) 
                    VALUES ( '" . $id . "', '{$item->title}', '{$item->page}', {$item->st} ) 
                    ON DUPLICATE KEY UPDATE title = '{$item->title}', st = '{$item->st}'; ";
                $wpdb->query($query);
            }

            if ($wpdb->last_error) {
                echo $wpdb->last_error;
            }
        }
    }

    public function truncateTableBeforeInsert() {
        $table = $this->tableName;
        $wpdb = $this->wpdb;

        $query = "TRUNCATE TABLE `$table`";
        $wpdb->query($query);

        if ($wpdb->last_error) {
            echo $wpdb->last_error;
        }
    }
}
