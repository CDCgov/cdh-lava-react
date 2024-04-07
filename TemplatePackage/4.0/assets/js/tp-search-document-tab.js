/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
/* Raw JS */
( function( $ ) {
	//var solrDomain = null;
	var solrRoot = CDC.Search.config.solrRoot;
	var apiBase = 'browse2-doc';
	var apiUrlBase = solrRoot + '/intranet/' + apiBase;
	var query = CDC.Search.cleanTerm( CDC.Search.searchTerm );
	var newResultsBlock = $( '.documentsResultsData' );
	var module;
	var cardBody;
	var title;
	//var url;
	var titleAnchor;
	var seriesUrl;
	var description;
	var current;
	var documentsResults;
	var moduleTitle,
		moduleSeries,
		pageCurrent = 1,
		startRow = 0,
		defaultPagingChunk = 10,
		totalPages = 0;
	var boldTerm = function boldTerm( line, word ) {
		var retval = '';
		line = 'object' === typeof line ? line[ 0 ] : line || '';
		word = word || '';
		if ( line.length && word.length ) {
			var regex = new RegExp( '(' + word + ')', 'gi' );
			retval = line.replace( regex, '<span class="font-weight-bold">$1</span>' );
			if ( 230 < line.length ) {
				// 				retval = retval.replace( /(.{230})..+/, '$1&hellip;' );
				retval = retval.substr( 0, 230 ) + '&hellip;';
			}
		}
		return retval;
	};
	var cleanSearchString = function cleanSearchString( searchTerm ) {
		var cleanString = searchTerm.replace( /[|;$%#<>()+]/g, '' );
		cleanString = encodeURI( cleanString );
		return cleanString;
	};
	var setupPagingListeners = function setupPagingListeners() {
		var $btnPagination = $( '.pagination.documents a' );
		$btnPagination.off( 'click' );
		$btnPagination.on( 'click', function( e ) {
			e.preventDefault();
			var pageNew = $( this ).attr( 'data-page' );
			if ( 1 > pageNew || pageNew === pageCurrent ) {
				return false;
			} else {
				pageCurrent = pageNew;
				getResults( function() {
					buildPaging();
					setupPagingListeners();
					window.scrollTo( 0, 400 );
				} );
			}
		} );
	};
	var addDocsTag = function( url ) {
		var docDetect = url.substr( -6 ),
			prefix = '';
		if ( -1 < docDetect.toLowerCase().indexOf( '.pdf' ) ) {
			prefix = '<small>[PDF]</small> ';
		}
		if ( -1 < docDetect.toLowerCase().indexOf( '.doc' ) ) {
			prefix = '<small>[DOC]</small> ';
		}
		if ( -1 < docDetect.toLowerCase().indexOf( '.ppt' ) ) {
			prefix = '<small>[PPT]</small> ';
		}
		return prefix;
	};
	var buildResults = function buildResults() {
		if ( 0 === documentsResults.response.docs.length ) {
			newResultsBlock.text( 'no Documents results' );
		} else {
			newResultsBlock = $( '.documentsResultsData' );
			newResultsBlock.empty();
			newResultsBlock.append( '<div class="searchResultsSummary"><strong>' + documentsResults.response.numFound.toLocaleString() + '</strong> documents returned for <em><b>' + query + '</b></em> </div>' );
			totalPages = Math.ceil( documentsResults.response.numFound / 20 );
			for ( var i = 0; i < documentsResults.response.docs.length; i++ ) {
				current = documentsResults.response.docs[ i ];
				module = $( '<div />' ).addClass( 'searchResultsModule' );
				moduleTitle = $( '<div />' ).addClass( 'searchResultsTitle lead' ).html( $( '<a />' ).attr( 'href', current.url ).html( addDocsTag( current.url ) + boldTerm( current.title, query ) ) );
				moduleSeries = $( '<div />' ).addClass( 'searchResultsUrl' ).text( current.url );
				description = $( '<div /> ' ).addClass( 'searchResultsDescription' ).html( boldTerm( current.content, query ) );
				module.append( moduleTitle );
				module.append( moduleSeries );
				module.append( description );
				newResultsBlock.append( module );
			}
		}
	};
	var buildPaging = function buildPaging() {
		if ( 20 < documentsResults.response.numFound ) {
			var disabled = 1 < pageCurrent ? '' : 'disabled',
				loopStart = Math.ceil( ( pageCurrent - defaultPagingChunk ) / 2 ),
				i = 1,
				html = [];
			html.push( '<nav class="mt-4 nav d-flex justify-content-center" aria-label="Search Results Pagination">' );
			html.push( '<ul class="pagination documents">' );
			html.push( '\t<li class="page-item ' + disabled + '"><a class="page-link" href="#" data-page="' + ( pageCurrent - 1 ) + '">Previous</a></li>' );
			if ( 1 > loopStart ) {
				loopStart = 1;
			}
			for ( loopStart; loopStart <= totalPages && i <= defaultPagingChunk; loopStart++ ) {
				var active = Number( loopStart ) === Number( pageCurrent ) ? 'active' : '';
				html.push( '\t<li class="page-item d-none d-md-inline ' + active + '"><a class="page-link" href="#" data-page="' + loopStart + '">' + loopStart + '</a></li>' );
				i++;
			}
			if ( totalPages > pageCurrent ) {
				html.push( '<li class="page-item"><a class="page-link"  href="#" data-page="' + ( pageCurrent + 1 ) + '">Next</a></li>' );
			}
			html.push( '</ul>' );
			html.push( '</nav>' );
			newResultsBlock.append( html.join( '' ) );
		}
	};
	var getResults = function getResults( callback ) {
		var searchTerm = cleanSearchString( query ),
			rows = 20;
		if ( 1 < pageCurrent ) {
			startRow = rows * ( pageCurrent - 1 );
		}
		console.log( apiUrlBase + '?q=' + searchTerm + '&rows=' + rows + '&start=' + startRow + '&wt=json' );
		$.when( $.ajax( {
			type: 'GET',
			url: apiUrlBase + '?q=' + searchTerm + '&rows=' + rows + '&start=' + startRow + '&wt=json',
			dataType: 'json',
			cache: false
		} ).done( function( results ) {
			documentsResults = results;
		} ).fail( function( jqXHR, textStatus ) {
			console.log( 'Documents Request failed: ' + textStatus );
		} ).always( function() {} ) ).then( function() {
			buildResults();
			callback();
		} );
	};
	if ( query && 0 < query.trim().length ) {
		getResults( function() {
			buildPaging();
			setupPagingListeners();
		} );
	}
} )( jQuery );

/* End Raw JS */
