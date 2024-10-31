<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://semalt.com
 * @since      1.0.0
 *
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/public
 * @author     Semalt SEO <company@semalt.com>
 */
class Semalt_Seo_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */

	private $table_prefix;

	private $wpdb;

	private $table;

	public $imageURLs;

	public function __construct( $plugin_name, $version ) {
        global $table_prefix, $wpdb;

        $this->table_prefix = $table_prefix;
        $this->wpdb = $wpdb;

		$this->plugin_name = $plugin_name;
		$this->version = $version;

		$this->table = $table_prefix . 'semalt_seo_titles';

        $this->semalt_seo_update_content();
	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

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

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/semalt-seo-public.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

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

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/semalt-seo-public.js', array( 'jquery' ), $this->version, false );

	}

	public function semalt_seo_update_content() {

        add_action('wp_head', array($this, 'buffer_start'), 0 );
        add_action('wp_footer', array($this, 'buffer_end'), 9999 );
    }

    public function get_browser() {
        $arr_browsers = ["Opera", "Edge", "Chrome", "Safari", "Firefox", "MSIE", "Trident"];

        $agent = $_SERVER['HTTP_USER_AGENT'];

        $user_browser = '';
        foreach ($arr_browsers as $browser) {
            if (strpos($agent, $browser) !== false) {
                $user_browser = $browser;
                break;
            }
        }

        switch ($user_browser) {
            case 'MSIE':
                $user_browser = 'IE';
                break;

            case 'Trident':
                $user_browser = 'IE';
                break;

            case 'Edge':
                $user_browser = 'Microsoft Edge';
                break;
        }

        return $user_browser;
    }

    public function buffer_start() {
	    ob_start(array($this, 'callback_func'));
	}

    public function buffer_end() {
	    ob_end_flush();
	}

    public function callback_func($buffer) {
        // modify buffer here, and then return the updated code

        // Get current browser for set requirement image
        $browser = $this->get_browser();

        /*
         * Get all images that exists on page
         */
        preg_match_all('/(?:http(?:s?):)(?:[\/|.|\w|а-яА-ЯёЁ|\s|-])*\.(?:jpg|jpeg|png)/',$buffer, $matches);
        $imageURLs = array_unique($matches[0]);

        /*
         * Implement alt & title tags for every image on the website
         */
        if ( get_option('semalt_option_image_alt_title_generation') && get_option('semalt_option_image_alt_title_generation') === 'enabled' ) {

            $imagesPattern = "/<img[^>]*>/";
            preg_match_all($imagesPattern, $buffer, $images);

            foreach ($images[0] as $imageHtml) {
                $post_id = 0;
                $original_title = '';
                $stable_title = '';

                preg_match('/src="(.*?)"/', $imageHtml, $src);

                $imageSrc = $this->removeImageWidthAndHeightFromURL($src[1]);

                if ( attachment_url_to_postid($imageSrc) != 0 ) {
                    $post_id = attachment_url_to_postid($imageSrc);
                    $parent_id = wp_get_post_parent_id($post_id);
                    if ( $parent_id != 0 ) {
                        $original_title = get_the_title($parent_id);
                    }
                } else {
                    $path_info = pathinfo($imageSrc);
                    $filename = $path_info['filename'];

                    $table_name = $this->table_prefix . 'posts';
                    $parent_id_arr = $this->wpdb->get_col( $this->wpdb->prepare( "SELECT post_parent FROM $table_name WHERE post_title = %s", $filename ) );
                    $parent_id = $parent_id_arr[0];
                    $original_title = get_the_title($parent_id);
                }

                if ($original_title != '') {
                    $stable_title = $original_title;
                } else {
                    $stable_title = get_the_title();
                }

                $regex = '/alt="(.*?)"/';
                preg_match($regex, $imageHtml, $match);

                if ( get_option('semalt_option_image_alt_title_disable_update_existing') === 'disabled' ||
                    (get_option('semalt_option_image_alt_title_disable_update_existing') === 'enabled' && strlen($match[1]) < 3) ) {
                    $seoImage = $this->insertAltToImage($imageHtml, $stable_title );
                    $seoImage = $this->insertTitleToImage($seoImage, $stable_title );
                } else {
                    $seoImage = $imageHtml;
                }

                $buffer = str_replace($imageHtml, $seoImage, $buffer);
            }
        }

        /*
         * Get all optimized images from db based on images that exists on page
         */
        $optimizedImages = $this->get_semalt_cdn_optimized_images($imageURLs);

        foreach ($optimizedImages as $image) {

            if ( $image['st'] == 1 ) {
                $original = $image['original'];

                if (($browser == 'IE') || ($browser == 'Safari')) {
                    $cdn = '//'.$image['cdn'];
                } else {
                    $cdn = '//'.$image['webp'];
                }

                if (strpos($original, 'http://') !== FALSE) {
                    $original = substr($original, 7);
                } elseif (strpos($original, 'https://') !== FALSE) {
                    $original = substr($original, 8);
                }

                $original = addcslashes($original, '/');
                $pattern = "/(https|http):\/\/$original/";

                $buffer = preg_replace( $pattern, $cdn, $buffer );
            }
        }

        // get semalt SEO title for current page
/*
        $semalt_title = $this->get_semalt_title_for_current_page();
        if ($semalt_title) {
            $buffer = preg_replace( '/<title.*?\/title>/i', '<title>' . esc_html( $semalt_title ) . '</title>', $buffer );
        }*/

        return $buffer;
    }

    public function removeImageWidthAndHeightFromURL($image_url) {
	    $image_without_width_and_height = preg_replace('/-\d+[Xx]\d+\./', '.', $image_url, 1);
	    return $image_without_width_and_height;
    }

    public function insertAltToImage($image, $alt) {
	    $imageWithAlt = '';

        if ( strpos($image, "alt=") != FALSE ) {
            $pattern = '/alt="(.*?)"/';
            $replecement = 'alt="'.$alt.'"';
            $imageWithAlt = preg_replace($pattern, $replecement, $image);
        }  else {
            $pattern = '/>/';
            $replecement = ' alt="'.$alt.'">';
            $imageWithAlt = preg_replace($pattern, $replecement, $image);
        }

        return $imageWithAlt;
    }

    public function insertTitleToImage($image, $title) {
        $imageWithTitle = '';

        if ( strpos($image, "title=") != FALSE ) {
            $pattern = '/title="(.*?)"/';
            $replecement = 'title="'.$title.'"';
            $imageWithTitle = preg_replace($pattern, $replecement, $image);
        }  else {
            $pattern = '/>/';
            $replecement = ' title="'.$title.'">';
            $imageWithTitle = preg_replace($pattern, $replecement, $image);
        }

        return $imageWithTitle;
    }

    public function get_semalt_title_for_current_page() {
        $table_name = $this->table_prefix . 'semalt_seo_titles';

        $actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

        $sql = "SELECT title FROM $table_name WHERE (url = '$actual_link' AND st = 1)";
        $result = $this->wpdb->get_results($sql);

        if ($result[0]) {
            return $result[0]->title;
        }
    }

    public function get_semalt_cdn_optimized_images($imageURLs) {

        $table_name = $this->table_prefix . 'semalt_seo_cdn';
        $optimizedImages = [];

        foreach ( $imageURLs as $image ) {
            $query = "SELECT * FROM $table_name WHERE original = '$image'";
            $result = $this->wpdb->get_results($query);

            if ($result[0]) {
                $original = $result[0]->original;
                $optimized = $result[0]->cdn_compressed;
                $optimized_webp = $result[0]->cdn_webp_compressed;
                $st = $result[0]->st;

                $optimizedImages[] = ['original' => $original, 'cdn' => $optimized, 'webp' => $optimized_webp, 'st' => $st];
            }
        }

        return $optimizedImages;
    }

}
