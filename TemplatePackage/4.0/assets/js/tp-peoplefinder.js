/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
'use strict';

/**
 * tp-peoplefinder.js
 * @fileOverview
 * @version
 * @copyright 2018 Centers for Disease Control
 */

/* eslint-disable camelcase */
(function ($, window, document, undefined) {
	var pFErrorMessage = '<span class="fs11">No matching results were found. Please try your search again.</span>';

	var hidePFError = function () {
		$('.tt-error').hide();
		//$('.searchTypeAhead').hide(); may need something but not like this. makes the search click not fire since blur hides the div before the click
	};

	var showPFError = function (instance) {
		$(instance).removeClass('input-loading');
		if ('.headerSearchInput-intranet' === instance) {
			$('.tt-pf-header-error').show();
		} else {
			$('.tt-widget-error').show();
		}
	};

	$('.tp-search .dropdown-item').click(function () {
		var searchType = $(this)[0].innerText;
		if (' ' === searchType.charAt(searchType.length - 1)) {
			searchType = searchType.substr(0, searchType.length - 1);
		}
		if ('People Finder' === searchType) {
			hidePFError();
			$('.searchTypeAhead').hide();
			$('.headerSearchInput-intranet').typeahead('destroy');
			typeaheadInit('.headerSearchInput-intranet');
			$('.searchbutton-intranet').prop('disabled', true);
			$('.searchbutton-intranet').css({"opacity" : "0.25"});
		} else {
			hidePFError();
			$('.searchTypeAhead').show();
			$('.headerSearchInput-intranet').typeahead('destroy');
			$('.searchbutton-intranet').prop('disabled', false);
			$('.searchbutton-intranet').css({"opacity" : ""});
		}
	});

	var peopleSort = function (a, b) {
		var aLastName = a.LastName.toLowerCase();
		var bLastName = b.LastName.toLowerCase();
		var aFirstName = a.FirstName.toLowerCase();
		var bFirstName = b.FirstName.toLowerCase();

		if (aLastName < bLastName) {
			return -1;
		}
		if (aLastName > bLastName) {
			return 1;
		}
		if (aFirstName < bFirstName) {
			return -1;
		}
		if (aFirstName > bFirstName) {
			return 1;
		}
	};
	var typeaheadInit = function (instance) {
		instance = instance || '.typeahead';
		$(instance).closest('.tt-error').remove();
		$('.tt-error').hide();
		$(instance).typeahead(
			{
				hint: false,
				highlight: false,
				minLength: 3,
			},
			{
				name: 'states',
				limit: 500,
				display: function (input) {
					hidePFError();
					return $('.typeahead').closest('input').val();
					// return input['LastName'];
				},
				async: true,
				templates: {
					suggestion: function (data) {
						return cdc_people_finder_util.format_cdc_person(data);
					},
				},
				source: function (query, synResults, asyncResults) {
					// current people finder endpoint does not handle multiple words well
					query = query.split(',');
					$(instance).addClass('input-loading');
					console.log(instance);
					return $.ajax({
						url: cdc_people_finder_url + query[0],
						type: 'GET',
						dataType: dataType,
						success: function (json) {
							var people = [];
							var map = {};
							$.each(json, function (i, person) {
								map[person.UserID] = person;
								people.push(person);
							});
							people.sort(peopleSort);
							$(instance).removeClass('input-loading');
							return asyncResults(people);
						},
						error: function () {
							showPFError(instance);
						},
					});
				},
			}
		);
	};

	var clear_typeahead = function () {
		$('.headerSearchInput-intranet').typeahead('destroy');
		$('.people-finder-input').typeahead('destroy'); // v1 fix
		$('.typeahead').blur(function () {
			hidePFError();
		});
	};

	var cdc_people_finder_util = {
		format_cdc_people: function (data) {
			var results = [];
			for (var i = 0; i < data.length; i++) {
				var person_data = cdc_people_finder_util.format_cdc_person(data[i]);
				console.log('person data: ' + person_data);
				results[i] = person_data;
			}
			return results;
		},
		format_cdc_person: function (input) {
			var item;
			item = '<div class="p-3" data-user-id="' + input.UserID + '">';
			item += '<a class="suggestion-url" href="https://navigator.cdc.gov/UserProfile/Index?id=' + input.id + '">';
			item += '<span class="fs11 name">' + input.LastName + ', ' + input.FirstName + '</span><br>';
			item += '<span class="fs0875">' + input.CDCTitle + '<br>';
			item += input.AdminCodeLongName + '</span>';
			item += '</a>';
			item +=
				'<a href="mailto:' +
				input.UserID +
				'@cdc.gov"><span class="fs1">' +
				input.UserID +
				'@cdc.gov</a> | <a href="tel:' +
				input.Phone +
				'">' +
				cdc_people_finder_util.make_pretty_phone_number(input.Phone) +
				'</a></span>';
			item += '</div>';
			return item;
		},
		make_pretty_phone_number: function (number) {
			if ('undefined' !== number) {
				if (10 >= number.length) {
					return number.replace(/(\d{0,3})(\d\d\d)(\d\d\d\d)/, '$1-$2-$3');
				} else {
					return number.replace(/(\d{0,3})(\d\d\d)(\d\d\d)(\d\d\d\d)/, '$1-$2-$3-$4');
				}
			}
		},
	};

	$('#typeahead-widget .typeahead').bind('typeahead:select', function (e, s, d) {
		var summary_url = cdc_people_finder_summary + '?UserID=' + s.UserID;
		window.location = summary_url;
	});

	// If jQuery typeahead not available, load it first
	if (!window.jQuery.fn || !window.jQuery.fn.typeahead) {
		CDC.Common.loadScript(
			CDC.tpPath + '/TemplatePackage/contrib/libs/typeahead/js/typeahead.bundle.min.js',
			function () {
				typeaheadInit();
				clear_typeahead();
			}
		);
	} else {
		typeaheadInit();
		clear_typeahead();
	}
})(jQuery, window, document);

$( function() {
	$( '.intranet-search-input' ).on( 'keypress', function( e ) {
		var key = e.which;

		// if people finder is selected in the dropdown, exit
		// if ( 'People Finder' === $( '#searchSelected-intranet' ).text() ) {
		// 	return false;
		// }
		if ( 13 === key ) { // the enter key code
			$( '.searchbutton-intranet' ).click();
			return false;
		}
	} );
} );
