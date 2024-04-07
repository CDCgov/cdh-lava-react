import React from 'react';

export default ( props ) => {
	return (
		<div className="container d-flex flex-wrap body-wrapper bg-white">
			<main className="col-12 order-lg-2" role="main" aria-label="Main Content Area">
				<div className="row">
					<div className="col content content-fullwidth">
						{ props.children }
					</div>
				</div>
			</main>
		</div>
	);
};
