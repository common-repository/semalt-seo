<?php

/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @link       https://semalt.com
 * @since      1.0.0
 *
 * @package    Semalt_Seo
 * @subpackage Semalt_Seo/admin/pages
 */

$default_kw_tops = [1,3,10,30,50,100];

?>
    <div class="wrap">

        <h1>Competitors</h1>

        <?php require_once SEMALT_SEO_PATH . 'admin/partials/semalt-seo-header.php'; ?>

        <div class="semalt-positions-block">
            <div class="semalt-positions-block-position">
                <span id="semalt-rank-position-number" class="position-number">0</span>
            </div>
            <div class="semalt-positions-block-info">
                <p class="heading">Position in the competitors rank</p>
                <p class="sub-heading"><span id="semalt-rank-keywords-count">0</span> keywords in TOP 100</p>
            </div>
        </div>


        <div class="semalt-seo-competitors-shared-keywords">

            <?php echo "<h2 class='mx3'>" . __( 'Shared keywords', 'header-keywords-on-top' ) . "</h2>"; ?>

            <div class="shared-keywords">

                <div class="shared-list">

                    <?php foreach($default_kw_tops as $item): ?>
                        <div class="shared-box">
                            <div class="header">
                                <p class="box-title">TOP <?php echo $item; ?></p>
                                <p id="semalt-competitors-increase-count-top<?php echo $item; ?>" class="kw-increase-count">0</p>
                            </div>
                            <div class="count-keywords">
                                <p id="semalt-competitors-keywords-count-top<?php echo $item; ?>">0</p>
                            </div>
                            <div class="footer">
                                <p class="kw">shared keywords</p>
                                <div id="semalt-competitors-arrow-style-top<?php echo $item; ?>" class="arrow-default">
                                    <svg height="15" width="13" viewBox="0 0 13 15" class=""><path id="semalt-competitors-arrow-color-top<?php echo $item; ?>" class="arrow-default-color" d="M7.76043 5.99865L7.76043 13.498C7.77256 13.6981 7.74189 13.8984 7.67045 14.0858C7.59902 14.2731 7.48843 14.4433 7.34601 14.585C7.20359 14.7267 7.03257 14.8367 6.84425 14.9078C6.65593 14.9789 6.45459 15.0094 6.25354 14.9973C6.05238 15.0096 5.85088 14.9793 5.66238 14.9083C5.47389 14.8373 5.30268 14.7273 5.1601 14.5856C5.01752 14.4439 4.9068 14.2736 4.83528 14.0861C4.76375 13.8987 4.73305 13.6982 4.7452 13.498L4.7452 5.99865L0.223082 5.99865L6.25209 1.05414e-06L12.2826 5.99865L7.76043 5.99865Z"/></svg>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>

                </div>

                <div class="preloader-shared-keywords">
                    <div class="sk-chase">
                        <div class="sk-chase-dot"></div>
                        <div class="sk-chase-dot"></div>
                        <div class="sk-chase-dot"></div>
                        <div class="sk-chase-dot"></div>
                        <div class="sk-chase-dot"></div>
                        <div class="sk-chase-dot"></div>
                    </div>
                </div>
            </div>

        </div>


        <div class="dynamics white-wrapper">
            <?php echo "<h2>" . __( 'Shared keywords dynamics', 'header-rankings' ) . "</h2>"; ?>

            <div class="competitors-dynamics-top-filter">
                <select id="competitors-dynamics-filter-select-top-count" class="select-box">
                    <option value="1">TOP 1</option>
                    <option value="3">TOP 3</option>
                    <option value="10">TOP 10</option>
                    <option value="30">TOP 30</option>
                    <option value="50">TOP 50</option>
                    <option value="100" selected>TOP 100</option>
                </select>
            </div>

            <div id="shared_keywords_dynamics" style="height: 400px;">
                <canvas id="shared_keywords_dynamics_canvas" width="600" height="400"></canvas>
            </div>

            <div class="preloader-chart">
                <div class="sk-chase">
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                </div>
            </div>
        </div>


        <div class="competitors-table white-wrapper">

            <div class="competitors-header">
                <?php echo "<h2>" . __( 'Competitors in Google TOP', 'header-rankings' ) . "</h2>"; ?>

                <div class="get-report">
