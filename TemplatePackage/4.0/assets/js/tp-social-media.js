/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
'use strict';

/**
 * tp-social-media.js
 * @fileOverview Social Media Module
 * @copyright 2018 Centers for Disease Control
 * @version 0.2.0.0
 */

( function( $, window, document, undefined ) {

	var pluginName = 'cdc_social_media',
		mediaId = '199',
		defaults = {
			urls: {
				podcast: `https://www2c.cdc.gov/podcasts/feed.asp?feedid=${ mediaId }&format=jsonp`,
				cs: `https://tools.cdc.gov/api/v2/resources/media/${ mediaId }.rss`
			}
		};

	function CDCPlugin( element, options ) {
		this.element = element;
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	CDCPlugin.prototype = {
		init: function() {
			//var defaults   = this._defaults,
			var t = this;
			t.parseAttributes( t );
		},

		parseAttributes: function( t ) {
			var $parents = $( 'div[data-mediaid][data-url]' ),
				feedUrl,
				parseFeed;

			$parents.each( function( i, e ) {

				// Assign this parent for parse/append reference
				var $parent = $( e );

				// Set up an Options Obj from data-attrs
				let feedOptions = {
					mediaId: $( e ).attr( 'data-mediaid' ),
					entries: $( e ).attr( 'data-entries' ),
					header: $( e ).attr( 'data-header' ),
					title: $( e ).attr( 'data-title' ),
					url: $( e ).attr( 'data-url' ),
					cdcUrl: $( e ).attr( 'data-cdc-url' ),
					cdcTitle: $( e ).attr( 'data-cdc-title' )
				};

				// Check media id to append correct feed endpoint (Podcast Url or CS Url)
				feedUrl = 1000 > parseInt( feedOptions.mediaId, 10 ) ? `https://www2c.cdc.gov/podcasts/feed.asp?feedid=${ feedOptions.mediaId }` : `https://tools.cdc.gov/api/v2/resources/media/${ feedOptions.mediaId }.rss`;

				// Check endpoint to parse correct social source (Facebook, Twitter)
				$.ajax( {
					url: feedUrl,
					jsonp: 'callback',
					dataType: 'jsonp',
					data: {
						format: 'json'
					},

					success: function( feed ) {
						parseFeed = feed;

						// Is it a Facebook feed?
						if ( parseFeed.hasOwnProperty( 'data' ) ) {
							t.parseFacebook( $parent, feed, feedOptions );
						} else if ( parseFeed.hasOwnProperty( 'statuses' ) ) {
							// Is it a Twitter feed?
							t.parseTwitter( $parent, feed, feedOptions );
						} else {
							console.log( 'Cannot parse Social Media Feed!' );
						}
					}
				} );
			} );
		},

		parseFacebook: function( $parent, feed, feedOptions ) {

			var t = this;

			// Regex for link styling
			var _urlExpression  = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
				_mentionExpression  = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/gim,
				_regex,
				_post;

			// Actual Markup of Component
			let wrapperMarkup = `
				<div class="cdc-mod cdc-socialMedia">
					<div class="socialMediaFeeds mb-3 card col-md-12">

						<div class="socl-hd card-header">
							<span class="x24 float-left fill-tw cdc-icon-fb-round"></span>
							<h4 class="float-left">${ feedOptions.header }</h4>
						</div>

						<div class="facebook-feed-entry card-body">

							<div class="socl-loader-graphic"></div>
							<div class="socl-bd">
								<div class="socl-comment-wrap">
									<div class="socl-avatar">
										<div class="socl-img"></div>
									</div>
									<div class="socl-comment-text">
										<div class="feed-header">
											<a href="${ feedOptions.url }">${ feedOptions.title }</a>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="card-footer">
							<a class="td-ul td-ul-none-hover" href="${ feedOptions.cdcUrl }">${ feedOptions.cdcTitle }</a>
						</div>

					</div>
				</div>
			`;

			// Append Dynamic Wrapper Markup
			$parent.append( wrapperMarkup );

			// Parse and Append Each "post"
			for ( var i = 0; i < feed.data.length && i < feedOptions.entries; i++ ) {

				// Regex URLs
				_post = feed.data[ i ].message;
				_regex = new RegExp( _urlExpression );
				if ( _post.match( _regex ) ) {
					_post = _post.replace( _regex, '<a href="$1">$1</a>' );
				}

				let postMarkup = `
					<div class="post">
						${ _post }
					</div>`;

				// Prepend posts
				$( $parent ).find( '.facebook-feed-entry .socl-comment-text' ).append( postMarkup );
			}
		},

		parseTwitter: function( $parent, feed, feedOptions ) {

			var t = this;

			// Regex for @mentions and link styling
			var _urlExpression      = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
				_mentionExpression  = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/gim,
				_regex,
				_post;

			// Actual Markup of Component
			let wrapperMarkup = `
				<div class="cdc-mod cdc-socialMedia">
					<div class="socialMediaFeeds mb-3 card col-md-12">

						<div class="socl-hd card-header">
							<span class="x24 float-left fill-fb cdc-icon-twitter-round"></span>
							<h4 class="float-left">${ feedOptions.header }</h4>
						</div>

						<div class="twitter-feed-entry card-body">

							<div class="socl-loader-graphic"></div>
							<div class="socl-bd">
								<div class="socl-comment-wrap">
									<div class="socl-avatar">
										<div class="socl-img"></div>
									</div>
									<div class="socl-comment-text">
										<div class="feed-header">
											<a href="${ feedOptions.url }">${ feedOptions.title }</a>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="card-footer">
							<a class="td-ul td-ul-none-hover" href="${ feedOptions.cdcUrl }">${ feedOptions.cdcTitle }</a>
						</div>

					</div>
				</div>
			`;

			// Append Dynamic Wrapper Markup
			$parent.append( wrapperMarkup );

			// Regex for @mentions and link styling
			for ( var i = 0; i < feed.statuses.length && i < feedOptions.entries; i++ ) {

				// if this is a retweet, use the retweet text and prepend the RT @ screenname
				if ( 'undefined' !== typeof feed.statuses[ i ].retweeted_status ) {
					_post = 'RT @' + feed.statuses[ i ].retweeted_status.user.screen_name + ': ' + feed.statuses[ i ].retweeted_status.text;

				} else {
					_post = feed.statuses[ i ].text;
				}

				_regex = new RegExp( _urlExpression );
				if ( _post.match( _regex ) ) {
					_post = _post.replace( _regex, '<a href="$1">$1</a>' );
				}

				// Regex @Mentions
				_regex = new RegExp( _mentionExpression );
				if ( _post.match( _regex ) ) {
					_post = _post.replace( _regex, ' <a href="https://twitter.com/$1">@$1</a> ' );
				}

				let postMarkup = `
					<div class="post">
						${ _post }
					</div>`;

				// Prepend posts
				$( $parent ).find( '.twitter-feed-entry .socl-comment-text' ).append( postMarkup );
			}
		}
	};
	// don't let the plugin load multiple times
	$.fn[ pluginName ] = function( options ) {
		return this.each( function() {
			if ( ! $.data( this, 'plugin_' + pluginName ) ) {
				$.data( this, 'plugin_' + pluginName, new CDCPlugin( this, options ) );
			}
		} );
	};

} )( jQuery, window, document );

