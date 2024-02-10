import React, { useEffect } from 'react';
import FooterCDC from '../assets/ssi/footer-cdc';
import FooterAgency from '../assets/ssi/footer-agency';

export default ( props ) => {

	// on load
	useEffect( () => {
		// handles mobile accordions
		document.querySelectorAll( 'footer .footer-mobile .accordion .card' ).forEach( ( card ) => {
			let isOpen = false;
			let cardHeader = card.querySelector( '.card-header' );
			let cardBody = card.querySelector( '.collapse' );
			cardHeader.onclick = () => {
				isOpen = ! isOpen;
				if ( isOpen ) {
					cardBody.classList.add( 'show' );
					cardHeader.classList.remove( 'collapsed' );
				} else {
					cardBody.classList.remove( 'show' );
					cardHeader.classList.add( 'collapsed' );
				}
			};
		} );

	}, [] );

	return (
		<footer role="contentinfo" aria-label="Footer">
			<div className="container-fluid footer-wrapper">
				<div className="container">
					<div
						dangerouslySetInnerHTML={ {
							__html: FooterCDC,
						} }
					/>
				</div>
			</div>
			<div className="container-fluid agency-footer pb-md-0">
				<div className="container">
					<div
						dangerouslySetInnerHTML={ {
							__html: FooterAgency,
						} }
					/>
				</div>
			</div>
		</footer>
	);
};
