/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
'use strict';

/**
 * social-sharing.js
 * @fileOverview Contains the Social Page Sharing module
 * @version 0.2.0.0
 * @copyright 2021 Centers for Disease Control
 */

(function ($) {
	var isProd = !window.location.hostname.match(/local|vvv|dev|test|stage|prototype/);

	var title = [$('main h1:first').text(), String(document.title).replace(/\s\|.*/, '')].shift();
	var url = [$('head link[rel="canonical"]').attr('href'), document.location.href].shift();

	// don't share non-prod urls, unless debugging
	url = isProd || CDC.Common.getParamSwitch('cdcdebug') ? url : 'https://www.cdc.gov';
	var props = {
		title: encodeURIComponent(title),
		url: encodeURIComponent(url),
	};
	var socialUrl = '';

	// Facebook
	socialUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + props.url;
	$('.page-share-facebook')
		.attr('href', socialUrl)
		.on('click', function (e) {
			$(this).trigger('metrics-capture', ['social-media-share-facebook', 'click']);
			e.preventDefault();
		});

	// Twitter
	socialUrl = 'http://twitter.com/share?url=' + props.url + '&text=' + props.title;
	$('.page-share-twitter')
		.attr('href', socialUrl)
		.on('click', function (e) {
			$(this).trigger('metrics-capture', ['social-media-share-twitter', 'click']);
			e.preventDefault();
		});

	// LinkedIn
	socialUrl = 'https://www.linkedin.com/shareArticle?url=' + props.url + '&title=' + props.title;
	$('.page-share-linkedin')
		.attr('href', socialUrl)
		.on('click', function (e) {
			$(this).trigger('metrics-capture', ['social-media-share-linkedin', 'click']);
			e.preventDefault();
		});
})(jQuery);
