import React from 'react';
import ReactDOM from 'react-dom';
import CDCHeader from './components/CDCHeader.component';
import CDCSiteTitle from './components/CDCSiteTitle.component';
import CDCBody from './components/CDCBody.component';
import CDCFooter from './components/CDCFooter.component';
import './assets/css/bootstrap.min.css';
import './assets/css/app.min.css';

// To use a specific color theme
//import './assets/css/theme-orange.min.css';

ReactDOM.render(
	<>
		<CDCHeader></CDCHeader>
		<CDCSiteTitle title="Template Package Gallery"></CDCSiteTitle>
		<CDCBody>
			<h2>Template Package React</h2>
			<p>
				This page is a demonstration of the Template Package React app available at
			</p>
			<p>
				<code>@cdcgov/templatepackage-react</code>
			</p>
			<p>More information is available in TP Gallery and Github.</p>
		</CDCBody>
		<CDCFooter></CDCFooter>
	</>,
	document.getElementById( 'root' )
);
