/**
 * @version 4.22.11
 * Date: 2023-02-01T11:19:52.232Z
 */
'use strict'
/**
 * tp-search-intra-results.js
 * @fileOverview Logic for the intranet.cdc.gov Search Results page
 * @version 0.1.0.1
 * @copyright 2020 Centers for Disease Control
 *
 * This JS is specifically built for the intranet.cdc.gov/search page
 * It expects:
 *  - TP app.js loaded first, which included CDC.Search (tp-search.js)
 *  - Currently has 3 other files that load after it:
 *      - tp-search-video.js
 *      - tp-search-journals.js
 *      - tp-search-podcasts.sj
 *
 */
window.CDC = window.CDC || {}

/**
 * @module Search
 * @memberof CDC
 * @param {object} $ - jQuery object
 * @param {object} w - window object
 * @param {object} g - CDC.Global object
 */
CDC.SearchResults =
  CDC.SearchResults ||
  (function () {
    'use strict'

    // Stop now if we're not on a search results page
    if (!$('#cdc-search-results').length) {
      console.error('tp-search-results.js: not search results page.')
      return
    }

    /*global log:false */
    var env = '@tp-environment-target@'

    // These values are already available from CDC.Search
    var searchTerm = CDC.Search.searchTerm
    var searchInputs = CDC.Search.searchInputs
    var siteLimit = CDC.getParam('sitelimit') || CDC.getParam('siteLimit') || ''
    var rawSearchTerm = String(searchTerm).trim().toLowerCase()
    var pageCurrent = parseInt(CDC.getParam('dpage'), 10)
    var totalPages = 0
    var siteName = CDC.getParam('sitename') || CDC.getParam('siteName') || titleCase(siteLimit)
    var pageName
    var setLanguage = CDC.getParam('affiliate') || 'cdc-main'
    var language = 'es-us' === $('html').attr('lang') || 'cdc-es' === setLanguage ? 'es-us' : 'en-us'
    var initialized = false
    var advancedfields = ['language', 'date1', 'date2', 'url']
    var advancedSearch = Boolean(searchInputs.language || searchInputs.all || searchInputs.any || searchInputs.exact || searchInputs.none || searchInputs.date1 || searchInputs.date2) // if search results page, check for meganav; // are we performing an advacned search
    var allSearch = Boolean(advancedSearch || searchTerm) // are we showing results for the all tab - in case there's no valid search for other tabs

    // strip any folders under siteLimit
    siteName = siteName.replace(/[\/\|].*/, '')

    if ('number' !== typeof pageCurrent || isNaN(pageCurrent)) {
      pageCurrent = 1
    }
    pageCurrent = 1 > pageCurrent ? 1 : pageCurrent
    var languageLabels = {
      cdcRecommendations: 'Recommended by CDC',
      page: 'Page',
      next: 'Next',
      previous: 'Previous',
      searchResults: 'Search Results',
      of: 'of',
      returnedFor: 'results returned for',
      zeroResults: 'No results found.',
      zeroSuggestion: 'Consider adjusting your search terms.',
      noSearchMessage: '<p style="padding:20px 0;">Please use the search area at the top of the page.</p>',
      localSearchPre: 'We are <b>only</b> including results from the',
      localSearchPost: 'site',
      localSearchAllPre: 'Do you want to see results',
      localSearchAllPost: 'from all sites',
      zeroDidyoumean: 'Did you mean',
      filterResults: 'Filter Results',
      clearFilter: 'Clear All',
      all: 'Must include',
      any: 'Include any',
      exact: 'Matching',
      none: 'Not including',
      language: 'Language',
      url: 'URL matches',
      dates: 'Between dates',
      topic: 'Topics',
      audience: 'Audiences',
      contenttype: 'Content Types',
      spanish: {
        cdcRecommendations: 'Recomendaci&oacute;n de CDC',
        page: 'P&aacute;gina',
        next: 'Siguiente',
        previous: 'Anterior',
        searchResults: 'Resultados de la b&uacute;squeda',
        of: 'de',
        returnedFor: 'resultados encontrados para',
        zeroResults: 'No se encontraron resultados.',
        zeroSuggestion: 'Considere revisar sus t&#xE9;rminos de b&#xFA;squeda.',
        noSearchMessage: '<p style="padding:20px 0;">Utilice el &aacute;rea de b&uacute;squeda en la parte superior de la p&aacute;gina.</p>',
        localSearchPre: 'Incluimos resultados de b&uacute;squeda de',
        localSearchPost: '',
        localSearchAllPre: '&iquest;Desea ver los resultados',
        localSearchAllPost: 'de todos los sitios',
        zeroDidyoumean: '&iquest;Quiso decir',
        filterResults: 'Filtrar Resultados',
        clearFilter: 'Borrar Filtros',
        all: 'Deban incluir',
        any: 'Incluyan',
        exact: 'Coincidan exactamente con',
        none: 'Que no incluyan',
        language: 'Idioma',
        url: 'URL incluir',
        dates: 'Entre estas fechas',
        topic: 'Topics',
        audience: 'Audiences',
        contenttype: 'Content Types'
      }
    }
    var config = {
      env: env,
      pageSize: 10,
      defaultBestBetsPageSize: 3,
      defaultAutoSuggest: 5,
      defaultPagingChunk: 10,
      widgetChatBot: false, // true when we want search
      json_ld: true, // don't render widgets yet
      useExtended: false, // whether to use extended fields
      useBoostQuery: true, // use boost query weighting
      sortfilters: true, // display sortfilters
      apierror: 'CDC Search is undergoing routine maintenance and will be restored shortly.<br />We apologize for the inconvenience and invite you to return later or go to our <a href="//www.cdc.gov/diseasesconditions/">A-Z index</a> to browse by topic.',
      apierrorIntranet: 'CDC Intranet Search is undergoing routine maintenance and will be restored shortly.<br />We apologize for the inconvenience and invite you to return later or go to our <a href="http://intranet.cdc.gov/connects/az/a.html">A-Z index</a> to browse by topic.'
    }
    // Load CDC.Search.config values on top of this config
    config = $.extend(config, CDC.Search.config)

    // account for proxy
    if (String(window.location.hostname).match(/\.msappproxy\.net$/)) {
      config.solrRoot = 'https://intranetsearch-cdc.msappproxy.net/srch'
    }

    var solrURL = config.solrRoot + '/intranet/browse2'
    var solrBBURL = config.solrRoot + '/intranet_bb/bestbets'

    if ('es-us' === language) {
      languageLabels = languageLabels.spanish
      solrURL = config.solrRoot + '/intranet_es/browse2'
      solrBBURL = config.solrRoot + '/intranet_esbb/bestbets'
    }

    /**
     * Page Initialization
     */
    function pageInit() {
      // allow only once
      if (initialized) {
        return
      }
      initialized = true

      // change to load videos, journals and podcasts on demand
      // These listeners are for mobile accordion
      $(document).on('shown.bs.collapse', function (e) {
        if ('mobilecoll-item-0_2' === e.target.id && window.CDC.SearchResults.Journals) {
          window.CDC.SearchResults.Journals.init()
        }
        if ('mobilecoll-item-0_3' === e.target.id && window.CDC.SearchResults.Podcasts) {
          window.CDC.SearchResults.Podcasts.init()
        }
      })

      if ('closed' !== CDC.Search.settings.get('advanced-form') && advancedSearch) {
        CDC.Search.openAdvancedForm()
      }

      // If we're on the results page, load
      if (siteLimit) {
        addLocalSearchField()
      }
      getResults()
      setupListeners()
    }

    /**
     * Read query params and build a SOLR query term
     * @param boolean skipAdvanced If true, only return values for main query
     */
    function getSearchQuery(skipAdvanced) {
      var terms = []
      var solrQuery
      var queryTerm = cleanTerm(String(searchTerm || '').trim())
      var date1 = searchInputs.date1 ? new Date(searchInputs.date1) : null
      var date2 = searchInputs.date2 ? new Date(searchInputs.date2) : null
      var date1val
      var date2val
      // test if dates are valid
      if (date1 && isNaN(date1.getTime())) {
        date1 = null
      }
      if (date2 && isNaN(date2.getTime())) {
        date2 = null
      }
      if (queryTerm) {
        terms.push(queryTerm)
      }
      // handle advanced terms
      if (searchInputs.exact) {
        terms.push('"' + cleanTerm(searchInputs.exact.trim()) + '"')
      }
      if (searchInputs.any) {
        terms.push(
          '"" AND (' +
            cleanTerm(
              searchInputs.any
                .split(/[\s,]+/)
                .join(' ')
                .trim()
            ) +
            ')'
        )
      }
      if (searchInputs.all) {
        $.each(searchInputs.all.split(/[\s,]+/), function (i, term) {
          terms.push('(' + cleanTerm(term) + ')')
        })
      }
      if (searchInputs.none) {
        terms.push(
          '-(' +
            cleanTerm(
              searchInputs.none
                .split(/[\s,]+/)
                .join(' ')
                .trim()
            ) +
            ')'
        )
      }
      terms = unique(terms)
      solrQuery = encodeURI(terms.join(' AND ').trim())
      if (searchInputs.language && !skipAdvanced) {
        solrQuery += '&fq=lang:' + searchInputs.language
      }
      if ((date1 || date2) && !skipAdvanced) {
        // if date1 is after date2, switch
        if (date1 && date2 && date1.getTime() > date2.getTime()) {
          date1 = new Date(searchInputs.date2)
          date2 = new Date(searchInputs.date1)
        }
        if (date1) {
          date1val = date1.getFullYear() + '-' + pad(date1.getMonth() + 1, 2) + '-' + pad(date1.getDate()) + 'T00:00:00.000Z'
        } else {
          date1val = '*'
        }
        if (date2) {
          date2val = date2.getFullYear() + '-' + pad(date2.getMonth() + 1, 2) + '-' + pad(date2.getDate()) + 'T23:59:59.999Z'
        } else {
          date2val = '*'
        }
        solrQuery += '&fq=dc_date:[' + date1val + ' TO ' + date2val + ']'
      }
      if (searchInputs.url && !skipAdvanced) {
        solrQuery += '&fq=(url:"' + String(searchInputs.url).replace(/\s+/g, '" OR url:"').trim() + '")'
      }
      return solrQuery
    }

    function valuesToLabel(values, clickable, field) {
      values = Array.isArray(values) ? values : [String(values)]
      values = values.map(function (value) {
        return cleanTerm(value)
      })
      // if clickable, render each term as an HTML term
      if (clickable) {
        return values
          .map(function (value) {
            return '<span class="search-term" data-field="' + field + '">' + value + ' <i class="cdc-icon-times"></i></span>'
          })
          .join(' ')
      }
      // if not clickable, just return a string
      return values.join(', ')
    }

    function getSiteLimitQuery() {
      var localsearch = ''
      var siteLimitValue = siteLimit
      if (-1 < siteLimit.indexOf('coronavirus') && 0 > siteLimit.indexOf('covid-data-tracker')) {
        siteLimitValue += '|covid-data-tracker'
      }
      if (siteLimit) {
        // SOLR expected format for local search
        // fq=(url:"www.cdc.gov/niosh" OR url:"blogs.cdc.gov/niosh-science-blog")
        localsearch = '&fq=(url:"cdc.gov/' + siteLimitValue.replace(/\s*\|\s*/g, '" OR url:"cdc.gov/') + '")'
      }
      return localsearch
    }

    /**
     * Get a label for the current search term
     * @param boolean skipAdvanced Include advanced terms or not
     * @param boolean clickable    Add HTML to make tags clickable
     * @returns {*}
     */
    function getSearchLabel(skipAdvanced, clickable) {
      var labels = []
      var fullLabel
      var addClear = false
      if (searchTerm) {
        if (clickable) {
          labels.push(valuesToLabel(searchTerm, clickable, 'query'))
        } else {
          labels.push(cleanTerm(searchTerm))
        }
      }
      if (clickable) {
        labels.push('<br/>')
      }
      $.each(searchInputs, function (field, value) {
        if (!value) {
          return
        }
        if (skipAdvanced && -1 < advancedfields.indexOf(field)) {
          return
        }
        var fieldName = languageLabels[field] || titleCase(field)
        // special case for date fields
        if ('date1' === field) {
          fieldName = languageLabels.dates
          value = (searchInputs.date1 ? searchInputs.date1 : 'any') + ' - ' + (searchInputs.date2 ? searchInputs.date2 : 'any')
        }
        if ('date2' === field) {
          return
        }
        if (clickable && fieldName) {
          fieldName = '<b>' + fieldName + '</b> '
        } else {
          fieldName += ': '
        }
        labels.push(fieldName + valuesToLabel(value, clickable, field))
        addClear = clickable
      })

      // finally check to add clearAll
      if (addClear) {
        labels.push('<a href="#" class="search-terms-clear">' + languageLabels.clearFilter + '</a> ')
      }
      if (clickable) {
        fullLabel = labels.join(' ')
      } else {
        fullLabel = stripTags(labels.join(', '))
      }
      return fullLabel
    }

    /**
     * Make SOLR query
     * @param apiroot
     * @param callback
     * @param additionalFields Additional fields to return in results, added to fl
     */
    function getSolrData(callback) {
      var startRow = 0
      var localsearch = getSiteLimitQuery()
      // fields we want from SOLR
      var fl = ['id', 'title', 'url', 'description', 'type', 'json_ld']
      var query = getSearchQuery()

      // determine start row for paging
      if (1 < pageCurrent) {
        startRow = config.pageSize * (pageCurrent - 1)
      }

      // check for best bets
      var bbDeferred = $.Deferred(function (dfd) {
        if (1 !== pageCurrent || !searchTerm || 'en-us' !== language) {
          return dfd.resolve()
        }
        var bbTerm = cleanTerm(rawSearchTerm)
        if (window.cdcBBCleanTerm) {
          bbTerm = window.cdcBBCleanTerm(bbTerm)
        }
        $.ajax({
          type: 'GET',
          url: solrBBURL + '?wt=json&q="' + bbTerm + '"&rows=3&start=' + startRow + localsearch + '&hl=on&df=description,title&hl.simple.pre=<strong>&hl.simple.post=</strong>&hl.fragsize=200&affiliate=' + setLanguage,
          dataType: 'json'
        })
          .done(function (data) {
            dfd.resolve(data)
          })
          .fail(function () {
            console.error('CDC.SearchResults: Failed to get Best Bets data.')
            dfd.resolve(false)
          })
      })
      var solrQuery = $.ajax({
        type: 'GET',
        url: solrURL + '?wt=json&q=' + query + '&rows=' + config.pageSize + '&start=' + startRow + localsearch + '&fq=title:[* TO *]&fl=' + fl.join(',') + '&hl=on&df=description,title&hl.simple.pre=<strong>&hl.simple.post=</strong>&hl.fragsize=200&affiliate=' + setLanguage,
        dataType: 'json',
        error: function (jqXHR, textStatus, errorThrown) {
          console.log('Failed search request', textStatus, errorThrown)
          $('.searchResultsData').safehtml(config.apierror)
        }
      })
      // wait for both deferreds to complete
      $.when(solrQuery, bbDeferred)
        .done(function (queryData, bbData) {
          var queryResults = queryData[0]
          totalPages = Math.ceil(queryResults.response.numFound / config.pageSize)
          callback(queryResults, bbData)
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          console.error('Failed search request', textStatus, errorThrown)
          $('.searchResultsData').safehtml(config.apierror)
        })
    }

    function getResults() {
      // prevent blinking on previous term
      $('.search-input input').val('')

      if (getSearchQuery()) {
        // Add Spinner while it gets the data
        $('.searchResultsData').safehtml('<div class="searchSpinner">Searching... <span class="icon-refresh"></span></div>')

        // get main search results
        getSolrData(function (data, bbData) {
          // set search term
          CDC.SearchResults.lastSearch = searchTerm

          // sticky search term
          $('.search-input input').val(searchTerm)

          // build html
          buildHtml(data, bbData)
        })
      } else {
        $('.searchResultsData').safehtml(languageLabels.noSearchMessage)
      }
      // jump to results if a search was performed
      if (advancedSearch) {
        location.hash = '#content'
      }
    }

    var buildHtml = function (data, bbData) {
      var results = data.response.docs
      var pagePrefix = ''
      var html = []
      var bbResults = bbData && bbData.response ? bbData.response.docs : false
      var bbResult

      data.responseHeader.params.q = data.responseHeader.params.q.replace(/[<>]/g, '')
      if (0 < results.length) {
        if (1 < pageCurrent) {
          pagePrefix = languageLabels.page + ' ' + String(pageCurrent) + ' ' + languageLabels.of + ' '
        }
        data.responseHeader.params.q = data.responseHeader.params.q.replace(/[<>]/g, '')
        html.push('<div class="searchResultsSummary">' + pagePrefix + String(data.response.numFound) + ' ' + languageLabels.returnedFor + ' ' + getSearchLabel(false, true) + ' </div>')

        // Local search message
        if (siteLimit) {
          html.push(languageLabels.localSearchPre + ' ' + siteName + ' ' + languageLabels.localSearchPost + '.<br />')
          html.push(languageLabels.localSearchAllPre + ' <a href="' + getSearchURL({ sitelimit: '' }) + '"> ' + languageLabels.localSearchAllPost + '?</a>')
        }

        // If we have Best Bets data, add to top
        if (Array.isArray(bbResults) && bbResults.length) {
          // append highlighting
          if ('object' === typeof bbData.highlighting && 'object' === typeof data.highlighting) {
            data.highlighting = $.extend(data.highlighting, bbData.highlighting)
          }

          var bbIndex = bbResults.length - 1
          for (; 0 <= bbIndex; bbIndex--) {
            bbResult = {
              url: bbResults[bbIndex].BB_url,
              title: bbResults[bbIndex].BB_title,
              keywords: bbResults[bbIndex].BB_keywords,
              bestbet: true
            }
            var url = bbResult.url
            if (url) {
              var index = results.length - 1
              for (; 0 <= index; index--) {
                if (url === results[index].url) {
                  results.splice(index, 1)
                }
              }
            }
            results.unshift(bbResult)
          }
        }

        $.each(results, function (j, result) {
          var description = '',
            targetBlank = '',
            title = result.title,
            titleBolded,
            type = '',
            jsonlds,
            highlight = data.highlighting ? data.highlighting[result.url] : false

          if ('undefined' !== typeof result.type) {
            type = result.type[0]
          }
          if (result.json_ld) {
            jsonlds = result.json_ld
          }

          switch (type) {
            case 'application/pdf':
            case 'application/doc':
            case 'application/vnd.sealed-ppt':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/vnd.ms-excel':
              targetBlank = ' target="_blank" rel="noreferrer noopener"'
              break
            default:
              targetBlank = ''
          }

          //Use this if you want highlighting. Right now, highlighting length is too long
          if (highlight) {
            highlight = highlight.description || highlight.content || highlight.BB_content || highlight.BB_keywords
            if (Array.isArray(highlight) && highlight.length) {
              description = String(highlight[0])
            }
          }
          if (!description && result.description) {
            if (Array.isArray(result.description) && result.description.length) {
              description = String(result.description[0])
            } else {
              description = result.description
            }
          }
          if (description) {
            description = String(description).replace(/(.{230})..+/, '$1&hellip;')
          }
          title = stripTags(title || '', '<em><i>')
          titleBolded = boldTerm(title, rawSearchTerm)

          if (3 === j) {
            html.push('<div data-adaptive-height="false" data-cdc-slider="thumbnail-slider" data-center-mode="false" data-equalize-images="false" data-larger-overlay-description="true" data-slides-to-scroll="3" data-slides-to-show="3"></div>')
          }

          html.push(getSingleResultHTML(j, result.url, title, titleBolded, targetBlank, description, jsonlds))
        })

        // PAGING
        if (data.response.numFound > config.pageSize) {
          // NON MOBILE PAGING

          var disabled = 1 < pageCurrent ? '' : 'disabled',
            loopStart = Math.ceil((pageCurrent - config.defaultPagingChunk) / 2),
            k = 1

          html.push('<nav class="mt-4 nav d-flex justify-content-center" aria-label="Search Results Pagination">')
          html.push('<ul class="pagination">')
          html.push('	<li class="page-item ' + disabled + '"><a class="page-link" href="#" data-page="' + (pageCurrent - 1) + '">' + languageLabels.previous + '</a></li>')

          if (1 > loopStart) {
            loopStart = 1
          }

          for (loopStart; loopStart <= totalPages && k <= config.defaultPagingChunk; loopStart++) {
            var active = loopStart === pageCurrent ? 'active' : ''
            html.push('	<li class="page-item d-none d-md-inline ' + active + '"><a class="page-link" href="#" data-page="' + loopStart + '">' + loopStart + '</a></li>')

            k++
          }

          if (totalPages > pageCurrent) {
            html.push('<li class="page-item"><a class="page-link"  href="#" data-page="' + (pageCurrent + 1) + '">' + languageLabels.next + '</a></li>')
          }

          html.push('</ul>')
          html.push('</nav>')
        }

        // inject results html to the page
        $('.searchResultsData').safehtml(html.join(''))

        // check for widgets that need to render in search results
        renderWidgets(results)
      } else {
        // 0 results
        zeroResults(data.response.numFound.toLocaleString(), data.responseHeader.params.q)
      }

      // finally add listeners
      setupSearchListeners()
    }

    /**
     * Optionally add widgets to search results page
     */
    function renderWidgets(results) {
      if (config.widgetChatBot) {
        // Conditionally add Coronavirus chatbot
        //   - When doing local search on coronavirus
        //   - Doing global search but has any of this word in search term “Coronavirus” or “Covid” or “nCov”
        //   - if search result has https://www.cdc.gov/coronacirus/ url then show this widget - if possible
        var showChatBot = 'coronavirus' === siteLimit
        var chatTerms = ['coronavirus', 'covid', 'ncov']
        if (rawSearchTerm && -1 < chatTerms.indexOf(rawSearchTerm)) {
          showChatBot = true
        }
        $.each(results, function (resultIndex, result) {
          if (result.url && -1 < String(result.url).indexOf('/coronavirus/')) {
            showChatBot = true
          }
        })

        if (showChatBot) {
          var $chatbot = $('<div data-cdc-widget="healthBot" data-cdc-theme="theme1" ' + 'class="cdc-widget-color-white cdc-widget" data-cdc-language="' + language + '"></div>\n' + '<script src="https://t.cdc.gov/1M1B"></script>')
          $('.searchResultsData').prepend($chatbot)
        }
      }
    }

    function getSingleResultHTML(index, url, title, titleBolded, targetBlank, description, jsonlds) {
      var html = []
      var titleForAttribute = escapeString(title, true)

      html.push('<div class="searchResultsModule">')
      if (url) {
        html.push('<div class="searchResultsTitle lead"><a href="' + url + '" title="' + titleForAttribute + '"' + targetBlank + '>' + addDocsTag(url) + titleBolded + '</a></div>')
        html.push('<div class="searchResultsUrl">' + url + '</div>')
      }
      if (description) {
        html.push('<div class="searchResultsDescription">' + description + '</div>')
      }

      // Logic for rendering FAQ structured data
      if (jsonlds && config.json_ld) {
        if ('string' === typeof jsonld) {
          jsonlds = [jsonlds]
        }
        if (Array.isArray(jsonlds)) {
          $.each(jsonlds, function (i, jsonld) {
            html.push(renderJSONLD(jsonld, index))
          })
        }
      }
      html.push('</div>')

      return $('<div>').safehtml(html.join('')).html()
    }

    /**
     * Render supported JSON+LD structured data widgets
     * Currently only supporting FAQ Pages
     * @param jsonld
     */
    function renderJSONLD(jsonld, index) {
      index = 'number' === typeof index && !isNaN(index) ? index : 0
      var html = ''
      var data
      var type

      try {
        data = JSON.parse(jsonld)
      } catch (exception) {
        console.error("Can't parse JSON+LD data. ")
        return false // couldn't parse JSON LD string to object
      }
      type = data && 'object' === typeof data && data['@type'] ? data['@type'] : ''

      // Check JSON+LD format
      if (data.mainEntity && data.mainEntity.length) {
        switch (type) {
          case 'FAQPage':
            html += renderFAQModule(data, index)
            break
          default:
            break
        }
      }
      return html
    }

    /**
     * Specifically render a FAQ Module JSON LD widget
     * @param object data
     * @param number index
     * @returns {string}
     */
    function renderFAQModule(data, index) {
      var faq = []
      var parentTag = '-faq' + index
      var html = ''
      var more = false
      // output FAQ accordian
      $.each(data.mainEntity, function (i, row) {
        var question
        var answer
        var tag = parentTag + '-' + i

        // if we're over 3 items, add a more collapse
        if (3 === i) {
          more = true
          faq.push('<div class="collapse" id="collapse' + parentTag + '">')
        }

        if (row.name && 'string' === typeof row.name) {
          question = stripTags(row.name)
        }
        if (row.acceptedAnswer && row.acceptedAnswer.text) {
          answer = String(row.acceptedAnswer.text)
        }
        if (!question || !answer) {
          return
        }

        faq.push(
          '<div class="card-header collapsed" role="tab" id="heading' +
            tag +
            '" data-target="#collapse' +
            tag +
            '" ' +
            'data-toggle="collapse" data-parent="#accordion' +
            parentTag +
            '" aria-expanded="false" aria-controls="collapse' +
            tag +
            '"> ' +
            '<button class="card-title btn btn-link"><span role="heading" aria-level="' +
            (i + 1) +
            '">' +
            question +
            '</span> ' +
            '</button></div>' +
            '<div class="collapse" id="collapse' +
            tag +
            '" role="tablist" aria-labelledby="heading' +
            tag +
            '">' +
            '<div class="card-body"> ' +
            answer +
            '</div></div>'
        )
      })
      // add closing div if we're collapsing more results
      if (more) {
        faq.push('</div>')
        faq.push(' <button class="btn btn-more" type="button" data-toggle="collapse" ' + ' data-target="#collapse' + parentTag + '" aria-expanded="false" aria-controls="collapse' + parentTag + '">' + '</button>')
      }
      // compile results
      if (faq.length) {
        html = '<div class="accordion indicator-chevron accordion-white cdc-faq-accordion" id="accordion' + parentTag + '" aria-multiselectable="true" role="tablist">\n' + '<div class="card">' + faq.join('\n') + '</div></div>'
      }
      return html
    }

    function zeroResults(numfound, term) {
      var html = []

      html.push('<div class="searchResultsSummary"><strong>' + numfound + '</strong> ' + languageLabels.returnedFor + ' ' + getSearchLabel(false, true) + ' </div>')

      $('.searchResultsData').safehtml(html.join(''))

      // If the user used an advanced search, show a different message
      if (searchInputs.language || searchInputs.all || searchInputs.any || searchInputs.exact || searchInputs.none || searchInputs.date1 || searchInputs.date2) {
        // @TODO: Update language and add translation
        $('.searchResultsData').append('<p>' + languageLabels.zeroSuggestion + '</p>')
        return
      }

      var spellingUrl = solrBase + '/spell?wt=json&spellcheck.collateParam.q.op=AND&spellcheck.q=' + term

      // API spelling typo call
      $.ajax({
        type: 'GET',
        url: spellingUrl,
        data: { wt: 'json' },
        dataType: 'json',
        cache: false,
        success: function success(data) {
          var didyoumeanHTML = [],
            collationQuery = ''

          if ('object' !== ('undefined' === typeof data ? 'undefined' : typeof data)) {
            data = JSON.parse(data)
          }
          // the API changed, so made some adjustments for the new field names
          if (data.hasOwnProperty('spellcheck') && 1 < data.spellcheck.suggestions.length && data.spellcheck.suggestions[1].hasOwnProperty('suggestion')) {
            collationQuery = data.spellcheck.suggestions[1].suggestion

            if (collationQuery.length) {
              // sort by freq to get the most reasonable match
              collationQuery.sort(function (a, b) {
                return a.freq < b.freq ? 1 : -1
              })
              didyoumeanHTML.push('<h3>' + languageLabels.zeroDidyoumean + ' <a href="#" class="didyoumean"><em>' + collationQuery[0].word + '</em></a>?</h3>')
              $('.searchResultsData').append(didyoumeanHTML.join(''))
              $('.searchResultsData .didyoumean').on('click', function (e) {
                e.preventDefault()
                setGetParameter('query', collationQuery[0].word)
              })
            }
          }
        }
      })
    }

    function setupListeners() {
      // · All Tab Click - cdcintrasearchtab-all
      // · Web Pages Tab Click - cdcintrasearchtab-web-pages
      // · Documents Tab Click - cdcintrasearchtab-docs
      $('.intranet a[href="#allresults"]').on('click', function () {
        $(this).trigger('metrics-capture', ['cdcintrasearchtab-all', 'click'])
      })
      $('.intranet a[href="#webpagesresults"]').on('click', function () {
        $(this).trigger('metrics-capture', ['cdcintrasearchtab-web-pages', 'click'])
      })
      $('.intranet a[href="#documentsresults"]').on('click', function () {
        $(this).trigger('metrics-capture', ['cdcintrasearchtab-docs', 'click'])
      })

      //Intranet Top 3 Internet Results module
      //trigger metrics capture for any link clicked inside the module
      $('#topSearchList a').on('click', function () {
        $(this).trigger('metrics-capture', ['cdctopinternetresults', 'click'])
      })
      //trigger metrics capture for button inside the module
      $('#topSearchListBtn').on('click', function () {
        $(this).trigger('metrics-capture', ['cdctopinternetresults-btn', 'click'])
      })

      // wait for the slider to appear then tag each slide with a metrics trigger
      var idx = 0,
        slickInterval = window.setInterval(function () {
          if ($('.slick-initialized').length) {
            window.clearInterval(slickInterval)
            $('div[class~="slick-slide"]:not([class~="slick-cloned"]) .slide-content > a').each(function (i) {
              $(this).on('click', function () {
                $(this).trigger('metrics-capture', ['cdcsitesearch-carousel-video' + i, 'click'])
              })
            })
          }
          // abort if the slider doesn't appear after 20 tries
          if (20 < idx) {
            window.clearInterval(slickInterval)
          }
          idx++
        }, 300)
    }

    /**
     * Ajax Pagination
     * @param page
     */
    function goToPage(page) {
      page = parseInt(page, 10)
      if (1 > page || page === pageCurrent) {
        return
      }
      pageCurrent = page
      getResults()
      // trigger page load metrics call
      if ('object' === typeof window.s) {
        pageName = pageName || s.pageName
        s.pageURL = String(window.location.href).replace(/dpage=\d+/, 'dpage=' + String(pageCurrent))
        s.pageName = pageName + ' - page ' + String(pageCurrent)
        s.t()
      }
      location.hash = '#cdc-search-results'
      location.hash = '#content'
    }

    var setupSearchListeners = function () {
      var $btnPageNext = $('.searchResultsData .searchBtnNext'),
        $btnPagePrev = $('.searchResultsData .searchBtnPrev'),
        $btnPagination = $('.searchResultsData .pagination a')

      $btnPageNext.on('click', function (e) {
        e.preventDefault()
        goToPage(pageCurrent + 1)
      })

      $btnPagePrev.on('click', function (e) {
        e.preventDefault()
        goToPage(pageCurrent - 1)
      })

      $btnPagination.on('click', function (e) {
        e.preventDefault()
        goToPage($(this).attr('data-page'))
      })

      // Add listeners to search terms
      $('.searchResultsData .search-term').on('click', function () {
        var text = $(this).text().trim()
        var field = $(this).data('field')
        removeTerm(field, text)
      })
      $('.searchResultsData .search-terms-clear').on('click', function (e) {
        e.preventDefault()
        removeTerms()
      })

      // Add metrics capture on FAQ Modules
      $('.searchResultsData .cdc-faq-accordion').each(function () {
        $(this)
          .find('.card-header')
          .on('click', function () {
            if ('false' === $(this).attr('aria-expanded')) {
              $(this).trigger('metrics-capture', ['cdcsitesearch-faq-module-expand', 'click'])
            }
          })
      })
    }

    /**
     *  Add local search dropdown to search results page
     */
    function addLocalSearchField() {
      var $headerSearch = $('div.headerSearch:first')
      if (!$headerSearch.length || !siteLimit) {
        return
      }
      $headerSearch.addClass('cdc-header-local-search')
      $headerSearch.find('.form-control-clear').remove()
      $headerSearch
        .find('input#headerSearch')
        .after(
          '<div class="input-group-append dropdown-submenu">' +
            '<span class="form-control-clear" style="visibility: hidden;">×</span>\n' +
            '<button class="btn btn-control dropdown-toggle text-ellipsis local-search-label" ' +
            'type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            siteName +
            '</button>\n' +
            '<div class="dropdown-menu dropdown-menu-right ds-6">\n' +
            '<a class="dropdown-item" data-site-limit="' +
            siteLimit +
            '" href="#">' +
            siteName +
            '</a>\n' +
            '<a class="dropdown-item" data-site-limit="" href="#">All CDC</a>\n' +
            '</div></div>'
        )
    }

    /**
     * Handle removing clickable terms
     * @param field
     * @param value
     */
    function removeTerm(field, value) {
      if (!searchInputs[field] && 'query' !== field) {
        return
      }
      if ('query' === field) {
        searchTerm = ''
      } else if (searchInputs[field]) {
        searchInputs[field] = null
      }
      window.location.href = getSearchURL()
    }

    /**
     * Handle removing all advanced terms
     */
    function removeTerms() {
      searchTerm = ''
      $.each(searchInputs, function (field) {
        searchInputs[field] = null
      })
      window.location.href = getSearchURL()
    }

    /**
     * Generate a url for the initial set of search terms
     * @param object override If you want to substitute any values in the current values
     * @returns {string}
     */
    function getSearchURL(override) {
      var params = $.extend({ query: searchTerm, sitelimit: siteLimit }, searchInputs)
      var outParams = {}
      if ('object' === typeof override) {
        params = $.extend(params, override)
      }
      $.each(params, function (field, value) {
        if (value) {
          outParams[field] = Array.isArray(value) ? value.join('|') : String(value)
        }
      })
      return config.resultsPage + '?' + $.param(outParams)
    }

    var addDocsTag = function (url) {
      if (!url) {
        return ''
      }
      var docDetect = String(url).substr(-6),
        prefix = ''

      if (-1 < docDetect.toLowerCase().indexOf('.pdf')) {
        prefix = '<small>[PDF]</small> '
      }
      if (-1 < docDetect.toLowerCase().indexOf('.doc')) {
        prefix = '<small>[DOC]</small> '
      }
      if (-1 < docDetect.toLowerCase().indexOf('.ppt')) {
        prefix = '<small>[PPT]</small> '
      }

      return prefix
    }

    // Utilities
    function stripTags(input, allowed) {
      allowed = (
        String(allowed || '')
          .toLowerCase()
          .match(/<[a-z][a-z0-9]*>/g) || []
      ).join('') // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
      var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
        brokenTags = /(<\w+(?:\s+\w+=\"[^"]+\")*)(?=[^>]+(?:<|$))/g
      return input
        .replace(commentsAndPhpTags, '')
        .replace(brokenTags, '')
        .replace(tags, function ($0, $1) {
          return -1 < allowed.indexOf('<' + $1.toLowerCase() + '>') ? $0 : ''
        })
    }

    function titleCase(str) {
      return str
        .toLowerCase()
        .split(' ')
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
    }

    function escapeString(s, forAttribute) {
      var ESC_MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }
      return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function (c) {
        return ESC_MAP[c]
      })
    }

    function boldTerm(line, word, maxlength) {
      line = line || ''
      var regex = new RegExp('(' + word + ')', 'gi')
      if ('number' === typeof maxlength && line.length > maxlength) {
        line = line.substr(0, maxlength) + '&hellip;'
      }
      if (word) {
        line = line.replace(regex, '<span class="font-weight-bold">$1</span>')
      }
      return line
    }

    function cleanTerm(term) {
      return String(term)
        .replace(/["\?|;&$%#<>()+]/g, '')
        .replace(/\s\s+/g, ' ')
    }

    function setGetParameter(paramName, paramValue) {
      var url = CDC.cleanUrl(window.location.href)
      var hash = window.location.hash
      url = url.replace(hash, '')
      if (0 <= url.indexOf(paramName + '=')) {
        var prefix = url.substring(0, url.indexOf(paramName))
        var suffix = url.substring(url.indexOf(paramName))
        suffix = suffix.substring(suffix.indexOf('=') + 1)
        suffix = 0 <= suffix.indexOf('&') ? suffix.substring(suffix.indexOf('&')) : ''
        url = prefix + paramName + '=' + paramValue + suffix
      } else if (0 > url.indexOf('?')) {
        url += '?' + paramName + '=' + paramValue
      } else {
        url += '&' + paramName + '=' + paramValue
      }
      CDC.open(url + hash)
    }

    function unique(array) {
      array = array.filter(function (el) {
        return Boolean(el)
      })
      return array.filter(function (el, index, arr) {
        return index === arr.indexOf(el)
      })
    }

    function pad(num, size) {
      var s = String(num)
      size = size || 2
      while (s.length < size) {
        s = '0' + s
      }
      return s
    }

    // Here udpate metrics
    ;(function () {
      /**
       *
       * REQUIREMENTS
       * - prop40 - Extended Fields (topic, audience, contenttype)
       * - eVar5  - [counter of number of searches per visit]
       * - eVar78 -  Advanced Search Terms
       *             Main Search Term - “main:”
       *             All these words - “all:”
       *             Exact Word - “exact:”
       *             Any words - “any:”
       *             None - “none”
       *             EX: main:PPE|none:gowns
       */
      var e78 = []
      var s40 = []
      var counter = 0

      if ('object' !== typeof window.s) {
        console.error('ERROR: window.s not present.')
        return
      }

      if (window.sessionStorage) {
        counter = parseInt(sessionStorage.cdcsearchcount || 0, 10)
        counter = isNaN(counter) ? 1 : counter + 1
        sessionStorage.cdcsearchcount = counter
        window.s.eVar5 = counter
      }

      // build eVar78
      $.each(searchInputs, function (key, value) {
        e78.push(key + ':' + cleanTerm(value))
      })

      window.s.eVar78 = String(e78.join('|')).substr(0, 255)
      window.s.prop40 = String(s40.join('|')).substr(0, 255)
    })()

    // Finally run init on page load
    $(function () {
      pageInit()
    })

    return {
      // expose attributes
      config: config,
      searchTerm: searchTerm,
      siteLimit: siteLimit,
      searchInputs: searchInputs,
      pageCurrent: pageCurrent,
      totalPages: function () {
        return totalPages
      },
      // expose utility clases
      languageLabels: languageLabels,
      getSearchQuery: getSearchQuery,
      getSearchLabel: getSearchLabel,
      getSiteLimitQuery: getSiteLimitQuery,
      allSearch: allSearch,
      advancedSearch: advancedSearch,
      stripTags: stripTags,
      escapeString: escapeString,
      boldTerm: boldTerm,
      unique: unique,
      pad: pad,
      cleanTerm: cleanTerm
    }
  })()
