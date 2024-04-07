/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
/**
 * tp-events - renders event calendars
 * This is a legacy JS, disabling camelcase check
 */

/* eslint-disable camelcase */
var _typeof = 'function' === typeof Symbol && 'symbol' === typeof Symbol.iterator ? function( obj ) {
	return typeof obj;
} : function( obj ) {
	return obj && 'function' === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj;
};

var days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
var monthNames = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
var cdc_external_link_exclude_domains = [ 'cdc.gov', 'localhost', 'facebook.com', 'twitter.com', 'linkedin.com', 'pinterest.com', 'youtube.com', 'youtube-nocookie.com', 'plus.google.com', 'instagram.com', 'flickr.com', 'tumblr.com' ];

function is_url_external( url ) {
	var $external = true;

	//Check against excluded domains
	if ( $external ) {
		//If domain is on exclude list, not external
		for ( var i = 0; i < cdc_external_link_exclude_domains.length; i++ ) {
			if ( 0 < url.indexOf( cdc_external_link_exclude_domains[ i ] ) ) {
				$external = false;
				break;
			}
		}
	}
	return $external;
}

function truncate( str, no_words ) {
	return str.split( /\s(?=\w)/ ).splice( 0, no_words ).join( ' ' );
}

function getUTCNow() {
	var now = new Date();
	var time = now.getTime();
	var offset = now.getTimezoneOffset();
	offset *= 60000;
	return time - offset;
}

/**
 * Given a GMT date object, add a time value
 * @param date Date   Date object
 * @param time String Time value in HH:MM format, optionally including am / pm
 * @returns {Date|false} Date, or false if no Date object given
 */
function addTimeToGMTDate( date, time ) {
	var timeMatch = /(\d+):(\d+)\s*(am|pm|)/i;
	var datestring = date.toGMTString().replace( /\d\d:\d\d:\d\d/, time );
	// date must be a Date object
	if ( ! ( date instanceof Date ) ) {
		return false;
	}
	// time must be in a H:MM format, and can include AM or PM
	if ( ! time || ! timeMatch.test( time ) ) {
		return date;
	}
	if ( 'string' !== typeof time ) {
		time = time.toString();
	}
	time = time.replace( timeMatch, '$1:$2 $3' ).toUpperCase();
	// return new parsed date with time
	return new Date( Date.parse( datestring.replace( /\d\d:\d\d:\d\d/, time ) ) );
}

function getParameterByName( name, url ) {
	if ( ! url ) {
		url = window.location.href;
	}
	name = name.replace( /[\[\]]/g, '\\$&' );
	var regex = new RegExp( '[?&]' + name + '(=([^&#]*)|&|#|$)' ),
		results = regex.exec( url );
	if ( ! results ) {
		return null;
	}
	if ( ! results[ 2 ] ) {
		return '';
	}
	return decodeURIComponent( results[ 2 ].replace( /\+/g, ' ' ) );
}

function cutString( s, n ) {
	var cut = s.indexOf( ' ', n );
	if ( -1 === cut ) {
		return s;
	}
	return s.substring( 0, cut );
}

function firstDayInPreviousMonth( date ) {
	return new Date( date.getFullYear(), date.getMonth() - 1, 1 );
}

function lastDayInPreviousMonth( date ) {
	return new Date( date.getFullYear(), date.getMonth(), 0 );
}

function firstDayInNextMonth( date ) {
	return new Date( date.getFullYear(), date.getMonth() + 1, 1 );
}

function lastDayInNextMonth( date ) {
	return new Date( date.getFullYear(), date.getMonth() + 2, 0 );
}

