import React, { useEffect } from 'react';
import Logo from '../assets/icons/logos/cdclogo.svg';
import LogoMobile from '../assets/icons/logos/cdclogo-mobile.svg';
import HeaderSearch from '../assets/ssi/header-search';

export default (props) => {
	let searchEnabled = props?.search;
	if (searchEnabled === undefined) {
		searchEnabled = true;
	}

	// on load
	useEffect(() => {
		// handles display of mobile search menu
		if (!searchEnabled) {
			return;
		}
		let headerSearch = document.querySelector('header .headerSearch form');
		let searchButton = headerSearch.querySelector('.search-button');
		let searchMenu = headerSearch.querySelector('.dropdown-menu');
		let searchSubmit = headerSearch.querySelector('.search-submit');
		let isOpen = false;

		searchButton.onclick = () => {
			isOpen = !isOpen;
			if (isOpen) {
				searchMenu.classList.add('show');
				headerSearch.classList.add('show');
				searchButton.setAttribute('aria-expanded', 'true');
			} else {
				searchMenu.classList.remove('show');
				headerSearch.classList.remove('show');
				searchButton.setAttribute('aria-expanded', 'false');
			}
		};
		searchSubmit.onclick = () => {
			headerSearch.submit();
		}
	}, []);

	return (
		<div className="container-fluid header-wrapper">
			<div className="container">
				<header role="banner" aria-label="Header" className="pt-2 pb-2">
					<div className="row">
						<div className="col cdc-logo">
							<a href="https://www.cdc.gov">
								<span className="sr-only">
									Centers for Disease Control and Prevention. CDC twenty four seven. Saving Lives,
									Protecting People
								</span>
								<img
									src={Logo}
									alt="Centers for Disease Control and Prevention"
									className="d-none d-lg-block logo-large masthead-subpage"
								/>
								<img
									src={LogoMobile}
									alt="Centers for Disease Control and Prevention"
									className="d-lg-none logo-small masthead-1-col"
								/>
							</a>
						</div>
						{searchEnabled ? (
							<div
								className="col-2 col-md-3 col-xl-5 col-xxl-4 tp-search"
								dangerouslySetInnerHTML={{
									__html: HeaderSearch,
								}}
							></div>
						) : (
							''
						)}
					</div>
				</header>
			</div>
		</div>
	);
};
