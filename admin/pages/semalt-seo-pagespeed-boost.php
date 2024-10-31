<?php
global $wp;
require_once SEMALT_SEO_PATH . 'includes/class-semalt-seo-image-optimization.php';

$imageOptimization = new Semalt_SEO_Image_Optimization();
$numberOfOptimizedImages = $imageOptimization->countOfOptimizedImages;

// Disable image optimization for localhost projects
$error_msg = '';
$siteUrl = home_url( $wp->request );
$parsedURL = parse_url($siteUrl);
if ($parsedURL['host'] == 'localhost') {
    $error_msg = 'Error! Optimization of images is not possible on <b>localhost</b>.';
}

?>

<div class="wrap">
    <div class="title-auto-generation white-wrapper">
        <h2>Pagespeed Boost</h2>

        <div class="semalt-pagespeed-boost-tabs-wrapper">

            <ul class="tabs">
                <li class="tab-link current" data-tab="image-optimization">Image Optimization</li>
<!--                <li class="tab-link" data-tab="js-css-minification">Option #2</li>-->
            </ul>

            <div id="image-optimization" class="tab-content current">

                <?php if ($error_msg) { ?>
                    <div class="semalt-error-msg">
                        <p><?php echo $error_msg; ?></p>
                    </div>
                <?php } ?>

                <table class="semalt-pagespeed-tab-image-optimization">
                    <tbody>
                        <tr>
                            <th>
                                <p>Image Optimization</p>
                            </th>
                            <td>

                                <p>Number of optimized images: <b><?php echo $numberOfOptimizedImages; ?></b></p>

                                <div class="enable-image-optimization-checkbox">
                                    <input
                                            type="checkbox"
                                            id="enable-cron-image-optimization"
                                            <?php if ($error_msg) { ?> disabled <?php } ?>
                                    >
                                    <label for="enable-cron-image-optimization"> Enable image optimization</label><br>
                                </div>

                                <p><i> - the process of image optimization works in the background.</i></p>
                                <p><i> - number of images to be optimized is not limited.</i></p>

                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>Image sizes</p>
                            </th>
                            <td>
                                <div class="image-sizes">


                                    <p>Wordpress generates resized versions of every image.</p>
                                    <p><b>Optimization of resized versions will work after enabling <u>Image optimization</u></b></p>
                                    <div class="enable-image-sizes-optimization-checkbox">
                                        <input
                                                type="checkbox"
                                                id="enable-cron-image-optimization-sizes"
                                                <?php if ($error_msg) { ?> disabled <?php } ?>
                                        >
                                        <label for="enable-cron-image-optimization-sizes"> Enable image optimization for resized version</label><br>
                                    </div>

                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <p>Automatic generation of alt and title</p>
                            </th>
                            <td>
                                <p>Enable automatic generation of alt and title for all images on the site.</p>
                                <div class="images-auto-generation-alt-title">
                                    <input type="checkbox" id="enable-auto-generation-alt-title">
                                    <label for="enable-auto-generation-alt-title">Enable automatic generation</label>
                                </div>

                                <div class="disable-update-existing-alt-title-wrapper">
                                    <input type="checkbox" id="disable-update-existing-alt-title">
                                    <label for="disable-update-existing-alt-title">Disable update of existing alt & title</label>
                                </div>

                            </td>
                        </tr>
                    </tbody>
                </table>

                <div class="semalt-image-optimization-send-form-btn">
                    <button id="semalt-image-optimization-send-form">Save changes</button>
                    <div class="clearfix"></div>
                </div>

                <div class="semalt-seo-msg-success">The settings have been successfully updated.</div>



                <!--                <p style="text-decoration: underline;"><b>Pictures will be optimized in the background. <br>The time of image optimization depends on the number of images.</b></p>-->




            </div>
<!--            <div id="js-css-minification" class="tab-content">
                <h2>JS & CSS Minification</h2>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </div>-->

        </div>

    </div>
</div>