<!--                    <button id="rankings-get-report-btn" class="btn">-->
<!--                        <i class="fas fa-download"></i> Get report-->
<!--                    </button>-->

                    <div id="rankings-report-modal" class="modal">

                        <div class="modal-content">
                            <div class="close-btn">
                                <span class="close">&times;</span>
                            </div>
                            <div class="modal-header">
                                <h3 class="header">Create report</h3>
                            </div>
                            <div class="content-inner">
                                <div class="data-header">
                                    <p class="report-data-header">Select data:</p>
                                </div>
                                <div class="radio-block rankings-report-radio-full-report-block">
                                    <input id="rankings-report-radio-full" class="report-radio-btn" type="radio" name="report-radio" value="1" checked>
                                    <label for="rankings-report-radio-full" class="report-radio-label">Full Report</label>
                                </div>
                                <div class="radio-block rankings-report-radio-keywords-block">
                                    <input id="rankings-report-radio-keywords" class="report-radio-btn" type="radio" name="report-radio" value="1">
                                    <label for="rankings-report-radio-keywords" class="report-radio-label">Keywords</label><br>
                                    <div class="number-of-keywords">
                                        <label for="rankings-report-number-of-keywords" class="report-radio-label">Number of keywords: </label>
                                        <input id="rankings-report-number-of-keywords" type="number" value="2000" min="1" max="10000" disabled>
                                    </div>
                                </div>
                                <div class="report-format">
                                    <p class="report-format-header">Select format:</p>
                                    <div class="format-actions">
                                        <button class="format-pdf-btn active">PDF</button>
                                        <button class="format-csv-btn">CSV</button>
                                    </div>
                                </div>
                                <div class="report-action-btns">
                                    <button class="report-cancel-btn">Cancel</button>
                                    <button class="report-download-btn"><i class="fas fa-download"></i> Download</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div id="competitors-websites-daterange">
                <p>Date</p>
                <div id="competitors-daterange-inner" class="daterange-wrapper pull-left">
                    <i class="fa fa-calendar"></i>&nbsp;
                    <span></span> <i class="fa fa-caret-down"></i>
                </div>
                <div class="clearfix"></div>
            </div>

            <div class="filters">
                <div class="title">
                    Filters:
                </div>
                <div class="filter filter-dropdown">
                    <div id="competitors-domain-filter-wrapper">
                        <input id="competitors-domain-filter-input" class="input-field" type="text" placeholder="Enter a full domain or its part">

                        <div id="competitors-domain-filter-block" class="params">
                            <div class="params-wrapper">
                                <div class="radio-group">
                                    <div class="radio-block disabled">
                                        <input id="competitors-website-filter-radio-1" class="radio-btn" type="radio" name="keyword-radio" value="1" disabled>
                                        <label for="competitors-website-filter-radio-1" class="radio-label">Domain contains</label>
                                    </div>
                                    <div class="radio-block disabled">
                                        <input id="competitors-website-filter-radio-2" class="radio-btn" type="radio" name="keyword-radio" value="2" disabled>
                                        <label for="competitors-website-filter-radio-2" class="radio-label">Doesn't contain</label>
                                    </div>
                                    <div class="radio-block">
                                        <input id="competitors-website-filter-radio-3" class="radio-btn" type="radio" name="keyword-radio" value="3" checked>
                                        <label for="competitors-website-filter-radio-3" class="radio-label">Exact match</label>
                                    </div>
                                </div>
                                <div class="action-btns">
                                    <div class="reset-btn">
                                        <button id="competitors-filter-domain-reset-btn" class="reset btn">Reset</button>
                                    </div>
                                    <div class="apply-btn">
                                        <button id="competitors-filter-domain-apply-btn" class="apply btn disallow">Apply</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="filter">
                    <select id="competitors-filter-select-top-count" class="select-box">
                        <option value="1">TOP 1</option>
                        <option value="3">TOP 3</option>
                        <option value="10">TOP 10</option>
                        <option value="30">TOP 30</option>
                        <option value="50">TOP 50</option>
                        <option value="100" selected>TOP 100</option>
                    </select>
                </div>
                <div class="filter">
                    <select  class="select-box" disabled>
                        <option value="default">Default</option>
                    </select>
                </div>
            </div>

            <table id="competitors-table">
                <tbody>
                <tr>
                    <th class="id">#</th>
                    <th id="totalCount" data-attr="0">Website (0)</th>
                    <th class="competitors-start-date"></th>
                    <th class="competitors-end-date"></th>
                </tr>
                </tbody>
            </table>

            <div class="preloader-competitors-table">
                <div class="sk-chase">
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                </div>
            </div>
        </div>

    </div>
<?php