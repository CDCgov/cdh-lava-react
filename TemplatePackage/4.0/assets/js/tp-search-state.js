/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
'use strict';

/**
 * State Departments of Health Search page
 * This is only for a specific search page that targets content crawled from state departments of health.
 * @memberof CDC
 */
window.CDC = window.CDC || {};
window.CDC.StateSearch =
	CDC.StateSearch ||
	(function () {
		// Important util functions
		function getParam(name) {
			name = name.replace(/[\[\]]/g, '\\$&');
			var url = window.location.href;
			var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
			var results = regex.exec(url);
			if (!results) {
				return null;
			}
			if (!results[2]) {
				return '';
			}
			return decodeURIComponent(results[2].replace(/\+/g, ' '));
		}

		/*global log:false */
		var $ = jQuery;
		var solrDomain = 'search.cdc.gov';
		var solrRoot = window.location.protocol + '//' + solrDomain + '/srch';
		var searchNetwork = 'internet_phd';
		var ESC_MAP = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;',
		};
		var fileTests = {
			XLS: new RegExp('\\.(csv|tsv|xls|xlsx)\\??[^/]*$'),
			PDF: new RegExp('\\.pdf\\??[^/]*$'),
			PPT: new RegExp('\\.pptx?\\??[^/]*$'),
			DOC: new RegExp('\\.docx?\\??[^/]*$'),
			Image: new RegExp('\\.(png|jpg|gif|svg|jpeg)\\??[^/]*$'),
		};

		// Get params
		var pageCurrent = getParam('dpage') || 1;
		var searchType = getParam('type') || 'all';
		var searchTerm = getParam('query');
		var depts = getParam('depts') || '';
		var states = getParam('states') || '';
		var allDepts = [];
		var allTopics = [];
		var allLanguages = [];

		if ('string' === typeof depts) {
			depts = depts.split(/\s*,\s*/);
		}
		if ('string' === typeof states) {
			states = states.split(/\s*,\s*/);
		}

		pageCurrent = 1 > pageCurrent ? 1 : parseInt(pageCurrent, 10);

		var $dom = {}; // DOM jQuery pointers
		var config = {
			pageSize: 10,
			pagingChunk: 10,
		};
		// Holds info for search types
		var searchTypes = {
			all: {
				api: solrRoot + '/' + searchNetwork + '/browse2',
				page: pageCurrent,
				count: 0,
			},
			html: {
				api: solrRoot + '/' + searchNetwork + '/browse2',
				page: pageCurrent,
				count: 0,
				fq: 'type:*html*',
			},
			docs: {
				api: solrRoot + '/' + searchNetwork + '/browse2',
				page: pageCurrent,
				count: 0,
				fq: '-type:*html*',
			},
		};

		/**
		 * Initialize the State Search page
		 */
		function init(options) {
			// must have ID, or we're not on the right page
			var $wrapper = $('#cdc-state-search-page');
			if (!$wrapper.length) {
				return;
			}

			// extend config
			if (options) {
				$.extend(config, options);
			}

			// define DOM pointers
			$dom = {
				spanishHTML: $('html.esp'),
				wrapper: $wrapper,
				results: $('#results'),
				advanced: $wrapper.find('#cdc-state-advanced-search'),
				inputs: {
					term: $wrapper.find('#search-term'),
					depts: $wrapper.find('#search-dept'),
					states: $wrapper.find('#search-state'),
					language: $wrapper.find('#language'),
					filetype: $wrapper.find('#filetype'),
					all: $wrapper.find('#all-these-words'),
					exact: $wrapper.find('#exact-words'),
					any: $wrapper.find('#any-words'),
					none: $wrapper.find('#none-of-these-words'),
					topic: $wrapper.find('#topic'),
				},
				buttons: {
					search: $wrapper.find('#do-search'),
					advanced: $wrapper.find('a[href="#cdc-state-advanced-search"]'),
				},
				tabs: {
					all: function () {
						return $('a.nav-link[data-tab="all"]');
					},
					html: function () {
						return $('a.nav-link[data-tab="html"]');
					},
					docs: function () {
						return $('a.nav-link[data-tab="docs"]');
					},
				},
				panes: {
					all: function () {
						return $('#hdallresults, #mobilecoll-item-0_0');
					},
					html: function () {
						return $('#hdhtmlresults, #mobilecoll-item-0_1');
					},
					docs: function () {
						return $('#hddocresults, #mobilecoll-item-0_2');
					},
				},
			};

			$wrapper.find('input').on('keyup', function (e) {
				if (13 === e.which) {
					doSearch(1);
				}
			});

			$dom.buttons.advanced.on('click', function () {
				$dom.buttons.advanced.trigger('metrics-capture', ['cdchdsearch-advanced-open', 'click']);
			});

			$dom.buttons.search.on('click', function () {
				doSearch(1);
			});

			// finally trigger search if params are present
			$.ajax({
				url: window.cdcDeptsJSON || 'config.json',
				method: 'GET',
				dataType: 'json',
			}).done(function (results) {
				allDepts = results.depts;
				allTopics = results.topics;
				allLanguages = results.languages;
				initLoad();
			});

			$.ajax({
				url: 'date.html',
				dataType: 'text',
				method: 'GET',
			}).done(function (date) {
				date = String(date).trim();
				if (!date) {
					return;
				}
				$('.cdc-2020-bar .last-updated').text(date);
				var contentsource = $('.last-reviewed-row .last-reviewed .content-source').clone();
				$('.last-reviewed-row .last-reviewed')
					.html('Last ' + date)
					.append(contentsource);
			});
		}

		/**
		 * Run after states load
		 */
		function initLoad() {
			// Load dropdowns
			$.each(allDepts, function (index, data) {
				var val = data.code || '';
				var label = data.label || '';
				var name = data.name || '';
				if (val && label && data.domain) {
					$dom.inputs.depts.append(
						'<option value="' + escapeString(val, true) + '">' + escapeString(name) + '</option>'
					);
					if ('state' === data.level || 'territory' === data.level) {
						$dom.inputs.states.append(
							'<option value="' + escapeString(val, true) + '">' + escapeString(label) + '</option>'
						);
					}
				}
			});
			$.each(allTopics, function (index, topic) {
				if (!topic) {
					return;
				}
				$dom.inputs.topic.append(
					'<option value="' + escapeString(topic, true) + '">' + escapeString(topic) + '</option>'
				);
			});
			$.each(allLanguages, function (index, language) {
				if (!language) {
					return;
				}
				if (!$dom.inputs.language.find('option[value="' + language + '"]').length) {
					$dom.inputs.language.append(
						'<option value="' + escapeString(language, true) + '">' + escapeString(language) + '</option>'
					);
				}
			});

			if (depts) {
				$.each(depts, function (i, dept) {
					$dom.inputs.depts.find('option[value="' + dept + '"]').prop('selected', true);
				});
			}
			if (states) {
				$.each(states, function (i, state) {
					$dom.inputs.states.find('option[value="' + state + '"]').prop('selected', true);
				});
			}

			if (searchType && searchTypes[searchType] && 'all' !== searchType) {
				$dom.tabs.all().removeClass('active');
				$dom.panes.all().removeClass('active');
				$dom.tabs[searchType]().addClass('active');
				$dom.panes[searchType]().addClass('active');
			}
			if (null !== searchTerm) {
				$dom.inputs.term.val(searchTerm);
				doSearch();
			}
		}

		function showTab(activeTab) {
			for (var tab in $dom.tabs) {
				$dom.tabs[tab]().toggleClass('active', activeTab === tab);
				$dom.panes[tab]().toggleClass('active', activeTab === tab);
			}
		}

		/**
		 * Perform the 3 searches
		 */
		function doSearch(newPage) {
			$dom.results.show();
			// reset the 3 search types
			$.each(searchTypes, function (type) {
				if (newPage) {
					searchTypes[type].page = newPage;
				}
				updateSearch(type);
			});
			window.location.href = '#results';
			updateMetrics();
			showTab('all');
		}

		/**
		 * Update search for a given type
		 * @param searchType
		 */
		function updateSearch(type) {
			if (!searchTypes[type]) {
				return false;
			}
			var terms = [];
			var query = {
				start: config.pageSize * (searchTypes[type].page - 1),
				rows: config.pageSize,
				wt: 'json',
				hl: 'on',
				df: 'description,title',
				'hl.simple.pre': '<strong>',
				'hl.simple.post': '</strong>',
				'hl.fragsize': 200,
				fl: 'url,title,description,keyword,content,score',
			};
			var params;
			var domains = [];
			var inputs = {
				term: $dom.inputs.term.val().trim(),
				none: $dom.inputs.none.val().trim(),
				all: $dom.inputs.all.val().trim(),
				exact: $dom.inputs.exact.val().trim(),
				any: $dom.inputs.any.val().trim(),
				topic: $dom.inputs.topic.val(),
				language: $dom.inputs.language.val(),
				filetype: $dom.inputs.filetype.val(),
			};

			// build terms
			searchTerm = $dom.inputs.term.val().trim();
			terms.push(cleanTerm(searchTerm.trim()));
			// handle advanced terms
			if (inputs.exact) {
				terms.push('"' + cleanTerm(inputs.exact.trim()) + '"');
			}
			if (inputs.any) {
				terms.push(
					'"" AND (' +
						cleanTerm(
							inputs.any
								.split(/[\s,]+/)
								.join(' ')
								.trim()
						) +
						')'
				);
			}
			if (inputs.all) {
				$.each(inputs.all.split(/[\s,]+/), function (i, term) {
					terms.push('(' + cleanTerm(term) + ')');
				});
			}
			if (inputs.none) {
				terms.push(
					'-(' +
						cleanTerm(
							inputs.none
								.split(/[\s,]+/)
								.join(' ')
								.trim()
						) +
						')'
				);
			}
			terms = unique(terms);
			// if more than 1 term, remove blank terms
			if (terms.length) {
				query.q = terms.join(' AND ');
			}

			// build list of domains to filter on based on states and depts selected
			depts = $dom.inputs.depts.val();
			states = $dom.inputs.states.val();
			$.each(allDepts, function (index, data) {
				$.each(depts, function (i, dept) {
					if (dept && dept === data.code && data.domain) {
						domains = domains.concat(data.domain.split(/\s*,\s*/));
					}
				});
				$.each(states, function (i, state) {
					if (state && (state === data.state || state === data.code)) {
						domains = domains.concat(data.domain.split(/\s*,\s*/));
					}
				});
			});
			domains = unique(domains);
			if (domains.length) {
				domains = domains.map(function (domain) {
					return 'url:' + domain.trim();
				});
				query.fq = domains.join(' OR ');
			}
			// the searchTypes has additional "fq" params for the different types
			params = $.param(query);
			if (searchTypes[type].fq) {
				params += '&fq=' + searchTypes[type].fq;
			}
			// add language
			if (inputs.language) {
				params += '&fq=alt_language:"' + cleanTerm(inputs.language) + '"';
			}
			// add topic
			if (inputs.topic) {
				params += '&fq=alt_topics:"' + cleanTerm(inputs.topic) + '"';
			}
			// add filetype
			if (inputs.filetype) {
				params += '&fq=' + inputs.filetype;
			}
			$.ajax({
				type: 'GET',
				url: searchTypes[type].api + '?' + params,
				dataType: 'json',
			}).done(function (response) {
				updateResults(type, response);
			});
		}

		/**
		 *
		 * @param response
		 * @param type
		 */
		function updateResults(type, response) {
			if (!$dom.panes[type]) {
				console.error('Search Type not recognized: ', type);
				return;
			}
			var results = response.response || {};
			var docs = results.docs;
			var $pane = $dom.panes[type]();
			var $results = $pane.find('.search-results');
			var $pagination = $pane.find('.pagination');
			var page = searchTypes[type].page;
			var count = parseInt(results.numFound, 10);
			var pages = Math.ceil(count / config.pageSize);

			searchTypes[type].count = count;

			$results.html('');
			$pagination.html('');

			// Add results count
			var summaryCount = count ? numberWithCommas(count) : 'No';
			var summary = '<strong>' + summaryCount + '</strong> result' + (1 === count ? '' : 's') + ' returned';
			if (searchTerm) {
				summary += ' for <em><b>' + escapeString(searchTerm) + '</b></em>';
			}
			$results.append('<div class="searchResultsSummary">' + summary + '</div>');

			// update results html
			$.each(docs, function (index, doc) {
				$results.append(getSingleResultHTML(doc));
			});

			// update pagination
			var rangeStart = page - Math.floor(config.pagingChunk / 2);
			var rangeStop = rangeStart + config.pagingChunk;
			if (rangeStop > pages) {
				rangeStart -= rangeStop - pages;
				rangeStop = pages;
				if (1 > rangeStart) {
					rangeStart = 1;
				}
			}
			if (1 > rangeStart) {
				rangeStop -= rangeStart - 1;
				rangeStart = 1;
				if (rangeStop > pages) {
					rangeStop = pages;
				}
			}
			var className = '';
			var $li = '';
			var previous = 2 > page ? false : page - 1;
			var next = page >= pages ? false : page + 1;

			// previous
			if (previous) {
				$pagination.append(
					'<li class="page-item"><a class="page-link" href="#" data-type="' +
						type +
						'" data-page="' +
						previous +
						'">Previous</a></li>'
				);
			} else {
				$pagination.append('<li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>');
			}

			for (var i = rangeStart; i <= rangeStop; i++) {
				className = 'page-item d-none d-md-inline';
				if (page === i) {
					className += ' active';
				}
				$li = $(
					'<li><a class="page-link" href="#results" data-type="' +
						type +
						'" data-page="' +
						i +
						'">' +
						i +
						'</a></li>'
				);
				$li.attr('class', className);
				$pagination.append($li);
			}

			// next
			if (next) {
				$pagination.append(
					'<li class="page-item"><a class="page-link" href="#" data-type="' +
						type +
						'" data-page="' +
						next +
						'">Next</a></li>'
				);
			} else {
				$pagination.append('<li class="page-item disabled"><a class="page-link" href="#">Next</a></li>');
			}

			$pagination.find('.page-link').on('click', function (e) {
				e.preventDefault();
				var $item = $(e.currentTarget);
				updatePage($item.data('type'), $item.data('page'));
			});
		}

		/**
		 * Function called against a pagination link
		 * @param e
		 */
		function updatePage(type, page) {
			if (!searchTypes[type]) {
				console.error('Search type not valid: ', type);
				return false;
			}
			searchTypes[type].page = page;
			updateSearch(type);
		}

		/**
		 * Template for single result
		 *
		 * @param doc
		 * @returns {jQuery}
		 */
		function getSingleResultHTML(doc) {
			var url = doc.url || '';
			var title = doc.title || '';
			var targetBlank = ' target="_blank" rel="noreferrer noopener"'; // right now all external
			var description = '';

			if (!title) {
				title = url;
			}
			var titleBolded = boldTerm(title, searchTerm);

			if ('string' === typeof doc.description) {
				description = doc.description;
			} else if ('object' === typeof doc.description && doc.description.length) {
				description = doc.description[0];
			} else if ('string' === typeof doc.content) {
				description = doc.content;
			}
			description = stripTags(description);
			var descriptionWords = description.split(/\s+/);
			if (100 <= descriptionWords.length) {
				description = descriptionWords.slice(0, 10).join(' ') + '...';
			}
			description = boldTerm(description, searchTerm);

			var html = [];

			html.push('<div class="searchResultsModule">');
			html.push(
				'<div class="searchResultsTitle lead"><a href="' +
					url +
					'" title="' +
					escapeString(title, true) +
					'"' +
					targetBlank +
					'>' +
					addDocsTag(url) +
					titleBolded +
					'</a></div>'
			);
			html.push('<div class="searchResultsUrl">' + url + '</div>');
			html.push('<div class="searchResultsDescription">' + description + '</div>');
			html.push('</div>');

			return $('<div>').html(html.join('')).html();
		}

		/**
		 * Given all the values for the current search
		 * @param inputs
		 */
		function updateMetrics() {
			/**
			 *
			 * REQUIREMENTS
			 * - prop40 - cdchdsearch-lang: [Language]
			 * - prop40 - cdchdsearch-ft: [FileType]
			 * - prop40 - cdchdsearch-topic: [Topic]
			 * - eVar5  - [counter of number of searches per visit]
			 * - eVar63 - [search term]
			 * - eVar76 - History of search terms, pipe deliminated
			 * - eVar78 - cdchdsearch-state: [State/Territory]
			 */
			var inputs = {
				term: $dom.inputs.term.val() || '',
				none: $dom.inputs.none.val() || '',
				all: $dom.inputs.all.val() || '',
				exact: $dom.inputs.exact.val() || '',
				any: $dom.inputs.any.val() || '',
				topic: $dom.inputs.topic.val() || '',
				language: $dom.inputs.language.val() || '',
				filetype: $dom.inputs.filetype.val() || '',
			};
			var query = inputs.term;
			var e76 = [];
			var e78 = [];
			var s40 = [];
			var counter = parseInt((window.sessionStorage && window.sessionStorage.getItem('cdchdcount')) || 0, 10);

			if ('object' !== typeof window.s) {
				console.error('ERROR: window.s not present.');
				return;
				// window.s = {};
				// window.s.tl = function(a, b, c) { console.info( 'CALL: ', window.s ); }
			}

			// build counter
			counter = isNaN(counter) ? 1 : counter + 1;
			window.sessionStorage && window.sessionStorage.setItem('cdchdcount', counter);
			window.s.eVar5 = counter;

			window.s.eVar63 = inputs.term.trim();

			// Build eVar76
			var termsString = String(
				(window.sessionStorage && window.sessionStorage.getItem('cdc_search_history')) || ''
			);
			var terms = termsString ? termsString.split(/\s*\|\s*/) : [];
			if (query) {
				if (!terms.length || query !== terms[terms.length - 1]) {
					terms.push(query);
				}
				if (10 < terms.length) {
					terms = terms.slice(-10);
				}
				termsString = terms.join('|');
				window.sessionStorage && window.sessionStorage.setItem('cdc_search_history', termsString);
			}
			window.s.eVar76 = termsString;

			// Build eVar78
			e78 = e78.concat($dom.inputs.depts.val());
			e78 = e78.concat($dom.inputs.states.val());
			e78 = unique(e78);
			window.s.eVar78 = 'cdchdsearch-state:' + e78.join('|');

			// Build prop40
			s40.push('ci-cdchdsearch-search: click');
			if (inputs.language) {
				s40.push('lang:' + $dom.inputs.language.find('option:selected').text().toLowerCase());
			}
			if (inputs.filetype) {
				s40.push('ft:' + $dom.inputs.filetype.find('option:selected').text().toLowerCase());
			}
			if (inputs.topic) {
				s40.push('topic:' + $dom.inputs.topic.find('option:selected').text().toLowerCase());
			}
			window.s.prop40 = s40.join('|');
			window.s.pageName = null;
			window.s.linkTrackVars = 'prop40,prop49,prop46,prop2,prop31,channel,eVar76,eVar78,eVar5,eVar63';
			window.s.tl(true, 'o', 'click');
		}

		var addDocsTag = function (url) {
			var docDetect = url.toLowerCase(),
				prefix = '';
			$.each(fileTests, function (type, test) {
				if (docDetect.match(test)) {
					prefix = '<small>[' + type + ']</small> ';
				}
			});
			return prefix;
		};

		var boldTerm = function (line, word) {
			line = line || '';
			var regex = new RegExp('(' + word + ')', 'gi');
			return line.replace(regex, '<span class="font-weight-bold">$1</span>');
		};

		function stripTags(input, allowed) {
			allowed = (
				String(allowed || '')
					.toLowerCase()
					.match(/<[a-z][a-z0-9]*>/g) || []
			).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
				commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
				brokenTags = /(<\w+(?:\s+\w+=\"[^"]+\")*)(?=[^>]+(?:<|$))/g;
			return input
				.replace(commentsAndPhpTags, '')
				.replace(brokenTags, '')
				.replace(tags, function ($0, $1) {
					return -1 < allowed.indexOf('<' + $1.toLowerCase() + '>') ? $0 : '';
				});
		}

		function escapeString(s, forAttribute) {
			if ('string' !== typeof s) {
				return s;
			}
			return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function (c) {
				return ESC_MAP[c];
			});
		}
		function numberWithCommas(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		}

		function cleanTerm(term) {
			return String(term).replace(/["|;$%#<>()+]/g, '');
		}

		function unique(array) {
			array = array.filter(function (el) {
				return Boolean(el);
			});
			return array.filter(function (el, index, arr) {
				return index === arr.indexOf(el);
			});
		}

		// This expects jQuery to have already been run
		init();

		// Public method
		return {};
	})();
