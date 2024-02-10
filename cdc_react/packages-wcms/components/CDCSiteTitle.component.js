import React from 'react';

export default ( props ) => {

	const tagline = props.tagline || '';
	const title = props.title || '';
	const link = props.link || '/';

	return (
		<div className="container-fluid site-title">
			<div className="container">
				<div className="row">
					<div className="col">
						<div className="display-6 text-white fw-500 py-1">
							<a href={ link }>
								{ title }
							</a>
						</div>
						{ ( tagline ) && (
							<p className="tagline d-none d-md-inline-block">
								{ tagline }
							</p>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};
