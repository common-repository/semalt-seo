<?php

class Semalt_SEO_Image_Optimization {
    public $domain;
    public $cdn = 'http://api.jetpic.net/shrink';
    public $countOfOptimizedImages;
    public $optimizedImageList = [];
    public $notOptimizedImageList = [];
    public $error_msg;

    private $imageOptimizationLimit = 50;
    private $optimizeResizedVersion = 'disabled';
    private $imageSizes;
    private $token;
    private $tableName;
    private $wpdb;
    private $logMode = false;

    public function __construct()
    {
        global $table_prefix, $wpdb;

        $this->wpdb = $wpdb;
        $this->tableName = $table_prefix . 'semalt_seo_cdn';
        $this->domain = $_SERVER['SERVER_NAME'];

        if (get_option('semalt_option_cdn_auth_key')) {
            $this->token = get_option('semalt_option_cdn_auth_key');
        }

        if (get_option('semalt_option_cron_image_optimization_sizes')) {
            $this->optimizeResizedVersion = get_option('semalt_option_cron_image_optimization_sizes');
        }

        $this->imageSizes = get_intermediate_image_sizes();

        $this->getTheNumberOfOptimizedImages();
    }

    public function getNotOptimizedImageURLs()
    {
        $table = $this->tableName;
        $imageURLs = [];
        $counter = 0;

        $query_args = array(
            'post_type' => 'attachment',
            'post_mime_type' => array(
                'jpg|jpeg' => 'image/jpeg',
                'png' => 'image/png',
            ),
            'post_status' => 'inherit',
            'posts_per_page' => -1,
        );
        $images = new WP_Query($query_args);


        if ($images->post_count > 0) {

            foreach ($images->posts as $image) {

                if ($counter >= $this->imageOptimizationLimit) {
                    $this->notOptimizedImageList = $imageURLs;

                    $this->log("Total number of pictures found: " . count($imageURLs));
                    return;
                }

                $imageURL = wp_get_attachment_url($image->ID);

                if ($imageURL) {
                    $this->log("Starting looking for unoptimized images...");
                        $tempImageSizesArray = [];

                        $isOptimized = $this->isOptimized($imageURL);
                        if (!$isOptimized) {

                            $this->log("New unoptimized image found: $imageURL");
                            $tempImageSizesArray[] = $imageURL;
                        }

                        if ($this->optimizeResizedVersion == 'enabled') {
                            foreach ($this->imageSizes as $size) {
                                $imageURLSize = wp_get_attachment_image_url($image->ID, $size);

                                if ($imageURLSize != $imageURL) {

                                    $isOptimized = $this->isOptimized($imageURLSize);
                                    if (!$isOptimized) {
                                        $this->log("New unoptimized image found (resized): $imageURLSize");
                                        $tempImageSizesArray[] = $imageURLSize;
                                        $counter++;
                                    }
                                }
                            }
                        }

                        $imageURLs[] = array_unique($tempImageSizesArray);
//                    }
                }
            }

            if ( count($imageURLs) == 0 ) {
                $this->log("No unoptimized images found.");
            }
            $this->notOptimizedImageList = $imageURLs;

        } else {
            $this->log("No image posts found.");
        }
    }

    public function makeOptimizationForNotOptimizedImages() {

        $auth = base64_encode("api:$this->token");
        $error = '';

        $context = array(
            'headers' => array(
                'Authorization' => 'Basic ' . $auth
            )
        );


//        $start = microtime(true);

        if ( count($this->notOptimizedImageList) > 0 ) {

            foreach ($this->notOptimizedImageList as $images) {
                $tempOptimizedImagesArray = [];
                foreach ($images as $image) {

                    $parsedURL = parse_url($image);
                    if ($parsedURL['host'] == 'localhost') {
                        $error = 'Image optimization is not supported on localhost.';
                    }

                    if (!$error) {
                        $request_url = "$this->cdn?image=$image";
                        $optimizedURLsJSON = wp_remote_retrieve_body(wp_remote_get($request_url, $context));
                        $optimizedURLs = json_decode($optimizedURLsJSON);

                        if ($optimizedURLs) {
                            $optimizedImageURL = $optimizedURLs->url[1];
                            $optimizedImageURLWebp = $optimizedURLs->url[2];

                            if ($optimizedImageURL && $optimizedImageURLWebp) {
                                $tempOptimizedImagesArray[] = ['original' => $image, 'optimized' => $optimizedImageURL, 'optimized_webp' => $optimizedImageURLWebp, 'st' => 1];
                            }

                        } else {
                            $tempOptimizedImagesArray[] = ['original' => $image, 'optimized' => '', 'optimized_webp' => '', 'st' => 2];
                        }
                    }

                }

                if ($tempOptimizedImagesArray) {
                    $this->optimizedImageList[] = $tempOptimizedImagesArray;
                }

            }

            $this->log("makeOptimizationForNotOptimizedImages method is done.");
        }
//        $time_exec = microtime(true) - $start;
//        echo ' - time exec: ' . $time_exec;
    }

