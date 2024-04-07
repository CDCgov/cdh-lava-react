/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
/* Raw JS */
( function() {

	var bolder = function( line, word ) {
		line = line || '';
		var regex = new RegExp( '(' + word + ')', 'gi' );
		var result = line.toString().replace( regex, '<span class="font-weight-bold">$1</span>' );
		return result;
	};

	textTruncate = function( str, length, ending ) {
		if ( null === length ) {
			length = 100;
		}
		if ( null === ending ) {
			ending = '...';
		}
		if ( str.length > length ) {
			return str.substring( 0, length - ending.length ) + ending;
		} else {
			return str;
		}
	};

	var searchterm = CDC.Search.cleanTerm( CDC.Search.searchTerm );
	if ( ! searchterm ) {
		return;
	}
	var url = 'https://search.cdc.gov/srch/internet/browse2?q=' + searchterm + '&rows=3&start=0&wt=json';

	// JSON Call for Top 3 CDC.gov Results
	$.ajax( {
		type: 'GET',
		url: url,
		dataType: 'json',
	} ).done( function( data ) {
		var results = '';
		$.each( data.response.docs, function( key, value ) {
			results += '<div class="topsearchResults">';
			results += '<div class="topsearchResultsModule">';
			results += '<div class="searchResultsTitle"><a href="' + value.url + '" title="' + value.title + '">' + bolder( value.title, searchterm ) + ' </a></div>';
			results += '<div class="searchResultsUrl">' + value.url + '</div>';
			if ( value.description ) {
				results += '<div class="searchResultsDescription">' + textTruncate( value.description[ 0 ], 150, '...' ) + '</div>';
			} else {
				results += '<div class="searchResultsDescription"></div>';
			}
			results += '</div></div>';
		} );
		$( '#topSearchList' ).append( results );
		$( '#topSearchList' ).parents( '.card:first' ).find( '.card-footer a' ).attr( 'href', 'https://search.cdc.gov/search/?query=' + searchterm );
	} );

} )();

/* End Raw JS */
