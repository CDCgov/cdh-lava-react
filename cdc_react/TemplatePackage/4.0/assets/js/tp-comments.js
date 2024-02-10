/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
'use strict';

/**
 * comments.js
 * This is a legacy JS, disabling camelcase check
 */

/* eslint-disable camelcase */
( function( $, window, document ) {

	var siteUrl = CDC.cleanUrl( $( '#site_url' ).val() );
	var $submitButton;
	var handlersAlreadyAdded = false;
	var allowAnonymous = false;
	var post_id = parseInt( $( '#post' ).val(), 10 );
	if ( ! CDC.Common.cdcUrl( siteUrl ) ) {
		console.error( 'Bad site url on page, cannot connect comments.' );
		return;
	}

	window.cdc_ajax_post_comment_url = siteUrl + '/wp-json/wp/v2/comments?post=' + post_id;
	window.cdc_ajax_format_comment_url = siteUrl + '/wp-json/cdc/v2/comments/format?post=' + post_id;

	// put Ajax here.
	if ( $( '#comments-paint-container' ).length ) {
		paintComments( true );
	}

	function addEventHandlers() {

		if ( false === handlersAlreadyAdded ) {

			$submitButton = $( '#commentform .submit_container [name="submit"]' );

			//ON DROPDOWN CHANGE
			$( document ).on( 'change', '#comment_sort_by', function() {
				var sortChoice = $( '#comment_sort_by' ).val();
				var sortFinalChoice = 'true' === sortChoice;
				paintComments( sortFinalChoice );
			} );

			//SUBMIT FORM
			$( document ).on( 'submit', '#commentform', function() {
				$submitButton.attr( 'value', 'Sending...' );
				$submitButton.css( 'opacity', '.45' );
				$submitButton.css( 'pointer-events', 'none' );
				$submitButton.css( 'cursor', 'wait' );
				submitComment( formToJSON( this.elements ) );
				return false;
			} );

			//COMMENT REPLY LINK
			$( document ).on( 'click', '.comment-reply-link', function( e ) {
				e.preventDefault();
				replyToComment( $( this ) );
			} );

			//ON LICK FOR TEXTAREA
			$( document ).on( 'click', '#respond #comment_content', function() {
				reply_form_elements_open();
			} );

			//ON CLICK FOR CANCEL BTN
			$( document ).on( 'click', '#comment_cancel', function() {
				reply_form_reset();
			} );

			//TOGGLE FOR CHECKBOX
			var anon_toggle = false;
			$( document ).on( 'click', '#chk_post_anon', function() {
				$( this ).attr( 'checked', ! anon_toggle );
				anon_toggle = ! anon_toggle;

				if ( anon_toggle ) {
					jQuery( '#author_email' ).val( jQuery( '#hidEmail' ).val() );
					jQuery( '#author_email_display' ).safehtml( jQuery( '#hidEmail' ).val() );
					jQuery( '#author_name' ).val( jQuery( '#hidAuthor' ).val() );
				} else {
					var currentTime = Number( new Date() );
					jQuery( '#author_email' ).val( 'Anonymous-' + currentTime + '@anonymous.com' );
					jQuery( '#author_email_display' ).html( 'Anonymous (not displayed)' );
					jQuery( '#author_name' ).val( 'Anonymous' );
				}
			} );

			handlersAlreadyAdded = true;
		}
	}

	var formToJSON = function formToJSON( elements ) {
		return [].reduce.call( elements, function( data, element ) {
			if ( 'comment_content' === element.name ) {
				data.content = element.value;
			} else {
				data[ element.name ] = element.value;
			}
			return data;
		}, {} );
	};

	function paintComments( $sort ) {

		$( '#comments-paint-container' ).html( 'Loading comments...' );

		var sortChoice = 'true' === $( '#comment_sort_by' ).val();
		var sortFinalChoice = $sort ? $sort : sortChoice;

		$.ajax( {
			type: 'GET',
			url: window.cdc_ajax_format_comment_url,
			data: {
				post: $( '#post' ).val(),
				//inserted_email: inserted,
				status: 1,
				sort: sortFinalChoice
			},
			beforeSend: function beforeSend( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', $( '#_wpnonce' ).val() );
			},
			success: function success( result ) {
				$( '#comments-paint-container' ).safehtml( result.html );

				allowAnonymous = 0 < $( '#chk_post_anon' ).length;

				$( 'h1#content' ).next( '.top-comment-count' ).remove();
				$( '#cdc_comments .top-comment-count' ).insertAfter( 'h1#content' ).removeClass( 'd-none' );

				addEventHandlers();

				getUserInfo();
			},
			error: function error( xhr ) {
				console.log( xhr );
				console.log( 'An error occured: ' + xhr.status + ' ' + xhr.statusText );
			}
		} );
	}

	function submitComment( form ) {
		$.ajax( {
			type: 'POST',
			url: window.cdc_ajax_post_comment_url,
			data: form,
			beforeSend: function beforeSend( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', $( '#_wpnonce' ).val() );
			},
			success: function success( result ) {
				//inserted = result.author_email;
				console.log( result );

				if ( 'string' === typeof  result  ) {
					var clearedString = result.replace( '\n', '' );
					var regex = /\<head(.+)body\>/;
					result = clearedString.replace( regex, '' );
					result = JSON.parse( result );
				}

				//result.content.rendered
				//result.parent
				//result.date
				//result.author_name

				let date = new Date( result.date );
				let options = {
					month: 'long',
					day: 'numeric',
					year: 'numeric'
				};
				var dateStr = date.toLocaleDateString( 'en-us', options );
				dateStr += ' at ';
				options = {
					hour: '2-digit',
					minute: '2-digit'
				};
				dateStr += date.toLocaleTimeString( 'en-us', options );

				var confirmationText = '<div class="intranet_comment_thankyou">';
				if ( $( '#chk_post_anon' ).is( ':checked' ) ) {
					confirmationText += '<p><strong>Thank you for commenting!</strong></p>';
				} else {
					confirmationText += '<p><strong>Thank you for commenting!</strong><br/>We\'ll review your submission and post all comments that are relevant and respectful.</p>\n';
				}

				confirmationText += '<hr/>';
				confirmationText +=  '<em><p class="comment-reply-header mb-2"><span class="reply-name">' + result.author_name + '</span><span class="reply-date">' + dateStr + '</span></p><div class="cl"' + result.content.rendered + '</em>';
				confirmationText += '</div>';

				jQuery( '<div/>', { class: 'comments-confirmation-container' } ).safehtml( confirmationText ).insertBefore( '#respond' );

				reply_form_reset();
			},
			error: function error( xhr ) {
				if ( xhr.hasOwnProperty( 'responseJSON' ) ) {
					console.log( xhr.responseJSON );
					alert( $( '<div></div>' ).safehtml( xhr.responseJSON.message ).text() );
				} else {
					alert( 'Your comment failed to submit. Please try again later. ' );
				}

				$submitButton.attr( 'value', 'Post Comment' );
				$submitButton.css( 'opacity', '1' );
				$submitButton.css( 'pointer-events', 'auto' );
				$submitButton.css( 'cursor', 'pointer' );
				console.log( 'An error occured: ' + xhr.status + ' ' + xhr.statusText );

			}
		} );
	}

	function replyToComment( comment ) {
		var form = $( '#respond' );
		var target = $( comment.parents( '.comment-body' ) );
		var id = comment.parent().data( 'commentId' );
		$( '#parent' ).val( id ).attr( 'value', id );
		target.append( form );
	}

	function reply_form_reset() {
		reply_form_elements_close();
		$( '#comments-paint-container' ).prepend( $( '#respond' ) );
		$( 'textarea[name="comment_content"]' ).val( '' );
		$submitButton.attr( 'value', 'Post Comment' );
		$submitButton.css( 'opacity', '1' );
		$submitButton.css( 'pointer-events', 'auto' );
		$submitButton.css( 'cursor', 'pointer' );
	}

	function reply_form_elements_open() {
		if ( ! $( '#respond #comment_content' ).hasClass( 'open' ) ) {
			$( '#respond #comment_content' ).addClass( 'open' );
		}
		$( '.respond-subtitle' ).removeClass( 'd-none' );
		$( '.post_anon_container' ).removeClass( 'd-none' );
		$( '.comment_author' ).removeClass( 'd-none' );
		$( '.comment_email' ).removeClass( 'd-none' );
		$( '.submit_container' ).removeClass( 'd-none' );
	}

	function reply_form_elements_close() {
		if ( $( '#respond #comment_content' ).hasClass( 'open' ) ) {
			$( '#respond #comment_content' ).removeClass( 'open' );
		}
		$( '.respond-subtitle' ).addClass( 'd-none' );
		$( '.post_anon_container' ).addClass( 'd-none' );
		$( '.comment_author' ).addClass( 'd-none' );
		$( '.comment_email' ).addClass( 'd-none' );
		$( '.submit_container' ).addClass( 'd-none' );
	}

	function addUserInfoToCommentForm( id, email, fullname ) {
		jQuery( '#hidEmail' ).val( email );
		jQuery( '#hidAuthor' ).val( fullname );
		if ( ! allowAnonymous ) {
			jQuery( '#author_email' ).val( email );
			jQuery( '#author_name' ).val( fullname );
			jQuery( '#author_email_display' ).safehtml( email );
		}
	}

	function getUserInfo() {

		var ajaxDataType = 'json';

		var apiUrl = '';
		if ( 0 <= siteUrl.indexOf( 'vvv' ) ) {
			apiUrl = '//vvv.wcms/wp-content/plugins/cdc-gov/assets/cdc/json/sample-comments-user.json';
		} else {
			ajaxDataType = 'jsonp';
			apiUrl = '//intranet.cdc.gov/HomePageSupport/user.asp';
		}

		//Check local storage for the user info first
		var commentsUserId = localStorage[ 'connects.networkid' ];
		var commentsEmailAddress = localStorage[ 'connects.email' ];
		var commentsFullName = localStorage[ 'connects.name' ];

		if ( 'undefined' !== typeof commentsUserId &&
            'undefined' !== typeof commentsEmailAddress &&
            'undefined' !== typeof commentsFullName &&
            'null' !== commentsUserId &&
            'null' !== commentsEmailAddress &&
            'null' !== commentsFullName ) {

			console.log( 'Getting user from local storage' );
			console.log( commentsUserId + ', ' + commentsEmailAddress + ', ' + commentsFullName );

			addUserInfoToCommentForm( commentsUserId, commentsEmailAddress, commentsFullName );

		} else {
			console.log( 'Getting user from server' );

			jQuery.ajax( {
				url: apiUrl,
				dataType: ajaxDataType,
				success: function( json ) {
					commentsUserId = json.name;
					commentsEmailAddress = commentsUserId + '@cdc.gov';
					console.log( 'Got user id from intranet server: ' + commentsUserId );

					var peopleFinderApiUrl = window.location.protocol + '//intranet.cdc.gov/HomePageSupport/peoplefinder.asp?callback=?&findNameById=' + json.name;
					if ( 0 <= siteUrl.indexOf( 'vvv' ) ) {
						peopleFinderApiUrl = window.location.protocol + '//vvv.wcms/wp-content/plugins/cdc-gov/assets/cdc/json/sample-people-finder-result.json';
					}

					localStorage[ 'connects.networkid' ] = commentsUserId;
					localStorage[ 'connects.email' ] = commentsEmailAddress;
					jQuery.ajax( {
						url: peopleFinderApiUrl,
						dataType: ajaxDataType,
						success: function( nameData ) {
							//if (nameData.length > 0) {
							commentsFullName = nameData[ 0 ].name;
							localStorage[ 'connects.name' ] = commentsFullName;
							//} else {
							//    commentsFullName = nameData[0]["name"];
							//}
							console.log( 'Got user full name from db: ' + commentsFullName );
							addUserInfoToCommentForm( commentsUserId, commentsEmailAddress, commentsFullName );
						},
						error: function( xhr ) {
							console.log( 'Error received trying to get user info from database' );
							console.log( xhr );
							console.log( 'An error occured: ' + xhr.status + ' ' + xhr.statusText );
						}
					} );
				},
				error: function( xhr ) {
					console.log( 'Error received trying to get user info intranet server' );
					console.log( xhr );
					console.log( 'An error occured: ' + xhr.status + ' ' + xhr.statusText );
				}
			} );
		}

	}

} )( jQuery, window, document );