    public function getTheTotalNumberOfImages($debug) {
        $query_img_args = array(
            'post_type' => 'attachment',
            'post_mime_type' =>array(
                'jpg|jpeg' => 'image/jpeg',
                'png' => 'image/png',
            ),
            'post_status' => 'inherit',
            'posts_per_page' => -1,
        );
        $images = new WP_Query( $query_img_args );

        $response = [];
        $totalCount = 0;
        $totalCountResized = 0;
        $imageURLs = [];
        $tempImageSizesArray = [];

        foreach ($images->posts as $image) {
            $imageURL = wp_get_attachment_url( $image->ID );

            if ($imageURL) {
                $imageURLs[] = $imageURL;

                $tempImageSizesArray[] = $imageURL;
                foreach ($this->imageSizes as $size) {
                    $imageURLSize = wp_get_attachment_image_url($image->ID, $size);

                    if ($imageURLSize != $imageURL) {
                        $tempImageSizesArray[] = $imageURLSize;
                    }
                }
            }
        }

        $totalCount = count(array_unique($imageURLs));
        $totalCountResized = count(array_unique($tempImageSizesArray));

        $response = ['total' => $totalCount, 'totalResized' => $totalCountResized];

        if ($debug) {
            $optimizedImages = $this->getOptimizedImageList();
            $allImagesListOnTheSite = [];

            foreach ($tempImageSizesArray as $image) {
                $allImagesListOnTheSite[] = $image;
            }
            $allImagesListOnTheSite = array_unique($allImagesListOnTheSite);
            $diff = array_diff($allImagesListOnTheSite, $optimizedImages);
            $response['debug_count'] = count($diff);
            $response['debug'] = $diff;
        }
        return $response;
    }

    public function getTheNumberOfOptimizedImages() {
        $table = $this->tableName;
        $this->countOfOptimizedImages = intval( $this->wpdb->get_var("SELECT COUNT(id) FROM $table") );
    }

    public function getOptimizedImageList() {
        $table = $this->tableName;
        $urls = $this->wpdb->get_results("SELECT original FROM $table", "ARRAY_N");
        $response = [];
        foreach ($urls as $url) {
            $response[] = $url[0];
        }
        return $response;
    }

    public function deleteEmptyRows() {
        $table = $this->tableName;
        $this->wpdb->delete( $table, array('original' => '') );
    }

    public function isOptimized($image) {
        $response = false;
        $table = $this->tableName;
        $isOptimized = $this->wpdb->get_results("SELECT original FROM $table WHERE original = '".$image."'");
        if ($isOptimized) {
            $response = true;
        }
        return $response;
    }

    public function log($msg) {
        if ($this->logMode === true) {
            $logs_file = SEMALT_SEO_PATH . "logs.txt";
            $current_logs = file_get_contents($logs_file);
            $current_logs .= date("Y-m-d h:i:sa") . " - $msg \n";
            file_put_contents($logs_file, $current_logs);
        }
    }

    public function insertImageListToDataBase() {

        if ($this->optimizedImageList) {

            $table = $this->tableName;
            foreach ($this->optimizedImageList as $optimizedImageSizes) {

                if (!$optimizedImageSizes[0]['original']) {
                    return false;
                }


                $isOptimized = $this->isOptimized($optimizedImageSizes[0]['original']);
                if (!$isOptimized) {

                    if (count($optimizedImageSizes) > 1) {
                        $parent_id = 0;

                        foreach ($optimizedImageSizes as $key => $item) {

                            if ( $item['original'] && $item['optimized'] && $item['optimized_webp'] ) {
                                if ($key == 0) {
                                    $query = "INSERT INTO `$table` (original, cdn_compressed, cdn_webp_compressed, parent_id, st) VALUES ( '" . $item['original'] . "', '" . $item['optimized'] . "', '" . $item['optimized_webp'] . "', 0,'" . $item['st'] . "' )";
                                    $this->wpdb->query($query);

                                    $parent_id = $this->wpdb->insert_id;
                                } else {
                                    $query = "INSERT INTO `$table` (original, cdn_compressed, cdn_webp_compressed, parent_id, st) VALUES ( '" . $item['original'] . "', '" . $item['optimized'] . "', '" . $item['optimized_webp'] . "', " . $parent_id . ",'" . $item['st'] . "' )";
                                    $this->wpdb->query($query);
                                }
                            }
                        }

                    } else {

                        if ( $optimizedImageSizes[0]['original'] && $optimizedImageSizes[0]['optimized'] && $optimizedImageSizes[0]['optimized_webp'] ) {
                            $query = "INSERT INTO `$table` (original, cdn_compressed, cdn_webp_compressed, parent_id, st) 
                            VALUES ( '" . $optimizedImageSizes[0]['original'] . "', '" . $optimizedImageSizes[0]['optimized'] . "', '" . $optimizedImageSizes[0]['optimized_webp'] . "', 0,'" . $optimizedImageSizes[0]['st'] . "' )";
                            $this->wpdb->query($query);
                        }

                    }
                }
            }

            if ($this->wpdb->last_error) {
                echo $this->wpdb->last_error;
            }
        }
    }

    public function runCronImageOptimization() {
        if (!get_option('semalt_cron_status')) {
            add_option('semalt_cron_status', 'processing');
        } else {
            update_option('semalt_cron_status', 'processing');
        }

        $this->deleteEmptyRows();

        $this->getNotOptimizedImageURLs();

        $this->makeOptimizationForNotOptimizedImages();

        $this->insertImageListToDataBase();

        update_option('semalt_cron_status', 'completed'); 
    }
}
