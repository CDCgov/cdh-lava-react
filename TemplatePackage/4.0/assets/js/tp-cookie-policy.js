/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
'use strict';

/**
 * app.js
 * @fileOverview Contains module and constructors to initiate any global application functionality outside the scope of bootstrap, contents ported from prototypical examples
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

( function( $, window, document ) {

	window.CDC.tp4 = window.CDC.tp4 || {};

	window.CDC.tp4.setCookies = function setCookie( cname, cvalue, exdays ) {
		const d = new Date();

		d.setTime( d.getTime() + ( exdays * 24 * 60 * 60 * 1000 ) );

		let expires = "expires=" + d.toUTCString();

		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	};

	window.CDC.tp4.getCookies = function getCookie( cname ) {

		let name = cname + "=";
		let ca = document.cookie.split(';');

		for( let i = 0; i < ca.length; i++ ) {
			let c = ca[i];
			while ( ' ' === c.charAt(0) ) {
				c = c.substring(1);
			}
			if ( 0 === c.indexOf( name ) ) {
				return c.substring( name.length, c.length );
			}
		}
		return null;
	};

	window.CDC.tp4.deleteCookies = function deleteCookie( cname ) {
		document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	};

	window.CDC.tp4.showCookiePolicy = function showCookiePolicy() {
		$( '.cdc-cookie-policy-modal' ).toggleClass( 'd-none' );
	};

	//on slider click fn
	$(document).on( 'click keypress', '.cdc-cookie-policy-modal #policy-accordion .toggle-container .slider', function( e ) {

		var keyPress = e.which;
		const item = $( this )[0]; //select the slider
		//const checked = item.getAttribute( 'aria-checked' );

		const itemInput = $( this ).parent().find( 'input' );
		const itemInputChecked = $( itemInput ).prop( 'checked' );

		if ( 32 === keyPress ) { // the spacebar key code

			if ( true === itemInputChecked ) {
				item.setAttribute( 'aria-checked', 'false' );
				$( itemInput ).prop( 'checked', false );
			} else {
				item.setAttribute( 'aria-checked', 'true' );
				$( itemInput ).prop( 'checked', true );
			}

			updateCookie();

			return false; //this prevents the page from scrolling
		}

		 if ( 'click' === e.type ) {

			$( '.cdc-cookie-policy-modal #policy-accordion .toggle-container .switch input[type="checkbox"]' ).trigger( 'change' );

			if ( true === itemInputChecked ) {
				//item.setAttribute( 'aria-checked', 'false' );
				//$( itemInput ).prop( 'checked', false );
			} else {
				//item.setAttribute( 'aria-checked', 'true' );
				//$( itemInput ).prop( 'checked', true );
			}

			updateCookie();
		}


	});

	//handle the escape key if pressed and detect which modal is open, then close them when esc is pressed
	$(document).on( 'keypress keyup keydown', '.cdc-cookie-policy-modal', function( e ) {
		var keyPressNew = e.which;

		if ( $('.cdc-privacy-policy-confirmation').is(':visible') ) {
			if ( 27 === keyPressNew ) { // the escape key code
				//close confirmation modal
				$( '.cdc-privacy-policy-confirmation.overlay' ).toggleClass( 'd-none' );
				//close the cookie modal
				window.CDC.tp4.showCookiePolicy();
				//set screen readers back to the button that opened the modal
				$( '.privacy-popup-link' ).focus();
			}

		}

		if( $('.cdc-cookie-policy-modal').is(':visible') ) {
			if ( 27 === keyPressNew ) { // the escape key code
				window.CDC.tp4.showCookiePolicy();
				$( '.privacy-popup-link' ).focus();
			}
		}

	});

	//on change of checkbox input
	$(document).on( 'change', '.cdc-cookie-policy-modal #policy-accordion .toggle-container .switch input[type="checkbox"]', function( e ) {
		updateCookie();

		/*var checkboxInput = this;
		var sliderValue = $( this ).parent().find( '.slider' )[0];

		if ( true === $( checkboxInput ).prop( 'checked' ) ) {
			sliderValue.setAttribute( 'aria-checked', 'true' );
		} else {
			sliderValue.setAttribute( 'aria-checked', 'false' );
		} */

	});

	//accordion open/close fix to close other accordions and change the indicator direction
	$(document).on( 'click', '.cdc-cookie-policy-modal .btn-link', function( e ) {

		resetAccordions();

		//check if has closed class
		var closedCheck = $(this).hasClass( 'collapsed' );

		//save value of aria-expanded
		var isExpanded = $( this ).attr( "aria-expanded" );

		if ( ! closedCheck && 'true' === isExpanded ) {
			//find indicator of current accordion
			var toggleIndicator = $( this ).parent().find( '.indicator' );
			//set class flipped for chevron to flip
			toggleIndicator.toggleClass( 'flipped' );
		}

	} );

	$(document).on( 'click', '.cdc-cookie-policy-modal #policy-accordion .toggle-container .indicator', function( e ) {
		$( this ).parent().find( '.btn-link' ).trigger( 'click' );
	});


	//remove all button
	$(document).on( 'click', '.cdc-cookie-policy-modal .remove-all-btn', function( e ) {
		e.preventDefault();

		//loop through the checkboxes and turn them all off
		var checkboxValues = document.querySelectorAll( '.cdc-cookie-policy-modal #policy-accordion .toggle-container .switch input[type="checkbox"]' );

		for ( var i = 0; i < checkboxValues.length; i++ ) {
			$( checkboxValues[i] ).prop( 'checked', false );
		}

		updateCookie();
	} );

	//this is for the confirm choices button on the cookie modal
	$(document).on( 'click', '.cdc-cookie-policy-modal .policy-confirm-btn', function( e ) {

		$( '.cdc-privacy-policy-confirmation.overlay' ).toggleClass( 'd-none' );

		$( '.cookie-policy-close' ).focus();

		updateCookie();
	} );

	//this is for the privacy policy button on the privacy page
	$(document).on( 'click', '.privacy-popup-link', function( e ) {
		window.CDC.tp4.showCookiePolicy();
		//sets focus for screen readers
		$( '#cookiefocus1' ).focus();
	} );

	//this is the close button on the confirmation modal not the confirm choices button on the cookie modal
	$(document).on( 'click', '.cookie-policy-close', function( e ) {
		$( '.cdc-privacy-policy-confirmation.overlay' ).toggleClass( 'd-none' );

		window.CDC.tp4.showCookiePolicy();

		$( '.privacy-popup-link' ).focus();
	} );


	$(document).on( 'click', '.modal-close-button', function( e ) {
		if ( $('.cdc-privacy-policy-confirmation').is(':visible') ) {
			$( '.cdc-privacy-policy-confirmation.overlay' ).toggleClass( 'd-none' );
		}
		window.CDC.tp4.showCookiePolicy();

		$( '.privacy-popup-link' ).focus();
	} );

	function resetAccordions() {
		//var cookiePolicyLinks = $( '.cdc-cookie-policy-modal #policy-accordion .toggle-container .btn-link' );
		var cookiePolicyLinks = document.querySelectorAll( '.cdc-cookie-policy-modal #policy-accordion .toggle-container .btn-link' );

		//loop over each of the toggle/accordions and reset them if the user selects a different one
		for ( var i = 0; i < cookiePolicyLinks.length; i++ ) {
			//remove flipped class from chevron
			$( cookiePolicyLinks[i] ).parent().find( '.indicator' ).removeClass( 'flipped' );
			//get value of btn-link class for collapsed
			var isCollapsed = $( cookiePolicyLinks[i] ).hasClass( 'collapsed' );
			//get parent value of content section
			var isCollapsedContent = $( cookiePolicyLinks[i] ).attr( 'data-target' );


			if ( isCollapsed ) {
				//do nothing
			} else {
				$( cookiePolicyLinks[i] ).parent().parent().find( isCollapsedContent ).collapse();
				//$(cookiePolicyLinks[0]).parent().parent().find('#collapseOne').collapse( 'toggle' ); //.collapse("hide") .collapse("show")
			}
		}

	}

	function updateCookie() {
		var checkboxValues = document.querySelectorAll( '.cdc-cookie-policy-modal #policy-accordion .toggle-container .switch input[type="checkbox"]' );
		var valuesArray = [];

		//loop through the checkboxes and save the values of the ones that are checked
		for ( var i = 0; i < checkboxValues.length; i++ ) {
			var isChecked = $( checkboxValues[i] ).prop( 'checked' );

			if ( isChecked ) {
				valuesArray.push( $( checkboxValues[i] ).attr( 'value' ) );
			}
		}

		window.CDC.tp4.setCookies( 'CDCActiveGroups', valuesArray.join( ',' ), 365 );
	}

	function setupCheckboxes() {
		//checkboxes
		var checkboxValues = document.querySelectorAll( '.cdc-cookie-policy-modal #policy-accordion .toggle-container .switch input[type="checkbox"]' );
		//cookieValues
		var cookieValues = '';

		if ( null !== window.CDC.tp4.getCookies( 'CDCActiveGroups' ) ) {
			cookieValues = window.CDC.tp4.getCookies( 'CDCActiveGroups' ).split( ',' );
		}

		var accessibilityValue = '';

		//loop on the cookieValues
		for ( var i = 0; i < cookieValues.length; i++ ) {

			if ( checkboxValues[0] ) {
				accessibilityValue = $( checkboxValues[0] ).parent().find( '.slider' )[0]; //find the slider / visual representation of the input
				if ( 'C0002' === cookieValues[i] ) { //check the cookieValues for C0002
					$( checkboxValues[0] ).prop( 'checked', true ); //if C0002 === C0002 is true set the input type="checkbox" checked attribute to true.
					// if ( true === $( checkboxValues[0] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'true' ); //update it's aria/accessibility attributes
					// }
				} else {
					checkboxValues[0].removeAttribute( 'checked' );
					// if ( false === $( checkboxValues[0] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'false' ); //update it's aria/accessibility attributes
					// }
				}
			}
			if ( checkboxValues[1] ) {
				accessibilityValue = $( checkboxValues[1] ).parent().find( '.slider' )[0]; //find the slider / visual representation of the input
				if ( 'C0003' === cookieValues[i] ) {
					$( checkboxValues[1] ).prop( 'checked', true );
					// if ( true === $( checkboxValues[1] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'true' ); //update it's aria/accessibility attributes
					// }
				} else {
					checkboxValues[1].removeAttribute( 'checked' );
					// if ( false === $( checkboxValues[1] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'false' ); //update it's aria/accessibility attributes
					// }
				}
			}
			if ( checkboxValues[2] ) {
				accessibilityValue = $( checkboxValues[2] ).parent().find( '.slider' )[0]; //find the slider / visual representation of the input
				if ( 'C0004' === cookieValues[i] ) {
					$( checkboxValues[2] ).prop( 'checked', true );
					// if ( true === $( checkboxValues[2] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'true' ); //update it's aria/accessibility attributes
					// }
				} else {
					checkboxValues[2].removeAttribute( 'checked' );
					// if ( false === $( checkboxValues[2] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'false' ); //update it's aria/accessibility attributes
					// }
				}
			}
			if ( checkboxValues[3] ) {
				accessibilityValue = $( checkboxValues[3] ).parent().find( '.slider' )[0]; //find the slider / visual representation of the input
				if ( 'C0005' === cookieValues[i] ) {
					$( checkboxValues[3] ).prop( 'checked', true );
					// if ( true === $( checkboxValues[3] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'true' ); //update it's aria/accessibility attributes
					// }
				} else {
					checkboxValues[3].removeAttribute( 'checked' );
					// if ( false === $( checkboxValues[3] ).prop( 'checked' ) ) {
					// 	accessibilityValue.setAttribute( 'aria-checked', 'false' ); //update it's aria/accessibility attributes
					// }
				}
			}
		}
	}

	$( window ).on ( 'load', function() {
		//if cookie does not exist create it
		if ( $( '.cdc-cookie-policy-modal' ).length ) {
			if ( null === window.CDC.tp4.getCookies( 'CDCActiveGroups' ) ) {
				window.CDC.tp4.setCookies( 'CDCActiveGroups', 'C0002,C0003,C0004,C0005', 365 );
			}
		}
		setupCheckboxes();
	});



} )( jQuery, window, document );
