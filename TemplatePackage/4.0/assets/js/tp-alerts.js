/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
/**
 * TP Alerts
 * Logic for rendering WCMS alerts
 */
( function( $ ) {

	$( '*[id^="alert_unique_"]' ).each( function() {

		var today = new Date();
		var alertStart = new Date( $( this ).attr( 'data-alert-start' ) );
		var alertEnd = new Date( $( this ).attr( 'data-alert-end' ) );

		if ( ( today.getTime() >= alertStart.getTime() && alertEnd.getTime() >= today.getTime() ) ||
			( today.getTime() >= alertStart.getTime() && isNaN( alertEnd.getTime() ) ) ||
			( isNaN( alertStart.getTime() ) && alertEnd.getTime() >= today.getTime() ) ||
			( isNaN( alertStart.getTime() ) && isNaN( alertEnd.getTime() ) ) ) {
			$( this ).removeClass( 'd-none' );
		}
	} );

} )( jQuery );