var cdcEvent = {
	rows: 10,
	cat_id: null,
	event_id: null,
	category: '',
	current_page: 0,
	solrFields: 'id,title,cdc_related_image_str,permalink,cdc_event_start_date_txt,cdc_event_end_date_txt,cdc_event_start_date_str,cdc_event_start_time_str,cdc_event_end_date_str,cdc_event_end_time_str,cdc_event_start_date_dt,cdc_event_end_date_dt,cdc_website_url_str,cdc_address_one_str,cdc_address_two_str,cdc_city_str,cdc_state_str,cdc_postal_code_str,cdc_phone_str,cdc_organizer_str,cdc_organizer_email_str,cdc_include_links_to_campus_maps_str,cdc_organizer_phone_str,cdc_organizer_url_str,cdc_venue_url_str,content_rend_t,title,cdc_event_category_srch,cdc_event_category_str,cdc_website_url_text_str,excerpt_txt,cdc_show_add_to_calendar_str',

	/**
	 * Init method to fetch query params
	 */
	init: function init() {
		var cdcEventConfig = window.cdcEventConfig || {};
		cdcEvent.categories = cdcEventConfig.categories;
		cdcEvent.current_page = parseInt( getParameterByName( 'current_page' ) || 0 );
		cdcEvent.cat_id = getParameterByName( 'cat_id' ) || cdcEventConfig.cat_id || null;
		// if cat_id must be positive to populate category value
		if ( cdcEvent.cat_id && 0 < cdcEvent.cat_id ) {
			cdcEvent.category = getParameterByName( 'category' ) || cdcEventConfig.category || '';
		}
		cdcEvent.event_id = getParameterByName( 'storageid' ) || null;

		// Look for event_module to trigger render of Events / Calendar
		if ( $( '#event_module' ).length ) {
			if ( ! cdcEvent.event_id ) {
				// render Calendar view
				cdcEvent.getCalendar();
			} else {
				// render Event view
				cdcEvent.getEvent();
			}
		}
	},

	/**
	 * Get base url path
	 * @param object params Query params to pass
	 * @returns {string}
	 */
	getURL: function getURL( params ) {
		var path = [];
		var defaults = {};
		if ( cdcEvent.cat_id ) {
			defaults.cat_id = cdcEvent.cat_id;
		}
		if ( cdcEvent.category ) {
			defaults.category = cdcEvent.category;
		}
		if ( cdcEvent.current_page ) {
			defaults.current_page = cdcEvent.current_page;
		}
		params = $.extend( defaults, params );
		$.each( params, function( key, value ) {
			if ( null !== value ) {
				path.push( key + '=' + encodeURI( value ) );
			}
		} );
		return '?' + path.join( '&' );
	},

	/**
	 * Perform SOLR query for events
	 * @param Array query Query parameters to pass to SOLR
	 * @returns jQuery AJAX Deferred Object
	 */
	solrQuery: function solrQuery( query ) {
		var site_id = window.site_id || 1;
		var parts = [];
		var solr_host = window.solr_url_prefix || '//' + location.hostname + ':8983/solr/wcms_front_end_core';
		var url = solr_host + '/select?';
		var queryDefaults = {
			fq: {
				site_id: site_id
			},
			type: 'cdc_event',
			rows: cdcEvent.rows,
			q: '*:*',
			wt: 'json',
			_: Number( new Date() )
		};

		// if cat_id set, update base filter query
		if ( cdcEvent.cat_id && 0 < cdcEvent.cat_id ) {
			// check for child cat ids
			if ( cdcEventConfig && cdcEventConfig.cat_children && cdcEventConfig.cat_children[ cdcEvent.cat_id ] ) {
				queryDefaults.fq.cdc_event_category_str = '(' + cdcEventConfig.cat_children[ cdcEvent.cat_id ].join( ' OR ' ) + ')';
			} else {
				queryDefaults.fq.cdc_event_category_str = Number( cdcEvent.cat_id );
			}
		}

		query = $.extend( true, query, queryDefaults );
		$.each( query, function( field, value ) {
			if ( 'object' === ( 'undefined' === typeof value ? 'undefined' : _typeof( value ) ) ) {
				$.each( value, function( field2, value2 ) {
					parts.push( field + '=' + field2 + ':' + value2 );
				} );
			} else {
				parts.push( field + '=' + value );
			}
		} );
		url += parts.join( '&' );
		return $.ajax( {
			type: 'GET', // define the type of HTTP verb we want to use (POST for our form)
			url: url,
			encode: true,
			cache: false,
			dataType: 'json',
		} );
	},

	/**
	 * Fetch Calendar
	 */
	getCalendar: function getCalendar() {
		var date = new Date();
		var current_date = date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate() + 'T' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + 'Z';
		var date_clause = '';
		var sort_clause = '';
		var start = 0;
		if ( 0 > cdcEvent.current_page ) {
			date_clause = '[* TO ' + current_date + ']';
			sort_clause = 'cdc_event_start_date_dt desc';
			start = ( Math.abs( cdcEvent.current_page ) - 1 ) * cdcEvent.rows;
		} else {
			date_clause = '[' + current_date + ' TO *]';
			sort_clause = 'cdc_event_start_date_dt asc';
			start = Math.abs( cdcEvent.current_page ) * cdcEvent.rows;
		}
		var query = {
			fq: {
				cdc_event_end_date_dt: date_clause
			},
			fl: cdcEvent.solrFields,
			sort: sort_clause,
			start: start
		};
		cdcEvent.solrQuery( query ).done( function( data ) {
			cdcEvent.renderCalendar( data );
		} ).fail( function( data ) {
			console.error( 'Calendar Query fail: ', data );
		} );
	},

	/**
	 * Fetch an event from SOLR
	 * @param id
	 */
	getEvent: function getEvent() {
		var id = getParameterByName( 'storageid' );

		cdcEvent.solrQuery( {
			fq: { id: id },
			fl: cdcEvent.solrFields
		} ).done( function( data ) {
			var doc = data.response.docs;
			if ( doc.length ) {
				doc = doc[ 0 ];
			}
			console.info( doc );
			cdcEvent.renderEvent( doc );
		} ).fail( function( data ) {
			console.error( 'Event Query failure: ', data );
		} );
	},

	/**
	 * Render Prev / Next links
	 * @param next_page_enabled
	 * @param previous_page_enabled
	 * @param previous_page
	 * @param next_page
	 * @returns {string}
	 */
	renderNextPrevLinks: function renderNextPrevLinks( next_page_enabled, previous_page_enabled, previous_page, next_page ) {

		var html = '';

		html += '<nav role="navigation" aria-label="Previous and Next Pages" class="tp-multipage"><ul class="d-flex justify-content-between">';

		if ( previous_page_enabled ) {
			html += '<li class="tp-mp-prev tp-mp-arrow"><a class="td-ul-hover" title="Previous Page" href="' + cdcEvent.getURL( { current_page: previous_page } ) + '"><span class="d-lg-none">Prev<\/span><span class="d-none d-lg-inline">Previous Events<\/span><\/a></li>';
		} else {
			html += '<li class=""></li>';
		}

		if ( next_page_enabled ) {
			html += '<li class="tp-mp-next tp-mp-arrow"><a class="td-ul-hover" title="Next Page" href="' + cdcEvent.getURL( { current_page: next_page } ) + '"><span class="d-lg-none">Next<\/span><span class="d-none d-lg-inline">Next Events<\/span><\/a></li>';
		} else {
			html += '<li class=""></li>';
		}

		html += '</ul></nav>';
		return html;
	},

	/**
	 * Render the calendar view
	 * @param object data         Respond from SOLR
	 */
	renderCalendar: function renderCalendar( data ) {
		var next_page = parseInt( cdcEvent.current_page ) + 1;
		var previous_page = parseInt( cdcEvent.current_page ) - 1;
		var date = new Date();
		var current_date = date.getFullYear() + '-' + ( date.getMonth() + 1 ) + '-' + date.getDate() + 'T' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + 'Z';
		var total_records = data.response.numFound;
		var docs = data.response.docs;
		var eventlistHTML = '';
		var start_date_for_compare = '';

		// Add Category Header
		if ( cdcEvent.category ) {
			eventlistHTML += '<h3>Category: ' + cdcEvent.category + '</h3>';
			eventlistHTML += '<p><a href="' + cdcEvent.getURL( { cat_id: -1, category: null } ) + '">See all Events</a></p>';
		}

		if ( 0 >= docs.length ) {
			eventlistHTML += '<div class="col-md-12"><div class="card border-0 mb-3"><div class="card-body "><div class="row"><div class="col"><h6> There are currently no upcoming events on the calendar. <\/h6><\/div><\/div><\/div><\/div><\/div>';
		}

		for ( var i = 0; i < docs.length; i++ ) {
			var event = docs[ i ];
			var start_date = new Date( event.cdc_event_start_date_dt );
			var start_day_full_name = days[ start_date.getUTCDay() ];
			var start_day_name = days[ start_date.getUTCDay() ].substring( 0, 3 );
			var start_month_name = monthNames[ start_date.getUTCMonth() ];
			var start_year = start_date.getUTCFullYear();
			var start_day = start_date.getUTCDate();
			var start_date_str_format = start_day_name + ', ' + start_month_name + ' ' + start_day + ', ' + start_year;
			var start_time_str = event.cdc_event_start_time_str;
			var end_date = event.cdc_event_end_date_dt ? new Date( event.cdc_event_end_date_dt ) : null;
			var end_date_str_format = null;
			var end_time = event.cdc_event_end_time_str;
			var time_str = '';

			if ( end_date ) {
				var end_day_name = days[ end_date.getUTCDay() ].substring( 0, 3 );
				var end_month_name = monthNames[ end_date.getUTCMonth() ];
				var end_year = end_date.getUTCFullYear();
				var end_day = end_date.getUTCDate();
				end_date_str_format = end_day_name + ', ' + end_month_name + ' ' + end_day + ', ' + end_year;
			}

			if ( 0 === i ) {
				start_date_for_compare = start_date.getMonth() + '-' + start_day + '-' + start_year;
			} else {
				var current_start_date = start_date.getMonth() + '-' + start_day + '-' + start_year;
			}

			if ( start_date_str_format === end_date_str_format ) {
				if ( start_time_str ) {
					time_str += start_time_str;
				}
				if ( end_time ) {
					time_str += ' - ' + end_time;
				}
				if ( 0 < time_str.length ) {
					time_str += ' on ' + start_date_str_format;
				} else {
					time_str += start_date_str_format;
				}
			} else {
				if ( start_time_str ) {
					time_str += start_time_str + ' on ';
				}

				time_str += start_date_str_format;

				if ( end_time && '' !== end_time ) {
					time_str += ' - ' + end_time + ' on ';

					if ( end_date_str_format ) {
						time_str += end_date_str_format;
					}
				} else if ( end_date_str_format ) {
					time_str += ' - ' + end_date_str_format;
				}
			}

			var post_content = event.content_rend_t;
			var excerpt = event.excerpt_txt;
			var related_image = event.cdc_related_image_str;
			var title = event.title;
			var id = event.id;
			var text_version = CDC.Common.stripTags( CDC.cleanHTML( excerpt || post_content || '' ), '<p><b><li><ul><a>' );
			if ( text_version.length && 35 < text_version.split( /\s(?=\w)/ ).length ) {
				// Regex is to strip any unfinished or trailing tags
				text_version = truncate( text_version, 35 ).replace( /<[^>]+$/, '' ) + '...';
			}

			var link_text = truncate( title, 2 );

			localStorage[ id ] = JSON.stringify( event );

			eventlistHTML += '<div class="row event-row">';

			var month_widget = start_month_name.toUpperCase();
			var start_day_widget = start_day;
			var start_day_name_widget = start_day_full_name.toUpperCase();

			if ( 0 <= cdcEvent.current_page ) {
				if ( start_date < date ) {
					start_day_name_widget = days[ date.getDay() ];
					month_widget = monthNames[ date.getMonth() ];
					start_day_widget = date.getDate();
				}
			}

			eventlistHTML += '<div class="col-md-2 pt-3" >';
			eventlistHTML += '<div class="card calendar-card ds-5">';
			eventlistHTML += '<div class="card-body">';
			eventlistHTML += '<span class="month">' + month_widget + '<\/span>';
			eventlistHTML += '<span class="n-day d-md-block">' + start_day_widget + '<\/span>';
			eventlistHTML += '<span class="s-day">' + start_day_name_widget + '<\/span>';
			eventlistHTML += '<\/div>';
			eventlistHTML += '<\/div>';
			eventlistHTML += '<\/div>';

			start_date_for_compare = start_date.getMonth() + '-' + start_day + '-' + start_year;

			eventlistHTML += '<div class="col-md-10">';
			eventlistHTML += '<div class="card border-0 mb-3">';
			eventlistHTML += '<div class="card-body ">';
			eventlistHTML += '<div class="row">';
			eventlistHTML += '<div class="col event-card-body">';
			eventlistHTML += '<h4><a href="' + cdcEvent.getURL( { storageid: id } ) + '">' + title + '</a><\/h4>';
			eventlistHTML += '<p><label>' + time_str + '</label></p>';
			if ( related_image ) {
				eventlistHTML += '<p class="d-md-none"><img src="' + related_image + '" class="img-fluid" alt=""></p>';
			}
			eventlistHTML += '<p>' + text_version + '</p>';
			eventlistHTML += '<p><a href="' + cdcEvent.getURL( { storageid: id } ) + '">Details for ' + link_text + '... &raquo;<\/a></p>';
			eventlistHTML += '<\/div>';

			if ( related_image ) {
				eventlistHTML += '<div class="col-md-4">';
				eventlistHTML += '<img src="' + related_image + '" class="card-img-top p-0 d-none d-md-inline" alt="">';
				eventlistHTML += '<\/div>';
			}

			eventlistHTML += '<\/div>';
			eventlistHTML += '<\/div>';
			eventlistHTML += '<\/div>';
			eventlistHTML += '<\/div>';
			eventlistHTML += '<\/div>';
		}

		var next_page_enabled = true;
		var previous_page_enabled = true;
		var nextpreviouslinksHTML = '';

		if ( 0 === cdcEvent.current_page ) {

			var date_clause_previous = '[* TO ' + current_date + ']';
			var sort_clause_previous = 'cdc_event_start_date_dt desc';
			var start = ( Math.abs( cdcEvent.current_page ) - 1 ) * cdcEvent.rows;

			cdcEvent.solrQuery( {
				fq: { cdc_event_start_date_dt: date_clause_previous },
				sort: sort_clause_previous
			} ).done( function() {
				var total_records_previous = data.response.numFound;

				if ( 0 >= total_records_previous ) {
					previous_page_enabled = false;
				}
				if ( total_records <= cdcEvent.rows ) {
					next_page_enabled = false;
				}

				nextpreviouslinksHTML = cdcEvent.renderNextPrevLinks( next_page_enabled, previous_page_enabled, previous_page, next_page );
				eventlistHTML += nextpreviouslinksHTML;
				$( '#eventlist' ).safehtml( eventlistHTML );
			} );
		} else if ( 0 > cdcEvent.current_page ) {
			if ( total_records <= Math.abs( cdcEvent.current_page ) * cdcEvent.rows ) {
				previous_page_enabled = false;
			}
			nextpreviouslinksHTML = cdcEvent.renderNextPrevLinks( next_page_enabled, previous_page_enabled, previous_page, next_page );
			eventlistHTML += nextpreviouslinksHTML;
			$( '#eventlist' ).safehtml( eventlistHTML );
		} else if ( 0 < cdcEvent.current_page ) {
			if ( total_records <= ( cdcEvent.current_page + 1 ) * cdcEvent.rows ) {
				next_page_enabled = false;
				eventlistHTML += nextpreviouslinksHTML;
			}
			nextpreviouslinksHTML = cdcEvent.renderNextPrevLinks( next_page_enabled, previous_page_enabled, previous_page, next_page );
			eventlistHTML += nextpreviouslinksHTML;
			$( '#eventlist' ).safehtml( eventlistHTML );
		}
		$( '#eventdetailsSection' ).hide();
		$( '#eventListSection' ).show();
	},

	/**
	 * Given an event document and current page, render the event
	 * @param data
	 */
	renderEvent: function renderEvent( event ) {
		var now = new Date();
		var plural = '';
		var url = '';
		var start_date = new Date( event.cdc_event_start_date_dt );
		var title = event.title;
		var start_day_name = days[ start_date.getUTCDay() ].substring( 0, 3 );
		var start_month_name = monthNames[ start_date.getUTCMonth() ];
		var start_year = start_date.getUTCFullYear();
		var start_day = start_date.getUTCDate();
		var start_time = event.cdc_event_start_time_str;
		var end_date = event.cdc_event_end_date_dt ? new Date( event.cdc_event_end_date_dt ) : false;
		var end_time = event.cdc_event_end_time_str;
		var event_website = event.cdc_website_url_str;
		var event_website_text = event.cdc_website_url_text_str;
		var address_1_str = event.cdc_address_one_str;
		var address_2_str = event.cdc_address_two_str;
		var city_str = event.cdc_city_str;
		var state_str = event.cdc_state_str;
		var postal_code = event.cdc_postal_code_str;
		var phone_str = event.cdc_phone_str;
		var permalink = event.permalink;
		var ics_link = permalink.replace( '//', '' );
		var split_link = ics_link.split( '/' );
		var split_link_str = split_link.splice( 1, split_link.length - 1 );
		var include_campus_map_link = event.cdc_include_links_to_campus_maps_str;
		var organizer_url = event.cdc_organizer_url_str;
		var venue_url = event.cdc_venue_url_str;
		var start_date_str_format = start_day_name + ', ' + start_month_name + ' ' + start_day + ', ' + start_year;

		ics_link = '/' + split_link_str.join( '/' );

		if ( end_date ) {
			var end_day_name = days[ end_date.getUTCDay() ].substring( 0, 3 );
			var end_month_name = monthNames[ end_date.getUTCMonth() ];
			var end_year = end_date.getUTCFullYear();
			var end_day = end_date.getUTCDate();
			var end_date_str_format = end_day_name + ', ' + end_month_name + ' ' + end_day + ', ' + end_year;
		}

		//var end_date = event.cdc_event_end_date_txt;
		var organizer = event.cdc_organizer_str;
		var organizer_email = event.cdc_organizer_email_str;
		var organizer_phone = event.cdc_organizer_phone_str;
		var post_content = event.content_rend_t;
		var addToCalendar = ( ! event.cdc_show_add_to_calendar_str || 'hide' !== String( event.cdc_show_add_to_calendar_str ) );
		var regexp = RegExp( '(' + title + ')?\\s+' + permalink + '[^<]+' );
		post_content = post_content.replace( regexp, '' );

		var related_image = event.cdc_related_image_str;
		var backLink = '<div class="float-left"><a href="' + cdcEvent.getURL() + '">Back To Event List </a>';

		$( '#backlink' ).safehtml( backLink );
		$( '#eventdetailsSection' ).show();
		$( '#eventListSection' ).hide();

		// CATEGORIES
		var eventcategoriesHTML = '';
		if ( $.isArray( event.cdc_event_category_srch ) && $.isArray( event.cdc_event_category_str ) && event.cdc_event_category_srch.length ) {
			plural = 'Categories';
			if ( 1 >= event.cdc_event_category_srch.length ) {
				plural = 'Category';
			}
			var categories = [];
			for ( var i = 0; i < event.cdc_event_category_srch.length; i++ ) {
				if ( event.cdc_event_category_str[ i ] ) {
					url = cdcEvent.getURL( {
						cat_id: event.cdc_event_category_str[ i ],
						category: event.cdc_event_category_srch[ i ]
					} );
					categories.push( '<a href="' + url + '">' + event.cdc_event_category_srch[ i ] + '</a>' );
				}
			}
			eventcategoriesHTML = '<p class="mt-3"><span class="bold"><strong>' + plural + ':<\/strong> ' +
                categories.join( ', ' ) + '</p>';
		}

		var eventdetailHTML = '<div class="row col-md-12"><h2 class="mb-4">' + title + '<\/h2><\/div><div class="row"><div class="col-md-8">';

		// calculate effective end ts to see if event has passed
		var start_ts = addTimeToGMTDate( start_date, start_time );
		var end_ts;
		if ( ! end_date ) {
			if ( ! start_time ) {
				// an event with a start date and nothing else is a 1 day event
				end_ts = new Date( ( start_ts.valueOf() + 24 ) * 60 * 60 * 1000 );
			} else {
				// an event with a start date and time is assumed to have a 1 hour duration
				end_ts = new Date( ( start_ts.valueOf() + 60 ) * 60 * 1000 );
			}
		} else if ( ! end_time ) {
			if ( start_time ) {
				// when end date is specified but no end time,...
				if ( start_date === end_date ) {
					// ...and end date is same as start date, end is 1hr after start time
					end_ts = new Date( ( start_ts.valueOf() + 60 ) * 60 * 1000 );
				} else {
					// ...and end date is different from start date, end is assumed midnight of end date
					end_ts = new Date( end_date.valueOf() );
				}
			} else {
				// when there's no start time and only a start / end date, end time is 11:59pm on end date
				end_ts = addTimeToGMTDate( end_date, '11:59 PM' );
			}
		} else {
			end_ts = addTimeToGMTDate( end_date, end_time );
		}

		if ( getUTCNow() > end_ts.valueOf() ) {
			eventdetailHTML += '<div class="alert alert-warning" role="alert">';
			eventdetailHTML += '<div class="row padding-pagealert">';
			eventdetailHTML += '<div>';
			eventdetailHTML += '<span class="sr-only">Alert_06<\/span><svg focusable="false" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use href="#alert_06" xlink:href="#alert_06"><\/use><\/svg><\/div>';
			eventdetailHTML += '<div class="col">';
			eventdetailHTML += '<p class="margin-pagealert">';
			eventdetailHTML += 'This event has passed. </p>';
			eventdetailHTML += '<\/div>';
			eventdetailHTML += '<\/div>';
			eventdetailHTML += '<\/div>';
		}

		eventdetailHTML += '<p class="d-md-none"><img src="' + related_image + '" class="img-fluid" alt=""></p>';
		eventdetailHTML += post_content;
		eventdetailHTML += '<div class="d-none d-md-block">';
		if ( addToCalendar ) {
			eventdetailHTML += '<a href="' + ics_link + '" class="btn btn-secondary">Add to Calendar<\/a>';
		}
		eventdetailHTML += eventcategoriesHTML;
		eventdetailHTML += '<\/div>';

		eventdetailHTML += '<\/div>';
		eventdetailHTML += '<div class="col-md-4">';
		if ( related_image ) {
			eventdetailHTML += '<p>';
			eventdetailHTML += '<img src="' + related_image + '" class="img-fluid d-none d-md-inline" alt="">';
			eventdetailHTML += '</p>';
		}
		eventdetailHTML += '<div class="card mb-3">';
		eventdetailHTML += '<div class="card-header h4 bg-secondary">Event Details<\/div>';
		eventdetailHTML += '<div class="card-body bg-gray-l3">';

		if ( end_date_str_format && end_date_str_format !== start_date_str_format ) {
			eventdetailHTML += '<p><span class="bold"><strong>Date &amp; Time<\/strong><\/span><br/>';
			var start_time_str = event.cdc_event_start_time_str;
			if ( start_time_str && '' !== start_time_str ) {
				eventdetailHTML += start_time_str + ' on ';
			}
			eventdetailHTML += start_date_str_format + ' - ';
			if ( end_time && '' !== end_time ) {
				eventdetailHTML += end_time + ' on ';
			}
			eventdetailHTML += end_date_str_format;
		} else {
			eventdetailHTML += '<p><span class="bold"><strong>Date<\/strong><\/span><br/>';
			eventdetailHTML += start_date_str_format;
			eventdetailHTML += '<br/>';
			eventdetailHTML += '</p>';
			if ( start_time ) {
				eventdetailHTML += '<p><span class="bold"><strong>Time<\/strong><\/span><br/>';
				eventdetailHTML += start_time;
				if ( end_time ) {
					eventdetailHTML += ' - ' + end_time;
				}
			}
		}
		if ( event_website && '' !== event_website ) {
			eventdetailHTML += '<br/>';
			event_website = event_website.toString();
			var event_website_url = event_website.replace( 'http://', '' );
			var anchor_text = event_website_url;
			if ( event_website_text ) {
				anchor_text = event_website_text;
			}
			eventdetailHTML += '<a href="' + event_website + '">' + anchor_text;

			if ( is_url_external( event_website_url ) ) {
				eventdetailHTML += '<svg class="icon x16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#ext"></use></svg>';
			}
			eventdetailHTML += '<\/a>';
			eventdetailHTML += '<br/>';
		}

		eventdetailHTML += '</p>';
		// VENUE
		var venueHTML = '';
		if ( address_1_str ) {
			venueHTML += address_1_str + '<br/>';
		}
		if ( address_2_str ) {
			venueHTML += address_2_str + '<br/>';
		}
		var city_state_postal = '';

		if ( city_str ) {
			city_state_postal += city_str;
		}
		if ( state_str ) {
			if ( city_state_postal ) {
				city_state_postal += ', ' + state_str;
			} else {
				city_state_postal += state_str;
			}
		}
		if ( postal_code ) {
			if ( city_state_postal ) {
				city_state_postal += ' ' + postal_code;
			} else {
				city_state_postal += postal_code;
			}
		}

		if ( city_state_postal ) {
			venueHTML += city_state_postal + '<br/>';
		}

		if ( include_campus_map_link && 'on' === include_campus_map_link ) {
			venueHTML += '<span>(see a <\/span><a href="/connects/agency-info/campus-maps.html">campus map<\/a> <span>)<\/span><br/>';
		}

		if ( phone_str ) {
			venueHTML += phone_str + '<br/>';
		}

		if ( venue_url ) {
			venue_url = venue_url.toString();
			var venue_url_display = venue_url.replace( 'http://', '' );
			venueHTML += '<a href="' + venue_url + '">' + venue_url_display;
			if ( is_url_external( venue_url_display ) ) {
				eventdetailHTML += '<svg class="icon x16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#ext"></use></svg>';
			}
			venueHTML += '<\/a>';
			venueHTML += '<br/>';
		}

		if ( venueHTML ) {
			eventdetailHTML += '<p><span class="bold"><strong>Venue<\/strong><\/span><br/>' + venueHTML + '</p>';
		}

		// Organizer
		if ( organizer ) {
			eventdetailHTML += '<p><span class="bold"><strong>Organizer<\/strong><\/span><br/>' + organizer + '<br/>';
			if ( organizer_email ) {
				eventdetailHTML += '<a href = "mailto: ' + organizer_email + '">' + organizer_email + '<\/a><br/>';
			}
			if ( organizer_phone ) {
				eventdetailHTML += organizer_phone + '<br/>';
			}
			if ( organizer_url ) {
				organizer_url = organizer_url.toString();
				var organizer_url_display = organizer_url.replace( 'http://', '' );
				eventdetailHTML += '<a href="' + organizer_url + '">' + organizer_url_display;
				if ( is_url_external( organizer_url_display ) ) {
					eventdetailHTML += '<svg class="icon x16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#ext"></use></svg>';
				}
				eventdetailHTML += '<\/a><br/>';
			}
			eventdetailHTML += '</p>';
		}

		eventdetailHTML += '<\/div><\/div><\/div><\/div>';

		eventdetailHTML += '<div class="d-md-none mt-2 mb-3">';
		if ( addToCalendar ) {
			eventdetailHTML += '<a href="' + ics_link + '" class="btn btn-secondary">Add to Calendar<\/a>';
		}
		eventdetailHTML += eventcategoriesHTML;
		eventdetailHTML += '<\/div>';

		$( '#eventdetails' ).safehtml( eventdetailHTML );
	}
};

// init on page load
$( function() {
	cdcEvent.init();
} );
