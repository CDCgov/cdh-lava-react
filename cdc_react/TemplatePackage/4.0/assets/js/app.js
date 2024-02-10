"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */

/* global window, document, define, jQuery, setInterval, clearInterval */
;

(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
})(function ($) {
  'use strict';

  var Slick = window.Slick || {};

  Slick = function () {
    var instanceUid = 0;

    function Slick(element, settings) {
      var _ = this,
          dataSettings;

      _.defaults = {
        accessibility: true,
        adaptiveHeight: false,
        appendArrows: $(element),
        appendDots: $(element),
        arrows: true,
        asNavFor: null,
        prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
        nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
        autoplay: false,
        autoplaySpeed: 3000,
        centerMode: false,
        centerPadding: '50px',
        cssEase: 'ease',
        customPaging: function customPaging(slider, i) {
          return $('<button type="button" />').text(i + 1);
        },
        dots: false,
        dotsClass: 'slick-dots',
        draggable: true,
        easing: 'linear',
        edgeFriction: 0.35,
        fade: false,
        focusOnSelect: false,
        focusOnChange: false,
        infinite: true,
        initialSlide: 0,
        lazyLoad: 'ondemand',
        mobileFirst: false,
        pauseOnHover: true,
        pauseOnFocus: true,
        pauseOnDotsHover: false,
        respondTo: 'window',
        responsive: null,
        rows: 1,
        rtl: false,
        slide: '',
        slidesPerRow: 1,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 500,
        swipe: true,
        swipeToSlide: false,
        touchMove: true,
        touchThreshold: 5,
        useCSS: true,
        useTransform: true,
        variableWidth: false,
        vertical: false,
        verticalSwiping: false,
        waitForAnimate: true,
        zIndex: 1000
      };
      _.initials = {
        animating: false,
        dragging: false,
        autoPlayTimer: null,
        currentDirection: 0,
        currentLeft: null,
        currentSlide: 0,
        direction: 1,
        $dots: null,
        listWidth: null,
        listHeight: null,
        loadIndex: 0,
        $nextArrow: null,
        $prevArrow: null,
        scrolling: false,
        slideCount: null,
        slideWidth: null,
        $slideTrack: null,
        $slides: null,
        sliding: false,
        slideOffset: 0,
        swipeLeft: null,
        swiping: false,
        $list: null,
        touchObject: {},
        transformsEnabled: false,
        unslicked: false
      };
      $.extend(_, _.initials);
      _.activeBreakpoint = null;
      _.animType = null;
      _.animProp = null;
      _.breakpoints = [];
      _.breakpointSettings = [];
      _.cssTransitions = false;
      _.focussed = false;
      _.interrupted = false;
      _.hidden = 'hidden';
      _.paused = true;
      _.positionProp = null;
      _.respondTo = null;
      _.rowCount = 1;
      _.shouldClick = true;
      _.$slider = $(element);
      _.$slidesCache = null;
      _.transformType = null;
      _.transitionType = null;
      _.visibilityChange = 'visibilitychange';
      _.windowWidth = 0;
      _.windowTimer = null;
      dataSettings = $(element).data('slick') || {};
      _.options = $.extend({}, _.defaults, settings, dataSettings);
      _.currentSlide = _.options.initialSlide;
      _.originalSettings = _.options;

      if (typeof document.mozHidden !== 'undefined') {
        _.hidden = 'mozHidden';
        _.visibilityChange = 'mozvisibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        _.hidden = 'webkitHidden';
        _.visibilityChange = 'webkitvisibilitychange';
      }

      _.autoPlay = $.proxy(_.autoPlay, _);
      _.autoPlayClear = $.proxy(_.autoPlayClear, _);
      _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
      _.changeSlide = $.proxy(_.changeSlide, _);
      _.clickHandler = $.proxy(_.clickHandler, _);
      _.selectHandler = $.proxy(_.selectHandler, _);
      _.setPosition = $.proxy(_.setPosition, _);
      _.swipeHandler = $.proxy(_.swipeHandler, _);
      _.dragHandler = $.proxy(_.dragHandler, _);
      _.keyHandler = $.proxy(_.keyHandler, _);
      _.instanceUid = instanceUid++; // A simple way to check for HTML strings
      // Strict HTML recognition (must start with <)
      // Extracted from jQuery v1.11 source

      _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

      _.registerBreakpoints();

      _.init(true);
    }

    return Slick;
  }();

  Slick.prototype.activateADA = function () {
    var _ = this;

    _.$slideTrack.find('.slick-active').attr({
      'aria-hidden': 'false'
    }).find('a, input, button, select').attr({
      'tabindex': '0'
    });
  };

  Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {
    var _ = this;

    if (typeof index === 'boolean') {
      addBefore = index;
      index = null;
    } else if (index < 0 || index >= _.slideCount) {
      return false;
    }

    _.unload();

    if (typeof index === 'number') {
      if (index === 0 && _.$slides.length === 0) {
        $(markup).appendTo(_.$slideTrack);
      } else if (addBefore) {
        $(markup).insertBefore(_.$slides.eq(index));
      } else {
        $(markup).insertAfter(_.$slides.eq(index));
      }
    } else {
      if (addBefore === true) {
        $(markup).prependTo(_.$slideTrack);
      } else {
        $(markup).appendTo(_.$slideTrack);
      }
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slides.each(function (index, element) {
      $(element).attr('data-slick-index', index);
    });

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.animateHeight = function () {
    var _ = this;

    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);

      _.$list.animate({
        height: targetHeight
      }, _.options.speed);
    }
  };

  Slick.prototype.animateSlide = function (targetLeft, callback) {
    var animProps = {},
        _ = this;

    _.animateHeight();

    if (_.options.rtl === true && _.options.vertical === false) {
      targetLeft = -targetLeft;
    }

    if (_.transformsEnabled === false) {
      if (_.options.vertical === false) {
        _.$slideTrack.animate({
          left: targetLeft
        }, _.options.speed, _.options.easing, callback);
      } else {
        _.$slideTrack.animate({
          top: targetLeft
        }, _.options.speed, _.options.easing, callback);
      }
    } else {
      if (_.cssTransitions === false) {
        if (_.options.rtl === true) {
          _.currentLeft = -_.currentLeft;
        }

        $({
          animStart: _.currentLeft
        }).animate({
          animStart: targetLeft
        }, {
          duration: _.options.speed,
          easing: _.options.easing,
          step: function step(now) {
            now = Math.ceil(now);

            if (_.options.vertical === false) {
              animProps[_.animType] = 'translate(' + now + 'px, 0px)';

              _.$slideTrack.css(animProps);
            } else {
              animProps[_.animType] = 'translate(0px,' + now + 'px)';

              _.$slideTrack.css(animProps);
            }
          },
          complete: function complete() {
            if (callback) {
              callback.call();
            }
          }
        });
      } else {
        _.applyTransition();

        targetLeft = Math.ceil(targetLeft);

        if (_.options.vertical === false) {
          animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
        } else {
          animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
        }

        _.$slideTrack.css(animProps);

        if (callback) {
          setTimeout(function () {
            _.disableTransition();

            callback.call();
          }, _.options.speed);
        }
      }
    }
  };

  Slick.prototype.getNavTarget = function () {
    var _ = this,
        asNavFor = _.options.asNavFor;

    if (asNavFor && asNavFor !== null) {
      asNavFor = $(asNavFor).not(_.$slider);
    }

    return asNavFor;
  };

  Slick.prototype.asNavFor = function (index) {
    var _ = this,
        asNavFor = _.getNavTarget();

    if (asNavFor !== null && _typeof(asNavFor) === 'object') {
      asNavFor.each(function () {
        var target = $(this).slick('getSlick');

        if (!target.unslicked) {
          target.slideHandler(index, true);
        }
      });
    }
  };

  Slick.prototype.applyTransition = function (slide) {
    var _ = this,
        transition = {};

    if (_.options.fade === false) {
      transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
    } else {
      transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
    }

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.autoPlay = function () {
    var _ = this;

    _.autoPlayClear();

    if (_.slideCount > _.options.slidesToShow) {
      _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
    }
  };

  Slick.prototype.autoPlayClear = function () {
    var _ = this;

    if (_.autoPlayTimer) {
      clearInterval(_.autoPlayTimer);
    }
  };

  Slick.prototype.autoPlayIterator = function () {
    var _ = this,
        slideTo = _.currentSlide + _.options.slidesToScroll;

    if (!_.paused && !_.interrupted && !_.focussed) {
      if (_.options.infinite === false) {
        if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
          _.direction = 0;
        } else if (_.direction === 0) {
          slideTo = _.currentSlide - _.options.slidesToScroll;

          if (_.currentSlide - 1 === 0) {
            _.direction = 1;
          }
        }
      }

      _.slideHandler(slideTo);
    }
  };

  Slick.prototype.buildArrows = function () {
    var _ = this;

    if (_.options.arrows === true) {
      _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
      _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

      if (_.slideCount > _.options.slidesToShow) {
        _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

        _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

        if (_.htmlExpr.test(_.options.prevArrow)) {
          _.$prevArrow.prependTo(_.options.appendArrows);
        }

        if (_.htmlExpr.test(_.options.nextArrow)) {
          _.$nextArrow.appendTo(_.options.appendArrows);
        }

        if (_.options.infinite !== true) {
          _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
        }
      } else {
        _.$prevArrow.add(_.$nextArrow).addClass('slick-hidden').attr({
          'aria-disabled': 'true',
          'tabindex': '-1'
        });
      }
    }
  };

  Slick.prototype.buildDots = function () {
    var _ = this,
        i,
        dot;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$slider.addClass('slick-dotted');

      dot = $('<ul />').addClass(_.options.dotsClass);

      for (i = 0; i <= _.getDotCount(); i += 1) {
        dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
      }

      _.$dots = dot.appendTo(_.options.appendDots);

      _.$dots.find('li').first().addClass('slick-active');
    }
  };

  Slick.prototype.buildOut = function () {
    var _ = this;

    _.$slides = _.$slider.children(_.options.slide + ':not(.slick-cloned)').addClass('slick-slide');
    _.slideCount = _.$slides.length;

    _.$slides.each(function (index, element) {
      $(element).attr('data-slick-index', index).data('originalStyling', $(element).attr('style') || '');
    });

    _.$slider.addClass('slick-slider');

    _.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();
    _.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();

    _.$slideTrack.css('opacity', 0);

    if (_.options.centerMode === true || _.options.swipeToSlide === true) {
      _.options.slidesToScroll = 1;
    }

    $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

    _.setupInfinite();

    _.buildArrows();

    _.buildDots();

    _.updateDots();

    _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

    if (_.options.draggable === true) {
      _.$list.addClass('draggable');
    }
  };

  Slick.prototype.buildRows = function () {
    var _ = this,
        a,
        b,
        c,
        newSlides,
        numOfSlides,
        originalSlides,
        slidesPerSection;

    newSlides = document.createDocumentFragment();
    originalSlides = _.$slider.children();

    if (_.options.rows > 0) {
      slidesPerSection = _.options.slidesPerRow * _.options.rows;
      numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);

      for (a = 0; a < numOfSlides; a++) {
        var slide = document.createElement('div');

        for (b = 0; b < _.options.rows; b++) {
          var row = document.createElement('div');

          for (c = 0; c < _.options.slidesPerRow; c++) {
            var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);

            if (originalSlides.get(target)) {
              row.appendChild(originalSlides.get(target));
            }
          }

          slide.appendChild(row);
        }

        newSlides.appendChild(slide);
      }

      _.$slider.empty().append(newSlides);

      _.$slider.children().children().children().css({
        'width': 100 / _.options.slidesPerRow + '%',
        'display': 'inline-block'
      });
    }
  };

  Slick.prototype.checkResponsive = function (initial, forceUpdate) {
    var _ = this,
        breakpoint,
        targetBreakpoint,
        respondToWidth,
        triggerBreakpoint = false;

    var sliderWidth = _.$slider.width();

    var windowWidth = window.innerWidth || $(window).width();

    if (_.respondTo === 'window') {
      respondToWidth = windowWidth;
    } else if (_.respondTo === 'slider') {
      respondToWidth = sliderWidth;
    } else if (_.respondTo === 'min') {
      respondToWidth = Math.min(windowWidth, sliderWidth);
    }

    if (_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {
      targetBreakpoint = null;

      for (breakpoint in _.breakpoints) {
        if (_.breakpoints.hasOwnProperty(breakpoint)) {
          if (_.originalSettings.mobileFirst === false) {
            if (respondToWidth < _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          } else {
            if (respondToWidth > _.breakpoints[breakpoint]) {
              targetBreakpoint = _.breakpoints[breakpoint];
            }
          }
        }
      }

      if (targetBreakpoint !== null) {
        if (_.activeBreakpoint !== null) {
          if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
            _.activeBreakpoint = targetBreakpoint;

            if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
              _.unslick(targetBreakpoint);
            } else {
              _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);

              if (initial === true) {
                _.currentSlide = _.options.initialSlide;
              }

              _.refresh(initial);
            }

            triggerBreakpoint = targetBreakpoint;
          }
        } else {
          _.activeBreakpoint = targetBreakpoint;

          if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
            _.unslick(targetBreakpoint);
          } else {
            _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);

            if (initial === true) {
              _.currentSlide = _.options.initialSlide;
            }

            _.refresh(initial);
          }

          triggerBreakpoint = targetBreakpoint;
        }
      } else {
        if (_.activeBreakpoint !== null) {
          _.activeBreakpoint = null;
          _.options = _.originalSettings;

          if (initial === true) {
            _.currentSlide = _.options.initialSlide;
          }

          _.refresh(initial);

          triggerBreakpoint = targetBreakpoint;
        }
      } // only trigger breakpoints during an actual break. not on initialize.


      if (!initial && triggerBreakpoint !== false) {
        _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
      }
    }
  };

  Slick.prototype.changeSlide = function (event, dontAnimate) {
    var _ = this,
        $target = $(event.currentTarget),
        indexOffset,
        slideOffset,
        unevenOffset; // If target is a link, prevent default action.


    if ($target.is('a')) {
      event.preventDefault();
    } // If target is not the <li> element (ie: a child), find the <li>.


    if (!$target.is('li')) {
      $target = $target.closest('li');
    }

    unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
    indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

    switch (event.data.message) {
      case 'previous':
        slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;

        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
        }

        break;

      case 'next':
        slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;

        if (_.slideCount > _.options.slidesToShow) {
          _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
        }

        break;

      case 'index':
        var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;

        _.slideHandler(_.checkNavigable(index), false, dontAnimate);

        $target.children().trigger('focus');
        break;

      default:
        return;
    }
  };

  Slick.prototype.checkNavigable = function (index) {
    var _ = this,
        navigables,
        prevNavigable;

    navigables = _.getNavigableIndexes();
    prevNavigable = 0;

    if (index > navigables[navigables.length - 1]) {
      index = navigables[navigables.length - 1];
    } else {
      for (var n in navigables) {
        if (index < navigables[n]) {
          index = prevNavigable;
          break;
        }

        prevNavigable = navigables[n];
      }
    }

    return index;
  };

  Slick.prototype.cleanUpEvents = function () {
    var _ = this;

    if (_.options.dots && _.$dots !== null) {
      $('li', _.$dots).off('click.slick', _.changeSlide).off('mouseenter.slick', $.proxy(_.interrupt, _, true)).off('mouseleave.slick', $.proxy(_.interrupt, _, false));

      if (_.options.accessibility === true) {
        _.$dots.off('keydown.slick', _.keyHandler);
      }
    }

    _.$slider.off('focus.slick blur.slick');

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
      _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

      if (_.options.accessibility === true) {
        _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
        _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
      }
    }

    _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);

    _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);

    _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);

    _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

    _.$list.off('click.slick', _.clickHandler);

    $(document).off(_.visibilityChange, _.visibility);

    _.cleanUpSlideEvents();

    if (_.options.accessibility === true) {
      _.$list.off('keydown.slick', _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().off('click.slick', _.selectHandler);
    }

    $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);
    $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);
    $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);
    $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
  };

  Slick.prototype.cleanUpSlideEvents = function () {
    var _ = this;

    _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));

    _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));
  };

  Slick.prototype.cleanUpRows = function () {
    var _ = this,
        originalSlides;

    if (_.options.rows > 0) {
      originalSlides = _.$slides.children().children();
      originalSlides.removeAttr('style');

      _.$slider.empty().append(originalSlides);
    }
  };

  Slick.prototype.clickHandler = function (event) {
    var _ = this;

    if (_.shouldClick === false) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  Slick.prototype.destroy = function (refresh) {
    var _ = this;

    _.autoPlayClear();

    _.touchObject = {};

    _.cleanUpEvents();

    $('.slick-cloned', _.$slider).detach();

    if (_.$dots) {
      _.$dots.remove();
    }

    if (_.$prevArrow && _.$prevArrow.length) {
      _.$prevArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

      if (_.htmlExpr.test(_.options.prevArrow)) {
        _.$prevArrow.remove();
      }
    }

    if (_.$nextArrow && _.$nextArrow.length) {
      _.$nextArrow.removeClass('slick-disabled slick-arrow slick-hidden').removeAttr('aria-hidden aria-disabled tabindex').css('display', '');

      if (_.htmlExpr.test(_.options.nextArrow)) {
        _.$nextArrow.remove();
      }
    }

    if (_.$slides) {
      _.$slides.removeClass('slick-slide slick-active slick-center slick-visible slick-current').removeAttr('aria-hidden').removeAttr('data-slick-index').each(function () {
        $(this).attr('style', $(this).data('originalStyling'));
      });

      _.$slideTrack.children(this.options.slide).detach();

      _.$slideTrack.detach();

      _.$list.detach();

      _.$slider.append(_.$slides);
    }

    _.cleanUpRows();

    _.$slider.removeClass('slick-slider');

    _.$slider.removeClass('slick-initialized');

    _.$slider.removeClass('slick-dotted');

    _.unslicked = true;

    if (!refresh) {
      _.$slider.trigger('destroy', [_]);
    }
  };

  Slick.prototype.disableTransition = function (slide) {
    var _ = this,
        transition = {};

    transition[_.transitionType] = '';

    if (_.options.fade === false) {
      _.$slideTrack.css(transition);
    } else {
      _.$slides.eq(slide).css(transition);
    }
  };

  Slick.prototype.fadeSlide = function (slideIndex, callback) {
    var _ = this;

    if (_.cssTransitions === false) {
      _.$slides.eq(slideIndex).css({
        zIndex: _.options.zIndex
      });

      _.$slides.eq(slideIndex).animate({
        opacity: 1
      }, _.options.speed, _.options.easing, callback);
    } else {
      _.applyTransition(slideIndex);

      _.$slides.eq(slideIndex).css({
        opacity: 1,
        zIndex: _.options.zIndex
      });

      if (callback) {
        setTimeout(function () {
          _.disableTransition(slideIndex);

          callback.call();
        }, _.options.speed);
      }
    }
  };

  Slick.prototype.fadeSlideOut = function (slideIndex) {
    var _ = this;

    if (_.cssTransitions === false) {
      _.$slides.eq(slideIndex).animate({
        opacity: 0,
        zIndex: _.options.zIndex - 2
      }, _.options.speed, _.options.easing);
    } else {
      _.applyTransition(slideIndex);

      _.$slides.eq(slideIndex).css({
        opacity: 0,
        zIndex: _.options.zIndex - 2
      });
    }
  };

  Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {
    var _ = this;

    if (filter !== null) {
      _.$slidesCache = _.$slides;

      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.focusHandler = function () {
    var _ = this; // If any child element receives focus within the slider we need to pause the autoplay


    _.$slider.off('focus.slick blur.slick').on('focus.slick', '*', function (event) {
      var $sf = $(this);
      setTimeout(function () {
        if (_.options.pauseOnFocus) {
          if ($sf.is(':focus')) {
            _.focussed = true;

            _.autoPlay();
          }
        }
      }, 0);
    }).on('blur.slick', '*', function (event) {
      var $sf = $(this); // When a blur occurs on any elements within the slider we become unfocused

      if (_.options.pauseOnFocus) {
        _.focussed = false;

        _.autoPlay();
      }
    });
  };

  Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {
    var _ = this;

    return _.currentSlide;
  };

  Slick.prototype.getDotCount = function () {
    var _ = this;

    var breakPoint = 0;
    var counter = 0;
    var pagerQty = 0;

    if (_.options.infinite === true) {
      if (_.slideCount <= _.options.slidesToShow) {
        ++pagerQty;
      } else {
        while (breakPoint < _.slideCount) {
          ++pagerQty;
          breakPoint = counter + _.options.slidesToScroll;
          counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }
      }
    } else if (_.options.centerMode === true) {
      pagerQty = _.slideCount;
    } else if (!_.options.asNavFor) {
      pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
    } else {
      while (breakPoint < _.slideCount) {
        ++pagerQty;
        breakPoint = counter + _.options.slidesToScroll;
        counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
      }
    }

    return pagerQty - 1;
  };

  Slick.prototype.getLeft = function (slideIndex) {
    var _ = this,
        targetLeft,
        verticalHeight,
        verticalOffset = 0,
        targetSlide,
        coef;

    _.slideOffset = 0;
    verticalHeight = _.$slides.first().outerHeight(true);

    if (_.options.infinite === true) {
      if (_.slideCount > _.options.slidesToShow) {
        _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
        coef = -1;

        if (_.options.vertical === true && _.options.centerMode === true) {
          if (_.options.slidesToShow === 2) {
            coef = -1.5;
          } else if (_.options.slidesToShow === 1) {
            coef = -2;
          }
        }

        verticalOffset = verticalHeight * _.options.slidesToShow * coef;
      }

      if (_.slideCount % _.options.slidesToScroll !== 0) {
        if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
          if (slideIndex > _.slideCount) {
            _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
            verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
          } else {
            _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
            verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
          }
        }
      }
    } else {
      if (slideIndex + _.options.slidesToShow > _.slideCount) {
        _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
        verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
      }
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.slideOffset = 0;
      verticalOffset = 0;
    }

    if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
      _.slideOffset = _.slideWidth * Math.floor(_.options.slidesToShow) / 2 - _.slideWidth * _.slideCount / 2;
    } else if (_.options.centerMode === true && _.options.infinite === true) {
      _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
    } else if (_.options.centerMode === true) {
      _.slideOffset = 0;
      _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
    }

    if (_.options.vertical === false) {
      targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
    } else {
      targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
    }

    if (_.options.variableWidth === true) {
      if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
      } else {
        targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
      }

      if (_.options.rtl === true) {
        if (targetSlide[0]) {
          targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
        } else {
          targetLeft = 0;
        }
      } else {
        targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
      }

      if (_.options.centerMode === true) {
        if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
          targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
        } else {
          targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
        }

        if (_.options.rtl === true) {
          if (targetSlide[0]) {
            targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
          } else {
            targetLeft = 0;
          }
        } else {
          targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
        }

        targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
      }
    }

    return targetLeft;
  };

  Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {
    var _ = this;

    return _.options[option];
  };

  Slick.prototype.getNavigableIndexes = function () {
    var _ = this,
        breakPoint = 0,
        counter = 0,
        indexes = [],
        max;

    if (_.options.infinite === false) {
      max = _.slideCount;
    } else {
      breakPoint = _.options.slidesToScroll * -1;
      counter = _.options.slidesToScroll * -1;
      max = _.slideCount * 2;
    }

    while (breakPoint < max) {
      indexes.push(breakPoint);
      breakPoint = counter + _.options.slidesToScroll;
      counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
    }

    return indexes;
  };

  Slick.prototype.getSlick = function () {
    return this;
  };

  Slick.prototype.getSlideCount = function () {
    var _ = this,
        slidesTraversed,
        swipedSlide,
        swipeTarget,
        centerOffset;

    centerOffset = _.options.centerMode === true ? Math.floor(_.$list.width() / 2) : 0;
    swipeTarget = _.swipeLeft * -1 + centerOffset;

    if (_.options.swipeToSlide === true) {
      _.$slideTrack.find('.slick-slide').each(function (index, slide) {
        var slideOuterWidth, slideOffset, slideRightBoundary;
        slideOuterWidth = $(slide).outerWidth();
        slideOffset = slide.offsetLeft;

        if (_.options.centerMode !== true) {
          slideOffset += slideOuterWidth / 2;
        }

        slideRightBoundary = slideOffset + slideOuterWidth;

        if (swipeTarget < slideRightBoundary) {
          swipedSlide = slide;
          return false;
        }
      });

      slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;
      return slidesTraversed;
    } else {
      return _.options.slidesToScroll;
    }
  };

  Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'index',
        index: parseInt(slide)
      }
    }, dontAnimate);
  };

  Slick.prototype.init = function (creation) {
    var _ = this;

    if (!$(_.$slider).hasClass('slick-initialized')) {
      $(_.$slider).addClass('slick-initialized');

      _.buildRows();

      _.buildOut();

      _.setProps();

      _.startLoad();

      _.loadSlider();

      _.initializeEvents();

      _.updateArrows();

      _.updateDots();

      _.checkResponsive(true);

      _.focusHandler();
    }

    if (creation) {
      _.$slider.trigger('init', [_]);
    }

    if (_.options.accessibility === true) {
      _.initADA();
    }

    if (_.options.autoplay) {
      _.paused = false;

      _.autoPlay();
    }
  };

  Slick.prototype.initADA = function () {
    var _ = this,
        numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
        tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
      return val >= 0 && val < _.slideCount;
    });

    _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
      'aria-hidden': 'true',
      'tabindex': '-1'
    }).find('a, input, button, select').attr({
      'tabindex': '-1'
    });

    if (_.$dots !== null) {
      _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
        var slideControlIndex = tabControlIndexes.indexOf(i);
        $(this).attr({
          'role': 'tabpanel',
          'id': 'slick-slide' + _.instanceUid + i,
          'tabindex': -1
        });

        if (slideControlIndex !== -1) {
          var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex;

          if ($('#' + ariaButtonControl).length) {
            $(this).attr({
              'aria-describedby': ariaButtonControl
            });
          }
        }
      });

      _.$dots.attr('role', 'tablist').find('li').each(function (i) {
        var mappedSlideIndex = tabControlIndexes[i];
        $(this).attr({
          'role': 'presentation'
        });
        $(this).find('button').first().attr({
          'role': 'tab',
          'id': 'slick-slide-control' + _.instanceUid + i,
          'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
          'aria-label': i + 1 + ' of ' + numDotGroups,
          'aria-selected': null,
          'tabindex': '-1'
        });
      }).eq(_.currentSlide).find('button').attr({
        'aria-selected': 'true',
        'tabindex': '0'
      }).end();
    }

    for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
      if (_.options.focusOnChange) {
        _.$slides.eq(i).attr({
          'tabindex': '0'
        });
      } else {
        _.$slides.eq(i).removeAttr('tabindex');
      }
    }

    _.activateADA();
  };

  Slick.prototype.initArrowEvents = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.off('click.slick').on('click.slick', {
        message: 'previous'
      }, _.changeSlide);

      _.$nextArrow.off('click.slick').on('click.slick', {
        message: 'next'
      }, _.changeSlide);

      if (_.options.accessibility === true) {
        _.$prevArrow.on('keydown.slick', _.keyHandler);

        _.$nextArrow.on('keydown.slick', _.keyHandler);
      }
    }
  };

  Slick.prototype.initDotEvents = function () {
    var _ = this;

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      $('li', _.$dots).on('click.slick', {
        message: 'index'
      }, _.changeSlide);

      if (_.options.accessibility === true) {
        _.$dots.on('keydown.slick', _.keyHandler);
      }
    }

    if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {
      $('li', _.$dots).on('mouseenter.slick', $.proxy(_.interrupt, _, true)).on('mouseleave.slick', $.proxy(_.interrupt, _, false));
    }
  };

  Slick.prototype.initSlideEvents = function () {
    var _ = this;

    if (_.options.pauseOnHover) {
      _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));

      _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));
    }
  };

  Slick.prototype.initializeEvents = function () {
    var _ = this;

    _.initArrowEvents();

    _.initDotEvents();

    _.initSlideEvents();

    _.$list.on('touchstart.slick mousedown.slick', {
      action: 'start'
    }, _.swipeHandler);

    _.$list.on('touchmove.slick mousemove.slick', {
      action: 'move'
    }, _.swipeHandler);

    _.$list.on('touchend.slick mouseup.slick', {
      action: 'end'
    }, _.swipeHandler);

    _.$list.on('touchcancel.slick mouseleave.slick', {
      action: 'end'
    }, _.swipeHandler);

    _.$list.on('click.slick', _.clickHandler);

    $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

    if (_.options.accessibility === true) {
      _.$list.on('keydown.slick', _.keyHandler);
    }

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on('click.slick', _.selectHandler);
    }

    $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));
    $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));
    $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);
    $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
    $(_.setPosition);
  };

  Slick.prototype.initUI = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.show();

      _.$nextArrow.show();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.show();
    }
  };

  Slick.prototype.keyHandler = function (event) {
    var _ = this; //Dont slide if the cursor is inside the form fields and arrow keys are pressed


    if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
      if (event.keyCode === 37 && _.options.accessibility === true) {
        _.changeSlide({
          data: {
            message: _.options.rtl === true ? 'next' : 'previous'
          }
        });
      } else if (event.keyCode === 39 && _.options.accessibility === true) {
        _.changeSlide({
          data: {
            message: _.options.rtl === true ? 'previous' : 'next'
          }
        });
      }
    }
  };

  Slick.prototype.lazyLoad = function () {
    var _ = this,
        loadRange,
        cloneRange,
        rangeStart,
        rangeEnd;

    function loadImages(imagesScope) {
      $('img[data-lazy]', imagesScope).each(function () {
        var image = $(this),
            imageSource = $(this).attr('data-lazy'),
            imageSrcSet = $(this).attr('data-srcset'),
            imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
            imageToLoad = document.createElement('img');

        imageToLoad.onload = function () {
          image.animate({
            opacity: 0
          }, 100, function () {
            if (imageSrcSet) {
              image.attr('srcset', imageSrcSet);

              if (imageSizes) {
                image.attr('sizes', imageSizes);
              }
            }

            image.attr('src', imageSource).animate({
              opacity: 1
            }, 200, function () {
              image.removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');
            });

            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
          });
        };

        imageToLoad.onerror = function () {
          image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

          _.$slider.trigger('lazyLoadError', [_, image, imageSource]);
        };

        imageToLoad.src = imageSource;
      });
    }

    if (_.options.centerMode === true) {
      if (_.options.infinite === true) {
        rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
        rangeEnd = rangeStart + _.options.slidesToShow + 2;
      } else {
        rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
        rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
      }
    } else {
      rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
      rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);

      if (_.options.fade === true) {
        if (rangeStart > 0) rangeStart--;
        if (rangeEnd <= _.slideCount) rangeEnd++;
      }
    }

    loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

    if (_.options.lazyLoad === 'anticipated') {
      var prevSlide = rangeStart - 1,
          nextSlide = rangeEnd,
          $slides = _.$slider.find('.slick-slide');

      for (var i = 0; i < _.options.slidesToScroll; i++) {
        if (prevSlide < 0) prevSlide = _.slideCount - 1;
        loadRange = loadRange.add($slides.eq(prevSlide));
        loadRange = loadRange.add($slides.eq(nextSlide));
        prevSlide--;
        nextSlide++;
      }
    }

    loadImages(loadRange);

    if (_.slideCount <= _.options.slidesToShow) {
      cloneRange = _.$slider.find('.slick-slide');
      loadImages(cloneRange);
    } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
      cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
      loadImages(cloneRange);
    } else if (_.currentSlide === 0) {
      cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
      loadImages(cloneRange);
    }
  };

  Slick.prototype.loadSlider = function () {
    var _ = this;

    _.setPosition();

    _.$slideTrack.css({
      opacity: 1
    });

    _.$slider.removeClass('slick-loading');

    _.initUI();

    if (_.options.lazyLoad === 'progressive') {
      _.progressiveLazyLoad();
    }
  };

  Slick.prototype.next = Slick.prototype.slickNext = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'next'
      }
    });
  };

  Slick.prototype.orientationChange = function () {
    var _ = this;

    _.checkResponsive();

    _.setPosition();
  };

  Slick.prototype.pause = Slick.prototype.slickPause = function () {
    var _ = this;

    _.autoPlayClear();

    _.paused = true;
  };

  Slick.prototype.play = Slick.prototype.slickPlay = function () {
    var _ = this;

    _.autoPlay();

    _.options.autoplay = true;
    _.paused = false;
    _.focussed = false;
    _.interrupted = false;
  };

  Slick.prototype.postSlide = function (index) {
    var _ = this;

    if (!_.unslicked) {
      _.$slider.trigger('afterChange', [_, index]);

      _.animating = false;

      if (_.slideCount > _.options.slidesToShow) {
        _.setPosition();
      }

      _.swipeLeft = null;

      if (_.options.autoplay) {
        _.autoPlay();
      }

      if (_.options.accessibility === true) {
        _.initADA();

        if (_.options.focusOnChange) {
          var $currentSlide = $(_.$slides.get(_.currentSlide));
          $currentSlide.attr('tabindex', 0).focus();
        }
      }
    }
  };

  Slick.prototype.prev = Slick.prototype.slickPrev = function () {
    var _ = this;

    _.changeSlide({
      data: {
        message: 'previous'
      }
    });
  };

  Slick.prototype.preventDefault = function (event) {
    event.preventDefault();
  };

  Slick.prototype.progressiveLazyLoad = function (tryCount) {
    tryCount = tryCount || 1;

    var _ = this,
        $imgsToLoad = $('img[data-lazy]', _.$slider),
        image,
        imageSource,
        imageSrcSet,
        imageSizes,
        imageToLoad;

    if ($imgsToLoad.length) {
      image = $imgsToLoad.first();
      imageSource = image.attr('data-lazy');
      imageSrcSet = image.attr('data-srcset');
      imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
      imageToLoad = document.createElement('img');

      imageToLoad.onload = function () {
        if (imageSrcSet) {
          image.attr('srcset', imageSrcSet);

          if (imageSizes) {
            image.attr('sizes', imageSizes);
          }
        }

        image.attr('src', imageSource).removeAttr('data-lazy data-srcset data-sizes').removeClass('slick-loading');

        if (_.options.adaptiveHeight === true) {
          _.setPosition();
        }

        _.$slider.trigger('lazyLoaded', [_, image, imageSource]);

        _.progressiveLazyLoad();
      };

      imageToLoad.onerror = function () {
        if (tryCount < 3) {
          /**
           * try to load the image 3 times,
           * leave a slight delay so we don't get
           * servers blocking the request.
           */
          setTimeout(function () {
            _.progressiveLazyLoad(tryCount + 1);
          }, 500);
        } else {
          image.removeAttr('data-lazy').removeClass('slick-loading').addClass('slick-lazyload-error');

          _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

          _.progressiveLazyLoad();
        }
      };

      imageToLoad.src = imageSource;
    } else {
      _.$slider.trigger('allImagesLoaded', [_]);
    }
  };

  Slick.prototype.refresh = function (initializing) {
    var _ = this,
        currentSlide,
        lastVisibleIndex;

    lastVisibleIndex = _.slideCount - _.options.slidesToShow; // in non-infinite sliders, we don't want to go past the
    // last visible index.

    if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
      _.currentSlide = lastVisibleIndex;
    } // if less slides than to show, go to start.


    if (_.slideCount <= _.options.slidesToShow) {
      _.currentSlide = 0;
    }

    currentSlide = _.currentSlide;

    _.destroy(true);

    $.extend(_, _.initials, {
      currentSlide: currentSlide
    });

    _.init();

    if (!initializing) {
      _.changeSlide({
        data: {
          message: 'index',
          index: currentSlide
        }
      }, false);
    }
  };

  Slick.prototype.registerBreakpoints = function () {
    var _ = this,
        breakpoint,
        currentBreakpoint,
        l,
        responsiveSettings = _.options.responsive || null;

    if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {
      _.respondTo = _.options.respondTo || 'window';

      for (breakpoint in responsiveSettings) {
        l = _.breakpoints.length - 1;

        if (responsiveSettings.hasOwnProperty(breakpoint)) {
          currentBreakpoint = responsiveSettings[breakpoint].breakpoint; // loop through the breakpoints and cut out any existing
          // ones with the same breakpoint number, we don't want dupes.

          while (l >= 0) {
            if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
              _.breakpoints.splice(l, 1);
            }

            l--;
          }

          _.breakpoints.push(currentBreakpoint);

          _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
        }
      }

      _.breakpoints.sort(function (a, b) {
        return _.options.mobileFirst ? a - b : b - a;
      });
    }
  };

  Slick.prototype.reinit = function () {
    var _ = this;

    _.$slides = _.$slideTrack.children(_.options.slide).addClass('slick-slide');
    _.slideCount = _.$slides.length;

    if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
      _.currentSlide = _.currentSlide - _.options.slidesToScroll;
    }

    if (_.slideCount <= _.options.slidesToShow) {
      _.currentSlide = 0;
    }

    _.registerBreakpoints();

    _.setProps();

    _.setupInfinite();

    _.buildArrows();

    _.updateArrows();

    _.initArrowEvents();

    _.buildDots();

    _.updateDots();

    _.initDotEvents();

    _.cleanUpSlideEvents();

    _.initSlideEvents();

    _.checkResponsive(false, true);

    if (_.options.focusOnSelect === true) {
      $(_.$slideTrack).children().on('click.slick', _.selectHandler);
    }

    _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

    _.setPosition();

    _.focusHandler();

    _.paused = !_.options.autoplay;

    _.autoPlay();

    _.$slider.trigger('reInit', [_]);
  };

  Slick.prototype.resize = function () {
    var _ = this;

    if ($(window).width() !== _.windowWidth) {
      clearTimeout(_.windowDelay);
      _.windowDelay = window.setTimeout(function () {
        _.windowWidth = $(window).width();

        _.checkResponsive();

        if (!_.unslicked) {
          _.setPosition();
        }
      }, 50);
    }
  };

  Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {
    var _ = this;

    if (typeof index === 'boolean') {
      removeBefore = index;
      index = removeBefore === true ? 0 : _.slideCount - 1;
    } else {
      index = removeBefore === true ? --index : index;
    }

    if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
      return false;
    }

    _.unload();

    if (removeAll === true) {
      _.$slideTrack.children().remove();
    } else {
      _.$slideTrack.children(this.options.slide).eq(index).remove();
    }

    _.$slides = _.$slideTrack.children(this.options.slide);

    _.$slideTrack.children(this.options.slide).detach();

    _.$slideTrack.append(_.$slides);

    _.$slidesCache = _.$slides;

    _.reinit();
  };

  Slick.prototype.setCSS = function (position) {
    var _ = this,
        positionProps = {},
        x,
        y;

    if (_.options.rtl === true) {
      position = -position;
    }

    x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
    y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';
    positionProps[_.positionProp] = position;

    if (_.transformsEnabled === false) {
      _.$slideTrack.css(positionProps);
    } else {
      positionProps = {};

      if (_.cssTransitions === false) {
        positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';

        _.$slideTrack.css(positionProps);
      } else {
        positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';

        _.$slideTrack.css(positionProps);
      }
    }
  };

  Slick.prototype.setDimensions = function () {
    var _ = this;

    if (_.options.vertical === false) {
      if (_.options.centerMode === true) {
        _.$list.css({
          padding: '0px ' + _.options.centerPadding
        });
      }
    } else {
      _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);

      if (_.options.centerMode === true) {
        _.$list.css({
          padding: _.options.centerPadding + ' 0px'
        });
      }
    }

    _.listWidth = _.$list.width();
    _.listHeight = _.$list.height();

    if (_.options.vertical === false && _.options.variableWidth === false) {
      _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);

      _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));
    } else if (_.options.variableWidth === true) {
      _.$slideTrack.width(5000 * _.slideCount);
    } else {
      _.slideWidth = Math.ceil(_.listWidth);

      _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
    }

    var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();

    if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);
  };

  Slick.prototype.setFade = function () {
    var _ = this,
        targetLeft;

    _.$slides.each(function (index, element) {
      targetLeft = _.slideWidth * index * -1;

      if (_.options.rtl === true) {
        $(element).css({
          position: 'relative',
          right: targetLeft,
          top: 0,
          zIndex: _.options.zIndex - 2,
          opacity: 0
        });
      } else {
        $(element).css({
          position: 'relative',
          left: targetLeft,
          top: 0,
          zIndex: _.options.zIndex - 2,
          opacity: 0
        });
      }
    });

    _.$slides.eq(_.currentSlide).css({
      zIndex: _.options.zIndex - 1,
      opacity: 1
    });
  };

  Slick.prototype.setHeight = function () {
    var _ = this;

    if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
      var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);

      _.$list.css('height', targetHeight);
    }
  };

  Slick.prototype.setOption = Slick.prototype.slickSetOption = function () {
    /**
     * accepts arguments in format of:
     *
     *  - for changing a single option's value:
     *     .slick("setOption", option, value, refresh )
     *
     *  - for changing a set of responsive options:
     *     .slick("setOption", 'responsive', [{}, ...], refresh )
     *
     *  - for updating multiple values at once (not responsive)
     *     .slick("setOption", { 'option': value, ... }, refresh )
     */
    var _ = this,
        l,
        item,
        option,
        value,
        refresh = false,
        type;

    if ($.type(arguments[0]) === 'object') {
      option = arguments[0];
      refresh = arguments[1];
      type = 'multiple';
    } else if ($.type(arguments[0]) === 'string') {
      option = arguments[0];
      value = arguments[1];
      refresh = arguments[2];

      if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {
        type = 'responsive';
      } else if (typeof arguments[1] !== 'undefined') {
        type = 'single';
      }
    }

    if (type === 'single') {
      _.options[option] = value;
    } else if (type === 'multiple') {
      $.each(option, function (opt, val) {
        _.options[opt] = val;
      });
    } else if (type === 'responsive') {
      for (item in value) {
        if ($.type(_.options.responsive) !== 'array') {
          _.options.responsive = [value[item]];
        } else {
          l = _.options.responsive.length - 1; // loop through the responsive object and splice out duplicates.

          while (l >= 0) {
            if (_.options.responsive[l].breakpoint === value[item].breakpoint) {
              _.options.responsive.splice(l, 1);
            }

            l--;
          }

          _.options.responsive.push(value[item]);
        }
      }
    }

    if (refresh) {
      _.unload();

      _.reinit();
    }
  };

  Slick.prototype.setPosition = function () {
    var _ = this;

    _.setDimensions();

    _.setHeight();

    if (_.options.fade === false) {
      _.setCSS(_.getLeft(_.currentSlide));
    } else {
      _.setFade();
    }

    _.$slider.trigger('setPosition', [_]);
  };

  Slick.prototype.setProps = function () {
    var _ = this,
        bodyStyle = document.body.style;

    _.positionProp = _.options.vertical === true ? 'top' : 'left';

    if (_.positionProp === 'top') {
      _.$slider.addClass('slick-vertical');
    } else {
      _.$slider.removeClass('slick-vertical');
    }

    if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
      if (_.options.useCSS === true) {
        _.cssTransitions = true;
      }
    }

    if (_.options.fade) {
      if (typeof _.options.zIndex === 'number') {
        if (_.options.zIndex < 3) {
          _.options.zIndex = 3;
        }
      } else {
        _.options.zIndex = _.defaults.zIndex;
      }
    }

    if (bodyStyle.OTransform !== undefined) {
      _.animType = 'OTransform';
      _.transformType = '-o-transform';
      _.transitionType = 'OTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
    }

    if (bodyStyle.MozTransform !== undefined) {
      _.animType = 'MozTransform';
      _.transformType = '-moz-transform';
      _.transitionType = 'MozTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
    }

    if (bodyStyle.webkitTransform !== undefined) {
      _.animType = 'webkitTransform';
      _.transformType = '-webkit-transform';
      _.transitionType = 'webkitTransition';
      if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
    }

    if (bodyStyle.msTransform !== undefined) {
      _.animType = 'msTransform';
      _.transformType = '-ms-transform';
      _.transitionType = 'msTransition';
      if (bodyStyle.msTransform === undefined) _.animType = false;
    }

    if (bodyStyle.transform !== undefined && _.animType !== false) {
      _.animType = 'transform';
      _.transformType = 'transform';
      _.transitionType = 'transition';
    }

    _.transformsEnabled = _.options.useTransform && _.animType !== null && _.animType !== false;
  };

  Slick.prototype.setSlideClasses = function (index) {
    var _ = this,
        centerOffset,
        allSlides,
        indexOffset,
        remainder;

    allSlides = _.$slider.find('.slick-slide').removeClass('slick-active slick-center slick-current').attr('aria-hidden', 'true');

    _.$slides.eq(index).addClass('slick-current');

    if (_.options.centerMode === true) {
      var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;
      centerOffset = Math.floor(_.options.slidesToShow / 2);

      if (_.options.infinite === true) {
        if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
          _.$slides.slice(index - centerOffset + evenCoef, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
        } else {
          indexOffset = _.options.slidesToShow + index;
          allSlides.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
        }

        if (index === 0) {
          allSlides.eq(_.options.slidesToShow + _.slideCount + 1).addClass('slick-center');
        } else if (index === _.slideCount - 1) {
          allSlides.eq(_.options.slidesToShow).addClass('slick-center');
        }
      }

      _.$slides.eq(index).addClass('slick-center');
    } else {
      if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
        _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
      } else if (allSlides.length <= _.options.slidesToShow) {
        allSlides.addClass('slick-active').attr('aria-hidden', 'false');
      } else {
        remainder = _.slideCount % _.options.slidesToShow;
        indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

        if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {
          allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
        } else {
          allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
        }
      }
    }

    if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
      _.lazyLoad();
    }
  };

  Slick.prototype.setupInfinite = function () {
    var _ = this,
        i,
        slideIndex,
        infiniteCount;

    if (_.options.fade === true) {
      _.options.centerMode = false;
    }

    if (_.options.infinite === true && _.options.fade === false) {
      slideIndex = null;

      if (_.slideCount > _.options.slidesToShow) {
        if (_.options.centerMode === true) {
          infiniteCount = _.options.slidesToShow + 1;
        } else {
          infiniteCount = _.options.slidesToShow;
        }

        for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
          slideIndex = i - 1;
          $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass('slick-cloned');
        }

        for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
          slideIndex = i;
          $(_.$slides[slideIndex]).clone(true).attr('id', '').attr('data-slick-index', slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass('slick-cloned');
        }

        _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
          $(this).attr('id', '');
        });
      }
    }
  };

  Slick.prototype.interrupt = function (toggle) {
    var _ = this;

    if (!toggle) {
      _.autoPlay();
    }

    _.interrupted = toggle;
  };

  Slick.prototype.selectHandler = function (event) {
    var _ = this;

    var targetElement = $(event.target).is('.slick-slide') ? $(event.target) : $(event.target).parents('.slick-slide');
    var index = parseInt(targetElement.attr('data-slick-index'));
    if (!index) index = 0;

    if (_.slideCount <= _.options.slidesToShow) {
      _.slideHandler(index, false, true);

      return;
    }

    _.slideHandler(index);
  };

  Slick.prototype.slideHandler = function (index, sync, dontAnimate) {
    var targetSlide,
        animSlide,
        oldSlide,
        slideLeft,
        targetLeft = null,
        _ = this,
        navTarget;

    sync = sync || false;

    if (_.animating === true && _.options.waitForAnimate === true) {
      return;
    }

    if (_.options.fade === true && _.currentSlide === index) {
      return;
    }

    if (sync === false) {
      _.asNavFor(index);
    }

    targetSlide = index;
    targetLeft = _.getLeft(targetSlide);
    slideLeft = _.getLeft(_.currentSlide);
    _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

    if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }

      return;
    } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
      if (_.options.fade === false) {
        targetSlide = _.currentSlide;

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
          _.animateSlide(slideLeft, function () {
            _.postSlide(targetSlide);
          });
        } else {
          _.postSlide(targetSlide);
        }
      }

      return;
    }

    if (_.options.autoplay) {
      clearInterval(_.autoPlayTimer);
    }

    if (targetSlide < 0) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
      } else {
        animSlide = _.slideCount + targetSlide;
      }
    } else if (targetSlide >= _.slideCount) {
      if (_.slideCount % _.options.slidesToScroll !== 0) {
        animSlide = 0;
      } else {
        animSlide = targetSlide - _.slideCount;
      }
    } else {
      animSlide = targetSlide;
    }

    _.animating = true;

    _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

    oldSlide = _.currentSlide;
    _.currentSlide = animSlide;

    _.setSlideClasses(_.currentSlide);

    if (_.options.asNavFor) {
      navTarget = _.getNavTarget();
      navTarget = navTarget.slick('getSlick');

      if (navTarget.slideCount <= navTarget.options.slidesToShow) {
        navTarget.setSlideClasses(_.currentSlide);
      }
    }

    _.updateDots();

    _.updateArrows();

    if (_.options.fade === true) {
      if (dontAnimate !== true) {
        _.fadeSlideOut(oldSlide);

        _.fadeSlide(animSlide, function () {
          _.postSlide(animSlide);
        });
      } else {
        _.postSlide(animSlide);
      }

      _.animateHeight();

      return;
    }

    if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
      _.animateSlide(targetLeft, function () {
        _.postSlide(animSlide);
      });
    } else {
      _.postSlide(animSlide);
    }
  };

  Slick.prototype.startLoad = function () {
    var _ = this;

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
      _.$prevArrow.hide();

      _.$nextArrow.hide();
    }

    if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
      _.$dots.hide();
    }

    _.$slider.addClass('slick-loading');
  };

  Slick.prototype.swipeDirection = function () {
    var xDist,
        yDist,
        r,
        swipeAngle,
        _ = this;

    xDist = _.touchObject.startX - _.touchObject.curX;
    yDist = _.touchObject.startY - _.touchObject.curY;
    r = Math.atan2(yDist, xDist);
    swipeAngle = Math.round(r * 180 / Math.PI);

    if (swipeAngle < 0) {
      swipeAngle = 360 - Math.abs(swipeAngle);
    }

    if (swipeAngle <= 45 && swipeAngle >= 0) {
      return _.options.rtl === false ? 'left' : 'right';
    }

    if (swipeAngle <= 360 && swipeAngle >= 315) {
      return _.options.rtl === false ? 'left' : 'right';
    }

    if (swipeAngle >= 135 && swipeAngle <= 225) {
      return _.options.rtl === false ? 'right' : 'left';
    }

    if (_.options.verticalSwiping === true) {
      if (swipeAngle >= 35 && swipeAngle <= 135) {
        return 'down';
      } else {
        return 'up';
      }
    }

    return 'vertical';
  };

  Slick.prototype.swipeEnd = function (event) {
    var _ = this,
        slideCount,
        direction;

    _.dragging = false;
    _.swiping = false;

    if (_.scrolling) {
      _.scrolling = false;
      return false;
    }

    _.interrupted = false;
    _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

    if (_.touchObject.curX === undefined) {
      return false;
    }

    if (_.touchObject.edgeHit === true) {
      _.$slider.trigger('edge', [_, _.swipeDirection()]);
    }

    if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
      direction = _.swipeDirection();

      switch (direction) {
        case 'left':
        case 'down':
          slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
          _.currentDirection = 0;
          break;

        case 'right':
        case 'up':
          slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
          _.currentDirection = 1;
          break;

        default:
      }

      if (direction != 'vertical') {
        _.slideHandler(slideCount);

        _.touchObject = {};

        _.$slider.trigger('swipe', [_, direction]);
      }
    } else {
      if (_.touchObject.startX !== _.touchObject.curX) {
        _.slideHandler(_.currentSlide);

        _.touchObject = {};
      }
    }
  };

  Slick.prototype.swipeHandler = function (event) {
    var _ = this;

    if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
      return;
    } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
      return;
    }

    _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;
    _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;

    if (_.options.verticalSwiping === true) {
      _.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
    }

    switch (event.data.action) {
      case 'start':
        _.swipeStart(event);

        break;

      case 'move':
        _.swipeMove(event);

        break;

      case 'end':
        _.swipeEnd(event);

        break;
    }
  };

  Slick.prototype.swipeMove = function (event) {
    var _ = this,
        edgeWasHit = false,
        curLeft,
        swipeDirection,
        swipeLength,
        positionOffset,
        touches,
        verticalSwipeLength;

    touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

    if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
      return false;
    }

    curLeft = _.getLeft(_.currentSlide);
    _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
    _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;
    _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));
    verticalSwipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

    if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
      _.scrolling = true;
      return false;
    }

    if (_.options.verticalSwiping === true) {
      _.touchObject.swipeLength = verticalSwipeLength;
    }

    swipeDirection = _.swipeDirection();

    if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
      _.swiping = true;
      event.preventDefault();
    }

    positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);

    if (_.options.verticalSwiping === true) {
      positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
    }

    swipeLength = _.touchObject.swipeLength;
    _.touchObject.edgeHit = false;

    if (_.options.infinite === false) {
      if (_.currentSlide === 0 && swipeDirection === 'right' || _.currentSlide >= _.getDotCount() && swipeDirection === 'left') {
        swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
        _.touchObject.edgeHit = true;
      }
    }

    if (_.options.vertical === false) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    } else {
      _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
    }

    if (_.options.verticalSwiping === true) {
      _.swipeLeft = curLeft + swipeLength * positionOffset;
    }

    if (_.options.fade === true || _.options.touchMove === false) {
      return false;
    }

    if (_.animating === true) {
      _.swipeLeft = null;
      return false;
    }

    _.setCSS(_.swipeLeft);
  };

  Slick.prototype.swipeStart = function (event) {
    var _ = this,
        touches;

    _.interrupted = true;

    if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
      _.touchObject = {};
      return false;
    }

    if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
      touches = event.originalEvent.touches[0];
    }

    _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
    _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;
    _.dragging = true;
  };

  Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {
    var _ = this;

    if (_.$slidesCache !== null) {
      _.unload();

      _.$slideTrack.children(this.options.slide).detach();

      _.$slidesCache.appendTo(_.$slideTrack);

      _.reinit();
    }
  };

  Slick.prototype.unload = function () {
    var _ = this;

    $('.slick-cloned', _.$slider).remove();

    if (_.$dots) {
      _.$dots.remove();
    }

    if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
      _.$prevArrow.remove();
    }

    if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
      _.$nextArrow.remove();
    }

    _.$slides.removeClass('slick-slide slick-active slick-visible slick-current').attr('aria-hidden', 'true').css('width', '');
  };

  Slick.prototype.unslick = function (fromBreakpoint) {
    var _ = this;

    _.$slider.trigger('unslick', [_, fromBreakpoint]);

    _.destroy();
  };

  Slick.prototype.updateArrows = function () {
    var _ = this,
        centerOffset;

    centerOffset = Math.floor(_.options.slidesToShow / 2);

    if (_.options.arrows === true && _.slideCount > _.options.slidesToShow && !_.options.infinite) {
      _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

      _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

      if (_.currentSlide === 0) {
        _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

        _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
      } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {
        _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

        _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
      } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {
        _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

        _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
      }
    }
  };

  Slick.prototype.updateDots = function () {
    var _ = this;

    if (_.$dots !== null) {
      _.$dots.find('li').removeClass('slick-active').end();

      _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active');
    }
  };

  Slick.prototype.visibility = function () {
    var _ = this;

    if (_.options.autoplay) {
      if (document[_.hidden]) {
        _.interrupted = true;
      } else {
        _.interrupted = false;
      }
    }
  };

  $.fn.slick = function () {
    var _ = this,
        opt = arguments[0],
        args = Array.prototype.slice.call(arguments, 1),
        l = _.length,
        i,
        ret;

    for (i = 0; i < l; i++) {
      if (_typeof(opt) == 'object' || typeof opt == 'undefined') _[i].slick = new Slick(_[i], opt);else ret = _[i].slick[opt].apply(_[i].slick, args);
      if (typeof ret != 'undefined') return ret;
    }

    return _;
  };
});
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
* jquery-match-height 0.7.2 by @liabru
* http://brm.io/jquery-match-height/
* License MIT
*/
!function (t) {
  "use strict";

  "function" == typeof define && define.amd ? define(["jquery"], t) : "undefined" != typeof module && module.exports ? module.exports = t(require("jquery")) : t(jQuery);
}(function (t) {
  var e = -1,
      o = -1,
      n = function n(t) {
    return parseFloat(t) || 0;
  },
      a = function a(e) {
    var o = 1,
        a = t(e),
        i = null,
        r = [];
    return a.each(function () {
      var e = t(this),
          a = e.offset().top - n(e.css("margin-top")),
          s = r.length > 0 ? r[r.length - 1] : null;
      null === s ? r.push(e) : Math.floor(Math.abs(i - a)) <= o ? r[r.length - 1] = s.add(e) : r.push(e), i = a;
    }), r;
  },
      i = function i(e) {
    var o = {
      byRow: !0,
      property: "height",
      target: null,
      remove: !1
    };
    return "object" == _typeof(e) ? t.extend(o, e) : ("boolean" == typeof e ? o.byRow = e : "remove" === e && (o.remove = !0), o);
  },
      r = t.fn.matchHeight = function (e) {
    var o = i(e);

    if (o.remove) {
      var n = this;
      return this.css(o.property, ""), t.each(r._groups, function (t, e) {
        e.elements = e.elements.not(n);
      }), this;
    }

    return this.length <= 1 && !o.target ? this : (r._groups.push({
      elements: this,
      options: o
    }), r._apply(this, o), this);
  };

  r.version = "0.7.2", r._groups = [], r._throttle = 80, r._maintainScroll = !1, r._beforeUpdate = null, r._afterUpdate = null, r._rows = a, r._parse = n, r._parseOptions = i, r._apply = function (e, o) {
    var s = i(o),
        h = t(e),
        l = [h],
        c = t(window).scrollTop(),
        p = t("html").outerHeight(!0),
        u = h.parents().filter(":hidden");
    return u.each(function () {
      var e = t(this);
      e.data("style-cache", e.attr("style"));
    }), u.css("display", "block"), s.byRow && !s.target && (h.each(function () {
      var e = t(this),
          o = e.css("display");
      "inline-block" !== o && "flex" !== o && "inline-flex" !== o && (o = "block"), e.data("style-cache", e.attr("style")), e.css({
        display: o,
        "padding-top": "0",
        "padding-bottom": "0",
        "margin-top": "0",
        "margin-bottom": "0",
        "border-top-width": "0",
        "border-bottom-width": "0",
        height: "100px",
        overflow: "hidden"
      });
    }), l = a(h), h.each(function () {
      var e = t(this);
      e.attr("style", e.data("style-cache") || "");
    })), t.each(l, function (e, o) {
      var a = t(o),
          i = 0;
      if (s.target) i = s.target.outerHeight(!1);else {
        if (s.byRow && a.length <= 1) return void a.css(s.property, "");
        a.each(function () {
          var e = t(this),
              o = e.attr("style"),
              n = e.css("display");
          "inline-block" !== n && "flex" !== n && "inline-flex" !== n && (n = "block");
          var a = {
            display: n
          };
          a[s.property] = "", e.css(a), e.outerHeight(!1) > i && (i = e.outerHeight(!1)), o ? e.attr("style", o) : e.css("display", "");
        });
      }
      a.each(function () {
        var e = t(this),
            o = 0;
        s.target && e.is(s.target) || ("border-box" !== e.css("box-sizing") && (o += n(e.css("border-top-width")) + n(e.css("border-bottom-width")), o += n(e.css("padding-top")) + n(e.css("padding-bottom"))), e.css(s.property, i - o + "px"));
      });
    }), u.each(function () {
      var e = t(this);
      e.attr("style", e.data("style-cache") || null);
    }), r._maintainScroll && t(window).scrollTop(c / p * t("html").outerHeight(!0)), this;
  }, r._applyDataApi = function () {
    var e = {};
    t("[data-match-height], [data-mh]").each(function () {
      var o = t(this),
          n = o.attr("data-mh") || o.attr("data-match-height");
      n in e ? e[n] = e[n].add(o) : e[n] = o;
    }), t.each(e, function () {
      this.matchHeight(!0);
    });
  };

  var s = function s(e) {
    r._beforeUpdate && r._beforeUpdate(e, r._groups), t.each(r._groups, function () {
      r._apply(this.elements, this.options);
    }), r._afterUpdate && r._afterUpdate(e, r._groups);
  };

  r._update = function (n, a) {
    if (a && "resize" === a.type) {
      var i = t(window).width();
      if (i === e) return;
      e = i;
    }

    n ? o === -1 && (o = setTimeout(function () {
      s(a), o = -1;
    }, r._throttle)) : s(a);
  }, t(r._applyDataApi);
  var h = t.fn.on ? "on" : "bind";
  t(window)[h]("load", function (t) {
    r._update(!1, t);
  }), t(window)[h]("resize orientationchange", function (t) {
    r._update(!0, t);
  });
});
"use strict";

// https://github.com/willmcpo/body-scroll-lock
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.bodyScrollLock = mod.exports;
  }
  /* CDC-UPDATE START: replace 'this' with 'window', scoping issue */

})(window, function (exports) {
  /* CDC-UPDATE END */
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  } // Older browsers don't support event options, feature detect it.
  // Adopted and modified solution from Bohdan Didukh (2017)
  // https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi


  var hasPassiveEvents = false;

  if (typeof window !== 'undefined') {
    var passiveTestOptions = {
      get passive() {
        hasPassiveEvents = true;
        return undefined;
      }

    };
    window.addEventListener('testPassive', null, passiveTestOptions);
    window.removeEventListener('testPassive', null, passiveTestOptions);
  }

  var isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  var locks = [];
  var documentListenerAdded = false;
  var initialClientY = -1;
  var previousBodyOverflowSetting = void 0;
  var previousBodyPaddingRight = void 0; // returns true if `el` should be allowed to receive touchmove events.

  var allowTouchMove = function allowTouchMove(el) {
    return locks.some(function (lock) {
      if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
        return true;
      }

      return false;
    });
  };

  var preventDefault = function preventDefault(rawEvent) {
    var e = rawEvent || window.event; // For the case whereby consumers adds a touchmove event listener to document.
    // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
    // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
    // the touchmove event on document will break.

    if (allowTouchMove(e.target)) {
      return true;
    } // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).


    if (e.touches.length > 1) return true;
    if (e.preventDefault) e.preventDefault();
    return false;
  };

  var setOverflowHidden = function setOverflowHidden(options) {
    // If previousBodyPaddingRight is already set, don't set it again.
    if (previousBodyPaddingRight === undefined) {
      var _reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;

      var scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

      if (_reserveScrollBarGap && scrollBarGap > 0) {
        previousBodyPaddingRight = document.body.style.paddingRight;
        document.body.style.paddingRight = scrollBarGap + 'px';
      }
    } // If previousBodyOverflowSetting is already set, don't set it again.


    if (previousBodyOverflowSetting === undefined) {
      previousBodyOverflowSetting = document.body.style.overflow; // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
      // the responsiveness for some reason. Setting within a setTimeout fixes this.

      setTimeout(function () {
        document.body.style.overflow = 'hidden';
      });
    }
  };

  var restoreOverflowSetting = function restoreOverflowSetting() {
    // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
    // the responsiveness for some reason. Setting within a setTimeout fixes this.
    setTimeout(function () {
      if (previousBodyPaddingRight !== undefined) {
        document.body.style.paddingRight = previousBodyPaddingRight; // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
        // can be set again.

        previousBodyPaddingRight = undefined;
      }

      if (previousBodyOverflowSetting !== undefined) {
        document.body.style.overflow = previousBodyOverflowSetting; // Restore previousBodyOverflowSetting to undefined
        // so setOverflowHidden knows it can be set again.

        previousBodyOverflowSetting = undefined;
      }
    });
  }; // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions


  var isTargetElementTotallyScrolled = function isTargetElementTotallyScrolled(targetElement) {
    return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
  };

  var handleScroll = function handleScroll(event, targetElement) {
    var clientY = event.targetTouches[0].clientY - initialClientY;

    if (allowTouchMove(event.target)) {
      return false;
    }

    if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
      // element is at the top of its scroll.
      return preventDefault(event);
    }

    if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
      // element is at the bottom of its scroll.
      return preventDefault(event);
    }

    event.stopPropagation();
    return true;
  };

  var disableBodyScroll = exports.disableBodyScroll = function disableBodyScroll(targetElement, options) {
    if (isIosDevice) {
      // targetElement must be provided, and disableBodyScroll must not have been
      // called on this targetElement before.
      if (!targetElement) {
        // eslint-disable-next-line no-console
        console.error('disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.');
        return;
      }

      if (targetElement && !locks.some(function (lock) {
        return lock.targetElement === targetElement;
      })) {
        var lock = {
          targetElement: targetElement,
          options: options || {}
        };
        locks = [].concat(_toConsumableArray(locks), [lock]);

        targetElement.ontouchstart = function (event) {
          if (event.targetTouches.length === 1) {
            // detect single touch.
            initialClientY = event.targetTouches[0].clientY;
          }
        };

        targetElement.ontouchmove = function (event) {
          if (event.targetTouches.length === 1) {
            // detect single touch.
            handleScroll(event, targetElement);
          }
        };

        if (!documentListenerAdded) {
          document.addEventListener('touchmove', preventDefault, hasPassiveEvents ? {
            passive: false
          } : undefined);
          documentListenerAdded = true;
        }
      }
    } else {
      setOverflowHidden(options);
      var _lock = {
        targetElement: targetElement,
        options: options || {}
      };
      locks = [].concat(_toConsumableArray(locks), [_lock]);
    }
  };

  var clearAllBodyScrollLocks = exports.clearAllBodyScrollLocks = function clearAllBodyScrollLocks() {
    if (isIosDevice) {
      // Clear all locks ontouchstart/ontouchmove handlers, and the references.
      locks.forEach(function (lock) {
        lock.targetElement.ontouchstart = null;
        lock.targetElement.ontouchmove = null;
      });

      if (documentListenerAdded) {
        document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? {
          passive: false
        } : undefined);
        documentListenerAdded = false;
      }

      locks = []; // Reset initial clientY.

      initialClientY = -1;
    } else {
      restoreOverflowSetting();
      locks = [];
    }
  };

  var enableBodyScroll = exports.enableBodyScroll = function enableBodyScroll(targetElement) {
    if (isIosDevice) {
      if (!targetElement) {
        // eslint-disable-next-line no-console
        console.error('enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.');
        return;
      }

      targetElement.ontouchstart = null;
      targetElement.ontouchmove = null;
      locks = locks.filter(function (lock) {
        return lock.targetElement !== targetElement;
      });

      if (documentListenerAdded && locks.length === 0) {
        document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? {
          passive: false
        } : undefined);
        documentListenerAdded = false;
      }
    } else {
      locks = locks.filter(function (lock) {
        return lock.targetElement !== targetElement;
      });

      if (!locks.length) {
        restoreOverflowSetting();
      }
    }
  };
});
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*! @license DOMPurify 2.4.1 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.4.1/LICENSE */
!function (e, t) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).DOMPurify = t();
}(void 0, function () {
  "use strict";

  function e(t) {
    return e = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
      return _typeof(e);
    } : function (e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e);
    }, e(t);
  }

  function t(e, n) {
    return t = Object.setPrototypeOf || function (e, t) {
      return e.__proto__ = t, e;
    }, t(e, n);
  }

  function n() {
    if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
    if (Reflect.construct.sham) return !1;
    if ("function" == typeof Proxy) return !0;

    try {
      return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
    } catch (e) {
      return !1;
    }
  }

  function r(e, o, a) {
    return r = n() ? Reflect.construct : function (e, n, r) {
      var o = [null];
      o.push.apply(o, n);
      var a = new (Function.bind.apply(e, o))();
      return r && t(a, r.prototype), a;
    }, r.apply(null, arguments);
  }

  function o(e) {
    return function (e) {
      if (Array.isArray(e)) return a(e);
    }(e) || function (e) {
      if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e);
    }(e) || function (e, t) {
      if (!e) return;
      if ("string" == typeof e) return a(e, t);
      var n = Object.prototype.toString.call(e).slice(8, -1);
      "Object" === n && e.constructor && (n = e.constructor.name);
      if ("Map" === n || "Set" === n) return Array.from(e);
      if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return a(e, t);
    }(e) || function () {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }

  function a(e, t) {
    (null == t || t > e.length) && (t = e.length);

    for (var n = 0, r = new Array(t); n < t; n++) {
      r[n] = e[n];
    }

    return r;
  }

  var i = Object.hasOwnProperty,
      l = Object.setPrototypeOf,
      c = Object.isFrozen,
      u = Object.getPrototypeOf,
      s = Object.getOwnPropertyDescriptor,
      m = Object.freeze,
      f = Object.seal,
      p = Object.create,
      d = "undefined" != typeof Reflect && Reflect,
      h = d.apply,
      g = d.construct;
  h || (h = function h(e, t, n) {
    return e.apply(t, n);
  }), m || (m = function m(e) {
    return e;
  }), f || (f = function f(e) {
    return e;
  }), g || (g = function g(e, t) {
    return r(e, o(t));
  });

  var y,
      b = O(Array.prototype.forEach),
      v = O(Array.prototype.pop),
      T = O(Array.prototype.push),
      N = O(String.prototype.toLowerCase),
      A = O(String.prototype.toString),
      E = O(String.prototype.match),
      w = O(String.prototype.replace),
      S = O(String.prototype.indexOf),
      x = O(String.prototype.trim),
      _ = O(RegExp.prototype.test),
      k = (y = TypeError, function () {
    for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) {
      t[n] = arguments[n];
    }

    return g(y, t);
  });

  function O(e) {
    return function (t) {
      for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) {
        r[o - 1] = arguments[o];
      }

      return h(e, t, r);
    };
  }

  function D(e, t, n) {
    n = n || N, l && l(e, null);

    for (var r = t.length; r--;) {
      var o = t[r];

      if ("string" == typeof o) {
        var a = n(o);
        a !== o && (c(t) || (t[r] = a), o = a);
      }

      e[o] = !0;
    }

    return e;
  }

  function L(e) {
    var t,
        n = p(null);

    for (t in e) {
      h(i, e, [t]) && (n[t] = e[t]);
    }

    return n;
  }

  function R(e, t) {
    for (; null !== e;) {
      var n = s(e, t);

      if (n) {
        if (n.get) return O(n.get);
        if ("function" == typeof n.value) return O(n.value);
      }

      e = u(e);
    }

    return function (e) {
      return console.warn("fallback value for", e), null;
    };
  }

  var M = m(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "shadow", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]),
      C = m(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]),
      I = m(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]),
      F = m(["animate", "color-profile", "cursor", "discard", "fedropshadow", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]),
      U = m(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover"]),
      H = m(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]),
      z = m(["#text"]),
      P = m(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "pattern", "placeholder", "playsinline", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "xmlns", "slot"]),
      j = m(["accent-height", "accumulate", "additive", "alignment-baseline", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]),
      B = m(["accent", "accentunder", "align", "bevelled", "close", "columnsalign", "columnlines", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lspace", "lquote", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]),
      G = m(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
      W = f(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
      q = f(/<%[\w\W]*|[\w\W]*%>/gm),
      Y = f(/\${[\w\W]*}/gm),
      $ = f(/^data-[\-\w.\u00B7-\uFFFF]/),
      K = f(/^aria-[\-\w]+$/),
      V = f(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),
      X = f(/^(?:\w+script|data):/i),
      Z = f(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
      J = f(/^html$/i),
      Q = function Q() {
    return "undefined" == typeof window ? null : window;
  },
      ee = function ee(t, n) {
    if ("object" !== e(t) || "function" != typeof t.createPolicy) return null;
    var r = null,
        o = "data-tt-policy-suffix";
    n.currentScript && n.currentScript.hasAttribute(o) && (r = n.currentScript.getAttribute(o));
    var a = "dompurify" + (r ? "#" + r : "");

    try {
      return t.createPolicy(a, {
        createHTML: function createHTML(e) {
          return e;
        },
        createScriptURL: function createScriptURL(e) {
          return e;
        }
      });
    } catch (e) {
      return console.warn("TrustedTypes policy " + a + " could not be created."), null;
    }
  };

  var te = function t() {
    var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : Q(),
        r = function r(e) {
      return t(e);
    };

    if (r.version = "2.4.1", r.removed = [], !n || !n.document || 9 !== n.document.nodeType) return r.isSupported = !1, r;
    var a = n.document,
        i = n.document,
        l = n.DocumentFragment,
        c = n.HTMLTemplateElement,
        u = n.Node,
        s = n.Element,
        f = n.NodeFilter,
        p = n.NamedNodeMap,
        d = void 0 === p ? n.NamedNodeMap || n.MozNamedAttrMap : p,
        h = n.HTMLFormElement,
        g = n.DOMParser,
        y = n.trustedTypes,
        O = s.prototype,
        te = R(O, "cloneNode"),
        ne = R(O, "nextSibling"),
        re = R(O, "childNodes"),
        oe = R(O, "parentNode");

    if ("function" == typeof c) {
      var ae = i.createElement("template");
      ae.content && ae.content.ownerDocument && (i = ae.content.ownerDocument);
    }

    var ie = ee(y, a),
        le = ie ? ie.createHTML("") : "",
        ce = i,
        ue = ce.implementation,
        se = ce.createNodeIterator,
        me = ce.createDocumentFragment,
        fe = ce.getElementsByTagName,
        pe = a.importNode,
        de = {};

    try {
      de = L(i).documentMode ? i.documentMode : {};
    } catch (e) {}

    var he = {};
    r.isSupported = "function" == typeof oe && ue && void 0 !== ue.createHTMLDocument && 9 !== de;

    var ge,
        ye,
        be = W,
        ve = q,
        Te = Y,
        Ne = $,
        Ae = K,
        Ee = X,
        we = Z,
        Se = V,
        xe = null,
        _e = D({}, [].concat(o(M), o(C), o(I), o(U), o(z))),
        ke = null,
        Oe = D({}, [].concat(o(P), o(j), o(B), o(G))),
        De = Object.seal(Object.create(null, {
      tagNameCheck: {
        writable: !0,
        configurable: !1,
        enumerable: !0,
        value: null
      },
      attributeNameCheck: {
        writable: !0,
        configurable: !1,
        enumerable: !0,
        value: null
      },
      allowCustomizedBuiltInElements: {
        writable: !0,
        configurable: !1,
        enumerable: !0,
        value: !1
      }
    })),
        Le = null,
        Re = null,
        Me = !0,
        Ce = !0,
        Ie = !1,
        Fe = !1,
        Ue = !1,
        He = !1,
        ze = !1,
        Pe = !1,
        je = !1,
        Be = !1,
        Ge = !0,
        We = !1,
        qe = "user-content-",
        Ye = !0,
        $e = !1,
        Ke = {},
        Ve = null,
        Xe = D({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]),
        Ze = null,
        Je = D({}, ["audio", "video", "img", "source", "image", "track"]),
        Qe = null,
        et = D({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]),
        tt = "http://www.w3.org/1998/Math/MathML",
        nt = "http://www.w3.org/2000/svg",
        rt = "http://www.w3.org/1999/xhtml",
        ot = rt,
        at = !1,
        it = null,
        lt = D({}, [tt, nt, rt], A),
        ct = ["application/xhtml+xml", "text/html"],
        ut = "text/html",
        st = null,
        mt = i.createElement("form"),
        ft = function ft(e) {
      return e instanceof RegExp || e instanceof Function;
    },
        pt = function pt(t) {
      st && st === t || (t && "object" === e(t) || (t = {}), t = L(t), ge = ge = -1 === ct.indexOf(t.PARSER_MEDIA_TYPE) ? ut : t.PARSER_MEDIA_TYPE, ye = "application/xhtml+xml" === ge ? A : N, xe = "ALLOWED_TAGS" in t ? D({}, t.ALLOWED_TAGS, ye) : _e, ke = "ALLOWED_ATTR" in t ? D({}, t.ALLOWED_ATTR, ye) : Oe, it = "ALLOWED_NAMESPACES" in t ? D({}, t.ALLOWED_NAMESPACES, A) : lt, Qe = "ADD_URI_SAFE_ATTR" in t ? D(L(et), t.ADD_URI_SAFE_ATTR, ye) : et, Ze = "ADD_DATA_URI_TAGS" in t ? D(L(Je), t.ADD_DATA_URI_TAGS, ye) : Je, Ve = "FORBID_CONTENTS" in t ? D({}, t.FORBID_CONTENTS, ye) : Xe, Le = "FORBID_TAGS" in t ? D({}, t.FORBID_TAGS, ye) : {}, Re = "FORBID_ATTR" in t ? D({}, t.FORBID_ATTR, ye) : {}, Ke = "USE_PROFILES" in t && t.USE_PROFILES, Me = !1 !== t.ALLOW_ARIA_ATTR, Ce = !1 !== t.ALLOW_DATA_ATTR, Ie = t.ALLOW_UNKNOWN_PROTOCOLS || !1, Fe = t.SAFE_FOR_TEMPLATES || !1, Ue = t.WHOLE_DOCUMENT || !1, Pe = t.RETURN_DOM || !1, je = t.RETURN_DOM_FRAGMENT || !1, Be = t.RETURN_TRUSTED_TYPE || !1, ze = t.FORCE_BODY || !1, Ge = !1 !== t.SANITIZE_DOM, We = t.SANITIZE_NAMED_PROPS || !1, Ye = !1 !== t.KEEP_CONTENT, $e = t.IN_PLACE || !1, Se = t.ALLOWED_URI_REGEXP || Se, ot = t.NAMESPACE || rt, t.CUSTOM_ELEMENT_HANDLING && ft(t.CUSTOM_ELEMENT_HANDLING.tagNameCheck) && (De.tagNameCheck = t.CUSTOM_ELEMENT_HANDLING.tagNameCheck), t.CUSTOM_ELEMENT_HANDLING && ft(t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck) && (De.attributeNameCheck = t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck), t.CUSTOM_ELEMENT_HANDLING && "boolean" == typeof t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (De.allowCustomizedBuiltInElements = t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements), Fe && (Ce = !1), je && (Pe = !0), Ke && (xe = D({}, o(z)), ke = [], !0 === Ke.html && (D(xe, M), D(ke, P)), !0 === Ke.svg && (D(xe, C), D(ke, j), D(ke, G)), !0 === Ke.svgFilters && (D(xe, I), D(ke, j), D(ke, G)), !0 === Ke.mathMl && (D(xe, U), D(ke, B), D(ke, G))), t.ADD_TAGS && (xe === _e && (xe = L(xe)), D(xe, t.ADD_TAGS, ye)), t.ADD_ATTR && (ke === Oe && (ke = L(ke)), D(ke, t.ADD_ATTR, ye)), t.ADD_URI_SAFE_ATTR && D(Qe, t.ADD_URI_SAFE_ATTR, ye), t.FORBID_CONTENTS && (Ve === Xe && (Ve = L(Ve)), D(Ve, t.FORBID_CONTENTS, ye)), Ye && (xe["#text"] = !0), Ue && D(xe, ["html", "head", "body"]), xe.table && (D(xe, ["tbody"]), delete Le.tbody), m && m(t), st = t);
    },
        dt = D({}, ["mi", "mo", "mn", "ms", "mtext"]),
        ht = D({}, ["foreignobject", "desc", "title", "annotation-xml"]),
        gt = D({}, ["title", "style", "font", "a", "script"]),
        yt = D({}, C);

    D(yt, I), D(yt, F);
    var bt = D({}, U);
    D(bt, H);

    var vt = function vt(e) {
      var t = oe(e);
      t && t.tagName || (t = {
        namespaceURI: ot,
        tagName: "template"
      });
      var n = N(e.tagName),
          r = N(t.tagName);
      return !!it[e.namespaceURI] && (e.namespaceURI === nt ? t.namespaceURI === rt ? "svg" === n : t.namespaceURI === tt ? "svg" === n && ("annotation-xml" === r || dt[r]) : Boolean(yt[n]) : e.namespaceURI === tt ? t.namespaceURI === rt ? "math" === n : t.namespaceURI === nt ? "math" === n && ht[r] : Boolean(bt[n]) : e.namespaceURI === rt ? !(t.namespaceURI === nt && !ht[r]) && !(t.namespaceURI === tt && !dt[r]) && !bt[n] && (gt[n] || !yt[n]) : !("application/xhtml+xml" !== ge || !it[e.namespaceURI]));
    },
        Tt = function Tt(e) {
      T(r.removed, {
        element: e
      });

      try {
        e.parentNode.removeChild(e);
      } catch (t) {
        try {
          e.outerHTML = le;
        } catch (t) {
          e.remove();
        }
      }
    },
        Nt = function Nt(e, t) {
      try {
        T(r.removed, {
          attribute: t.getAttributeNode(e),
          from: t
        });
      } catch (e) {
        T(r.removed, {
          attribute: null,
          from: t
        });
      }

      if (t.removeAttribute(e), "is" === e && !ke[e]) if (Pe || je) try {
        Tt(t);
      } catch (e) {} else try {
        t.setAttribute(e, "");
      } catch (e) {}
    },
        At = function At(e) {
      var t, n;
      if (ze) e = "<remove></remove>" + e;else {
        var r = E(e, /^[\r\n\t ]+/);
        n = r && r[0];
      }
      "application/xhtml+xml" === ge && ot === rt && (e = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + e + "</body></html>");
      var o = ie ? ie.createHTML(e) : e;
      if (ot === rt) try {
        t = new g().parseFromString(o, ge);
      } catch (e) {}

      if (!t || !t.documentElement) {
        t = ue.createDocument(ot, "template", null);

        try {
          t.documentElement.innerHTML = at ? "" : o;
        } catch (e) {}
      }

      var a = t.body || t.documentElement;
      return e && n && a.insertBefore(i.createTextNode(n), a.childNodes[0] || null), ot === rt ? fe.call(t, Ue ? "html" : "body")[0] : Ue ? t.documentElement : a;
    },
        Et = function Et(e) {
      return se.call(e.ownerDocument || e, e, f.SHOW_ELEMENT | f.SHOW_COMMENT | f.SHOW_TEXT, null, !1);
    },
        wt = function wt(e) {
      return e instanceof h && ("string" != typeof e.nodeName || "string" != typeof e.textContent || "function" != typeof e.removeChild || !(e.attributes instanceof d) || "function" != typeof e.removeAttribute || "function" != typeof e.setAttribute || "string" != typeof e.namespaceURI || "function" != typeof e.insertBefore || "function" != typeof e.hasChildNodes);
    },
        St = function St(t) {
      return "object" === e(u) ? t instanceof u : t && "object" === e(t) && "number" == typeof t.nodeType && "string" == typeof t.nodeName;
    },
        xt = function xt(e, t, n) {
      he[e] && b(he[e], function (e) {
        e.call(r, t, n, st);
      });
    },
        _t = function _t(e) {
      var t;
      if (xt("beforeSanitizeElements", e, null), wt(e)) return Tt(e), !0;
      if (_(/[\u0080-\uFFFF]/, e.nodeName)) return Tt(e), !0;
      var n = ye(e.nodeName);
      if (xt("uponSanitizeElement", e, {
        tagName: n,
        allowedTags: xe
      }), e.hasChildNodes() && !St(e.firstElementChild) && (!St(e.content) || !St(e.content.firstElementChild)) && _(/<[/\w]/g, e.innerHTML) && _(/<[/\w]/g, e.textContent)) return Tt(e), !0;
      if ("select" === n && _(/<template/i, e.innerHTML)) return Tt(e), !0;

      if (!xe[n] || Le[n]) {
        if (!Le[n] && Ot(n)) {
          if (De.tagNameCheck instanceof RegExp && _(De.tagNameCheck, n)) return !1;
          if (De.tagNameCheck instanceof Function && De.tagNameCheck(n)) return !1;
        }

        if (Ye && !Ve[n]) {
          var o = oe(e) || e.parentNode,
              a = re(e) || e.childNodes;
          if (a && o) for (var i = a.length - 1; i >= 0; --i) {
            o.insertBefore(te(a[i], !0), ne(e));
          }
        }

        return Tt(e), !0;
      }

      return e instanceof s && !vt(e) ? (Tt(e), !0) : "noscript" !== n && "noembed" !== n || !_(/<\/no(script|embed)/i, e.innerHTML) ? (Fe && 3 === e.nodeType && (t = e.textContent, t = w(t, be, " "), t = w(t, ve, " "), t = w(t, Te, " "), e.textContent !== t && (T(r.removed, {
        element: e.cloneNode()
      }), e.textContent = t)), xt("afterSanitizeElements", e, null), !1) : (Tt(e), !0);
    },
        kt = function kt(e, t, n) {
      if (Ge && ("id" === t || "name" === t) && (n in i || n in mt)) return !1;
      if (Ce && !Re[t] && _(Ne, t)) ;else if (Me && _(Ae, t)) ;else if (!ke[t] || Re[t]) {
        if (!(Ot(e) && (De.tagNameCheck instanceof RegExp && _(De.tagNameCheck, e) || De.tagNameCheck instanceof Function && De.tagNameCheck(e)) && (De.attributeNameCheck instanceof RegExp && _(De.attributeNameCheck, t) || De.attributeNameCheck instanceof Function && De.attributeNameCheck(t)) || "is" === t && De.allowCustomizedBuiltInElements && (De.tagNameCheck instanceof RegExp && _(De.tagNameCheck, n) || De.tagNameCheck instanceof Function && De.tagNameCheck(n)))) return !1;
      } else if (Qe[t]) ;else if (_(Se, w(n, we, ""))) ;else if ("src" !== t && "xlink:href" !== t && "href" !== t || "script" === e || 0 !== S(n, "data:") || !Ze[e]) {
        if (Ie && !_(Ee, w(n, we, ""))) ;else if (n) return !1;
      } else ;
      return !0;
    },
        Ot = function Ot(e) {
      return e.indexOf("-") > 0;
    },
        Dt = function Dt(t) {
      var n, o, a, i;
      xt("beforeSanitizeAttributes", t, null);
      var l = t.attributes;

      if (l) {
        var c = {
          attrName: "",
          attrValue: "",
          keepAttr: !0,
          allowedAttributes: ke
        };

        for (i = l.length; i--;) {
          var u = n = l[i],
              s = u.name,
              m = u.namespaceURI;
          if (o = "value" === s ? n.value : x(n.value), a = ye(s), c.attrName = a, c.attrValue = o, c.keepAttr = !0, c.forceKeepAttr = void 0, xt("uponSanitizeAttribute", t, c), o = c.attrValue, !c.forceKeepAttr && (Nt(s, t), c.keepAttr)) if (_(/\/>/i, o)) Nt(s, t);else {
            Fe && (o = w(o, be, " "), o = w(o, ve, " "), o = w(o, Te, " "));
            var f = ye(t.nodeName);

            if (kt(f, a, o)) {
              if (!We || "id" !== a && "name" !== a || (Nt(s, t), o = qe + o), ie && "object" === e(y) && "function" == typeof y.getAttributeType) if (m) ;else switch (y.getAttributeType(f, a)) {
                case "TrustedHTML":
                  o = ie.createHTML(o);
                  break;

                case "TrustedScriptURL":
                  o = ie.createScriptURL(o);
              }

              try {
                m ? t.setAttributeNS(m, s, o) : t.setAttribute(s, o), v(r.removed);
              } catch (e) {}
            }
          }
        }

        xt("afterSanitizeAttributes", t, null);
      }
    },
        Lt = function e(t) {
      var n,
          r = Et(t);

      for (xt("beforeSanitizeShadowDOM", t, null); n = r.nextNode();) {
        xt("uponSanitizeShadowNode", n, null), _t(n) || (n.content instanceof l && e(n.content), Dt(n));
      }

      xt("afterSanitizeShadowDOM", t, null);
    };

    return r.sanitize = function (t) {
      var o,
          i,
          c,
          s,
          m,
          f = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};

      if ((at = !t) && (t = "\x3c!--\x3e"), "string" != typeof t && !St(t)) {
        if ("function" != typeof t.toString) throw k("toString is not a function");
        if ("string" != typeof (t = t.toString())) throw k("dirty is not a string, aborting");
      }

      if (!r.isSupported) {
        if ("object" === e(n.toStaticHTML) || "function" == typeof n.toStaticHTML) {
          if ("string" == typeof t) return n.toStaticHTML(t);
          if (St(t)) return n.toStaticHTML(t.outerHTML);
        }

        return t;
      }

      if (He || pt(f), r.removed = [], "string" == typeof t && ($e = !1), $e) {
        if (t.nodeName) {
          var p = ye(t.nodeName);
          if (!xe[p] || Le[p]) throw k("root node is forbidden and cannot be sanitized in-place");
        }
      } else if (t instanceof u) 1 === (i = (o = At("\x3c!----\x3e")).ownerDocument.importNode(t, !0)).nodeType && "BODY" === i.nodeName || "HTML" === i.nodeName ? o = i : o.appendChild(i);else {
        if (!Pe && !Fe && !Ue && -1 === t.indexOf("<")) return ie && Be ? ie.createHTML(t) : t;
        if (!(o = At(t))) return Pe ? null : Be ? le : "";
      }

      o && ze && Tt(o.firstChild);

      for (var d = Et($e ? t : o); c = d.nextNode();) {
        3 === c.nodeType && c === s || _t(c) || (c.content instanceof l && Lt(c.content), Dt(c), s = c);
      }

      if (s = null, $e) return t;

      if (Pe) {
        if (je) for (m = me.call(o.ownerDocument); o.firstChild;) {
          m.appendChild(o.firstChild);
        } else m = o;
        return ke.shadowroot && (m = pe.call(a, m, !0)), m;
      }

      var h = Ue ? o.outerHTML : o.innerHTML;
      return Ue && xe["!doctype"] && o.ownerDocument && o.ownerDocument.doctype && o.ownerDocument.doctype.name && _(J, o.ownerDocument.doctype.name) && (h = "<!DOCTYPE " + o.ownerDocument.doctype.name + ">\n" + h), Fe && (h = w(h, be, " "), h = w(h, ve, " "), h = w(h, Te, " ")), ie && Be ? ie.createHTML(h) : h;
    }, r.setConfig = function (e) {
      pt(e), He = !0;
    }, r.clearConfig = function () {
      st = null, He = !1;
    }, r.isValidAttribute = function (e, t, n) {
      st || pt({});
      var r = ye(e),
          o = ye(t);
      return kt(r, o, n);
    }, r.addHook = function (e, t) {
      "function" == typeof t && (he[e] = he[e] || [], T(he[e], t));
    }, r.removeHook = function (e) {
      if (he[e]) return v(he[e]);
    }, r.removeHooks = function (e) {
      he[e] && (he[e] = []);
    }, r.removeAllHooks = function () {
      he = {};
    }, r;
  }();

  return te;
});
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  'use strict'; // SEND BEACON POLYFILL

  (function (root) {
    var isSupported = 'navigator' in root && 'sendBeacon' in root.navigator;

    var sendBeacon = function sendBeacon(url, data) {
      var xhr = 'XMLHttpRequest' in window ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
      xhr.open('POST', url, false);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Accept', '*/*');

      if ('string' === typeof data) {
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        xhr.responseType = 'text/plain';
      } else if ('[object Blob]' === {}.toString.call(data)) {
        if (data.type) {
          xhr.setRequestHeader('Content-Type', data.type);
        }
      }

      try {
        xhr.send(data);
      } catch (error) {
        console.log('error sending helper beacon...');
      }

      return true;
    };

    if (isSupported) {
      sendBeacon = navigator.sendBeacon.bind(navigator);
    }

    if ('undefined' !== typeof exports) {
      if ('undefined' !== typeof module && module.exports) {
        exports = module.exports = sendBeacon;
      }

      exports.sendBeacon = sendBeacon;
    } else if ('function' === typeof define && define.amd) {
      define([], function () {
        return sendBeacon;
      });
    } else if (!isSupported) {
      root.navigator.sendBeacon = sendBeacon;
    }
  })('object' === (typeof window === "undefined" ? "undefined" : _typeof(window)) ? window : this); // CUSTOM EVENT POLYFILL: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill


  (function () {
    if ('function' === typeof window.CustomEvent) {
      return false;
    }

    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  })(); // OBJECT.ASSIGN POLYFILL


  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function value(target) {
        if (target === undefined || null === target) {
          throw new TypeError('Cannot convert first argument to object');
        }

        var to = Object(target);

        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];

          if (nextSource === undefined || null === nextSource) {
            continue;
          }

          nextSource = Object(nextSource);
          var keysArray = Object.keys(nextSource);

          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }

        return to;
      }
    });
  } // Array.reduce Polyfill
  // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
  // Production steps of ECMA-262, Edition 5, 15.4.4.21
  // Reference: http://es5.github.io/#x15.4.4.21
  // https://tc39.github.io/ecma262/#sec-array.prototype.reduce

  /* eslint-disable */


  if (!Array.prototype.reduce) {
    Object.defineProperty(Array.prototype, 'reduce', {
      value: function value(callback
      /*, initialValue*/
      ) {
        if (null === this) {
          throw new TypeError('Array.prototype.reduce ' + 'called on null or undefined');
        }

        if ('function' !== typeof callback) {
          throw new TypeError(callback + ' is not a function');
        } // 1. Let O be ? ToObject(this value).


        var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

        var len = o.length >>> 0; // Steps 3, 4, 5, 6, 7

        var k = 0;
        var value;

        if (2 <= arguments.length) {
          value = arguments[1];
        } else {
          while (k < len && !(k in o)) {
            k++;
          } // 3. If len is 0 and initialValue is not present,
          //    throw a TypeError exception.


          if (k >= len) {
            throw new TypeError('Reduce of empty array ' + 'with no initial value');
          }

          value = o[k++];
        } // 8. Repeat, while k < len


        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kPresent be ? HasProperty(O, Pk).
          // c. If kPresent is true, then
          //    i.  Let kValue be ? Get(O, Pk).
          //    ii. Let accumulator be ? Call(
          //          callbackfn, undefined,
          //          « accumulator, kValue, k, O »).
          if (k in o) {
            value = callback(value, o[k], k, o);
          } // d. Increase k by 1.


          k++;
        } // 9. Return accumulator.


        return value;
      }
    });
  } // Array.find Polyfill
  // https://tc39.github.io/ecma262/#sec-array.prototype.find


  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value: function value(predicate) {
        // 1. Let O be ? ToObject(this value).
        if (null == this) {
          throw TypeError('"this" is null or not defined');
        }

        var o = Object(this); // 2. Let len be ? ToLength(? Get(O, "length")).

        var len = o.length >>> 0; // 3. If IsCallable(predicate) is false, throw a TypeError exception.

        if ('function' !== typeof predicate) {
          throw TypeError('predicate must be a function');
        } // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.


        var thisArg = arguments[1]; // 5. Let k be 0.

        var k = 0; // 6. Repeat, while k < len

        while (k < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
          // d. If testResult is true, return kValue.
          var kValue = o[k];

          if (predicate.call(thisArg, kValue, k, o)) {
            return kValue;
          } // e. Increase k by 1.


          k++;
        } // 7. Return undefined.


        return undefined;
      },
      configurable: true,
      writable: true
    });
  }
  /* eslint-enable */

  /* CDC COMMON COMPONENT */

  /* DEPENDENCIES: NONE */


  window.CDC = window.CDC || {};
  /**
   * Common methods and utilities
   * @namespace CDC.Common
   */

  CDC.Common = CDC.Common || function () {
    // SET RUNTIME DEFAULT
    var objCommon = {};
    objCommon.runtime = objCommon.runtime || {}; // Note the comment in the assignment below is replaced in the build...

    objCommon.runtime.loggingEnabled = objCommon.runtime.loggingEnabled || '/* @tp-logging-defaults@ */';
    /**
     * Sanitize HTML string
     * from: https://github.com/cure53/DOMPurify/
     * @name CDC.Common.cleanHTML
     * @param {string} content HTML string to sanitize
     * @returns {string} Sanitized HTML
     */

    objCommon.cleanHTML = function (content) {
      // Make certain DOMPurify script is loaded
      if ('function' !== typeof window.DOMPurify) {
        return content;
      }

      return DOMPurify.sanitize(content);
    };
    /**
     * Clean a string for use as an attribute
     * @name CDC.Common.cleanAttr
     * @param {string} attribute Element attribute value to clean
     * @returns {string} Cleaned attibute value
     */


    objCommon.cleanAttr = function (attribute) {
      return String(attribute).trim().replace(/&/g, '&amp;')
      /* This MUST be the 1st replacement. */
      .replace(/'/g, '&apos;')
      /* The 4 other predefined entities, required. */
      .replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r\n/g, '')
      /* Must be before the next replacement. */
      .replace(/[\r\n]/g, '');
    };
    /**
     * Sanitize URL - only tests for XSS issues
     * from: https://github.com/braintree/sanitize-url
     * @name CDC.Common.cleanURL
     * @param {string} targetURL URL to sanitize
     * @param {any} blankValue [optional] Value to return on blank, default 'about:blank'
     * @returns {string|any} Returns sanitized URL, or if unsafe, 'about:blank' or blankValue param
     */


    objCommon.cleanUrl = function (targetURL, blankValue) {
      blankValue = undefined === blankValue ? 'about:blank' : blankValue;
      var urlScheme, urlSchemeParseResults, sanitizedUrl, decodedUrl;

      if (!targetURL) {
        return blankValue;
      }

      sanitizedUrl = String(targetURL).replace(/[^\x20-\x7E]/gim, '').replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\){}']+/g, '').trim();

      try {
        decodedUrl = decodeURI(sanitizedUrl);
      } catch (error) {
        // malformed URI
        return blankValue;
      }

      if (/<script/im.test(decodedUrl)) {
        return blankValue;
      }

      urlSchemeParseResults = sanitizedUrl.match(/^([^:]+):/gm);

      if (!urlSchemeParseResults) {
        return sanitizedUrl;
      }

      urlScheme = urlSchemeParseResults[0];

      if (/^(%20|\s)*(javascript|data)/im.test(urlScheme)) {
        return blankValue;
      }

      return sanitizedUrl;
    };
    /**
     * Safe parse a JSON string with optional whitelist array of expected properties
     *
     * @name CDC.Common.parseJSON
     * @param {string} string Input JSON string value
     * @param {array} props [optional] Array of properties to allow from converted JSON object
     * @returns {object|null} If JSON is parsed, converted JSON object, otherwise nul
     */


    objCommon.parseJSON = function (string, props) {
      var parsedObj;
      var safeObj = {};

      try {
        parsedObj = $.parseJSON(String(string));

        if ('object' !== _typeof(parsedObj) || !Array.isArray(props)) {
          safeObj = parsedObj;
        } else {
          // copy only expected properties to the safeObj
          props.forEach(function (prop) {
            if (parsedObj.hasOwnProperty(prop)) {
              safeObj[prop] = parsedObj[prop];
            }
          });
        }

        return safeObj;
      } catch (e) {
        console.info("can't parse JSON string: ", string);
        return null;
      }
    };
    /**
     * Safe method for opening urls, either in current tab or new tab. If URL isn't safe, no action is taken.
     *
     * @name CDC.Common.open
     * @param {string} targetURL URL to open
     * @param {string} targetWindow [optional] Target tab to open up in.
     * @example
     * CDC.Common.open( 'test.html', '_blank' );
     */


    objCommon.open = function (targetURL, targetWindow) {
      targetURL = objCommon.cleanUrl(targetURL, false);

      if (!targetURL) {
        console.error('URL is blank. ', targetURL);
        return;
      }

      if (targetWindow) {
        var target = _typeof(targetWindow) ? targetWindow : null;
        window.open(targetURL, target);
      } else {
        location.href = targetURL;
      }
    };
    /**
     * Loads a JS script, and runs an optional callback once loaded
     * @name CDC.Common.loadScript
     * @param {string|array} scripts  Script or Scripts to load (in order)
     * @param {function}     callback [optional] Function to callback after JS is loaded
     */


    objCommon.loadScript = function (scripts, callback) {
      if (!Array.isArray(scripts)) {
        scripts = [scripts];
      }

      if (!scripts.length) {
        callback();
        return;
      }

      var script = scripts.shift();
      var eleScript = document.createElement('script'),
          // NEW SCRIPT TAG
      eleHead = document.getElementsByTagName('head')[0]; // FIRST SCRIPT TAG IN CALLING PAGE
      // LOAD IF SCRIPT VALID ARGUMENT PASSED

      script = objCommon.cleanUrl(script, false);

      if (script && 0 < script.length) {
        // SET SCRIPT TAG ATTRIBUTES
        eleScript.src = script; // set the src of the script to your script

        var fctLocalCallback = function fctLocalCallback() {
          // LOGGING
          objCommon.log('Loading script: ' + script); // if more scripts to load, continue loading

          if (scripts.length) {
            CDC.Common.loadScript(scripts, callback);
            return;
          } // CALLBACK PASSED?


          if (callback !== undefined) {
            // LOG & EXECUTE CALLBACK
            objCommon.log('Executing Callback: ' + script);
            return callback();
          } else {
            // LOG NO CALLBACK
            objCommon.log('No Callback Provided for: ' + script);
          }
        }; // BIND THE EVENT TO THE CALLBACK FUNCTION


        if (eleScript.addEventListener) {
          eleScript.addEventListener('load', fctLocalCallback, false); // IE9+, Chrome, Firefox
        } else if (eleScript.readyState) {
          eleScript.onreadystatechange = fctLocalCallback; // IE8
        } // APPEND SCRIPT TO PAGE


        eleHead.appendChild(eleScript);
      }
    };
    /**
     * Alias of CDC.Common.loadScript
     * @name CDC.Common.loadJS
     * @alias CDC.Common.loadScript
     */


    objCommon.loadJS = objCommon.loadScript;

    objCommon.isArray = function (someVar) {
      return '[object Array]' === Object.prototype.toString.call(someVar);
    };

    objCommon["typeof"] = function (data) {
      if (objCommon.isArray(data)) {
        return 'array';
      }

      return _typeof(data);
    };
    /**
     * Dynamically load a CSS file from the current domain.
     *
     * @name CDC.Common.loadCss
     * @param {string|array} stylesheetPaths Path or Paths to CSS file(s)
     * @param {string}       media           Media to apply styles to, default 'print,screen'
     */


    objCommon.loadCss = function (stylesheetPaths, media) {
      if (!Array.isArray(stylesheetPaths)) {
        stylesheetPaths = [stylesheetPaths];
      }

      stylesheetPaths.forEach(function (stylesheetPath) {
        var link = document.createElement('link'),
            hostname = objCommon.getSafeHostName(),
            path = objCommon.parseUrl(stylesheetPath).pathname;
        link.href = '//' + hostname + path;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = objCommon.cleanAttr(media || 'print,screen');
        document.getElementsByTagName('head')[0].appendChild(link);
      });
    };
    /**
     * Alias of CDC.Common.loadCss
     * @name CDC.Common.loadCSS
     * @alias CDC.Common.loadCss
     */


    objCommon.loadCSS = objCommon.loadCss;
    /**
     * Strips new lines from a string
     *
     * @name CDC.Common.cleanString
     * @param {string} anyString
     * @returns {string} String stripped of unwanted characters
     */

    objCommon.cleanString = function (anyString) {
      // DEFAULT STRING
      anyString = String(anyString || ''); // CLEAN IT UP & RETURN IT

      return anyString.replace('\t', '').replace('\r', '').replace('\n', '');
    };
    /**
     * Generates a randomized 4 character hexadecimal string
     * @name CDC.Common.s4
     * @returns {string}
     */


    objCommon.s4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }; // GUID GENERATOR

    /**
     * Generates a randomized 36 character string with hexadecimal characters and dashes
     * @name CDC.Common.guid
     * @returns {string}
     */


    objCommon.guid = function () {
      return objCommon.s4() + objCommon.s4() + '-' + objCommon.s4() + '-' + objCommon.s4() + '-' + objCommon.s4() + '-' + objCommon.s4() + objCommon.s4() + objCommon.s4();
    }; // REPLACE ALL HANDLER


    objCommon.replaceAll = function (find, replace, str) {
      if ('|' === find) {
        find = new RegExp('\\|', 'g');
      } else {
        find = new RegExp(find, 'g');
      }

      return str.replace(find, replace);
    };
    /**
     * Sanitized method for getting the current page's hostname
     * @name CDC.Common.getSafeHostName
     * @returns {string} Current page's hostname
     */


    objCommon.getSafeHostName = function () {
      var safeHost = objCommon.parseUrl().host;
      var inputHost = objCommon.getCallParam('cHost') || objCommon.getCallParam('host') || false;

      if (inputHost) {
        inputHost = objCommon.parseUrl('//' + inputHost).hostname;

        if (inputHost.match(/\.cdc\.gov$/i)) {
          safeHost = inputHost;
        }
      }

      return safeHost;
    };
    /**
     * Break a given url into its child parts
     * _(via: https://www.abeautifulsite.net/parsing-urls-in-javascript)_
     * @name CDC.Common.parseUrl
     * @param {string} targetURL [optional] URL to parce, default is the current location href
     * @returns {{searchObject, protocol: string, hostname: string, search: string, port: string, host: string, hash: string, pathname: string}}
     */


    objCommon.parseUrl = function (targetURL) {
      var parser = document.createElement('a'),
          searchObject = {},
          queries,
          split,
          i; // Let the browser do the work

      parser.href = objCommon.cleanUrl(targetURL || location.href, ''); // Convert query string to object

      queries = parser.search.replace(/^\?/, '').split('&');

      for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = 2 <= split.length ? split[1] : '';
      } // IE fix for pathname - misses leading slash


      var pathname = String(parser.pathname);

      if ('/' !== pathname.charAt(0)) {
        pathname = '/' + pathname;
      }

      return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: pathname,
        search: parser.search,
        searchObject: searchObject,
        params: searchObject,
        hash: parser.hash
      };
    };
    /**
     * Checks if url is a cdc.gov domain
     * @name CDC.Common.cdcUrl
     * @param targetURL
     * @returns {boolean}
     */


    objCommon.cdcUrl = function (targetURL) {
      var parts = objCommon.parseUrl(targetURL);
      var host = parts.hostname.toLowerCase();
      return 'cdc.gov' === host || 'localhost' === host || '127.0.0.1' === host || RegExp('.cdc.gov$').test(host) || RegExp('.wcms$').test(host);
    }; // DATA ATTRIBUTE TO CAMEL CASE CONVERTER


    objCommon.attrToCamelCase = function (strAttribute) {
      var aryDestination = [],
          arySource,
          strCurr,
          i;
      arySource = strAttribute.toLowerCase().replace('data-', '').split('-');

      for (i = 0; i < arySource.length; i++) {
        strCurr = arySource[i];

        if (0 < i) {
          strCurr = strCurr.charAt(0).toUpperCase() + strCurr.substring(1);
        }

        aryDestination.push(strCurr);
      }

      return aryDestination.join('');
    }; // LOCAL STORAGE API HELPER

    /**
     * Local storage helper object
     * @name CDC.Common.getLocalStorageApi
     * @param {string} storeName Name of value in localStorage to work with
     * @returns {Object}
     */


    objCommon.getLocalStorageApi = function (storeName) {
      var localStorageName = storeName;
      var api = {
        val: function val() {
          try {
            if ('undefined' !== typeof window.localStorage) {
              var localStore = window.localStorage[localStorageName];

              if (localStore) {
                return JSON.parse(localStore);
              }
            }
          } catch (e) {// localStorage is in the browser, but not available for this site.
          }

          return undefined;
        },
        save: function save(anyValue) {
          api.valueType = _typeof(anyValue);

          if ('object' === api.valueType) {
            if ('[object Array]' === Object.prototype.toString.call(anyValue)) {
              api.valueType = 'array';
            }
          }

          try {
            if ('undefined' !== typeof window.localStorage) {
              window.localStorage[localStorageName] = JSON.stringify(anyValue);
            }
          } catch (e) {// localStorage is in the browser, but not available for this site.
          }
        },
        clear: function clear() {
          try {
            if ('undefined' !== typeof window.localStorage) {
              window.localStorage.removeItem(localStorageName);
            }
          } catch (e) {// localStorage is in the browser, but not available for this site.
          }
        }
      };
      return api;
    };
    /**
     * Creates a shallow copy of a given native object
     * @name CDC.Common.cloneShallow
     * @param {any} obj Native object to clone
     * @returns {any} Copy of the given object
     */


    objCommon.cloneShallow = function (obj) {
      var anyReturn = null;

      switch (objCommon["typeof"](obj)) {
        case 'array':
          anyReturn = obj.slice(0);
          break;

        case 'object':
          anyReturn = Object.assign({}, obj);
          break;

        default:
          anyReturn = obj;
          break;
      }

      return anyReturn;
    };
    /**
     * Creates a deep copy of a given native object
     * @name CDC.Common.cloneDeep
     * @param {any} obj Native object to clone
     * @returns {any} Copy of the given object
     */


    objCommon.cloneDeep = function (anyVar, safeCopy) {
      if ('undefined' === typeof safeCopy) {
        safeCopy = true;
      }

      var anyReturn = null;

      switch (objCommon["typeof"](anyVar)) {
        case 'object':
          anyReturn = {};
          var key;

          for (key in anyVar) {
            if (anyVar.hasOwnProperty(key) || !safeCopy) {
              anyReturn[key] = objCommon.cloneDeep(anyVar[key]);
            }
          }

          break;

        case 'array':
          anyReturn = anyVar.slice(0);
          break;

        default:
          anyReturn = anyVar;
          break;
      }

      return anyReturn;
    };
    /**
     * Merge two objects to their first level of properties
     * @name CDC.Common.mergeShallow
     * @param {object} obj1 Object to merge
     * @param {object} obj2 Second object to merge
     * @returns {object} A merged object
     */


    objCommon.mergeShallow = function (obj1, obj2) {
      return Object.assign(objCommon.cloneShallow(obj1), objCommon.cloneShallow(obj2));
    }; // DATE DIFF METHODS


    objCommon.dateDiff = {
      /**
       * Get difference between two date objects in days
       * @name CDC.Common.dateDiff.inDays
       * @param {Date} d1 Date 1
       * @param {Date} d2 Date 2
       * @returns {number} Difference in days
       */
      inDays: function inDays(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
        return parseInt((t2 - t1) / (24 * 3600 * 1000));
      },

      /**
       * Get difference between two date objects in weeks
       * @name CDC.Common.dateDiff.inWeeks
       * @param {Date} d1 Date 1
       * @param {Date} d2 Date 2
       * @returns {number} Difference in weeks
       */
      inWeeks: function inWeeks(d1, d2) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
        return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
      },

      /**
       * Get difference between two date objects in months
       * @name CDC.Common.dateDiff.inMonths
       * @param {Date} d1 Date 1
       * @param {Date} d2 Date 2
       * @returns {number} Difference in months
       */
      inMonths: function inMonths(d1, d2) {
        var d1Y = d1.getFullYear();
        var d2Y = d2.getFullYear();
        var d1M = d1.getMonth();
        var d2M = d2.getMonth();
        return (d2M + 12) * d2Y - (d1M + 12) * d1Y;
      },
      inYears: function inYears(d1, d2) {
        return d2.getFullYear() - d1.getFullYear();
      }
    };
    /**
     * Given a url with query string as an object
     * @name CDC.Common.parseQueryString
     * @param {string} strUrl URl with querystring
     * @return {object} Parsed query string
     */

    objCommon.parseQueryString = function (strUrl) {
      var objReturn = {};
      strUrl = 0 === strUrl.indexOf('?') ? strUrl.substring(1) : strUrl;

      if (strUrl.length) {
        var aryCallParams = strUrl.split('&');
        var len = aryCallParams.length;

        while (len--) {
          var aryNvp = aryCallParams[len].split('=');
          objReturn[aryNvp[0]] = aryNvp[1];
        }
      }

      return objReturn;
    };
    /**
     * Render a number with thousandths commas
     * @name CDC.Common.numberWithCommas
     * @param {string|number} number Number to return as a comma'd string
     * @returns string Number with commas
     */


    objCommon.numberWithCommas = function (number) {
      return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }; // SAFE CALL PARAMETER RETREIVAL METHOD


    objCommon.getCallParam = function () {
      // SET RUNTIME CALLPARAMS TO THAT OF CALLING PAGS LOCATION URL (THIS IS WHERE MOST REQUESTS WILL COME FROM)
      if (!objCommon.runtime.callParams) {
        objCommon.runtime.callParams = objCommon.parseQueryString(window.location.search);
      }

      return function (paramName, blnDecode, strUrl) {
        blnDecode = 'undefined' === typeof blnDecode ? true : blnDecode;
        var objParams = strUrl ? objCommon.parseQueryString(strUrl) : objCommon.runtime.callParams;
        var anyVar = objParams[paramName] || null;
        return blnDecode && null !== anyVar ? decodeURIComponent(anyVar) : anyVar;
      };
    }(); // Standard Query getParam
    // getCallParam doesn't uridecode results

    /**
     * Fetch a query string parameter from the current page by name
     * @name CDC.Common.getParam
     * @param {string} name Name of query param to fetch
     * @returns {string|null} Value of query param if found, or null
     */


    objCommon.getParam = function (name) {
      var url = window.location.href;
      name = name.replace(/[\[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);

      if (!results) {
        return null;
      }

      if (!results[2]) {
        return '';
      }

      return decodeURIComponent(results[2].replace(/\+/g, ' ')).replace(/[<>]/g, '');
    };
    /**
     * Fetch a query parameter as a boolean switch
     * ?<param>    true
     * ?<param>=0  false
     * ?<param>=y  true
     * ?<param>=n  false
     * @name CDC.Common.getParam
     * @param {string} name          Name of query param to fetch
     * @param {boolean} defaultValue Default value to return when no param found
     * @returns {boolean} Switch value
     */


    objCommon.getParamSwitch = function (name, defaultValue) {
      var param = objCommon.getParam(name);
      var value = false;

      if ('string' !== typeof param) {
        return Boolean(defaultValue);
      }

      if ('' === param) {
        return true;
      }

      param = String(param).trim().toLowerCase();

      if (param.match(/^\d+$/)) {
        value = Boolean(parseInt(param, 10));
      } else if (param.match(/^(n|no|f|false|off)$/)) {
        value = false;
      } else {
        value = true;
      }

      return value;
    }; // INTERNAL DEBUG LOGGING REQUEST TRACKER
    // PASSING THE URL PARAMETER "consoleHelp=type" where type = metrics, all, etc.
    // PROVIDES A MECHANISM TO SHOW CONSOLE WARNINGS AT RUNTIME BASED ON A REQUEST VIA A URL PARAMETER
    // PLEASE BE FRUGAL IN USING


    objCommon.debugLogging = function () {
      var activeLogTypes = {};
      var aryConsoleSettings = (objCommon.getCallParam('tpConsoleHelp') || '').split(',');
      var i = aryConsoleSettings.length;

      while (i--) {
        activeLogTypes[aryConsoleSettings[i]] = true;
      }

      return function (logType) {
        return activeLogTypes.hasOwnProperty('all') || activeLogTypes.hasOwnProperty(logType);
      };
    }(); // LOGGING HANDLER


    objCommon.log = function () {
      // PARAM CONSOLE IF NEEDED
      var console = window.console || {
        log: function log() {},
        warn: function warn() {},
        error: function error() {},
        time: function time() {},
        timeEnd: function timeEnd() {},
        group: function group() {},
        groupCollapsed: function groupCollapsed() {},
        groupEnd: function groupEnd() {}
      };
      return function (anyArg) {
        if (objCommon.runtime.loggingEnabled) {
          // BASIC DEGRADING LOGGING HANDLER
          if (console && console.log) {
            if ('string' === typeof anyArg) {
              var wid = objCommon.getCallParam('wid');

              if (wid) {
                console.log(objCommon.getCallParam('wid') + ': ' + anyArg);
                return true;
              }
            }

            console.log(anyArg);
            return true;
          }
        }

        return false;
      };
    }(); // DEBOUNCE FUNCTION


    objCommon.debounce = function (func, wait, immediate) {
      var timeout;
      return function () {
        var context = this,
            args = arguments;

        var later = function later() {
          timeout = null;

          if (!immediate) {
            func.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) {
          func.apply(context, args);
        }
      };
    };
    /**
     * String HTML tags from a string
     * @name CDC.Common.stripTags
     * @param {string} input String to clean
     * @param {array} allowed Array of allowed tags
     * @returns {string} String stripped of tags
     */


    objCommon.stripTags = function (input, allowed) {
      allowed = (String(allowed || '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)

      var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
          commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi,
          brokenTags = /(<\w+(?:\s+\w+=\"[^"]+\")*)(?=[^>]+(?:<|$))/g;
      return String(input).replace(commentsAndPhpTags, '').replace(brokenTags, '').replace(tags, function ($0, $1) {
        return -1 < allowed.indexOf('<' + $1.toLowerCase() + '>') ? $0 : '';
      });
    };
    /**
     * Return string in TitleCase
     * @name CDC.Common.titleCase
     * @param {string} string String to convert
     * @returns {string} TitleCase string
     */


    objCommon.titleCase = function (string) {
      return String(string).toLowerCase().split(' ').map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    };
    /**
     * Return string capitalized
     * @name CDC.Common.capitalize
     * @param {string} string String to convert
     * @returns {string} capitalized string
     */


    objCommon.capitalize = function (string) {
      return String(string).charAt(0).toUpperCase() + String(string).slice(1);
    };
    /**
     * Diff 2 arrays
     * @name Returns an array with elements from array b removed from array a
     * @param {array} a Source array
     * @param {array} b Target array to remove from source array
     * @returns {array} Array a with items in array b removed
     */


    objCommon.arrayDiff = function (a, b) {
      if (!Array.isArray(a)) {
        return [];
      }

      if (!Array.isArray(b)) {
        b = [b];
      }

      var c = a.slice();
      $.each(b, function (i, term) {
        var index = c.indexOf(term);

        if (-1 < index) {
          c.splice(index, 1);
        }
      });
      return c;
    };
    /**
     * Returns an array with all duplicate items removed
     * @name CDC.Common.unique
     * @param {array} array Input array
     * @returns {array} Array with duplicates removed
     */


    objCommon.unique = function (array) {
      if (!Array.isArray(array)) {
        return [];
      }

      array = array.filter(function (el) {
        return Boolean(el);
      });
      return array.filter(function (el, index, arr) {
        return index === arr.indexOf(el);
      });
    };
    /**
     * Alias of CDC.Common.unique
     * @name CDC.Common.arrayUnique
     * @alias CDC.Common.unique
     */


    objCommon.arrayUnique = objCommon.unique;
    /**
     * Left pad a string with leading chars
     *
     * @param string  Input string
     * @param size    Final length of string, default = 2
     * @param padding Default is '0'
     * @returns {string}
     */

    objCommon.lpad = function (string, size, padding) {
      string = String(string);
      padding = padding ? String(padding).charAt(0) : '0';
      size = size || 2;

      while (string.length < size) {
        string = padding + string;
      }

      return string;
    };
    /**
     * Return boolean based on whether or not the hostname is in the development environments
     * @name CDC.Common.isProd
     * @returns {Boolean}
     */


    objCommon.isProd = function () {
      return !CDC.parseUrl().hostname.match(/local|vvv|dev|test|stage|prototype/);
    };
    /**
     * Compares two software version string
     *
     * @name CDC.Common.compareVersion
     * @param {string} v1 Version 1
     * @param {string} v2 Version 2
     * @returns {false|integer} False if no comparison can be made, -1|0|1 if comparison made
     */


    objCommon.compareVersion = function (v1, v2) {
      if ('string' !== typeof v1) return false;
      if ('string' !== typeof v2) return false;
      v1 = v1.split('.');
      v2 = v2.split('.');
      var k = Math.min(v1.length, v2.length);

      for (var i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
      }

      if (v1.length === v2.length) {
        return 0;
      }

      return v1.length < v2.length ? -1 : 1;
    }; // jQuery "safe" overrides for sanitizing HTML
    // clean any HTML before injecting into the page


    if (window.$ && window.$.fn) {
      $.fn.safehtml = function () {
        var args = arguments;

        if (args.length && 'string' === typeof args[0]) {
          // here we're cleaning the set HTML from XSS vulnerabilities
          args[0] = objCommon.cleanHTML(args[0]);
        }

        return $.fn.html.apply(this, args);
      }; // same, cleaning HTML


      $.fn.safeappend = function () {
        var args = arguments;

        if (args.length && 'string' === typeof args[0]) {
          // here we're cleaning the set HTML from XSS vulnerabilities
          args[0] = objCommon.cleanHTML(args[0]);
        }

        return $.fn.append.apply(this, args);
      };
    } // RETURN SELF


    return objCommon;
  }(); // Store path to TP root, fetched from first /TemplatePackage script


  CDC.tpPath = function () {
    var scripts = document.getElementsByTagName('script');

    for (var i = 0; i < scripts.length; i++) {
      var src = String(scripts[i].getAttribute('src'));

      if (-1 < src.indexOf('/TemplatePackage')) {
        return String(src).replace(/\/TemplatePackage\/.*/, '');
      }
    }

    return '';
  }(); // Grab /config/web.config.js values from WCMS


  CDC.config = Object.assign({}, window.CDC_WEB_CONFIG); // Add aliases

  CDC.isProd = CDC.Common.isProd;
  CDC.getParam = CDC.Common.getParam;
  CDC.open = CDC.Common.open;
  CDC.parseUrl = CDC.Common.parseUrl;
  CDC.cleanUrl = CDC.Common.cleanUrl;
  CDC.cleanHTML = CDC.Common.cleanHTML;
  CDC.cleanAttr = CDC.Common.cleanAttr; // finally load DOMPurify script if it's not available

  if ('function' !== typeof window.DOMPurify) {
    CDC.Common.loadScript('https://www.cdc.gov/TemplatePackage/contrib/libs/dompurify/latest/purify.min.js');
  }
})();
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (window, document, undefined) {
  'use strict';
  /* CDC METRICS COMPONENT */

  /* DEPENDENCIES:
         CDC COMMON COMPONENT
     */

  /* eslint-disable no-nested-ternary */

  window.CDC = window.CDC || {};
  window.CDC.Common = window.CDC.Common || {};

  window.CDC.Common.getMetricsHandler = function () {
    // LOCAL VARS
    var objCommon, metricsManager, productTypeVarMappings, commonMetricsVersion, environmentTarget; // LOCAL VERSION ID - CONTROLLED BY BUILD

    environmentTarget = 'local';
    commonMetricsVersion = '4.22.11'; // GRAB SHORTCUT FOR EXISTING CDC.WIDGET.COMMON

    objCommon = window.CDC.Common; // CREATE & RETURN METRICS MANAGER

    metricsManager = function () {
      // RETURN OBJECT
      var objMetrics = {
        enableLogging: false,
        linkDownloadFileTypes: ''
      }; // If we have access to this

      if (window.hasOwnProperty('s')) {
        objMetrics.linkDownloadFileTypes = window.s.linkDownloadFileTypes;
      } //setup Akamai beacon to track print / previews


      if (window.hasOwnProperty('s')) {
        var account = s.account;
        var imageBeaconUrl = 'https://www.cdc.gov/wcms/s.gif?action=print&rs=' + account + '&url=' + encodeURIComponent(window.location.href.split('#')[0].split('?')[0]) + '&pageName=' + encodeURIComponent(document.title) + '&_=' + new Date().getTime().toString();
        var rule = 'footer:first-of-type::after{content:url("' + imageBeaconUrl + '")}';
        var head = document.head || document.getElementsByTagName('head')[0];
        var css = document.createElement('style');

        if (css && head) {
          css.setAttribute('type', 'text/css');
          css.setAttribute('media', 'print');

          if (css.styleSheet) {
            // For IE
            css.styleSheet.cssText = rule;
          } else {
            css.appendChild(document.createTextNode(rule));
          }

          head.appendChild(css);
        }
      } // LOGGING PROXY (CAN BE TURNED ON/OFF FOR METRICS)


      objMetrics.log = function (params) {
        if (objMetrics.enableLogging) {
          window.CDC.Common.log(params);
        }
      }; // BEACON INITIALIZER


      objMetrics.initBeacon = function (strBeaconUrl) {
        if (strBeaconUrl) {
          if (navigator.sendBeacon) {
            // GENERATE BEACON CALL
            return navigator.sendBeacon(strBeaconUrl);
          } else {
            // GENERATE IMG ELEMENT
            var img = new Image();
            img.src = strBeaconUrl;
            return true;
          }
        }

        return false;
      }; // GLOBAL METRICS TRACKER


      objMetrics.trackPage = objMetrics.trackData = function (objParamOverrides) {
        objParamOverrides = objParamOverrides || {}; // VERIFY TRACKING IS ENABLED

        if (objMetrics.trackingEnabled(objParamOverrides)) {
          // APPROVE BEACON SEND BY DEFAULT
          var blnApproveSend = true; // TRANSLATE PARAMETERS

          var objTranslatedParameters = objMetrics.translateToBeacon(objParamOverrides, objMetrics.settings.objParamOmit); // PREVENT DUPLICATE BEACONS IF CONFIGURED AS SUCH

          if (objMetrics.settings.trackOnUnique) {
            // CHECK FOR VALID TRANSLATION KEY (DOES trackOnUnique KEY EXIST IN TRANSLATION MAP)
            var strTranslatedUniqueKey = objMetrics.settings.translations.hasOwnProperty(objMetrics.settings.trackOnUnique) ? objMetrics.settings.translations[objMetrics.settings.trackOnUnique].to : null; // IF TRANSLATED KEY FOUND...

            if (strTranslatedUniqueKey) {
              // GET / DEFAULT UNIQUE VALUE IN RUNTIME
              objMetrics.runtime.metricsUniqueValue = objMetrics.runtime.metricsUniqueValue || null; // GET UNIQUE CHECK VALUE FROM PARAMETERS

              var uniqueCheckValue = objTranslatedParameters.hasOwnProperty(strTranslatedUniqueKey) ? objTranslatedParameters[strTranslatedUniqueKey] : null; // IF UNIQUE CHECK VALUE HAS BEEN SENT...

              if (null !== uniqueCheckValue) {
                // VERIFY IT IS UNIQUE FROM PREVIOUS SEND (IF NOT, NO BEACON WILL BE SENT)
                blnApproveSend = objMetrics.runtime.metricsUniqueValue !== uniqueCheckValue; // IF IS IS UNIQUE...

                if (blnApproveSend) {
                  // UPDATE LAST SENT VALUE TO CURRENT (FOR UPDATED CHECK NEXT TIME)
                  objMetrics.runtime.metricsUniqueValue = uniqueCheckValue;
                }
              }
            }
          } // IF BEACON SEND IS APPROVED...


          if (blnApproveSend) {
            // GET URL
            var strBeaconUrl = objMetrics.getBeaconUrl(objTranslatedParameters); // FLAG PAGE TRACK

            objMetrics.runtime.blnPageTracked = true;
            objMetrics.runtime.MetricsCallStack = objMetrics.runtime.MetricsCallStack || []; // UPDATE URL OF BEACON TO SEND DATA TRACKER

            objMetrics.log('** BEACON SENDING: **', 'Settings:', objMetrics.settings, 'Translated Parameters:', objTranslatedParameters, 'Beacon URL:', strBeaconUrl);

            if (objMetrics.initBeacon(strBeaconUrl)) {
              objMetrics.runtime.MetricsCallStack.push({
                beaconUrl: strBeaconUrl,
                parameters: objTranslatedParameters
              });
            } else {
              console.warn('Unable to send beacon!');
            }

            objCommon.log('** BEACON SENT **');
          } else {
            // CANCEL BEACON SEND
            objCommon.log('** DUPLICATE BEACON DETECTED ON PARAMETER - ' + objMetrics.settings.trackOnUnique + ' - BEACON SEND ABORTED **');
          }
        } else {
          objCommon.log('** TRACKING DISABLED - BEACON SEND ABORTED **');
        } // BASIC TRUE RETURN (TO ALLOW EVEN BUBBLING)


        return true;
      }; // INTERACTIONS TRACKER (WRAPPER)


      objMetrics.trackEvent = function (objOrStringData, strEventValue, eventType) {
        // VAR LOCALS
        var linkType, linkName, interactionOnlyMode; // DETERMINE IF WE ARE IN INTERACTION ONLY MODE.

        interactionOnlyMode = false !== eventType; // UNLESS false IS PASSED EXPLICITELY FOR eventType, WE ARE IN INTERACTION ONLY MODE
        // IN THIS CASE, linkType & linkeName ARE INCLUDED IN THE BEACON
        // OMNITURE THEN FILTERS OUT PAGE NAME IN POST PROCESSING
        // SO THIS BEACON WILL NOT INCREASE THE PAGE VIEW COUNT
        // ARE WE IN INTERACTION ONLY MODE?

        if (interactionOnlyMode) {
          // HAVE WE SENT A PAGE LEVEL BEACON YET?
          if (!objMetrics.runtime.blnPageTracked) {
            // TRACK INITIAL LOAD AS PAGE
            objMetrics.trackData(objMetrics.settings.params);
            objMetrics.log('Initial Beacon Sent');
          } // DEFAULT NEW EVENT TYPE PARAMETER


          eventType = eventType || 'o'; // DEFAULT VALUE

          strEventValue = strEventValue || ''; // SWITCH ON EVENT TYPE

          switch (eventType.toLowerCase()) {
            // EXIT LINK
            case 'e':
              linkType = 'lnk_e';
              break;
            // FILE DOWNLOAD

            case 'd':
              linkType = 'lnk_d';
              break;
            // CUSTOM LINK (DEFAULT)

            default:
              linkType = 'lnk_o';
              break;
          }
        } // VERIFY ARG PASSED


        if (objOrStringData) {
          // CHECK FOR STRING
          if ('string' === typeof objOrStringData) {
            // INIT TRACKER OBJECT
            var objTracker = {}; // INTERACTION MODE?

            if (interactionOnlyMode) {
              // YES, APPEND LINK TYPE & NAME PARAMETERS
              objTracker.linkType = linkType;
              objTracker.linkName = strEventValue.length ? strEventValue : objOrStringData;
            } // TEMP UNTIL WE CAN FIND A DECENT WAY TO DRIVE FROM PARAM CONFIG


            switch (objMetrics.settings.trackAs) {
              // MOBILE APP
              case 'mobileApp':
                // MODULE OR MIRCOSITE
                break;

              case 'webPage':
                // SET STRING TO COMBINED INTERACTION DATA KEY
                if (strEventValue.length) {
                  strEventValue = ': ' + strEventValue;
                }

                objTracker.interactionType = objOrStringData + strEventValue;
                break;
              // WIDGET / MICROSITE / OR UNKNOWN

              default:
                // SET STRING TO INTERACTION DATA KEY(S)
                objTracker.interactionType = objOrStringData;
                objTracker.interactionValue = strEventValue;
                break;
            }

            if (objTracker) {
              return objMetrics.trackData(objTracker);
            }
          } else {
            // INTERACTION MODE?
            if (interactionOnlyMode) {
              // YES, APPEND LINK TYPE & NAME PARAMETERS
              objOrStringData.linkType = linkType;
              objOrStringData.linkName = objOrStringData.linkName || objOrStringData.interactionValue || 'unspecified-link-name';
            } // PASS OBJECT THROUGH


            return objMetrics.trackData(objOrStringData);
          }
        }
      };

      objMetrics.trackDownload = function (strFileName) {
        objMetrics.trackEvent.call(this, 'file-download', strFileName, 'd');
      };

      objMetrics.trackExitLink = function (strLinkName) {
        objMetrics.trackEvent.call(this, 'exit-link-clicked', strLinkName, 'e');
      }; // URL GENERATOR (FROM PARAMS - ALLOWING FOR OVERRIDES)


      objMetrics.getBeaconUrl = function (objParamOverrides) {
        var strBaseUrl = objMetrics.getBaseUrl(),
            qryString = objMetrics.getQueryString(objParamOverrides);

        if ('omniture' === objMetrics.settings.metricsApi) {
          // 1. REPLACE REPORT SUITE
          strBaseUrl = objCommon.replaceAll('@RS@', objParamOverrides.reportsuite || objParams.reportsuite, strBaseUrl); // 2. REPLACE MOBILE_INDICATOR (PASS OR DEFAULT)

          strBaseUrl = objCommon.replaceAll('@MOBILE_INDICATOR@', objParamOverrides.isMobile ? '5' : '1', strBaseUrl); // 3. REPLACE LIBRARY_VERSION (PASS OR DEFAULT)

          strBaseUrl = objCommon.replaceAll('@LIBRARY_VERSION@', objParamOverrides.libraryVersion ? objParamOverrides.libraryVersion : 'H.21', strBaseUrl); // 4. REPLACE ANTI_CACHE_VALUE

          strBaseUrl = objCommon.replaceAll('@ANTI_CACHE_VALUE@', objCommon.guid(), strBaseUrl);
        }

        return strBaseUrl + '?' + qryString;
      }; // BASE METRICS API URL CONSTRUCTOR


      objMetrics.getBaseUrl = function () {
        var strBaseUrl;

        switch (objMetrics.settings.metricsApi) {
          case 'metricsAspx':
            strBaseUrl = 'https://tools.cdc.gov/metrics.aspx';
            break;

          default:
            strBaseUrl = 'https://cdc.112.2o7.net/b/ss/@RS@/@MOBILE_INDICATOR@/@LIBRARY_VERSION@/@ANTI_CACHE_VALUE@';
            break;
        }

        return strBaseUrl;
      };

      objMetrics.getCallParam = function (paramName) {
        return objCommon.getCallParam(paramName);
      }; // METRICS URL CONVERTER


      objMetrics.getQueryString = function (objParamOverrides, objParamOmit) {
        // GET OR DEFAULT LOCAL OVERRIDES
        objParamOverrides = objParamOverrides || {};
        objParamOmit = objMetrics.settings.objParamOmit; // CREATE PARAM ARRAY

        var objParams = {},
            aryParams = [],
            key,
            value; // MERGE IN OVERRIDES TO THIS CALLS PARAMS

        for (key in objParamOverrides) {
          objParams[key] = objParamOverrides[key];
        } // OMNITURE OR METRICS.ASPX HANDLING


        if ('omniture' === objMetrics.settings.metricsApi) {
          // OMNITURE - ADD AQE
          aryParams.push('AQB=1');
        } else {
          // METRICS ASPX - ADD MANUAL ANTI CACHE VALUE (THIS IS IN BASE URL IN THE CASE OF OMNITURE)
          aryParams.push('ac=' + objCommon.guid());
        } // LOOP METRIC PARAMS


        for (key in objParams) {
          // ONLY PROCEED WITH KEY IF IT IS NOT OMITTED
          if (!(objParamOmit.hasOwnProperty(key) && objParamOmit[key] !== undefined && null !== objParamOmit[key])) {
            // FINALIZE/FORMAT KEY VALUE
            value = objCommon.cleanString(objParams[key]); // CHECK FOR VALID FINAL VALUE

            if (value.length) {
              // PUSH KEY VALUE PAIR TO ARRAY
              aryParams.push(key + '=' + encodeURIComponent(value));
            }
          }
        } // ADD AQB/AQE (IMAGE BEGIN / IMAGE END) PARAMETERS TO QUERY STRING


        if ('omniture' === objMetrics.settings.metricsApi) {
          aryParams.push('AQE=1');
        } // CONVERT ARRAY TO QUERY STRING & RETURN


        return aryParams.join('&');
      }; // HELPER: IS TRACKING ENABLED


      objMetrics.trackingEnabled = function (objParamOverrides) {
        objParamOverrides = objParamOverrides || {};
        var objSettings = objMetrics.settings,
            anyIsEnabled; // GET ENABLED VALUE (FROM OVERRIDES OR SETTINGS OR FAILOVER TO FALSE)

        anyIsEnabled = objParamOverrides.useMetrics || objSettings.useMetrics || 'false'; // TYPE AGNOSTIC CHECK FOR TRUE

        return 'false' !== objCommon.cleanString(anyIsEnabled).toLowerCase();
      };

      objMetrics.getTranslations = function (objSettings) {
        // LOCAL
        var objTranslations, objMap, i; // DEFAULT RETURN OBJECT

        objTranslations = {
          // ADD DISPLAY ORDER ARRAY TO AID IN HOW THINGS SHOULD BE ORDER
          _displayOrder: []
        }; // GET LOOP LENGTH

        i = objSettings.productVariableMap.length; // LOOP MAPPINGS

        while (i--) {
          // GET CURRENT VAR MAP
          objMap = objSettings.productVariableMap[i]; // MAP TRANSLATIONS FOR VARIABLE

          objTranslations._displayOrder.push(objMap[objSettings.translation.fromKey]);

          objTranslations[objMap[objSettings.translation.fromKey]] = {
            to: objMap[objSettings.translation.toKey],
            description: objMap.description,
            defaultValue: 'function' === typeof objMap.defaultValue ? objMap.defaultValue.call(this, objSettings) : objMap.defaultValue
          };
        } // RETURN TRANSLATION MAP


        return objTranslations;
      };

      objMetrics.help = function () {
        if (!objMetrics.settings || !objMetrics.settings.translations) {
          console.groupCollapsed('CDC Common Metrics Framework is Not Initialized');
          console.log('Version: ' + commonMetricsVersion);
          console.warn('Please use the init method to initialize the Metrics Framework, Specify a product type: webPage, widget, or mobileApp');
          console.warn('Doing so will will allow the framework to provide you with a list of available parameters based on product type.');
          console.groupEnd();
          return;
        }

        var i, key, objParam;
        console.group('CDC Common Metrics Framework is Initialized');
        console.log('Version: ' + commonMetricsVersion);
        console.log('Tracking Data as: ' + objMetrics.settings.trackAs);
        console.groupEnd();
        console.group('Translation Configuration');
        console.log('Metric Key Values will be translated');
        console.log('From: ' + objMetrics.settings.translation.fromKey);
        console.log('To: ' + objMetrics.settings.translation.toKey);
        console.groupEnd();
        console.group('Supported Key Value Parameters:'); // LOOP TRANSLATIONS OBJECT VIA DISPLAY ORDER

        i = objMetrics.settings.translations._displayOrder.length;

        while (i--) {
          key = objMetrics.settings.translations._displayOrder[i];
          var objParamValue = objMetrics.settings.translations[key]; // BYPASS OMITTED SETTINGS

          if (!objMetrics.settings.objParamOmit.hasOwnProperty(key)) {
            console.group(key + ' (Translates to: ' + objParamValue.to + ' )');
            console.log('Description: ' + objParamValue.description);
            console.log('Current value: ' + objParamValue.defaultValue);
            console.log('Default value: ' + objMetrics.settings.params[key]);
            console.groupEnd();
          }
        }

        console.groupEnd();
        return true;
      };

      objMetrics.translateToBeacon = function (objBeaconParameters, objParamOmit) {
        objBeaconParameters = objBeaconParameters || {};
        objParamOmit = objParamOmit || objMetrics.settings.objParamOmit;
        var currKey,
            objTranslatedReturn = {},
            objOmittedReturn = {}; // BACK FILL VALUES ALREADY SET TO THIS 'objBeaconParameters' OBJECT

        for (currKey in objMetrics.settings.params) {
          if (!objBeaconParameters.hasOwnProperty(currKey)) {
            objBeaconParameters[currKey] = objMetrics.settings.params[currKey];
          }
        } // THEN PERFORM TRANSLATIONS TO 'objBeaconParameters' OBJECT


        for (currKey in objBeaconParameters) {
          // APPEND MODE?
          if (objMetrics.settings.translation.appendTranslations) {
            // USES EXISTING SETTING OBJECT & APPENDS NEW NEWS AS NEEDED
            // DOES TRANSLATION EXIST
            if (objMetrics.settings.translations.hasOwnProperty(currKey)) {
              // DOES THE TRANSLATION NOT ALREADY EXIST (WE DONT WANT TO OVERWRITE ALREADY SET PARAMETERS)
              if (!objBeaconParameters.hasOwnProperty(objMetrics.settings.translations[currKey].to)) {
                // APPEND MAP KEY VALUE TO TRANSLATION KEY VALUE IN RETURN (APPENDED TO ORIGINAL OBJECT)
                objBeaconParameters[objMetrics.settings.translations[currKey].to] = objBeaconParameters[currKey];
              }
            }
          } else {
            // CREATES NEW RETURN OBJECT AND ADDS KEYS IN AS NEEDED
            // DOES TRANSLATION EXIST
            // eslint-disable-next-line no-lonely-if
            if (objMetrics.settings.translations.hasOwnProperty(currKey)) {
              // DOES THE TRANSLATION NOT ALREADY EXIST (WE DONT WANT TO OVERWRITE ALREADY SET PARAMETERS)
              if (!objTranslatedReturn.hasOwnProperty(objMetrics.settings.translations[currKey].to)) {
                // MAP KEY VALUE TO TRANSLATION KEY VALUE IN RETURN
                objTranslatedReturn[objMetrics.settings.translations[currKey].to] = objBeaconParameters[currKey];
              }
            } else {
              // ELSE PASS ALONG ORIGINAL KVP
              objTranslatedReturn[currKey] = objBeaconParameters[currKey];
            }
          }
        }

        var objReturn; // IF APPEND MODE, RETURN ORIGINAL OBJECT WITH APPENDED KVP TRANSLATIONS

        if (objMetrics.settings.translation.appendTranslations) {
          objReturn = objBeaconParameters;
        } else {
          // ELSE RETURN TRANSLATED OBJECT ONLY
          objReturn = objTranslatedReturn;
        } // COPY PARAMS FROM 'objBeaconParameters' SANS OMMITTED VALUES


        for (currKey in objReturn) {
          if (!(objParamOmit.hasOwnProperty(currKey) && objParamOmit[currKey])) {
            objOmittedReturn[currKey] = objReturn[currKey];
          }
        }

        return objOmittedReturn;
      };

      objMetrics.getLanguageDefault = function () {
        // DEFAULT TO EN-US
        var strLangLocale = 'en-us'; // TRY TO RETURN HTML LANG ATTRIBUTE IF AVAILABLE

        if (document.documentElement.lang) {
          strLangLocale = document.documentElement.lang.toLowerCase();
        } // GET DEFAULT LANGUAGE VALUE FROM LOCALE


        switch (strLangLocale.substring(0, 2)) {
          // SPANISH
          case 'es':
            return 'spa';
          // CHINESE

          case 'zh':
            return 'chi';
          // VIETNAMESE

          case 'vi':
            return 'vie';
          // KOREAN

          case 'ko':
            return 'kor';
          //TAGALOG

          case 'tl':
            return 'tgl';
          // RUSSIAN

          case 'ru':
            return 'rus';
          //ARABIC

          case 'ar':
            return 'ara';
          //CREOLE

          case 'ht':
            return 'hat';
          // FRENCH

          case 'fr':
            return 'fra';
          //POLISH

          case 'pl':
            return 'pol';
          // PORTUGUESE

          case 'pt':
            return 'jpn';
          // ITALIAN

          case 'it':
            return 'ita';
          // GERMAN

          case 'de':
            return 'deu';
          // JAPANESE

          case 'ja':
            return 'jpn';
          //FARSI

          case 'fa':
            return 'fas';
          // ENGLISH

          default:
            return 'eng';
        }
      };

      objMetrics.safeUpdateObject = function (objTarget, objUpdates, anyOmit) {
        anyOmit = anyOmit || false;

        if ('undefined' !== typeof objTarget && 'undefined' !== typeof objUpdates) {
          for (var key in objUpdates) {
            if (objUpdates.hasOwnProperty(key)) {
              if ('object' === _typeof(objUpdates[key]) && !Array.isArray(objUpdates[key])) {
                objTarget[key] = objMetrics.safeUpdateObject(objTarget[key], objUpdates[key], anyOmit[key] || {});
              } else if (!(anyOmit[key] || true === anyOmit)) {
                objTarget[key] = objUpdates[key];
              }
            }
          }
        }

        return objTarget;
      };

      objMetrics.updateSettings = function (objSettings) {
        // GET OR DEFAULT INIT OVERRIDES
        objSettings = objSettings || {};
        objMetrics.log('SETTINGS BEFORE UPDATE', window.CDC.Common.cloneShallow(objMetrics.settings)); // APPLY OVERRIDES TO SETTINGS OBJECT (UNLESS THEY SHOULD BE OMITTED FOR UPDATE)

        objMetrics.settings = objMetrics.safeUpdateObject(objMetrics.settings, objSettings, objMetrics.settings.objUpdateOmit);
        objMetrics.log('SETTINGS AFTER UPDATE', objMetrics.safeUpdateObject(objMetrics.settings));
        objMetrics.log('SETTINGS UPDATE OMIT OBJECT', objMetrics.safeUpdateObject(objMetrics.settings.objUpdateOmit)); // UPDATE TRANSLATIONS OBJECT (BASED ON CURRENT TRANSLATION SETTINGS)

        objMetrics.settings.translations = objMetrics.getTranslations(objMetrics.settings);
        return true;
      };

      objMetrics.updateParams = function (objParameters) {
        // GET OR DEFAULT INIT OVERRIDES
        objParameters = objParameters || {};

        if (!objMetrics.settings) {
          // eslint-disable-next-line no-throw-literal
          throw 'Metrics Framework is not initialized...\nUnable to update parameters\nPlease init the metrics library to use this method.';
        } else {
          // APPLY OVERRIDES TO SETTINGS OBJECT (UNLESS THEY SHOULD BE OMITTED FOR UPDATE)
          objMetrics.settings.params = objMetrics.safeUpdateObject(objMetrics.settings.params, objParameters, objMetrics.settings.objParamOmit);
        } // UPDATE TRANSLATIONS OBJECT (BASED ON CURRENT TRANSLATION SETTINGS)


        objMetrics.settings.translations = objMetrics.getTranslations(objMetrics.settings); // IF WE ARE LOADING ALONGSIDE OMNITURE, AUTO UPDATE FROM OMNITURE

        if (objMetrics.settings.loadPageLevel) {
          objMetrics.updateOmniture();
        }

        return true;
      };

      objMetrics.update = function (objParameters) {
        //console.warn('Deprecated call to metrics.update(). For disambiguation, this method has been separated into two calls: 'updateParams' for parameters, and 'updateSettings' to update gloab settings. This method will be removed in a future release.');
        return objMetrics.updateParams(objParameters);
      };

      objMetrics.updateOmniture = function () {
        objMetrics.log('Updating omniture with configuration values from CDC Common Metrics');

        if ('undefined' === typeof window.s) {
          console.warn('Unable to update omniture settings because the global omniture \'s\' variables is undefined');
          return false;
        } else if ('undefined' === typeof window.updateVariables) {
          console.warn('Unable to update omniture settings because the global omniture method \'updateVariables\' is undefined');
          return false;
        } else if ('undefined' === typeof window.s_gi) {
          console.warn('Unable to update omniture settings because the global omniture method \'s_gi\' is undefined');
          return false;
        } else {
          // GET TRANSLATION MAP FOR MAPPING TO OMNITURE
          var key,
              objMap,
              anyValue,
              i,
              strReportSuite,
              updates = {},
              objOmnitureTranslations = objMetrics.getTranslations({
            productVariableMap: objMetrics.settings.productVariableMap,
            translation: {
              fromKey: objMetrics.settings.translation.fromKey,
              toKey: 'omnitureJsVarName'
            }
          });
          objMetrics.log(objOmnitureTranslations);
          objMetrics.log(objMetrics.params);
          strReportSuite = (objMetrics.settings.params.hasOwnProperty('reportsuite') ? objMetrics.settings.params.reportsuite : objOmnitureTranslations.reportsuite.defaultValue) || window.s.account || window.s_account; // SHIM FOR BACKWARDS COMPATIBILTIY

          if (!window.s_account && window.s && window.s.account) {
            window.s_account = window.s.account;
          } // VERIFY REPORT SUITE IN OMNITURE AND RE-INIT OMNITURE IF NEEDED
          // This was a safety check that needed more baking apparently, commenting it out
          // if (window.s && window.s_account && (window.s.account !== strReportSuite)) {
          //     console.warn('Omniture Account did not match account in common-metrics library. Omniture has been re-initialized from ' + window.s.account + ' to ' + strReportSuite + ' match the requested value');
          //     window.s.account = window.s_account = strReportSuite;
          //     window.s = window.s_gi(window.s.account);
          // }
          // Suggested Update
          // if (window.s && window.s_account && (window.s.account !== strReportSuite)) {
          //     console.warn('Omniture Account did not match account in common-metrics library.', 'window.s.account is: ' + window.s.account, 'strReportSuite is: ' + strReportSuite, 'Please verify omniture configuration');
          // }
          // LOOP TRANSLATIONS OBJECT VIA DISPLAY ORDER


          i = objOmnitureTranslations._displayOrder.length;

          while (i--) {
            key = objOmnitureTranslations._displayOrder[i];
            objMap = objOmnitureTranslations[key];
            anyValue = objMetrics.settings.params.hasOwnProperty(key) ? objMetrics.settings.params[key] : 'function' === typeof objMap.defaultValue ? objMap.defaultValue.call(this, objMetrics.settings) : objMap.defaultValue;

            if (anyValue) {
              if ('reportsuite' !== key) {
                s[objMap.to] = anyValue;
                updates[objMap.to] = s[objMap.to];
              }

              objMetrics.log('Updated ' + key + ' in CDC Common Metrics; s.' + objMap.to + ' has been updated to ' + updates[objMap.to]);
            } else {
              objMetrics.log('No translation value set for ' + key + ' is set in CDC Common Metrics; s.' + objMap.to + ' will have not been updated');
            }
          }

          window.updateVariables(s);
          return updates;
        }
      };

      objMetrics.updateFromOmniture = function (trackAs) {
        objMetrics.log('Updating CDC Common Metrics omniture with configuration values from omniture');
        objMetrics.init({
          trackAs: trackAs
        });

        if ('undefined' === typeof window.s) {
          console.warn('Unable to CDC Common Metrics settings because the global omniture \'s\' variables is undefined');
          return false;
        } else if ('undefined' === typeof window.updateVariables) {
          console.warn('Unable to CDC Common Metrics settings because the global omniture method \'updateVariables\' is undefined');
          return false;
        } else if ('undefined' === typeof window.s_gi) {
          console.warn('Unable to CDC Common Metrics settings because the global omniture method \'s_gi\' is undefined');
          return false;
        } else {
          // GET TRANSLATION MAP FOR MAPPING TO OMNITURE
          var key,
              objMap,
              anyValue,
              strReportSuite,
              i,
              updates = {},
              objOmnitureTranslations = objMetrics.getTranslations({
            productVariableMap: objMetrics.settings.productVariableMap,
            translation: {
              fromKey: 'omnitureJsVarName',
              toKey: objMetrics.settings.translation.fromKey
            }
          });
          strReportSuite = objMetrics.settings.params.hasOwnProperty('reportsuite') ? objMetrics.settings.params.reportsuite : objOmnitureTranslations.reportsuite.defaultValue;
          objMetrics.log('objOmnitureTranslations', objOmnitureTranslations); // LOOP TRANSLATIONS OBJECT VIA DISPLAY ORDER

          i = objOmnitureTranslations._displayOrder.length;

          while (i--) {
            key = objOmnitureTranslations._displayOrder[i];
            objMap = objOmnitureTranslations[key];
            anyValue = objMetrics.settings.params.hasOwnProperty(key) ? objMetrics.settings.params[key] : 'function' === typeof objMap.defaultValue ? objMap.defaultValue.call(this, objMetrics.settings) : objMap.defaultValue;

            if (anyValue) {
              if ('reportsuite' !== key) {
                updates[objMap.to] = s[objMap.from];
              }

              objMetrics.log('Translation value set for ' + key + ' in CDC Common Metrics; s.' + objMap.to + ' has been updated');
            } else {
              objMetrics.log('No translation value set for ' + key + ' is set in CDC Common Metrics; s.' + objMap.to + ' has not been updated');
            }
          }

          objMetrics.log('updates', updates);
        }
      };

      objMetrics.configureInteractionTracking = function ($, configurationMap) {
        configurationMap = configurationMap || [
          /*
                         // Example 1
                         {
                             'events' : 'keyup click', // Default listener value is 'click'
                             'selector' : '.example-selector-1',
                             'data' : 'example interaction',
                             'priority': 'low'
                         },
                         // Example 2
                         {
                             'selector' : '.example-selector-2',
                             'data' : {
                                 // Key Value Pairs - var key names should be based on currently configured 'fromKey' in regards to translation settings
                                 pageName: 'New Page Name',
                                 channel: 'New Channel Value'
                             },
                             'priority': 'medium'
                         },
                         //  Example 3
                         {
                             'selector' : '.example-selector-3',
                             'data' : function () {
                                 var newOverrides = {};
                                 newOverrides.linkName = $(this).attr('aria-label');
                                 var channelName = $(this).attr('data-custom-channel');
                                 if (!!channelName) {
                                     newOverrides.channelName = channelName;
                                 }
                                 return newOverrides;
                             },
                             'priority': 'high'
                         }
                         */
        ]; // Determine Approved Priorities for interaction map tracking

        var approvedPriorities;

        switch (objMetrics.settings.interactionMapPriority) {
          case 'all':
          case 'lowUp':
            approvedPriorities = ['low', 'medium', 'high'];
            break;

          case 'mediumUp':
            approvedPriorities = ['medium', 'high'];
            break;

          case 'highOnly':
            approvedPriorities = ['high'];
            break;

          default:
            approvedPriorities = [];

          /* 'none' and any unsupported priority falls into default case */
        }

        configurationMap.forEach(function (trackerConfig) {
          trackerConfig = trackerConfig || {}; // Defaults

          var localConfig = {};
          localConfig.priority = localConfig.priority || 'low'; // Is this listener permitted by priority?

          if (-1 < approvedPriorities.indexOf(localConfig.priority)) {
            localConfig.testMode = trackerConfig.testMode || false;
            localConfig.directBind = localConfig.testMode || trackerConfig.directBind || false;
            localConfig.events = trackerConfig.events || 'click';
            localConfig.selector = trackerConfig.selector || false;
            localConfig.data = trackerConfig.data || {};
            localConfig.handler = trackerConfig.handler || undefined;
            localConfig.debounce = localConfig.testMode ? false : trackerConfig.debounce || false;

            localConfig.handler = function (event) {
              // TEST MODE? (HALT DEFAULT HANDLERS)
              if (localConfig.testMode) {
                event.preventDefault();
                event.stopPropagation();
                console.warn('Metrics Test Mode is enabled for this element!', 'Please note that debounce and delegation are disabled in test mode.', 'Additionally, this event has been prevented from its default behavior, and propagation has been halted.');
              }

              var objOrStringData;

              if ('function' === typeof localConfig.data) {
                objOrStringData = localConfig.data.call(this);
              } else {
                objOrStringData = localConfig.data;
              }

              console.log('window.CDC.Common.metrics.trackEvent', objOrStringData);
              window.CDC.Common.metrics.trackEvent(objOrStringData);
              return !localConfig.testMode;
            }; // SETUP DEBOUNCE IF REQUESTED


            if (localConfig.debounce) {
              localConfig.debouncedHandler = window.CDC.Common.debounce(localConfig.handler, localConfig.debounce);
            } else {
              localConfig.debouncedHandler = localConfig.handler;
            }

            if (localConfig.directBind) {
              console.warn('Direct Assignement of listener for: ' + localConfig.selector);
              $(localConfig.selector).on(localConfig.events, localConfig.debouncedHandler);
            } else {
              // See http://api.jquery.com/on/ for API description
              $('body').on(localConfig.events, localConfig.selector, localConfig.debouncedHandler);
            }
          }
        });
        objMetrics.log('Metrics Listeners Initialized');
        return true;
      };

      objMetrics.init = function (objOptions) {
        var key, sCodeCallback; // GET OR DEFAULT INIT SETTINGS OVERRIDES

        objOptions = objOptions || {};
        objOptions.loadPageLevel = objOptions.loadPageLevel || objCommon.getCallParam('loadPageLevel') || 'module' === objOptions.trackAs || false;
        objOptions.objUpdateOmit = objOptions.objUpdateOmit || {
          objParamOmit: true,
          objUpdateOmit: true,
          productVariableMap: true,
          interactionType: true,
          interactionValue: true,
          linkType: true,
          linkName: true,
          trackAs: true,
          translations: true,
          params: true,
          productType: true
        };
        objOptions.objParamOmit = objOptions.objParamOmit || {
          objParamOmit: true,
          objUpdateOmit: true,
          params: true,
          interactionType: true,
          interactionValue: true,
          translation: true,
          productVariableMap: true,
          trackOnUnique: true,
          useMetrics: true,
          trackAs: true,
          metricsApi: true,
          translations: true,
          linkType: true,
          linkName: true
        };
        objOptions.trackOnUnique = objOptions.trackOnUnique || null;
        objOptions.translation = objOptions.translation || {};
        objOptions.useMetrics = 'undefined' === typeof objOptions.useMetrics ? true : objOptions.useMetrics; // RUNTIME CONTINUITY VARIABLES (LAST PAGE & CURRENT PAGE)

        objMetrics.runtime = objMetrics.getRuntime(objOptions.productName || 'anonymous-' + objOptions.productType); // blnPageTracked = (Are we loading page level metrics? - AKA WIll Omniture Handle the Page Beacon?) || false;

        objMetrics.runtime.blnPageTracked = objOptions.loadPageLevel || false;
        objMetrics.runtime.MetricsCallStack = []; // SET DEFAULT SETTINGS

        objMetrics.settings = function () {
          // HANDLE METRICS ENGINE SWITCHER
          var objReturn = {},
              objTranslationDefaults,
              currKey,
              currItem,
              trackAs = objCommon.getCallParam('mMode') || objOptions.trackAs || 'widget',
              validOptions = ['loadPageLevel', 'objParamOmit', 'objUpdateOmit', 'productType', 'trackOnUnique', 'translation', 'useMetrics'],
              intOptionsLen = validOptions.length;

          while (intOptionsLen--) {
            currKey = validOptions[intOptionsLen];
            objReturn[currKey] = objOptions[currKey];
          } // SWITCH PREREQUISITE LIBS AND METRIC PARAMS BY TRACKING TYPE (MODULE, WIDGET, ETC)


          switch (trackAs.toLowerCase()) {
            // TRACK AS MODULE
            case 'module':
            case 'webpage':
              objReturn.trackAs = 'webPage';
              objReturn.productType = objOptions.productType ? objOptions.productType : 'Web Page';
              objReturn.metricsApi = objOptions.metricsApi || 'omniture';
              objTranslationDefaults = {
                fromKey: 'omnitureVarName',
                toKey: 'omnitureVarName',
                appendTranslations: false
              };
              break;
            // TRACK AS MOBILE APP

            case 'mobileapp':
              objReturn.trackAs = 'mobileApp';
              objReturn.productType = objOptions.productType ? objOptions.productType : 'Mobile Application';
              objReturn.metricsApi = objOptions.metricsApi || 'omniture';
              objTranslationDefaults = {
                fromKey: 'varName',
                toKey: 'omnitureVarName',
                appendTranslations: false
              };
              break;
            // TRACK AS WIDGET / MICROSITE (DEFAULT)

            default:
              objReturn.trackAs = 'widget';
              objReturn.productType = objOptions.productType ? objOptions.productType : 'Widget / Microsite';
              objReturn.metricsApi = objOptions.metricsApi || 'omniture';
              objTranslationDefaults = {
                fromKey: 'varName',
                toKey: 'omnitureVarName',
                appendTranslations: true
              };
              break;
          }

          objReturn.productVariableMap = productTypeVarMappings[objReturn.trackAs]; // LOOP TRANSLATION DEFAULTS / ALLOWING FOR OVERRIDES FROM PASSED PARAMETERS PER KEY

          for (currKey in objTranslationDefaults) {
            objReturn.translation[currKey] = objOptions.translation.hasOwnProperty(currKey) ? objOptions.translation[currKey] : objTranslationDefaults[currKey];
          } // SET TRANSLATIONS OBJECT (BASED ON TRANSLATION SETTINGS SET ABOVE)


          objReturn.translations = objMetrics.getTranslations(objReturn); // Interaction tracking priority

          objOptions.interactionMapPriority = 'mediumUp';
          /* Options: all, lowUp, mediumUp, highOnly, none */
          // CREATE PARAMS OBJECT IN RETURN

          objReturn.params = {}; // SET 'objReturn.params' DEFAULTS

          for (currKey in objReturn.translations) {
            // GET DEFAULT VALUE FOR CURRENT PARAMETER
            currItem = objReturn.translations[currKey]; // CHECK IF IT HAS A VALID VALUE FOR A DEFAULT

            if (currItem.defaultValue) {
              // IF SO, INCLUDE IT IN THE PARAMETER DEFAULTS
              objReturn.params[currKey] = currItem.defaultValue;
            }
          } // RETURN DERIVED SETTINGS OBJECT


          return objReturn;
        }(); // APPLY OVERRIDES TO SETTINGS OBJECT


        objMetrics.updateSettings(objOptions); // APPLY OVERRIDES TO PARAMETERS OBJECT

        objMetrics.updateParams(objOptions); // INIT BEACON ELEMENT
        // objMetrics.initBeacon();
        // RETURN SELF

        return objMetrics;
      };

      objMetrics.getRuntime = function () {
        var getNormUrlName = function getNormUrlName(url) {
          return url.toLowerCase().replace(/[\/]/g, '_').replace(/[.]/g, '');
        };

        return function (productName) {
          var objRuntime, currUrl, currUrlNorm, localStoreApi, localStoreData, urlInfo;
          currUrl = location.host.toLowerCase() + location.pathname.toLowerCase();
          currUrlNorm = getNormUrlName(currUrl);
          localStoreApi = objCommon.getLocalStorageApi('tpMetrics' + productName);
          localStoreData = localStoreApi.val() || {}; // SET METRICS INSTANCE RUNTIME DEFAULTS

          objRuntime = {
            visitReference: localStoreData.visitReference || {},
            referrer: localStoreData.referrer || document.referrer,
            pageTrack: localStoreData.pageTrack || []
          }; // GET OR SET (DEFAULT) THIS URLS' PLACE IN THE VISIT REFERENCE

          if (!objRuntime.visitReference.hasOwnProperty(currUrlNorm)) {
            objRuntime.visitReference[currUrlNorm] = {
              pageUrl: currUrl,
              pageName: document.title,
              visits: []
            };
          } // PUSH THE CURRENT DATE TO THE VISIT TRACKER


          objRuntime.visitReference[currUrlNorm].visits.push(Date.now()); // PUSH THE CURRENT URL (IN ITS NORMALIZED FORM) TO THE PAGE TRACKER

          objRuntime.pageTrack.push(currUrlNorm); // SAVE THE UPDATED DATA BACK TO LOCAL STORAGE

          localStoreApi.save({
            visitReference: objRuntime.visitReference,
            referrer: objRuntime.visitReference,
            pageTrack: objRuntime.pageTrack
          });
          return objRuntime;
        };
      }();

      return objMetrics;
    }(); // VARIABLE MAPPINGS BY PRODUCT TYPE (AND AS SUCH, REPORT SUITE)


    productTypeVarMappings = {
      mobileApp: [{
        varName: 'productType',
        description: 'Use to indicate what type of product this is, such as \'Mobile App\', or \'Widget\', etc.',
        omnitureVarName: 'c8',
        omnitureJsVarName: 'prop8',
        cdcVarName: 'c8',
        defaultValue: function defaultValue(options) {
          return options.productType || 'Mobile App';
        }
      }, {
        varName: 'reportsuite',
        description: 'Used to set the report suite that traffic should be sent to',
        omnitureVarName: 'reportsuite',
        omnitureJsVarName: 'reportsuite',
        cdcVarName: 'reportsuite',
        defaultValue: 'cdcsynddev'
      }, {
        varName: 'linkType',
        description: 'Omniture Specific Variable - Used in link tracking (AKA interaction tracking) | Types are: File Downloads=\'d\', translated to \'lnk_d\', Exit Links=\'e\', translated to \'lnk_e\', Custom Links=\'o\', which is translated to \'lnk_o\'',
        omnitureVarName: 'pe',
        omnitureJsVarName: 'pe',
        cdcVarName: 'pe',
        defaultValue: null
      }, {
        varName: 'linkName',
        description: 'Omniture Specific Variable - Used in link tracking (AKA interaction tracking) | This is the link or interaction name / short desc',
        omnitureVarName: 'pev2',
        omnitureJsVarName: 'pev2',
        cdcVarName: 'pev2',
        defaultValue: null
      }, {
        varName: 'appFramework',
        description: 'App Framework',
        omnitureVarName: 'c51',
        omnitureJsVarName: 'prop51',
        cdcVarName: 'c51',
        defaultValue: null
      }, {
        varName: 'appName',
        description: 'App Name',
        omnitureVarName: 'c52',
        omnitureJsVarName: 'prop52',
        cdcVarName: 'c52',
        defaultValue: null
      }, {
        varName: 'appVersion',
        description: 'App Version',
        omnitureVarName: 'c53',
        omnitureJsVarName: 'prop53',
        cdcVarName: 'c53',
        defaultValue: null
      }, {
        varName: 'interactionType',
        description: 'Events / Interactions (Format is \'Type: Value)\'',
        omnitureVarName: 'c58',
        omnitureJsVarName: 'prop58',
        cdcVarName: 'c58',
        defaultValue: null
      }, {
        varName: 'contentSection',
        description: 'Section',
        omnitureVarName: 'c59',
        omnitureJsVarName: 'prop59',
        cdcVarName: 'c59',
        defaultValue: null
      }, {
        varName: 'pageName',
        description: 'Page Name / Content or Article Name',
        omnitureVarName: 'gn',
        omnitureJsVarName: 'pageName',
        cdcVarName: 'contenttitle',
        defaultValue: null
      }, {
        varName: 'contentTitle',
        description: 'Page Name / Content or Article Name',
        omnitureVarName: 'gn',
        omnitureJsVarName: 'pageName',
        cdcVarName: 'contenttitle',
        defaultValue: null
      }, {
        varName: 'contentTitle',
        description: 'Page Name / Content or Article Name',
        omitureVarName: 'gn',
        cdcVarName: 'contenttitle',
        "default": null
      }, {
        varName: 'contentPath',
        description: 'Content Source URL',
        omnitureVarName: 'c1',
        omnitureJsVarName: 'prop1',
        cdcVarName: 'c1',
        defaultValue: null
      }, {
        varName: 'contentPartnerDomain',
        description: 'Partner Domain',
        omnitureVarName: 'c3',
        omnitureJsVarName: 'prop3',
        cdcVarName: 'c3',
        defaultValue: null
      }, {
        varName: 'contentId',
        description: 'Content ID',
        omnitureVarName: 'c6',
        omnitureJsVarName: 'prop6',
        cdcVarName: 'c6',
        defaultValue: null
      }, {
        varName: 'contentLanguage',
        description: 'Language code (en-us, en-es, etc.) for Currently Loaded Content',
        omnitureVarName: 'c5',
        omnitureJsVarName: 'prop5',
        cdcVarName: 'c5',
        defaultValue: null
      }, {
        varName: 'contentChannel',
        description: 'Channel',
        omnitureVarName: 'ch',
        omnitureJsVarName: 'ch',
        cdcVarName: 'channel',
        defaultValue: null
      }, {
        varName: 'deviceOsName',
        description: 'OS Name',
        omnitureVarName: 'c54',
        omnitureJsVarName: 'prop54',
        cdcVarName: 'c54',
        defaultValue: null
      }, {
        varName: 'deviceOsVersion',
        description: 'OS Version',
        omnitureVarName: 'c55',
        omnitureJsVarName: 'prop55',
        cdcVarName: 'c55',
        defaultValue: null
      }, {
        varName: 'deviceType',
        description: 'Device Type (Phone, Table, Etc.)',
        omnitureVarName: 'c56',
        omnitureJsVarName: 'prop56',
        cdcVarName: 'c56',
        defaultValue: null
      }, {
        varName: 'deviceIsOnline',
        description: 'Online / Offline Status. Use 0 and 1 respectively',
        omnitureVarName: 'c57',
        omnitureJsVarName: 'prop57',
        cdcVarName: 'c57',
        defaultValue: null
      }],
      widget: [{
        varName: 'productType',
        description: 'Use to indicate what type of product this is, such as \'Mobile App\', or \'Widget\', etc.',
        omnitureVarName: 'c8',
        omnitureJsVarName: 'prop8',
        cdcVarName: 'c8',
        defaultValue: function defaultValue(options) {
          return options.productType || 'Widget';
        }
      }, {
        varName: 'reportsuite',
        description: 'Used to set the report suite that traffic should be sent to',
        omnitureVarName: 'reportsuite',
        omnitureJsVarName: 'reportsuite',
        cdcVarName: 'reportsuite',
        defaultValue: 'cdcsynddev'
      }, {
        varName: 'linkType',
        description: 'Omniture Specific Variable - Used in link tracking (AKA interaction tracking) | Types are: File Downloads=\'d\', translated to \'lnk_d\', Exit Links=\'e\', translated to \'lnk_e\', Custom Links=\'o\', which is translated to \'lnk_o\'',
        omnitureVarName: 'pe',
        omnitureJsVarName: 'pe',
        cdcVarName: 'pe',
        defaultValue: null
      }, {
        varName: 'linkName',
        description: 'Omniture Specific Variable - Used in link tracking (AKA interaction tracking) | This is the link or interaction name / short desc',
        omnitureVarName: 'pev2',
        omnitureJsVarName: 'pev2',
        cdcVarName: 'pev2',
        defaultValue: null
      }, {
        varName: 'server',
        description: 'Used to the server of the calling page / resource',
        omnitureVarName: 'server',
        omnitureJsVarName: 'server',
        cdcVarName: 'server',
        defaultValue: metricsManager.getCallParam('chost')
      }, {
        varName: 'widgetId',
        description: 'Framework Used For This Widget (Defaults to: \'Widget Framework\' meaning the CDC Responsive iFrame Widget Framework)',
        omnitureVarName: 'c32',
        omnitureJsVarName: 'prop32',
        cdcVarName: 'c32',
        defaultValue: undefined
      }, {
        varName: 'widgetFramework',
        description: 'Framework Used For This Widget (Defaults to: \'Widget Framework\' meaning the CDC Responsive iFrame Widget Framework)',
        omnitureVarName: 'c27',
        omnitureJsVarName: 'prop27',
        cdcVarName: 'c27',
        defaultValue: 'Widget Framework'
      }, {
        varName: 'url',
        description: 'Metrics URL (Legacy Variable, Unsure of Purpose, seems redundant, Leaving Default Off)',
        omnitureVarName: 'c1',
        omnitureJsVarName: 'prop1',
        cdcVarName: 'url',
        defaultValue: undefined
      }, {
        varName: 'documentTitle',
        description: 'Document Title',
        omnitureVarName: 'c2',
        omnitureJsVarName: 'prop2',
        cdcVarName: 'documenttitle',
        defaultValue: document.title
      }, {
        varName: 'hostName',
        description: 'Metrics host name (Not sure what this is)',
        omnitureVarName: 'c3',
        omnitureJsVarName: 'prop3',
        cdcVarName: 'hostname',
        defaultValue: location.host
      }, {
        varName: 'registrationId',
        description: 'Content Syndication registration ID',
        omnitureVarName: 'c4',
        omnitureJsVarName: 'prop4',
        cdcVarName: 'registrationid',
        defaultValue: undefined
      }, {
        varName: 'referrerUrl',
        description: 'Widgets rarely use this as the majority are single page applications. This defaults to URL of the widget itself, but could be set to the hash or path of the previous view if needed.',
        omnitureVarName: 'c16',
        omnitureJsVarName: 'prop16',
        cdcVarName: 'referrerurl',
        defaultValue: location.host + location.pathname
      }, {
        varName: 'syndicationUrl',
        description: 'Url of the page which called the widget',
        omnitureVarName: 'c17',
        omnitureJsVarName: 'prop17',
        cdcVarName: 'c17',
        defaultValue: metricsManager.getCallParam('chost') + metricsManager.getCallParam('cpath')
      }, {
        varName: 'contentTitle',
        description: 'Content Title',
        omnitureVarName: 'pageName',
        omnitureJsVarName: 'pageName',
        cdcVarName: 'contenttitle',
        defaultValue: metricsManager.getCallParam('wn')
      }, {
        varName: 'contentChannel',
        description: 'Omniture channel',
        omnitureVarName: 'ch',
        omnitureJsVarName: 'ch',
        cdcVarName: 'channel',
        defaultValue: undefined
      }, {
        varName: 'feedName',
        description: '(Legacy Variable) Feed Name used as the source for the widget if applicable (No Default)',
        omnitureVarName: 'c47',
        omnitureJsVarName: 'prop47',
        cdcVarName: 'c47',
        defaultValue: undefined
      }, {
        varName: 'interactionType',
        description: 'Interaction Type (Separates Interaction Type from Interaction Value, Works in Conjunction with interactionValue',
        omnitureVarName: 'c33',
        omnitureJsVarName: 'prop33',
        cdcVarName: 'c33',
        defaultValue: undefined
      }, {
        varName: 'interactionValue',
        description: 'Interaction Value (Separates Interaction Type from Interaction Value, Works in Conjunction with interactionType',
        omnitureVarName: 'c14',
        omnitureJsVarName: 'prop14',
        cdcVarName: 'c14',
        defaultValue: undefined
      }],
      webPage: [{
        varName: 'productType',
        description: 'Use to indicate what type of product this is, such as \'Mobile App\', or \'Widget\', etc.',
        omnitureVarName: 'c8',
        omnitureJsVarName: 'prop8',
        cdcVarName: 'c8',
        defaultValue: function defaultValue(options) {
          return options.productType || 'webPage';
        }
      }, {
        varName: 'reportsuite',
        description: 'Used to set the report suite that traffic should be sent to',
        omnitureVarName: 'reportsuite',
        omnitureJsVarName: 'reportsuite',
        cdcVarName: 'reportsuite',
        defaultValue: 'devcdc'
      }, {
        varName: 'linkType',
        description: 'Omniture Specific Variable - Used in link tracking (AKA interaction tracking) | Types are: File Downloads=\'d\', translated to \'lnk_d\', Exit Links=\'e\', translated to \'lnk_e\', Custom Links=\'o\', which is translated to \'lnk_o\'',
        omnitureVarName: 'pe',
        omnitureJsVarName: 'pe',
        cdcVarName: 'pe',
        defaultValue: null
      }, {
        varName: 'linkName',
        description: 'Omniture Specific Variable - Used in link tracking (AKA interaction tracking) | This is the link or interaction name / short desc',
        omnitureVarName: 'pev2',
        omnitureJsVarName: 'pev2',
        cdcVarName: 'pev2',
        defaultValue: null
      }, {
        varName: 'pageName',
        description: 'Page Title',
        omnitureVarName: 'gn',
        omnitureJsVarName: 'pageName',
        cdcVarName: 'contenttitle',
        defaultValue: function defaultValue(options) {
          return 'undefined' !== typeof window.s && 'errorPage' === window.s.pageType ? null : 'undefined' !== typeof window.s && 'undefined' !== typeof window.s.pageName ? window.s.pageName : document.title;
        }
      }, {
        varName: 'channel',
        description: 'Used to the server of the calling page / resource',
        omnitureVarName: 'ch',
        omnitureJsVarName: 'channel',
        cdcVarName: 'channel',
        defaultValue: undefined
      }, {
        varName: 'server',
        description: 'Used to the server of the calling page / resource',
        omnitureVarName: 'server',
        omnitureJsVarName: 'server',
        cdcVarName: 'server',
        defaultValue: location.host.toLowerCase()
      }, {
        varName: 'pageType',
        description: 'Populate with \'errorPage\' on 404 pages ONLY.',
        omnitureVarName: 'pageType',
        omnitureJsVarName: 'pageType',
        cdcVarName: 'pageType',
        defaultValue: undefined
      }, {
        varName: 'keywords',
        description: 'Keywords (Internal)',
        omnitureVarName: 'c3',
        omnitureJsVarName: 'prop3',
        cdcVarName: 'c3',
        defaultValue: function () {
          var keywords = '';
          var metas = document.getElementsByTagName('meta');

          if (metas) {
            for (var x = 0, y = metas.length; x < y; x++) {
              if ('keywords' === metas[x].name.toLowerCase()) {
                keywords += metas[x].content;
              }
            }
          }

          return '' !== keywords ? keywords : false;
        }()
      }, {
        varName: 'contentLanguage',
        description: 'Content Language (Multilingual Content / Track pages viewed by language)',
        omnitureVarName: 'c5',
        omnitureJsVarName: 'prop5',
        cdcVarName: 'language',
        defaultValue: metricsManager.getLanguageDefault()
      }, {
        varName: 'contentLanguageByPage',
        description: 'Content Language by Page (Multilingual Content / Track pages viewed by language)',
        omnitureVarName: 'c6',
        omnitureJsVarName: 'prop6',
        cdcVarName: 'c6',
        defaultValue: undefined
      }, {
        varName: 'campaignTrackingId',
        description: 'Campaign Tracking Code ID',
        omnitureVarName: 'c15',
        omnitureJsVarName: 'prop15',
        cdcVarName: 'c15',
        defaultValue: metricsManager.getCallParam('cid')
      }, {
        varName: 'level1',
        description: 'Level 1',
        omnitureVarName: 'c22',
        omnitureJsVarName: 'prop22',
        cdcVarName: 'c22',
        defaultValue: undefined
      }, {
        varName: 'level2',
        description: 'Level 2',
        omnitureVarName: 'c23',
        omnitureJsVarName: 'prop23',
        cdcVarName: 'c23',
        defaultValue: undefined
      }, {
        varName: 'level3',
        description: 'Level 3',
        omnitureVarName: 'c24',
        omnitureJsVarName: 'prop24',
        cdcVarName: 'c24',
        defaultValue: undefined
      }, {
        varName: 'level4',
        description: 'Level 4',
        omnitureVarName: 'c25',
        omnitureJsVarName: 'prop25',
        cdcVarName: 'c25',
        defaultValue: undefined
      }, {
        varName: 'level5',
        description: 'Level 5',
        omnitureVarName: 'c43',
        omnitureJsVarName: 'prop43',
        cdcVarName: 'c43',
        defaultValue: undefined
      }, {
        varName: 'level6',
        description: 'Level 6',
        omnitureVarName: 'c44',
        omnitureJsVarName: 'prop44',
        cdcVarName: 'c44',
        defaultValue: undefined
      }, {
        varName: 'interactionType',
        description: 'Events / Interactions (Format is \'Type: Value)\'',
        omnitureVarName: 'c40',
        omnitureJsVarName: 'prop40',
        cdcVarName: 'c40',
        defaultValue: undefined
      }, {
        varName: 'application',
        description: 'Application Name (To Correlate with Interaction?)',
        omnitureVarName: 'c41',
        omnitureJsVarName: 'prop41',
        cdcVarName: 'c41',
        defaultValue: undefined
      }, {
        varName: 'appMeasurementVersion',
        description: 'App Measurement Version (Captures the current version of adobe code we are leveraging)',
        omnitureVarName: 'c53',
        omnitureJsVarName: 'prop53',
        cdcVarName: 'c53',
        defaultValue: location.host + location.pathname
      }, {
        varName: 'pageUrl',
        description: 'Page Url - Live Pages (v.2.0)',
        omnitureVarName: 'c54',
        omnitureJsVarName: 'prop54',
        cdcVarName: 'c54',
        defaultValue: location.host + location.pathname
      }, {
        varName: 'previousPageUrl',
        description: 'Previous Page Url',
        omnitureVarName: 'c55',
        omnitureJsVarName: 'prop55',
        cdcVarName: 'c55',
        defaultValue: document.referrer
      }, {
        varName: 'userAgentString',
        description: 'User Agent String',
        omnitureVarName: 'c60',
        omnitureJsVarName: 'prop60',
        cdcVarName: 'c60',
        defaultValue: navigator.userAgent
      }, {
        varName: 'campaignPathing',
        description: 'Path Name',
        omnitureVarName: 'c2',
        omnitureJsVarName: 'prop2',
        cdcVarName: 'documenttitle',
        defaultValue: window.location.href.toLowerCase()
      }, {
        varName: 'livePages',
        description: 'Live Pages (all versions) t26',
        omnitureVarName: 'c26',
        omnitureJsVarName: 'prop26',
        cdcVarName: 'documenttitle',
        defaultValue: document.title.toLowerCase()
      }, {
        varName: 'livePages2',
        description: 'Live Pages (v.2.0) t30',
        omnitureVarName: 'c30',
        omnitureJsVarName: 'prop30',
        cdcVarName: 'documenttitle',
        defaultValue: document.title.toLowerCase()
      }, {
        varName: 'livePages3',
        description: 'Live Pages URLs (all versions) t31',
        omnitureVarName: 'c31',
        omnitureJsVarName: 'prop31',
        cdcVarName: 'documenttitle',
        defaultValue: window.location.href.toLowerCase()
      }, {
        varName: 'livePages3',
        description: 'Page URLs(t46)',
        omnitureVarName: 'c46',
        omnitureJsVarName: 'prop46',
        cdcVarName: 'documenttitle',
        defaultValue: window.location.href.toLowerCase()
      }, {
        varName: 'Viewport',
        description: 'Viewport Name',
        omnitureVarName: 'c49',
        omnitureJsVarName: 'prop49',
        cdcVarName: 'prop49',
        defaultValue: undefined
      }]
    }; // RETURN COMMON WITH METRICS

    return metricsManager;
  }; // EXTEND COMMON OBJECT WITH METRICS HANDLER


  window.CDC.Common.metrics = window.CDC.Common.metrics || window.CDC.Common.getMetricsHandler();
})(window, document);
/*
s.pageName	Most Popular Pages, Pathing reports
s.channel	Most Popular Site Sections
-s.server	Most Popular Servers
s.pageType	Page Not Found
s.prop3	Keywords (Internal)
s.prop5	Multilingual Content
s.prop6	Multilingual Content by Page
s.prop8	Prop 8 Report
s.prop15	Campaign Tracking Code ID
s.prop22	Level 1
s.prop23	Level 2
s.prop24	Level 3
s.prop25	Level 4
s.prop34	Google Ranking
s.prop35	Traffic by Hour
s.prop36	Traffic by Day
s.prop39	Flash Version
s.prop40	Interactions
s.prop43	Level 5
s.prop44	Level 6
s.prop46	Most Popular URLs
s.prop47	Feed Name Clickthroughs
s.prop48	Original Search Page
s.prop49	Viewport
s.prop50	Custom Link Page Name
s.prop51
s.prop52	Quiz Results Returned
s.prop53	App Measurement Version
s.prop54	Page URL
s.prop55	Previous Page URL
s.prop56	Page Load Time
s.prop57	Visit Number
s.prop58	Days Since Last Visit
s.prop59	Percent of Page Viewed
s.prop60	User Agent String
s.prop61	Previous Page Name
s.prop62	Date Stamp
s.prop63	Internal Search Term
s.prop64
s.prop65
s.prop66
s.prop67
s.prop68
s.prop69
s.prop70
s.prop71
s.prop72
s.prop73	Page Path
s.prop74	Scenario
s.prop75	Test Version

*-s.prop41	Application
*s.prop1	Topic Segments
*-s.prop2	Campaign Pathing
*s.prop4	CIO
*s.prop7	Topic
*s.prop10	External URLs using CDC code
*s.prop11	CIO Level 1
*s.prop12	CIO Level 2
*s.prop13	CIO Level 3
*s.prop14	CIO Level 4
*s.prop16	Content Syndication
*s.prop17	Widget Syndication
*s.prop18	Respondent ID
*s.prop19	Survey Name
*s.prop26	Live Pages (all versions)
*-s.prop27	Widget Framework
*s.prop28	PHIL Images
*s.prop29	Live Pages (v.1.0)
*s.prop30	Live Pages (v.2.0)
*s.prop31	Live Pages URLs (all versions)
*s.prop37	Percentage of the Previous Page that the User Viewed
*s.prop38	Previous Page Value
*s.prop45	A-Z Entry
*/
'use strict';
/**
 * social-sharing.js
 * @fileOverview Contains the Social Page Sharing module
 * @version 0.2.0.0
 * @copyright 2021 Centers for Disease Control
 */

(function ($) {
  var isProd = !window.location.hostname.match(/local|vvv|dev|test|stage|prototype/);
  var title = [$('main h1:first').text(), String(document.title).replace(/\s\|.*/, '')].shift();
  var url = [$('head link[rel="canonical"]').attr('href'), document.location.href].shift(); // don't share non-prod urls, unless debugging

  url = isProd || CDC.Common.getParamSwitch('cdcdebug') ? url : 'https://www.cdc.gov';
  var props = {
    title: encodeURIComponent(title),
    url: encodeURIComponent(url)
  };
  var socialUrl = ''; // Facebook

  socialUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + props.url;
  $('.page-share-facebook').attr('href', socialUrl).on('click', function (e) {
    $(this).trigger('metrics-capture', ['social-media-share-facebook', 'click']);
    e.preventDefault();
  }); // Twitter

  socialUrl = 'http://twitter.com/share?url=' + props.url + '&text=' + props.title;
  $('.page-share-twitter').attr('href', socialUrl).on('click', function (e) {
    $(this).trigger('metrics-capture', ['social-media-share-twitter', 'click']);
    e.preventDefault();
  }); // LinkedIn

  socialUrl = 'https://www.linkedin.com/shareArticle?url=' + props.url + '&title=' + props.title;
  $('.page-share-linkedin').attr('href', socialUrl).on('click', function (e) {
    $(this).trigger('metrics-capture', ['social-media-share-linkedin', 'click']);
    e.preventDefault();
  });
})(jQuery);
'use strict';
/**
 * tp-social-media.js
 * @fileOverview Social Media Module
 * @copyright 2018 Centers for Disease Control
 * @version 0.2.0.0
 */

(function ($, window, document, undefined) {
  var pluginName = 'cdc_social_media',
      mediaId = '199',
      defaults = {
    urls: {
      podcast: "https://www2c.cdc.gov/podcasts/feed.asp?feedid=".concat(mediaId, "&format=jsonp"),
      cs: "https://tools.cdc.gov/api/v2/resources/media/".concat(mediaId, ".rss")
    }
  };

  function CDCPlugin(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  CDCPlugin.prototype = {
    init: function init() {
      //var defaults   = this._defaults,
      var t = this;
      t.parseAttributes(t);
    },
    parseAttributes: function parseAttributes(t) {
      var $parents = $('div[data-mediaid][data-url]'),
          feedUrl,
          parseFeed;
      $parents.each(function (i, e) {
        // Assign this parent for parse/append reference
        var $parent = $(e); // Set up an Options Obj from data-attrs

        var feedOptions = {
          mediaId: $(e).attr('data-mediaid'),
          entries: $(e).attr('data-entries'),
          header: $(e).attr('data-header'),
          title: $(e).attr('data-title'),
          url: $(e).attr('data-url'),
          cdcUrl: $(e).attr('data-cdc-url'),
          cdcTitle: $(e).attr('data-cdc-title')
        }; // Check media id to append correct feed endpoint (Podcast Url or CS Url)

        feedUrl = 1000 > parseInt(feedOptions.mediaId, 10) ? "https://www2c.cdc.gov/podcasts/feed.asp?feedid=".concat(feedOptions.mediaId) : "https://tools.cdc.gov/api/v2/resources/media/".concat(feedOptions.mediaId, ".rss"); // Check endpoint to parse correct social source (Facebook, Twitter)

        $.ajax({
          url: feedUrl,
          jsonp: 'callback',
          dataType: 'jsonp',
          data: {
            format: 'json'
          },
          success: function success(feed) {
            parseFeed = feed; // Is it a Facebook feed?

            if (parseFeed.hasOwnProperty('data')) {
              t.parseFacebook($parent, feed, feedOptions);
            } else if (parseFeed.hasOwnProperty('statuses')) {
              // Is it a Twitter feed?
              t.parseTwitter($parent, feed, feedOptions);
            } else {
              console.log('Cannot parse Social Media Feed!');
            }
          }
        });
      });
    },
    parseFacebook: function parseFacebook($parent, feed, feedOptions) {
      var t = this; // Regex for link styling

      var _urlExpression = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
          _mentionExpression = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/gim,
          _regex,
          _post; // Actual Markup of Component


      var wrapperMarkup = "\n\t\t\t\t<div class=\"cdc-mod cdc-socialMedia\">\n\t\t\t\t\t<div class=\"socialMediaFeeds mb-3 card col-md-12\">\n\n\t\t\t\t\t\t<div class=\"socl-hd card-header\">\n\t\t\t\t\t\t\t<span class=\"x24 float-left fill-tw cdc-icon-fb-round\"></span>\n\t\t\t\t\t\t\t<h4 class=\"float-left\">".concat(feedOptions.header, "</h4>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class=\"facebook-feed-entry card-body\">\n\n\t\t\t\t\t\t\t<div class=\"socl-loader-graphic\"></div>\n\t\t\t\t\t\t\t<div class=\"socl-bd\">\n\t\t\t\t\t\t\t\t<div class=\"socl-comment-wrap\">\n\t\t\t\t\t\t\t\t\t<div class=\"socl-avatar\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"socl-img\"></div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"socl-comment-text\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"feed-header\">\n\t\t\t\t\t\t\t\t\t\t\t<a href=\"").concat(feedOptions.url, "\">").concat(feedOptions.title, "</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class=\"card-footer\">\n\t\t\t\t\t\t\t<a class=\"td-ul td-ul-none-hover\" href=\"").concat(feedOptions.cdcUrl, "\">").concat(feedOptions.cdcTitle, "</a>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t"); // Append Dynamic Wrapper Markup

      $parent.append(wrapperMarkup); // Parse and Append Each "post"

      for (var i = 0; i < feed.data.length && i < feedOptions.entries; i++) {
        // Regex URLs
        _post = feed.data[i].message;
        _regex = new RegExp(_urlExpression);

        if (_post.match(_regex)) {
          _post = _post.replace(_regex, '<a href="$1">$1</a>');
        }

        var postMarkup = "\n\t\t\t\t\t<div class=\"post\">\n\t\t\t\t\t\t".concat(_post, "\n\t\t\t\t\t</div>"); // Prepend posts

        $($parent).find('.facebook-feed-entry .socl-comment-text').append(postMarkup);
      }
    },
    parseTwitter: function parseTwitter($parent, feed, feedOptions) {
      var t = this; // Regex for @mentions and link styling

      var _urlExpression = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
          _mentionExpression = /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/gim,
          _regex,
          _post; // Actual Markup of Component


      var wrapperMarkup = "\n\t\t\t\t<div class=\"cdc-mod cdc-socialMedia\">\n\t\t\t\t\t<div class=\"socialMediaFeeds mb-3 card col-md-12\">\n\n\t\t\t\t\t\t<div class=\"socl-hd card-header\">\n\t\t\t\t\t\t\t<span class=\"x24 float-left fill-fb cdc-icon-twitter-round\"></span>\n\t\t\t\t\t\t\t<h4 class=\"float-left\">".concat(feedOptions.header, "</h4>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class=\"twitter-feed-entry card-body\">\n\n\t\t\t\t\t\t\t<div class=\"socl-loader-graphic\"></div>\n\t\t\t\t\t\t\t<div class=\"socl-bd\">\n\t\t\t\t\t\t\t\t<div class=\"socl-comment-wrap\">\n\t\t\t\t\t\t\t\t\t<div class=\"socl-avatar\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"socl-img\"></div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"socl-comment-text\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"feed-header\">\n\t\t\t\t\t\t\t\t\t\t\t<a href=\"").concat(feedOptions.url, "\">").concat(feedOptions.title, "</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t<div class=\"card-footer\">\n\t\t\t\t\t\t\t<a class=\"td-ul td-ul-none-hover\" href=\"").concat(feedOptions.cdcUrl, "\">").concat(feedOptions.cdcTitle, "</a>\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t"); // Append Dynamic Wrapper Markup

      $parent.append(wrapperMarkup); // Regex for @mentions and link styling

      for (var i = 0; i < feed.statuses.length && i < feedOptions.entries; i++) {
        // if this is a retweet, use the retweet text and prepend the RT @ screenname
        if ('undefined' !== typeof feed.statuses[i].retweeted_status) {
          _post = 'RT @' + feed.statuses[i].retweeted_status.user.screen_name + ': ' + feed.statuses[i].retweeted_status.text;
        } else {
          _post = feed.statuses[i].text;
        }

        _regex = new RegExp(_urlExpression);

        if (_post.match(_regex)) {
          _post = _post.replace(_regex, '<a href="$1">$1</a>');
        } // Regex @Mentions


        _regex = new RegExp(_mentionExpression);

        if (_post.match(_regex)) {
          _post = _post.replace(_regex, ' <a href="https://twitter.com/$1">@$1</a> ');
        }

        var postMarkup = "\n\t\t\t\t\t<div class=\"post\">\n\t\t\t\t\t\t".concat(_post, "\n\t\t\t\t\t</div>"); // Prepend posts

        $($parent).find('.twitter-feed-entry .socl-comment-text').append(postMarkup);
      }
    }
  }; // don't let the plugin load multiple times

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new CDCPlugin(this, options));
      }
    });
  };
})(jQuery, window, document);
'use strict';
/**
 * tp-4th-level-nav.js
 * @fileOverview Contains module for 4th level nav controls
 * @version 0.2.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var pluginName = 'cdc_levelnav',
      defaults = {
    parent: null,
    toggle: true,
    navigationTitle: 'Related Pages',
    classes: ''
  },
      navOptions = {};
  var vps = ['unknown', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      vp = '',
      viewport;

  function CDCPlugin(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  CDCPlugin.prototype = {
    init: function init(options) {
      // Replacing references to window.pageOptions.navigation, instead, passing this in app init with the rest of the initializations
      navOptions = options || false; //var defaults = this._defaults;

      this.bindEvents();
      vp = window.CDC.tp4["public"].getViewport();
      viewport = vps.indexOf(vp);
      this.checkViewport(); // this.pullFourthLevelNavItems();

      var t = this;

      if (window.pageOptions.navigation.hasOwnProperty('showFourthLevel') && false === window.pageOptions.navigation.showFourthLevel) {
        $('.fourth-level-nav').remove();
        return false;
      } // Toggle once on load to make it start collapsed - doing this in a Bootstrap 4 friendly way


      if (window.pageOptions.navigation.hasOwnProperty('fourthLevelCollapsed') && true === window.pageOptions.navigation.fourthLevelCollapsed) {
        //$( '.card-header' ).attr('data-toggle', 'true');
        $('.tp-related-pages .collapse-link').trigger('click');
      }

      t.addFourthLevelTitle();
      t.addFourthLevelClasses();
    },
    addFourthLevelTitle: function addFourthLevelTitle() {
      var t = this,
          navigationTitle = t._defaults.navigationTitle;

      if (window.pageOptions.navigation.hasOwnProperty('fourthLevelNavTitle')) {
        navigationTitle = window.pageOptions.navigation.fourthLevelNavTitle;
        $('.fourth-level-nav .card-header .h4').text(navigationTitle);
      }
    },
    addFourthLevelClasses: function addFourthLevelClasses() {
      var t = this,
          classes = t._defaults.classes;

      if (window.pageOptions.navigation.hasOwnProperty('fourthLevelNavStyle')) {
        classes = window.pageOptions.navigation.fourthLevelNavStyle;
      } // $('.fourth-level-nav').addClass(classes);
      // Build Fourth Level after navOptions are set


      t.pullFourthLevelNavItems(classes);
    },
    bindEvents: function bindEvents() {
      var t = this;
      $(window).on('resize orientationchange', window.CDC.Common.debounce(function () {
        // 100% on L, XL, XXL
        // XS, S, M COLLAPSED
        vp = window.CDC.tp4["public"].getViewport();
        viewport = vps.indexOf(vp);
        t.checkViewport();
      }, 250));
      $('.collapse-link').on('click', function (e) {
        var leftOrBottom = -1 < $.inArray(CDC.tp4["public"].getViewport(), [1, 2, 3]) ? 'bottom' : 'left';
        $(this).trigger('metrics-capture', [leftOrBottom + '-nav-expand-collapse', $(this).parent('a').hasClass('nav-plus') ? 'expand' : 'collapse']);
        t.togglePlusMinus($(this));
      });
    },
    togglePlusMinus: function togglePlusMinus(element) {
      //https://websupport.cdc.gov/browse/WCMSRD-6193
      // element.text( element.text() == 'show' ? 'hide' : 'show' );
      var iconMinus = 'M19,13H5V11H19V13Z';
      var iconPlus = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';

      if (element.hasClass('nav-plus')) {
        element.removeClass('nav-plus').addClass('nav-minus');
        element.find('.cdc-icon-plus').css('transform', 'rotate(-180deg)').removeClass('cdc-icon-plus').addClass('cdc-icon-minus');
        element.find('svg title').text('collapse');
        element.find('svg path').attr('d', iconMinus);
        element.find('title').text('collapse');
      } else if (element.hasClass('nav-minus')) {
        element.removeClass('nav-minus').addClass('nav-plus');
        element.find('.cdc-icon-minus').css('transform', 'rotate(0deg)').removeClass('cdc-icon-minus').addClass('cdc-icon-plus');
        element.find('svg title').text('expand');
        element.find('svg path').attr('d', iconPlus);
        element.find('title').text('plus');
      }
    },
    pullFourthLevelNavItems: function pullFourthLevelNavItems(classes) {
      classes = classes ? String(classes) : 'block-list';
      var $nav = $('ul.tp-nav-main:first'),
          path = CDC.parseUrl(CDC.cleanUrl(window.location.href)).pathname,
          $currentLink = $nav.find('a[href="' + path + '"]'),
          $currentNav,
          fourthListType = -1 < classes.indexOf('ordered-list') ? 'ol' : 'ul'; // if not found exit

      if (!$currentLink.length) {
        return;
      }

      $currentNav = $currentLink.parents('li').first();

      if ($currentNav.hasClass('nav-lvl3') || $currentNav.hasClass('nav-lvl4')) {
        if ($currentNav.hasClass('nav-lvl4')) {
          $currentLink = $currentLink.parents('li.nav-lvl4').first();
          $currentLink.parents('.nav-lvl3').first().addClass('selected');
        }

        var $fourthLevelItems = $currentLink.parents('li').first().children('ul').children('li');
        $fourthLevelItems = $fourthLevelItems.clone();
        $fourthLevelItems.removeClass('list-group-item');

        if ($fourthLevelItems.length) {
          $('.fourth-level-nav').removeClass('d-none');
        }

        var target = $('.fourth-level-nav .card-body');

        if (5 < $fourthLevelItems.length) {
          classes += ' cc-md-2 lsp-out';
        }

        $('<' + fourthListType + '/>', {
          "class": classes
        }).appendTo(target);
        $('.fourth-level-nav ' + fourthListType).append($fourthLevelItems);
      }
    },
    checkViewport: function checkViewport() {
      vp = window.CDC.tp4["public"].getViewport();
      viewport = vps.indexOf(vps[vp]);
      var iconMinus = 'M19,13H5V11H19V13Z';
      var iconPlus = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';

      if (4 > viewport) {
        $('.tp-related-pages .collapse').removeClass('show').addClass('hide');

        if ($('.tp-related-pages .collapse-link').length) {
          var plusIconElement = $('.tp-related-pages .collapse-link');
          plusIconElement.removeClass('nav-minus').addClass('nav-plus');
          plusIconElement.find('.cdc-icon-minus').css('transform', 'rotate(0deg)').removeClass('cdc-icon-minus').addClass('cdc-icon-plus');
          plusIconElement.find('svg title').text('expand');
          plusIconElement.find('svg path').attr('d', iconPlus);
          plusIconElement.find('title').text('plus'); // $('.tp-related-pages .collapse-link').text( $('.tp-related-pages .collapse-link').text() == 'show' ? 'hide' : 'hide' );
        }
      } else {
        $('.tp-related-pages .collapse').removeClass('hide').addClass('show');

        if ($('.tp-related-pages .collapse-link').length) {
          var minusIconElement = $('.tp-related-pages .collapse-link');
          minusIconElement.removeClass('nav-plus').addClass('nav-minus');
          minusIconElement.find('.cdc-icon-plus').css('transform', 'rotate(-180deg)').removeClass('cdc-icon-plus').addClass('cdc-icon-minus');
          minusIconElement.find('svg title').text('collapse');
          minusIconElement.find('svg path').attr('d', iconMinus);
          minusIconElement.find('title').text('minus'); // $('.tp-related-pages .collapse-link').text( $('.tp-related-pages .collapse-link').text() == 'hide' ? 'show' : 'show' );
        }
      }
    }
  }; // don't let the plugin load multiple times

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new CDCPlugin(this, options));
      }
    });
  };
})(jQuery, window, document);
'use strict';
/**
 * audio.js
 * @fileOverview Event handling for the HTML5 audio control
 * @version 0.4.0.1
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var pluginName = 'audioly',
      defaults = {
    element: ''
  },
      vps = ['unknown', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      vp = '',
      viewport;

  function CDCPlugin(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options); //this._defaults = defaults;

    this._name = pluginName;
    this.container = $(this.element).closest('.audio-container');
    this.scrubber = this.container.find('.scrub-range-slider');
    this.playbutton = this.container.find('.btn-play');
    this.stopButton = this.container.find('.btn-stop');
    this.restartButon = this.container.find('.btn-restart');
    this.back5Button = this.container.find('.btn-back-5');
    this.forward5Button = this.container.find('.btn-forward-5');
    this.back1Button = this.container.find('.btn-back-1');
    this.forward1Button = this.container.find('.btn-forward-1');
    this.volumeUpButton = this.container.find('.btn-volume-up');
    this.volumeDownButton = this.container.find('.btn-volume-down');
    this.volumeToggleButton = this.container.find('.btn-volume-toggle');
    this.volumeRangeSlider = this.container.find('.volume-range-slider');
    this.init();
  }

  CDCPlugin.prototype = {
    init: function init() {
      this.options.status = 0;
      this.options.isPlaying = false;
      this.bindControls();
      this.bindEvents();
      vp = window.CDC.tp4["public"].getViewport();
      viewport = vps.indexOf(vp);
      this.checkViewport();
      this.identifier = Math.floor(Math.random() * (1000000 - 1)) + 1;
    },
    reset: function reset() {
      var t = this;
      this.element.addEventListener('timeupdate', function (e) {
        var currentTime = e.target.currentTime,
            duration = e.target.duration;
        t.scrubber.val(currentTime);
        t.scrubber.attr('max', duration);
      });
    },
    bindEvents: function bindEvents() {
      var t = this;
      $(window).on('resize orientationchange', window.CDC.Common.debounce(function () {
        vp = window.CDC.tp4["public"].getViewport();
        t.checkViewport();
      }, 250));
      t.element.addEventListener('timeupdate', function (e) {
        var currentTime = e.target.currentTime,
            duration = e.target.duration;
        t.scrubber.val(currentTime);
        t.scrubber.attr('max', duration);
      });
    },
    checkViewport: function checkViewport() {
      this.reset();
    },
    bindControls: function bindControls() {
      var isDragging = false,
          isMute = false,
          curVol = 0.5,
          $audio,
          self = this;
      self.playbutton.on('click', function () {
        if (self.options.isPlaying) {
          self.pause();
        } else {
          self.play();
        }
      });
      self.stopButton.on('click', function () {
        self.stop();
      });
      self.restartButon.on('click', function () {
        self.skip(0);
      });
      self.back5Button.on('click', function () {
        self.skip(self.element.currentTime - 5);
      });
      self.forward5Button.on('click', function () {
        self.skip(self.element.currentTime + 5);
      });
      self.back1Button.on('click', function () {
        self.skip(self.element.currentTime + 1);
      });
      self.forward1Button.on('click', function () {
        self.skip(self.element.currentTime + 1);
      });
      self.volumeUpButton.on('click', function () {
        self.volume('up');
      });
      self.volumeDownButton.on('click', function () {
        self.volume('down');
      });
      self.volumeToggleButton.on('click', function () {
        if (!isMute) {
          self.element.volume = 0;
          $(this).find('.fi').removeClass('cdc-icon-volume').addClass('cdc-icon-volume-mute');
        } else {
          self.element.volume = curVol;
          $(this).find('.fi').removeClass('cdc-icon-volume-mute').addClass('cdc-icon-volume');
        }

        isMute = !isMute;
      });
      self.volumeRangeSlider.on('change', function () {
        self.element.volume = $(this).val() / 10;
        curVol = $(this).val() / 10;
      });
      self.scrubber.on('mousedown', function () {
        isDragging = false;
      }).on('mousemove', function () {
        isDragging = true; // pause
      }).on('mouseup', function () {
        var wasDragging = isDragging;
        isDragging = false;

        if (!wasDragging) {// console.log( 'stopped dragging' );
        }

        self.skip($(this).val());
      });
    },
    play: function play() {
      //Stop other players first
      var otherAudio = $(document).find('audio').not(this.element);
      $(otherAudio).each(function () {
        var instance = $(this).data('plugin_audioly');
        instance.pause();
        instance.options.isPlaying = false;
      });
      this.element.play();
      this.playbutton.find('.fi').removeClass('cdc-icon-cdc-play').addClass('cdc-icon-pause');
      this.options.isPlaying = true;
    },
    pause: function pause() {
      this.element.pause();
      this.options.isPlaying = false;
      this.container.find('.fi').removeClass('cdc-icon-pause').addClass('cdc-icon-cdc-play');
    },
    stop: function stop() {
      this.element.pause();
      this.element.currentTime = 0;
      this.playbutton.find('.fi').removeClass('cdc-icon-pause').addClass('cdc-icon-cdc-play');
      this.options.status = 0;
      this.options.isPlaying = false;
    },
    skip: function skip(time) {
      this.element.currentTime = Math.round(time).toString();
    },
    volume: function volume(direction) {
      var volume = this.options.element.volume;

      if ('up' === direction) {
        if (1 <= Math.round(10 * volume) / 10) {
          this.options.element.volume = 1;
        } else {
          this.options.element.volume += 0.1;
        }
      } else if (0 >= Math.round(10 * volume) / 10) {
        this.options.element.volume = 0;
      } else {
        this.options.element.volume -= 0.1;
      }
    }
  }; // don't let the plugin load multiple times

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new CDCPlugin(this, options));
      }
    });
  };
})(jQuery, window, document);
'use strict';
/**
 * tp-badges.js
 * @fileOverview Contains badge code.
 * @version 0.1.0.0
 * @copyright 2021 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var badges = document.querySelectorAll('[data-cdc-datetime]');

  for (var i = 0; i < badges.length; i++) {
    var t = badges[i],
        sd = badges[i].getAttribute('data-cdc-datetime'),
        td = new Date(); // minor date validation

    var isDate = function isDate(date) {
      return 'Invalid Date' !== new Date(date) && !isNaN(new Date(date));
    };

    if (isDate(sd)) {
      var sdObj = new Date(sd);
      var twoWeeksOut = new Date(sd);
      twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);

      if (sdObj <= td && td < twoWeeksOut) {
        t.classList.remove('d-none');
      }
    }
  }
})(jQuery, window, document);
'use strict';
/**
 * tp-carousel.js
 * @fileOverview Wrapper for slick-slider.js which encapsulates TP4 business logic and implements slick based on those rules; additionally simplifying markup across slider types by normalizing with data attributes, etc.
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function ($, window, document, undefined) {
  var initLimit = 6,
      // Max Number of sliders which will be initialized on a page (at a time at least, per call to $('.selector').cdcCarousel('init'));
  methods = {},
      privateMethods = {},
      maxScreenWidth = Math.max(window.screen.width, window.innerWidth),
      loggingEnabled = false,
      globalListenersSet = false,
      lessThanBreakPoint = 992,
      bodyElement = $('body');

  privateMethods.initGlobalListeners = function () {
    if (!globalListenersSet) {
      globalListenersSet = true; // Auto Expand/collapse captions on resize

      bodyElement.on('click', '.caption-toggle', function (e) {
        e.preventDefault();
        methods.log('slider.logic.trace.caption-toggle-click');
        var $this = $(this),
            $currentSlider = $this.hasClass('slick-slider') ? $this : $this.parents('.slick-slider').first(); // Handle direct and indirect selection

        $currentSlider.cdcCarousel('captionToggle');
        return false;
      }); // Capture interaction metrics for slick sliders

      bodyElement.on('click', '.caption-toggle', function (e) {
        if ('true' === $(this).attr('aria-expanded')) {
          $(this).trigger('metrics-capture', ['caption-toggle', 'open']);
        } else {
          $(this).trigger('metrics-capture', ['caption-toggle', 'close']);
        }
      });

      var sliderWidth,
          swipeStartX,
          swipeEndX,
          swipeDirection,
          sliderImages = document.querySelectorAll('.slide-content img'),
          setSwipeStartX = function setSwipeStartX(e) {
        var isTouchSwipe = Boolean(e.touches);
        swipeStartX = isTouchSwipe ? e.touches[0].clientX : e.clientX;
      },
          setSwipeEndX = function setSwipeEndX(e) {
        var isTouchSwipe = Boolean(e.changedTouches);
        swipeEndX = isTouchSwipe ? e.changedTouches[0].clientX : e.clientX;
      },
          getSwipeDirection = function getSwipeDirection(e) {
        var swipeOrDrag = e.changedTouches ? 'swipe' : 'mousedrag';
        swipeDirection = 'swipe threshold unmet';
        var $thisSlider = $(e.currentTarget).closest('[data-cdc-slider].slick-initialized'),
            thisSlider = $thisSlider[0],
            touchThreshold = thisSlider.slick.touchThreshold ? thisSlider.slick.touchThreshold : thisSlider.slick.defaults.touchThreshold;
        sliderWidth = thisSlider.clientWidth;
        var touchThresholdWidth = 1 / touchThreshold * sliderWidth;

        if (swipeStartX - swipeEndX >= touchThresholdWidth) {
          swipeDirection = 'swipeLeft';
          $(e.currentTarget).trigger('metrics-capture', ['slider-next', swipeOrDrag]);
        }

        if (swipeEndX - swipeStartX >= touchThresholdWidth) {
          swipeDirection = 'swipeRight';
          $(e.currentTarget).trigger('metrics-capture', ['slider-previous', swipeOrDrag]);
        } // console.log('swipeDirection:', swipeDirection);

      };

      $.each(sliderImages, function () {
        $(this).on('touchstart', setSwipeStartX, false);
      });
      $.each(sliderImages, function () {
        $(this).on('touchend', function (e) {
          setSwipeEndX(e);
          getSwipeDirection(e);
        }, false);
      }); // end touchscreen swipe events
      // capture metrics for mouse drag swipes

      $.each(sliderImages, function () {
        $(this).on('mousedown', setSwipeStartX, false);
      });
      $.each(sliderImages, function () {
        $(this).on('mouseup', function (e) {
          setSwipeEndX(e);
          getSwipeDirection(e);
        }, false);
      });
      bodyElement.on('click', '.slick-next', function (e) {
        $(this).trigger('metrics-capture', ['slider-next', 'click']);
      });
      bodyElement.on('click', '.slick-prev', function (e) {
        $(this).trigger('metrics-capture', ['slider-previous', 'click']);
      });
      bodyElement.on('click', '.slick-dots button', function (e) {
        $(this).trigger('metrics-capture', ['slider-bottom-buttons', 'click']);
      }); // Open video directly on smaller screens (vs. inside of a modal)

      bodyElement.on('click', '[data-target-type]', function (e) {
        var $thisLink = $(this);
        methods.log('slider.logic.trace.data-target-type.click', maxScreenWidth);

        if (maxScreenWidth < lessThanBreakPoint && 'video' === $thisLink.attr('data-target-type')) {
          e.preventDefault();
          window.location = $thisLink.attr('href'); // TODO? Log metrics?

          return false;
        }
      }); // the images will resize, so keep them normalized when that happens

      $(window).on('resize orientationchange', window.CDC.Common.debounce(function () {
        methods.log('slider.logic.trace.resize-orientationchange');
        $('[data-cdc-slider].slick-initialized').cdcCarousel('redraw');
        return true;
      }, 200));
    }

    return globalListenersSet;
  };

  methods.autoSetArrowTop = function (e) {
    methods.log('slider.logic.trace.data-arrow-position.start', 'enabled');
    this.each(function (index) {
      var $currentSlider = $(this),
          currentSlide,
          $currSlide,
          topValue = '50%',
          arrowPosition = $currentSlider.attr('data-arrow-position');

      if (arrowPosition && arrowPosition.length) {
        methods.log('slider.logic.trace.autoSetArrowTop', index, $currentSlider, 'data-arrow-position:' + arrowPosition);
        currentSlide = $currentSlider.slick('slickCurrentSlide');
        $currSlide = $('.slide-content', $currentSlider).eq(currentSlide + 1);

        switch (arrowPosition) {
          case 'fixed':
            methods.log('slider.logic.trace.data-arrow-position', 'mobile-view-managed:fixed', $currSlide);
            topValue = '60px';
            break;

          case 'image-middle':
            methods.log('slider.logic.trace.data-arrow-position', 'mobile-view-managed:image-middle', $currSlide);
            topValue = Math.ceil($currSlide.height() / 2);
            break;

          case 'shortest-image-middle':
            methods.log('slider.logic.trace.data-arrow-position', 'mobile-view-managed:shortest-image-middle', $currSlide);
            topValue = Math.ceil($currentSlider.find('.slide-content img.shortest').height() / 2);
            break;

          case 'tallest-image-middle':
            methods.log('slider.logic.trace.data-arrow-position', 'mobile-view-managed:tallest-image-middle', $currSlide);
            topValue = Math.ceil($currentSlider.find('.slide-content img.tallest').height() / 2);
            break;

          default:
            methods.log('slider.logic.trace.data-arrow-position', 'mobile-view-managed:fixed', $currSlide);
            topValue = '60px';
        }

        $currentSlider.find('.slick-arrow').css('top', topValue);
      } else {
        methods.log('slider.logic.trace.data-arrow-position', 'disabled');
      }
    });
    methods.log('slider.logic.trace.data-arrow-position.end');
    return this;
  };

  methods.captionToggle = function () {
    this.each(function () {
      var $currentSlider = $(this);
      methods.log('slider.logic.trace.captionToggle', $currentSlider); // Cleanup aria attributes after toggle

      $('a.caption-toggle', $currentSlider).attr('aria-expanded', $currentSlider.toggleClass('expand-captions').hasClass('expand-captions'));
    });
    this.cdcCarousel('redraw');
    return this;
  };

  methods.clearHeights = function () {
    this.each(function () {
      var $currentSlider = $(this);
      methods.log('slider.logic.trace.clearHeights', $currentSlider);

      if ('true' === $currentSlider.attr('data-equalize-images')) {
        $currentSlider.find('.slide-content img').height('auto');
      }

      if ('thumbnail-slider' === $currentSlider.attr('data-cdc-slider')) {
        // Thumbnail Sliders
        $currentSlider.find('.slide-content h3, .slide-caption-content, .slide-caption-icon-container, .slide-caption').height('auto');
      } // RESET ALL HEIGHTS


      $currentSlider.find('.slick-track, .slick-slide, .slide-content').height('auto');
    });
    return this;
  };

  methods.equalizeHeight = function (strictMin, strictMax) {
    strictMin = strictMin || 0;
    strictMax = strictMax || 9999999;
    var maxHeight = strictMin; //alert(maxHeight + "|" + this.length);

    methods.log('equalizeHeight selection', this);
    this.each(function () {
      var thisHeight = $(this).height();

      if (thisHeight > maxHeight) {
        if (thisHeight <= strictMax) {
          maxHeight = thisHeight;
        } else {
          maxHeight = strictMax;
        }
      }
    });
    return this.each(function () {
      var $this = $(this);
      $this.height(maxHeight);
    });
  };

  methods.iconPaddingFix = function () {
    // Loop Sliders
    this.each(function () {
      var $thisSlider = $(this); // Loop Slides

      $thisSlider.find('.slide-caption-icon-container').each(function () {
        // Fix Classes as needed
        $(this).parents('.slide-caption').addClass('slide-caption-has-icon');
      });
    });
    return this;
  };

  methods.init = function (defaultOverrides) {
    defaultOverrides = defaultOverrides || {};
    var objDefaults = {
      prevArrow: defaultOverrides.prevArrow || '<button type="button" class="slick-prev rounded-circle">Previous <span class="fi cdc-icon-prev" aria-hidden="true"></span></button>',
      nextArrow: defaultOverrides.nextArrow || '<button type="button" class="slick-next rounded-circle">Next <span class="fi cdc-icon-next" aria-hidden="true"></span></button>',
      largerViews: {
        slidesToShow: defaultOverrides.largerViews && defaultOverrides.largerViews.slidesToShow ? defaultOverrides.largerViews.slidesToShow : 4,
        slidesToScroll: defaultOverrides.largerViews && defaultOverrides.largerViews.slidesToScroll ? defaultOverrides.largerViews.slidesToScroll : 4,
        overlayDescriptions: defaultOverrides.largerViews && defaultOverrides.largerViews.overlayDescriptions ? defaultOverrides.largerViews.overlayDescriptions : true
      },
      smallerViews: {
        slidesToShow: defaultOverrides.smallerViews && defaultOverrides.smallerViews.slidesToShow ? defaultOverrides.smallerViews.slidesToShow : 1,
        slidesToScroll: defaultOverrides.smallerViews && defaultOverrides.smallerViews.slidesToScroll ? defaultOverrides.smallerViews.slidesToScroll : 1
      },
      multiSlider: defaultOverrides.multiSlider || true
    }; // Initialize Global Event Handlers / Listeners

    privateMethods.initGlobalListeners.call(this); // Pre-processing

    this.each(function (index) {
      // Do not allow initializing more than x sliders (good practice and performance based limit)
      if (index + 1 >= initLimit) {
        return this;
      }

      methods.log('slider.logic.trace.pre-processing');
      var $slider = $(this),
          // Get this element as $slider
      thisSliderId = $slider.attr('id') || 'tp-slider-' + index + 1; // Use Current or Generate an ID if none exists...
      // Set this sliders responsive breakpoint

      $slider.cdcCarousel('iconPaddingFix').cdcCarousel('initRespondToData').cdcCarousel('setMobileView');

      if (!$slider.hasClass('slick-initialized')) {
        // Set the ID of the slider
        $slider.attr('id', thisSliderId); // Set larger viewport display options

        var largerViews = {
          slidesToShow: $slider.attr('data-slides-to-show') ? parseInt($slider.attr('data-slides-to-show')) : objDefaults.largerViews.slidesToShow,
          slidesToScroll: $slider.attr('data-slides-to-scroll') ? parseInt($slider.attr('data-slides-to-scroll')) : objDefaults.largerViews.slidesToScroll,
          overlayDescriptions: $slider.attr('data-larger-overlay-description') ? 'true' === $slider.attr('data-larger-overlay-description') : objDefaults.largerViews.overlayDescriptions
        },
            // Set smaller viewport display options
        smallerViews = {
          slidesToShow: $slider.attr('data-smaller-slides-to-show') ? parseInt($slider.attr('data-smaller-slides-to-show')) : objDefaults.smallerViews.slidesToShow,
          slidesToScroll: $slider.attr('data-smaller-slides-to-scroll') ? parseInt($slider.attr('data-smaller-slides-to-scroll')) : objDefaults.smallerViews.slidesToScroll
        },
            // Set multi-slider mode
        sliderMode = $slider.attr('data-cdc-slider') ? $slider.attr('data-cdc-slider') : 'standard-slider',
            // Get mobile mode
        isMobileMode = $slider.hasClass('mobile-view'),
            // Get the slides in this $slider as $slides
        $slides = $('> div', $slider); // Determine shortest and tallest images, set respective classes on each

        $slides.find('img').cdcCarousel('shortestTallest'); // TODO Disable overlay ... this could be CSSd by attribute... vs addClass...

        if (!largerViews.overlayDescriptions) {
          $slider.addClass('description-overlay-off');
        } // Loop the slider, set the pagination data attribute for each


        $slides.each(function (slideindex) {
          var $currSlide = $(this),
              $slideH3 = $('h3', $currSlide),
              $slideCaptionContent = $currSlide.find('.slide-caption-content'),
              slideNumber = slideindex + 1,
              sliderCaptionId = thisSliderId + '-caption-' + slideNumber,
              linkWrap = '',
              ariaExpanded,
              collapseClass,
              h3Contents,
              hasTitle = $currSlide.find('.slide-caption').attr('data-has-title'),
              hasCaption = $currSlide.find('.slide-caption').attr('data-has-caption');

          if (isMobileMode) {
            ariaExpanded = 'false';
            collapseClass = 'collapse';
          } else {
            ariaExpanded = 'true';
            collapseClass = 'collapse show';
          }

          if ($currSlide.attr('data-modal-id')) {
            var targetType = $currSlide.attr('data-target-type') ? $currSlide.attr('data-target-type') : 'html'; // Propagate target-type to link for onclick behavior

            linkWrap = '<a data-toggle="modal" data-target-type="' + targetType + '" data-target="#' + $currSlide.attr('data-modal-id') + '" role="button" aria-expanded="' + ariaExpanded + '" aria-controls="' + sliderCaptionId + '" href="' + $currSlide.attr('data-target') + '"></a>';
          } else if ($currSlide.attr('data-target')) {
            // WCMSRD-6336: If link to a file, add target=new.
            var $found = $currSlide.find('.file-details').length;

            if (0 < $found) {
              linkWrap = '<a href="' + $currSlide.attr('data-target') + '" target="new"></a>';
            } else {
              linkWrap = '<a href="' + $currSlide.attr('data-target') + '"></a>';
            }
          }

          if (linkWrap.length) {
            $('.slide-content, .slide-caption-content', $currSlide).wrap(linkWrap);
          } // Update caption header


          h3Contents = '' === $slideH3.html() ? ' ' : $slideH3.html(); //make title smaller

          $slideH3.addClass('h4'); // Add paging text data attribute

          $slideH3.attr('data-slide-page-text', slideNumber + ' of ' + $slides.length); // Update contents to include link wrap (so clicking h3 will activate target)

          if ('' === linkWrap) {
            $slideH3.html(h3Contents);
          } else {
            $slideH3.html($(linkWrap).append(h3Contents));
          } // Is there a caption to expand / collapse?


          if ($slideCaptionContent.length && !$slideCaptionContent.is(':empty') && 'true' === hasCaption) {
            // Add caption toggle element
            $slideH3.append('<a class="float-right caption-toggle" href="#' + thisSliderId + '" role="button" aria-expanded="' + ariaExpanded + '" aria-controls="' + sliderCaptionId + '"><svg class="plus" viewBox="0 0 24 24"><title>expand</title><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"></path></svg><svg class="minus" viewBox="0 0 24 24"><title>collapse</title><path d="M19,13H5V11H19V13Z"></path></svg></a>');
          } //don't show the overlay caption on desktop if no title or caption


          if ('false' === hasTitle && 'false' === hasCaption) {
            $currSlide.find('.slide-caption').addClass('d-lg-none');
          } //also if no title then remove the pipe after the number of slides on mobile


          if ('false' === hasTitle) {
            $slideH3.addClass('no-title');
          } // Add ID and toggle class to caption content for toggle purposes


          $slideCaptionContent.attr('id', sliderCaptionId).addClass(collapseClass);
        }); // Setup on init listener

        $slider.on('init', function ()
        /* event, slick */
        {
          methods.log('slider.logic.trace.carousel-init'); // Thread this to allow the slick slider time to finish initialize
          // If not done, a race condition ensues which wrecks this process...

          window.setTimeout(function () {
            $slider.cdcCarousel('redraw');
          }, 0);
        }); // Stops videos from playing on close

        $('.modal-video-container [data-dismiss="modal"]').on('click', function () {
          $(this).parents('.modal').find('.modal-body iframe').each(function () {
            this.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
          });
        }); // Setup after change listener

        $slider.on('afterChange', function ()
        /* event, slick */
        {
          methods.log('slider.logic.trace.carousel-afterChange');
          $slider.cdcCarousel('autoSetArrowTop');
        }); // Save View Changes to element

        $slider.data('lvSlidesToShow', largerViews.slidesToShow);
        $slider.data('lvSlidesToScroll', largerViews.slidesToScroll);
        $slider.data('svSlidesToShow', smallerViews.slidesToShow);
        $slider.data('svSlidesToScroll', smallerViews.slidesToScroll); // Handle Slick Initialization by Slider Mode

        switch (sliderMode.toLowerCase()) {
          case 'carousel-slider':
            methods.log('slider.logic.trace.carousel-slider'); // Yes, create the navigational thumbnail slider

            var thisNavSliderId = 'tp-nav-slider-' + index + 1,
                $sliderNav = $slider.clone().addClass('slider-nav').attr('id', thisNavSliderId).cdcCarousel('initRespondToData'); // Clear unnecessary ids from slide captions

            $sliderNav.find('.slide-caption-content').removeAttr('id'); // Insert it directly after the main/regular $slider

            $slider.after($sliderNav).addClass('slider-for').slick({
              // Default for all viewports
              adaptiveHeight: $slider.attr('data-adaptive-height') ? 'true' === $slider.attr('data-adaptive-height') : false,
              arrows: false,
              //asNavFor: '#' + thisNavSliderId,
              infinite: $slider.attr('data-scroll-infinite') ? 'true' === $slider.attr('data-scroll-infinite') : true,
              lazyLoad: 'progressive',
              slidesToShow: 1,
              slidesToScroll: 1,
              prevArrow: objDefaults.prevArrow,
              nextArrow: objDefaults.nextArrow
            }); // On before slide change

            $sliderNav.on('init', function ()
            /*event, slick, currentSlide, nextSlide*/
            {
              // Are we initialized?
              if ($sliderNav.hasClass('slick-initialized')) {
                // Setup Thumbnail slider click behavior
                $('.slick-slide a', $sliderNav).off('click').click(function (e) {
                  e.preventDefault();
                  var slideno = $(this).parents('.slick-slide').first().attr('data-slick-index');
                  $slider.slick('slickGoTo', slideno);
                  $(this).trigger('metrics-capture', ['carousel-thumbnail-image', 'click', false]);
                  return false;
                });
                $('.slider-nav a').click(function (e) {
                  e.preventDefault();
                });
                window.setTimeout(function () {
                  $sliderNav.cdcCarousel('redraw');
                }, 0);
              }
            });
            $sliderNav.slick({
              lazyLoad: 'progressive',
              slidesToShow: largerViews.slidesToShow,
              slidesToScroll: largerViews.slidesToScroll,
              adaptiveHeight: $slider.attr('data-adaptive-height') ? 'true' === $slider.attr('data-adaptive-height') : false,
              arrows: $slider.attr('data-smaller-show-arrows') ? 'true' === $slider.attr('data-smaller-show-arrows') : true,
              dots: true,
              infinite: $slider.attr('data-scroll-infinite') ? 'true' === $slider.attr('data-scroll-infinite') : true,
              centerMode: $slider.attr('data-center-mode') ? 'true' === $slider.attr('data-center-mode') : false,

              /* Commenting this out prevents the main slider image from changing when the thumbnail slider is paged left and right.
              This is consitent with the TP3 functionality. That said, we are keeping the sync from parent to child which allows for
              syncing when the top slider is swiped left or right
              asNavFor: '#' + thisSliderId,
              */
              prevArrow: objDefaults.prevArrow,
              nextArrow: objDefaults.nextArrow
            });
            var checkSlides = parseInt($sliderNav.find('.slick-track .slick-slide').length);

            if (checkSlides === parseInt(largerViews.slidesToShow)) {
              $sliderNav.slick('slickSetOption', 'dots', 'false');
            } //THIS REMOVES ARIA-DESCRIBEDBY TO AVOID 508 ISSUES


            $sliderNav.children('.slick-list').children('.slick-track').children().each(function () {
              var $currentSlide = $(this);

              if (_typeof(undefined) !== _typeof($currentSlide.attr('aria-describedby')) && false !== $currentSlide.attr('aria-describedby')) {
                $currentSlide.removeAttr('aria-describedby');
              }
            });
            break;

          case 'thumbnail-slider':
            methods.log('slider.logic.trace.thumbnail-slider', largerViews.slidesToShow);
            $slider.addClass('slider-for').slick({
              // Default for all viewports
              lazyLoad: 'progressive',
              dots: true,
              slidesToShow: largerViews.slidesToShow,
              slidesToScroll: largerViews.slidesToScroll,
              adaptiveHeight: $slider.attr('data-adaptive-height') ? 'true' === $slider.attr('data-adaptive-height') : false,
              arrows: $slider.attr('data-larger-show-arrows') ? 'true' === $slider.attr('data-larger-show-arrows') : true,
              prevArrow: objDefaults.prevArrow,
              nextArrow: objDefaults.nextArrow,
              infinite: $slider.attr('data-scroll-infinite') ? 'true' === $slider.attr('data-scroll-infinite') : true,
              centerMode: $slider.attr('data-center-mode') ? 'true' === $slider.attr('data-center-mode') : false,
              customPaging: function customPaging(slick) {
                // Get Current Slide
                var currentSlide = slick.slickCurrentSlide() + 1;
                var slidesCount = slick.slideCount; // Insert Slide Count to Page
                // Update Slider on Change

                $('.slider-for').on('init', function (event) {
                  $('.slider-count .slider-count-text').html("".concat(currentSlide, " / ").concat(slidesCount));
                });
                $('.slider-for').on('afterChange', function (event) {
                  currentSlide = slick.slickCurrentSlide();
                  $('.slider-count .slider-count-text').html("".concat(currentSlide + 1, " / ").concat(slidesCount));
                });
              }
            }); //THIS REMOVES ARIA-DESCRIBEDBY TO AVOID 508 ISSUES

            $('[data-cdc-slider="thumbnail-slider"]').children('.slick-list').children('.slick-track').children().each(function () {
              var $currentSlide = $(this);

              if (_typeof(undefined) !== _typeof($currentSlide.attr('aria-describedby')) && false !== $currentSlide.attr('aria-describedby')) {
                $currentSlide.removeAttr('aria-describedby');
              }
            });
            break;

          default:
            // case: 'standard-slider' (Single Slider)
            methods.log('slider.logic.trace.standard-slider');
            $slider.addClass('slider-for').slick({
              // Default for all viewports
              lazyLoad: 'progressive',
              dots: true,
              slidesToShow: 1,
              slidesToScroll: 1,
              adaptiveHeight: $slider.attr('data-adaptive-height') ? 'true' === $slider.attr('data-adaptive-height') : false,
              arrows: $slider.attr('data-smaller-show-arrows') ? 'true' === $slider.attr('data-smaller-show-arrows') : true,
              prevArrow: objDefaults.prevArrow,
              nextArrow: objDefaults.nextArrow
            }); //THIS REMOVES ARIA-DESCRIBEDBY TO AVOID 508 ISSUES

            $('[data-cdc-slider="standard-slider"]').children('.slick-list').children('.slick-track').children().each(function () {
              var $currentSlide = $(this);

              if (_typeof(undefined) !== _typeof($currentSlide.attr('aria-describedby')) && false !== $currentSlide.attr('aria-describedby')) {
                $currentSlide.removeAttr('aria-describedby');
              }
            });
            break;
        }
      }

      $slider.on('afterChange', function ()
      /* e, slick, currentSlide */
      {
        $(this).find('.slick-slide [tabindex="0"]').attr('tabindex', '-1');
        $(this).find('.slick-active [tabindex="-1"]').attr('tabindex', '0');
      });
    });
    return this;
  };

  methods.initRespondToData = function () {
    // Process Sliders
    this.each(function () {
      var $currentSlider = $(this);
      $currentSlider.data('responsiveLessThanBreakpoint', parseInt($currentSlider.attr('data-less-than-breakpoint')) || lessThanBreakPoint).data('respondTo', 'container' === $currentSlider.attr('data-respond-to') ? 'container' : 'screen');
    });
    return this;
  };

  methods.log = function () {
    if (loggingEnabled && arguments && arguments.length) {
      console.log.apply(this, arguments);
    }
  };

  methods.redraw = function (e) {
    // Process Sliders
    this.each(function () {
      var $currentSlider = $(this);
      $currentSlider.cdcCarousel('setMobileView').cdcCarousel('clearHeights').cdcCarousel('updateToMobileView').cdcCarousel('updateHeight').cdcCarousel('autoSetArrowTop');
      $currentSlider.find('.slick-slide [tabindex="0"]').attr('tabindex', '-1');
      $currentSlider.find('.slick-active [tabindex="-1"]').attr('tabindex', '0');
    });
    return this;
  };

  methods.setLogging = function (blnEnabled) {
    loggingEnabled = blnEnabled || false;
    return loggingEnabled;
  };

  methods.setMobileView = function () {
    methods.log('slider.logic.trace.setMobileView.begin');
    this.each(function (index) {
      var $currentSlider = $(this); // setMobileView constantly errors on resize unless we wait for the slider to finish what it's doing before looking for the data

      setTimeout(function () {}, 500);
      var ltBreakpoint = $currentSlider.data('responsiveLessThanBreakpoint'),
          widthToUse = 'container' === $currentSlider.data('respondTo') ? $currentSlider.parent().width() : window.innerWidth; // console.log({
      //     slider: $currentSlider,
      //     respondTo: $currentSlider.data('respondTo'),
      //     sliderBreakpoint: ltBreakpoint,
      //     widthToUse: widthToUse,
      //     isMobile: widthToUse < ltBreakpoint
      // });

      if (widthToUse < ltBreakpoint) {
        $currentSlider.addClass('mobile-view');
      } else {
        $currentSlider.removeClass('mobile-view');
      }
    }); // After this runs, every decision point regarding responsive should be able to hinge on $(this).hasClass('mobile-view');...

    methods.log('slider.logic.trace.setMobileView.end');
    return this;
  };

  methods.shortestTallest = function () {
    var tmp = {
      shortest: 99999,
      shortIndex: 0,
      tallest: 0,
      tallIndex: 0
    }; // This is meant to be an optimization:
    // The idea is that if we find the talles and shortest image in the slider on init,
    // Then we can use that information (setting classes for tallest/shortest) to resize
    // and or set sizes, vs checking the height of each item on each resize, redraw, etc.

    methods.log('shortestTallest selection', this);
    this.each(function (index) {
      var thisHeight = $(this).height();

      if (thisHeight > tmp.tallest) {
        tmp.tallest = thisHeight;
        tmp.tallIndex = index;
      }

      if (thisHeight < tmp.shortest) {
        tmp.shortest = thisHeight;
        tmp.shortIndex = index;
      }
    });
    this.eq(tmp.shortIndex).addClass('shortest');
    this.eq(tmp.tallIndex).addClass('tallest');
    return this;
  };

  methods.updateHeight = function () {
    this.each(function () {
      var $currentSlider = $(this);
      methods.log('slider.logic.trace.updateHeight', $currentSlider);

      if ('true' === $currentSlider.attr('data-equalize-images')) {
        $currentSlider.find('.slide-content img').cdcCarousel('equalizeHeight');
      }

      if ('thumbnail-slider' === $currentSlider.attr('data-cdc-slider')) {
        // Equalize Slide Heights & Contents thereof
        $currentSlider.find('.slide-content').cdcCarousel('equalizeHeight');
        $currentSlider.find('.slide-content h3').cdcCarousel('equalizeHeight');
        $currentSlider.find('.slide-caption-content').cdcCarousel('equalizeHeight');
        $currentSlider.find('.slide-caption-icon-container').cdcCarousel('equalizeHeight');
        $currentSlider.find('.slide-caption').cdcCarousel('equalizeHeight');
      } // Standard and Carousel Sliders


      $currentSlider.find('.slick-slide').height($currentSlider.find('.slick-track').height());
    });
    return this;
  };

  methods.updateToMobileView = function () {
    var toggleMethodsAll = {
      carouselSlider: {
        largerView: function largerView($currentSlider, isNavSlider) {
          methods.log('largerView:isNavSlider', isNavSlider);
          $currentSlider.slick('slickSetOption', 'arrows', isNavSlider, true);
        },
        smallerView: function smallerView($currentSlider, isNavSlider) {
          methods.log('smallerView:isNavSlider', isNavSlider);
          $currentSlider.slick('slickSetOption', 'arrows', !isNavSlider, true);
        }
      },
      thumbnailSlider: {
        largerView: function largerView($currentSlider) {
          methods.log('$currentSlider.data', $currentSlider.data);
          $currentSlider.slick('slickSetOption', 'slidesToShow', $currentSlider.data('lvSlidesToShow'), false).slick('slickSetOption', 'slidesToScroll', $currentSlider.data('lvSlidesToScroll'), true).slick('slickSetOption', 'dots', true, true);
        },
        smallerView: function smallerView($currentSlider) {
          methods.log('$currentSlider.data', $currentSlider.data);
          $currentSlider.slick('slickSetOption', 'slidesToShow', $currentSlider.data('svSlidesToShow'), false).slick('slickSetOption', 'slidesToScroll', $currentSlider.data('svSlidesToScroll'), true).slick('slickSetOption', 'dots', false, true);
        }
      },
      standardSlider: {
        largerView: function largerView($currentSlider) {
          $currentSlider.slick('slickSetOption', 'dots', true, true);
        },
        smallerView: function smallerView($currentSlider) {
          $currentSlider.slick('slickSetOption', 'dots', false, true);
        }
      }
    };
    return function () {
      methods.log('slider.logic.trace.updateToMobileView', this);
      this.each(function () {
        var $currentSlider = $(this),
            isNavSlider = $currentSlider.hasClass('slider-nav'),
            sliderType = $currentSlider.attr('data-cdc-slider'),
            viewSelect = $currentSlider.hasClass('mobile-view') ? 'smallerView' : 'largerView';

        switch (sliderType) {
          case 'carousel-slider':
            toggleMethodsAll.carouselSlider[viewSelect].call(this, $currentSlider, isNavSlider);
            break;

          case 'thumbnail-slider':
            toggleMethodsAll.thumbnailSlider[viewSelect].call(this, $currentSlider);
            break;

          case 'standard-slider':
            toggleMethodsAll.standardSlider[viewSelect].call(this, $currentSlider);
            break;

          default:
            toggleMethodsAll.standardSlider[viewSelect].call(this, $currentSlider);
        }
      });
      return this;
    };
  }();

  $.fn.cdcCarousel = $.fn.cdcCarousel || function (methodOrOptions) {
    if (methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if ('object' === _typeof(methodOrOptions) || !methodOrOptions) {
      // Default to "init"
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + methodOrOptions + ' does not exist on jQuery.cdcCarousel');
    }
  };
})(jQuery, window, document);
'use strict';

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

window.CDC = window.CDC || {};

CDC.Carousel = function (window, $) {
  var $modal;
  var initialized = []; // Button HTML

  var buttons = {
    play: '<img role="button" class="playbtn" aria-label="play video button" src="' + CDC.tpPath + '/TemplatePackage/4.0/assets/imgs/play.png" />',
    prev: '<img role="button" class="slider-prev" src="' + CDC.tpPath + '/TemplatePackage/4.0/assets/imgs/left.png" aria-label="previous slide button">',
    next: '<img role="button" src="' + CDC.tpPath + '/TemplatePackage/4.0/assets/imgs/right.png" aria-label="next slide button" class="slider-next">'
  };

  function slickInit(target, settings) {
    // only initialize once
    if ('string' === typeof target) {
      if (-1 < initialized.indexOf(target)) {
        return;
      } else {
        initialized.push(target);
      }
    }

    var $slider = $(target),
        slik = null,
        bps = {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1440
    },
        defaults = {
      dots: true,
      infinite: true,
      speed: 300,
      centerMode: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      mobileCaption: true,
      // if we should show the caption in mobile
      mobileFirst: true,
      prevArrow: buttons.prev,
      nextArrow: buttons.next,
      enableAria: true,
      accessibility: true,
      focusOnSelect: false,
      ariaLabel: '',
      // label if a label target isn't defined
      ariaLabelTarget: '',
      // one or more IDs for the slider label, typically the heading proceeding it
      sliderType: 'standard',
      // new optional flag for handling standard vs video vs modal vs jumbotron sliders
      bodyClass: '',
      // new optional flag for setting bg color on card body
      sliderCss: '',
      // additional CSS on the slider
      sliderClass: '',
      // additional CSS class on the slider
      slideCss: '',
      // additional CSS on each slide
      slideClass: '',
      // additional CSS class on each slide
      callback: null,
      // callback function
      showStatus: false,
      // always show the slide status indicator?
      rows: 0 // force rows to be 0 unless specifically passed in

    },
        config = {};

    if (0 === $slider.length) {
      console.error('Slider ID not defined or found. Please make sure slickInit is called with a slider ID that exists on the page.');
      return;
    } // if we're always showing the status indicator, hide the dots


    if (settings.showStatus) {
      settings.dots = false;
    } // replace our default settings with whatever is passed in


    config = $.extend({}, defaults, settings);

    if ('video' === config.sliderType) {
      handleVideo($slider, config);
    } else if ('modal' === config.sliderType) {
      handleModal($slider, config);
    } else if ('jumbotron' === config.sliderType) {
      if (3 < $slider.find('.jumbotron').length) {
        console.error('Jumbotron slider should have 3 or fewer images');
      }

      $slider.addClass('cdc-jumbotron-slider');
    } else if ('standard' === config.sliderType) {
      $slider.addClass('cdc-standard-slider');
    } else if ('carousel' === config.sliderType) {
      handleCarousel($slider, config);
    } else if ('video-carousel' === config.sliderType) {
      handleVideoCarousel($slider, config);
    } else if (0 === config.sliderType.trim.length) {
      // incase we need this, an empty string was passed in so default back to standard
      config.sliderType = 'standard';
      $slider.addClass('cdc-standard-slider');
    } else {
      console.warn('Unknown sliderType defined');
    }

    if (!config.mobileCaption) {
      $slider.addClass('cdc-no-mobile-caption');
    } // slides are treated a little differently in centerMode, flagging the slider here for use in CSS later


    if (config.centerMode) {
      $slider.addClass('cdc-centermode-slider');
    } // NOTE: the next two methods do basically the same thing,
    // EXCEPT we need to call init specifically in order to append the slider-status div
    // handling the appropriate events for tracking paging info


    $slider.on('init', function (event, slick, currentSlide, nextSlide) {
      slik = slick;
      handleInit($(this), slick, config);
    }); // handling the appropriate events for tracking paging info

    $slider.on('reInit afterChange', function (event, slick, currentSlide, nextSlide) {
      var i = (currentSlide ? currentSlide : 0) + 1,
          $t = $(this);
      $t.next('.cdc-slider-status').text(i + '/' + slick.slideCount);

      if (config.centerMode) {
        // GK: Fix to ensuring tabindex -1 is only set for non-active slide slides
        setTimeout(function () {
          $slider.find('.slick-slide').attr('tabindex', -1);
          $slider.find('.slick-slide.slick-active').removeAttr('tabindex');
        }, 200);
      }
    });
    $slider.on('breakpoint', function (event, slick, breakpoint) {
      // Optional: CSS we want to apply to each slide at breakpoint
      if ('' !== config.slideCss) {
        $slider.find('.slick-slide').css(config.slideCss);
      } // Optional: className we want to add at breakpoint


      if ('' !== config.slideClass) {
        $slider.find('.slick-slide').addClass(config.slideClass);
      } // Optional: CSS we want to apply to the slider at breakpoint


      if ('' !== config.sliderCss) {
        $slider.css(config.sliderCss);
      } // Optional: CSS we want to apply to each slide at breakpoint


      if ('' !== config.sliderClass) {
        $slider.addClass(config.sliderClass);
      }
    }); // handle metrics capture on events in the slider
    // handle any embedded videos
    // NOTE: nextSlide doesn't work in afterChange, so this was created

    $slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
      handleBeforeChange($(this), event, slick, currentSlide, nextSlide);
    }); // initialize the slider with the settings

    $slider.slick(config); // ARIA

    if (config.enableAria) {
      // set aria-label on each CARD
      // remove aria-describedby on each CARD
      $slider.find('.card').each(function () {
        var c = $(this),
            title = c.find('.card-title'),
            titleText = 'UNDEFINED';

        if (0 < title.text().length) {
          titleText = title.text().replace(/(\r\n|\n|\r)/gm, '');
          c.attr('aria-label', titleText);
        }

        c.removeAttr('aria-describedby'); // there's a ticket for this, where this aria attribute references nothing causing an aXe error in pageinfo, so the "fix" is to remove it
      }); // a target for the slider label

      if ('' !== config.ariaLabel) {
        $slider.attr('aria-label', config.ariaLabel);
      }

      if ('' !== config.ariaLabelTarget) {
        $slider.attr('aria-labelledby', config.ariaLabelTarget);
      }
    } // TP4 class to add to the card body, should be background classes; e.g. .bg-whatever


    if ('' !== config.bodyClass) {
      $slider.find('.card-body').each(function () {
        var c = $(this);
        c.addClass(config.bodyClass);
      });
    } // Optional: CSS we want to apply to each slide at runtime


    if ('' !== config.slideCss) {
      if ('object' === _typeof(config.slideCss)) {
        $slider.find('.slick-slide').css(config.slideCss);
      } else {
        console.error('slideCss needs to be a JSON representation of a CSS string. E.g. {"border": "1px solid red"} ');
      }
    } // Optional: CSS class we want to apply to each slide at runtime


    if ('' !== config.slideClass) {
      // remove the first character if it's a dot
      var cn = '.' === config.slideClass[0] ? config.slideClass.substr(1) : config.slideClass;
      $slider.find('.slick-slide').addClass(cn);
    } // Optional: Classname we want to add to the slider at runtime


    if ('' !== config.sliderClass) {
      // remove the first character if it's a dot
      var classname = '.' === config.sliderClass[0] ? config.sliderClass.substr(1) : config.sliderClass;
      $slider.addClass(classname);
    } // Optional: CSS we want to apply to the slider at runtime


    if ('' !== config.sliderCss) {
      if ('object' === _typeof(config.sliderCss)) {
        $slider.css(config.sliderCss);
      } else {
        console.error('sliderCss needs to be a JSON representation of a CSS string. E.g. {"border": "1px solid red"} ');
      }
    } // Optional: callback function


    if (null !== config.callback) {
      config.callback($slider, config, slik);
    } // Optional: always display status


    if (true === config.showStatus) {
      $slider.next('.cdc-slider-status').addClass('d-block');
    }
  }

  function handleBeforeChange($slider, event, slick, currentSlide, nextSlide) {
    var swipeOrDrag = event.changedTouches ? 'swipe' : 'mousedrag',
        direction = 'slider-prev'; // on the carousel slider, if the user navigates by sliding the top slider, update the thumbnail slider location

    if ($slider.hasClass('cdc-carousel-slider')) {
      var cts = $('.cdc-carousel-thumbnail-slider'),
          step = 4;

      if (0 === nextSlide % step) {
        cts[0].slick.slickGoTo(nextSlide);
      }
    } // this was largely copied from existing code in TP4


    if (1 === Math.abs(nextSlide - currentSlide)) {
      direction = 0 < nextSlide - currentSlide ? 'slider-next' : 'slider-prev';
    } else {
      direction = 0 < nextSlide - currentSlide ? 'slider-prev' : 'slider-next';
    } // capture swipe/drag and direction to metrics


    $(event.currentTarget).trigger('metrics-capture', [direction, swipeOrDrag]); // if it's a play-in-place video slider

    if ($slider.hasClass('cdc-video-slider')) {
      var embed = $('iframe.embed-responsive-item'); // if there's an embedded iframe

      if ($slider.has(embed).length) {
        // stop all of the videos on navigation
        $('.embed-responsive-item').each(function () {
          $(this)[0].contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        });
      }
    }
  }

  function handleInit($slider, slick, config) {
    // append the slider status after the slider
    $slider.after('<div class="cdc-slider-status" />'); // kick off the slider status count

    $slider.next('.cdc-slider-status').text('1/' + slick.slideCount); // reduce the bottom space under the jumbotron

    if ('jumbotron' === config.sliderType) {
      $slider.find('.slick-dots').css('bottom', '0');
    } // add a tabindex to the arrows to make them tabbable


    $slider.find('.slick-arrow').attr('tabindex', 0); // handling number key events on the slider so the end user can use 1-0 to navigate or space/enter on arrows

    $slider.on('keydown', function (e) {
      if (!isNaN(e.key) || null !== e.key) {
        // tab for the future!
        if ('tab' === e.key.toLowerCase()) {// metrics call
        } else if (' ' === e.key.toLowerCase() || 'enter' === e.key.toLowerCase()) {
          // click on the element that's the target of the action
          $(e.target).click();
        }

        var dots = $('.slick-dots li'),
            key = 0; // get the number - 1

        key = 0 === parseInt(e.key) ? 9 : parseInt(e.key) - 1; // if we have dots, try to click it

        if (dots.length) {
          $(dots[key]).click();
        }
      }
    }); // metrics on slider buttons

    $slider.on('click', '.slider-next', function (e) {
      $(e.currentTarget).trigger('metrics-capture', ['slider-next', 'click']);
    });
    $slider.on('click', '.slider-prev', function (e) {
      $(e.currentTarget).trigger('metrics-capture', ['slider-previous', 'click']);
    });
    $slider.on('click', '.slick-dots button', function (e) {
      $(e.currentTarget).trigger('metrics-capture', ['slider-bottom-buttons', 'click']);
    });
  } // clone the slider into a thumbnail slider, removing the card body


  function handleCarousel($slider, config) {
    var clone = $slider.clone(),
        id = $slider.attr('id') + '-clone'; //If the card is clickable, the card element in an A tag. Change to DIV tag for carousel

    var cardElement = clone.find('>a');

    if ('A' === cardElement.prop('tagName')) {
      cardElement.replaceWithTag('div', ['href', 'target']);
    }

    clone.attr('id', id);
    clone.find('.card-body').remove();
    clone.find('.card-footer').remove();
    clone.find('.card a > .card-img-top').unwrap();
    $slider.after(clone);
    var thumbnails = config.thumbnailsToShow || 4;
    slickInit('#' + id, {
      sliderType: 'thumbnail',
      bodyClass: '',
      ariaLabel: '',
      centerMode: false,
      slidesToShow: thumbnails,
      slidesToScroll: thumbnails,
      slideCss: {
        'box-shadow': 'none',
        margin: '0 3px'
      },
      callback: function callback(slider) {
        slider.addClass('cdc-carousel-thumbnail-slider d-none d-lg-block');
        slider.find('.card').on('click', function () {
          var index = $(this).data('slick-index');
          $slider[0].slick.slickGoTo(index);
        });
      },
      responsive: [{
        breakpoint: 1200,
        settings: {
          slidesToShow: thumbnails,
          slidesToScroll: thumbnails
        }
      }, {
        breakpoint: 992,
        settings: {
          slidesToShow: thumbnails,
          slidesToScroll: thumbnails
        }
      }, {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: '20px'
        }
      }]
    });
  } // almost the same as the handleCarousel method, this one uses the URL of the YouTube video to create the card images in the thumbnail slider


  function handleVideoCarousel($slider, config) {
    var clone = $slider.clone(),
        id = $slider.attr('id') + '-clone';
    clone.attr('id', id);
    clone.find('.card-body').remove();
    $slider.addClass('cdc-video-slider');
    var thumbnails = config.thumbnailsToShow || 4;
    clone.find('.embed-responsive').each(function () {
      var ct = $(this),
          iframe = ct.find('iframe'),
          src = iframe[0].src,
          regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
          videoId = src.match(regExp),
          cit = '';

      if (videoId && 11 === videoId[2].length) {
        cit = '<div class="card-img-wrap">' + buttons.play + '<img alt="Card image cap" class="card-img-top" src="http://i.ytimg.com/vi/' + videoId[2] + '/mqdefault.jpg" /></div>';
      }

      ct.after(cit);
      ct.remove();
    });
    $slider.after(clone); // init the thumbnail clone

    slickInit('#' + id, {
      sliderType: 'thumbnail',
      bodyClass: '',
      ariaLabel: '',
      centerMode: false,
      slidesToShow: thumbnails,
      slidesToScroll: thumbnails,
      slideCss: {
        'box-shadow': 'none',
        margin: '0 3px'
      },
      callback: function callback(slider) {
        slider.addClass('cdc-carousel-thumbnail-slider d-none d-lg-block');
        slider.find('.card').on('click', function () {
          var index = $(this).data('slick-index');
          $slider[0].slick.slickGoTo(index);
        });
      },
      responsive: [{
        breakpoint: 1200,
        settings: {
          slidesToShow: thumbnails,
          slidesToScroll: thumbnails
        }
      }, {
        breakpoint: 992,
        settings: {
          slidesToShow: thumbnails,
          slidesToScroll: thumbnails
        }
      }, {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 0,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: '20px'
        }
      }]
    });
  }

  function handleVideo($slider, config) {
    // video slider
    $slider.addClass('cdc-video-slider').find('.card-img-top').each(function () {
      var $tc = $(this),
          imgdata = $tc.data(); // if we have data attributes, add them to the footer we're creating here

      if (imgdata) {
        var footerhtml = '<div class="card-footer"><div class="video-links"><div class="video-transcript">';

        if (imgdata.transcriptUrl) {
          footerhtml += '<a class="nonHtml noDecoration" href="' + imgdata.transcriptUrl + '" target="new" tabindex="0"><span class="cdc-icon-pdf fill-pdf mr-1 ml-2"></span>View Transcript</a>';
        }

        if (imgdata.audioUrl) {
          footerhtml += '<a class="nonHtml noDecoration" href="' + imgdata.audioUrl + '" target="new" tabindex="0"><span class="cdc-icon-media fill-media mr-1 ml-2"></span>Audio Description</a>';
        }

        if (imgdata.lowresUrl) {
          footerhtml += '<a class="nonHtml noDecoration" href="' + imgdata.lowresUrl + '" target="new" tabindex="0"><span class="cdc-icon-video_01 mr-1 ml-2"></span>Low Resolution Video</a>';
        }

        footerhtml += '</div></div></div>';
        $tc.parent().find('.card-body').after(footerhtml);
      } // wrap the image so we can center the play button inside it
      // then handle clicking on it


      $tc.wrap('<div class="card-img-wrap" />').before(buttons.play).add('.playbtn');
      $tc.find('a:first').on('click', function (e) {
        e.stopImmediatePropagation();
        var $c = $(this),
            video,
            newData; // if they clicked the play button instead of the video image

        if ($c.hasClass('playbtn')) {
          // set this to the video image
          $c = $c.next();
        } // remove the playbutton


        $c.prev('.playbtn').remove(); // get the data attributes from the image

        newData = $c.data();

        if ('' !== newData.videoId) {
          // define the video embed
          video = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="https://www.youtube.com/embed/' + newData.videoId + '?enablejsapi=1&version=3&playerapiid=ytplayer" allow="" allowfullscreen=""></iframe></div>'; // replace the image with the video embed

          $c.replaceWith(video);
        } else {
          console.error('VIDEO ID is EMPTY or MISSING.');
        }
      });
    });
  }

  function handleModal($slider, config) {
    // video MODAL slider
    $slider.addClass('video-modal').find('.card').each(function (index, element) {
      var $slide = $(this),
          $image = $slide.find('.card-img-top'); // add play button if missing

      if (!$slide.find('.playbtn').length) {
        $image.wrap('<div class="card-img-wrap" />').before(buttons.play).add('.playbtn');
      }

      $slide.on('click keyup', function (e) {
        if ('keyup' === e.type && 13 !== e.keyCode) {
          return;
        }

        e.preventDefault(); // show the modal with the video

        showModal($image.data());
      });
    });
  }
  /* eslint-enable complexity */
  // modal for the video popup


  function showModal(data) {
    if (!$modal) {
      $modal = $('<div id="CDC_videoModal" class="modal fade z-supermax" tabindex="-1" role="dialog" aria-label="Video Modal" aria-hidden="true"></div>').safehtml('<div class="modal-dialog modal-lg">' + '<div class="modal-content">' + '<div class="modal-header" style="height: 66px"><button type="button" class="close rounded-circle" data-dismiss="modal" aria-label="Close">' + '<span class="sr-only">Close</span><span class="fi cdc-icon-close x24" aria-hidden="true"></span></button>' + '</div>' + '<div class="modal-body"></div>' + '<div class="modal-footer fj-start"><div class="video-links"><div class="video-transcript"></div></div></div>' + '</div>');
      $('body:first').append($modal);
      $modal.body = $modal.find('.modal-body');
      $modal.transcript = $modal.find('.video-transcript');
    } // Embed


    $modal.body.html('');

    if (data.videoId) {
      var embedurl = data.videoId ? CDC.cleanUrl('https://www.youtube.com/embed/' + data.videoId + '?enablejsapi=1&version=3&playerapiid=ytplayer') : '';
      $modal.body.html('<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="' + embedurl + '" allow="" allowfullscreen=""></iframe></div>');
    } // Transcript


    $modal.transcript.html('');

    if (data.transcriptUrl) {
      $modal.transcript.safeappend('<a class="nonHtml noDecoration" href="' + data.transcriptUrl + '" target="new"><span class="cdc-icon-pdf fill-pdf mr-1"></span>View Transcript</a>');
    }

    if (data.audioUrl) {
      $modal.transcript.safeappend('<a class="nonHtml noDecoration" href="' + data.audioUrl + '" target="new"><span class="ml-3 cdc-icon-media fill-media mr-1"></span>Audio Description</a>');
    }

    if (data.lowresUrl) {
      $modal.transcript.safeappend('<a class="nonHtml noDecoration" href="' + data.lowresUrl + '" target="new"><span class="ml-3 cdc-icon-video_01 mr-1"></span>Low Resolution Video</a>');
    }

    $modal.modal('show'); // remove the modal, stops video playback, too!

    $modal.on('hidden.bs.modal', function (e) {
      $modal.body.html('');
    });
  }

  return {
    slickInit: slickInit
  };
}(window, $); // expose slickInit as it was once external


window.slickInit = function (target, settings) {
  CDC.Carousel.slickInit(target, settings);
}; // jQuery method


$.fn.replaceWithTag = function (tagName, attributesToIgnore) {
  var result = [];
  this.each(function () {
    var newElem = $('<' + tagName + '>').get(0);

    for (var i = 0; i < this.attributes.length; i++) {
      if ($.isArray(attributesToIgnore) && -1 === $.inArray(this.attributes[i].name, attributesToIgnore)) {
        newElem.setAttribute(this.attributes[i].name, this.attributes[i].value);
      }
    }

    newElem = $(this).wrapInner(newElem).children(0).unwrap().get(0);
    result.push(newElem);
  });
  return $(result);
};
"use strict";

(function ($, window, document, undefined) {
  $('.child-theme-mobile-menu-btn').click(function () {
    $('.yamm #navbar-collapse-grid').toggleClass('d-block');
    $('.child-theme-mobile-menu-btn').toggleClass('active');
    $('.child-theme-mobile-menu-btn .open-smallmenu').toggleClass('d-none');
    $('.child-theme-mobile-menu-btn .close-smallmenu').toggleClass('d-none');
    $('.mobile-overlay').toggleClass('d-none');
  });
})(jQuery, window, document);
'use strict';
/**
 * tp-collapse.js
 * @fileOverview Contains module and constructors to genrate collapse/accordions/tab functions
 * @version 0.2.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var $currentTab = '',
      $currentAccordion = '',
      pluginName = 'cdc_collapse',
      defaults = {
    parent: null,
    toggle: true
  };

  function CDCPlugin(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  CDCPlugin.prototype = {
    init: function init() {
      //var defaults = this._defaults;
      this.bindEvents();

      if (768 > $(window).width()) {
        this.buildAccordion();
      } else {
        this.buildTabs();
      }
    },
    buildAccordion: function buildAccordion() {
      $.each($('.tabs-module'), function (i, val) {
        var buildObj = {},
            tabModule = $(val),
            tabContainer = tabModule.parent(),
            tabLinks = tabModule.find('.nav-link'),
            tabPanes = tabModule.find('.tab-pane'),
            linksLength = tabLinks.length,
            accordionToggle = tabContainer.find('.accordion_toggle');

        if (!accordionToggle.length) {
          tabModule.hide(); // Build obj from Links

          for (var k = 0; k < linksLength; k++) {
            buildObj[k] = {
              titleSafe: tabLinks[k].innerHTML.replace(/\s/g, ''),
              title: tabLinks[k].innerHTML,
              content: tabPanes[k].innerHTML
            };
          } // Build Accordion Wrapper


          accordionToggle = $('<div/>', {
            "class": 'accordion indicator-plus accordion_toggle'
          });
          tabContainer.append(accordionToggle); // Build Accordion Cards

          $.each(buildObj, function (j) {
            var unique_item_num = i + '_' + j; //var titleId = buildObj[j].titleSafe.toLowerCase();

            var titleMarkup = '\n                                <a  class="card-title" data-toggle="collapse" data-target="#mobilecoll-item-' + unique_item_num + '" aria-expanded="false" aria-controls="mobilecoll-item-' + unique_item_num + '">\n                                <button class="btn btn-link" role="heading">' + buildObj[j].title + '</button>\n                                </a>\n                        ';
            var contentMarkup = '\n                            <div id="mobilecoll-item-' + unique_item_num + '" class="collapse" aria-labelledby="mobilecoll-item-' + unique_item_num + '" data-parent="#mobilecoll-item-' + unique_item_num + '">\n                                <div class="card-body">\n                                    ' + buildObj[j].content + '\n                                </div>\n                            </div>\n                        '; // #CARD

            $('<div/>', {
              id: 'card-mobilecoll-item' + unique_item_num,
              "class": 'card'
            }).appendTo(accordionToggle); // #CARD HEADER

            $('<div/>', {
              id: 'heading-' + unique_item_num,
              'data-toggle': 'collapse',
              'data-target': '#mobilecoll-item-' + unique_item_num,
              'aria-expanded': 'false',
              'aria-controls': 'mobilecoll-item-' + unique_item_num,
              "class": 'card-header collapsed',
              html: titleMarkup
            }).appendTo('#card-mobilecoll-item' + unique_item_num); // #CONTENT

            $('#card-mobilecoll-item' + unique_item_num).append(contentMarkup);
            $(accordionToggle).find('.collapse').first().addClass('show');
            $(accordionToggle).find('.card-header').first().removeClass('collapsed');
          });
        } else {
          accordionToggle.show();
          tabModule.hide();
        }

        if ($currentAccordion.length) {
          if ($('#heading-' + $currentAccordion).hasClass('collapsed')) {
            $('#heading-' + $currentAccordion).removeClass('collapsed').click();
          }
        }
      });
    },
    buildTabs: function buildTabs() {
      $('.tabs-module').show();
      $('.accordion_toggle').hide(); // this breaks the homepage nav, not sure what to do with this code, but the selector seems super-sloppy
      // $("a.nav-link[href='" + "#" + $currentTab.replace(/\s/g, '') + "']").click();
    },
    redirect: function redirect(hash) {
      // $( hash ).attr( 'aria-expanded', 'true' ).focus();
      // $( hash + '+div.collapse' ).addClass( 'show' ).attr( 'aria-expanded', 'true' );
      // $( hash + '+div.collapse' ).collapse( 'show' );
      var sanitizedHash = $.escapeSelector(window.location.hash.substr(1)); // if we have a hash and it exists on the page... else kick us back out

      if (0 === $('#' + sanitizedHash).length) {
        return;
      }

      var targetHash = $.escapeSelector(CDC.parseUrl().hash.substr(1)).replace('tab', '');
      $('.nav-tabs a[href="#' + targetHash + '"]').tab('show'); // using this because of static nav bar space

      $('html, body').animate({
        scrollTop: $(hash).offset().top - 60
      }, 10, function () {
        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    },
    bindEvents: function bindEvents() {
      var t = this,
          resizeTimer,
          dragTimer,
          isDragging = false,
          mouseDown = false,
          flag = false,
          x = 0;
      $('div.accordion').on('click', function (e) {
        $currentTab = e.target.innerText.toLowerCase();
      });
      $("a.nav-link[role='tab']").on('click', function (e) {
        $currentAccordion = e.currentTarget.href.split('#')[1];
      }); //https://websupport.cdc.gov/browse/WCMSRD-5666

      $('.closeall').on('click', function (e) {
        e.preventDefault();
        $('.accordion .collapse.show').collapse('hide');
        return false;
      });
      $('.openall').on('click', function (e) {
        e.preventDefault();
        $('.accordion .collapse').collapse('show');
        return false;
      }); // when any anchor is clicked

      $('a').on('click', function (e) {
        var t_this = this,
            $t = $(t_this.hash); // if it has a hash and that ID exists on the page

        if ($t.length) {
          // if that hash begins with #accordion
          if (0 === t_this.hash.indexOf('#accordion')) {
            // don't allow the default behavior to work
            e.preventDefault(); // click the hash target

            $('div[data-target="' + t_this.hash + '"]').click(); // wait for the accordion to expand, and then scroll to its parent top

            setTimeout(function () {
              window.scrollTo(0, parseInt($t.parent().offset().top, 10));
            }, 300);
          }
        }
      }); // the images will resize, so keep them normalized when that happens

      $(window).on('resize orientationchange', window.CDC.Common.debounce(function () {
        if (768 > $(window).width()) {
          t.buildAccordion();
        } else {
          t.buildTabs();
        }
      }, 250));

      if (window.location.hash) {
        t.redirect(window.location.hash);
      }
    }
  }; // don't let the plugin load multiple times

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new CDCPlugin(this, options));
      }
    });
  };
})(jQuery, window, document);
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * CDC.Datatables
 *
 * Handles loading of datatable widgets
 */
window.CDC = window.CDC || {}; // Object for individual Datatable widgets

CDC.Datatable = CDC.Datatable || function ($dom, num) {
  function isTrue(value) {
    return 'true' === String(value).toLowerCase();
  }

  $dom = $($dom);
  var $table = $dom.find('table:first');
  var config = $dom.data();
  var table;
  var fields = [];
  var tableData = [];
  var options = {
    autoWidth: false,
    pageLength: parseInt(config.pagesize || 10, 10),
    paging: isTrue(config.pagination),
    lengthChange: isTrue(config.changepagesize),
    searching: isTrue(config.enablesearch) || isTrue(config.enablecustomfilter),
    ordering: isTrue(config.enablesort),
    orderMulti: isTrue(config.enablesort),
    language: {
      search: 'Search'
    }
  };
  var file = String(config.file || ''); // var fileExt = file.toLowerCase().trim().replace(/^.*\./, '');

  var fileExt = file.split('.').pop().toLowerCase().trim();
  var filetype = fileExt.indexOf(fileExt) !== -1 ? fileExt.split('?')[0] : fileExt;
  var scopeType = 'col'; // config other options

  if (isTrue(config.altrows)) {
    options.stripeClasses = ['', config.altrowcolor || 'bg-quaternary'];
  } // default template, standard for Bootstrap 4 (see: https://datatables.net/reference/option/dom#Styling )


  options.dom = "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6' <'row'<'cdc-custom-search w-100'> <'cdc-custom-filter d-flex col-md-12'>>>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"; // show pagination at top and bottom?

  if (isTrue(config.topandbottom) && isTrue(config.pagination)) {
    options.dom = "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'<'cdc-custom-filter'>f>>" + "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>";
  } //hide showing 1 of n entries


  if (!config.pagination) {
    options.info = false;
  } // show pagination at top and bottom


  if (isTrue(config.compact)) {
    $table.addClass('compact');
  } // enable scroll x


  if (isTrue(config.scrollx)) {
    options.scrollX = true;
  } // enable scroll y


  if (isTrue(config.scrolly)) {
    options.scrollCollapse = true;
    options.scrollY = config.scrollyheight;
  } // show pagination at top and bottom


  if (isTrue(config.enablesort)) {
    options.order = [];
  }

  function init() {
    switch (filetype) {
      case 'csv':
        // if PapaParse is already loaded, use now
        if ('object' === _typeof(window.Papa)) {
          loadCSV(file);
          return;
        } // otherwise load and then pase


        CDC.Common.loadScript(CDC.tpPath + '/TemplatePackage/contrib/libs/papaparse/latest/papaparse.min.js', function () {
          loadCSV(file);
        });
        break;

      case 'json':
        $.ajax({
          url: file,
          method: 'get',
          dataType: 'json'
        }).done(function (response) {
          console.log(response);
          parseJSON(response);
        });
        break;

      default:
        console.error('Datatable filetype not recognized: ', file);
    }
  }
  /**
   * Load a CSV file. 2 steps because we need a library to load CSV.
   * @param {string} csvfile
   */


  function loadCSV(csvfile) {
    window.Papa.parse(csvfile, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function complete(results) {
        if (results.errors) {
          console.error('CSV load error: ', csvfile, results.errors);
        }

        parseCSV(results);
      }
    });
  }
  /**
   * Accepts parsing response from CSV library into tableData and fields
   * @param data
   */


  function parseCSV(response) {
    var records = response.data;
    fields = response.meta && response.meta.fields ? response.meta.fields : fields;

    if (!Array.isArray(records) || !Array.isArray(fields)) {
      console.error('CSV records / fields not found.');
      return;
    }

    records.forEach(function (record) {
      tableData.push(record);
    });
    loadTable();
  }
  /**
   * Accepts JS object returned from fetch into tableData and fields
   * @param data
   */


  function parseJSON(data) {
    tableData = data;

    if (!data || 'object' !== _typeof(data)) {
      console.error('Datatable: data not valid from ' + file);
    } // test for Content Export structure


    if (data.items && Array.isArray(data.items)) {
      tableData = data.items;
    }

    if (!Array.isArray(tableData) || !tableData.length) {
      console.error('Datatable: records not found in ' + file);
    } // parse out columns


    if (!fields.length) {
      for (var field in tableData[0]) {
        if (tableData[0].hasOwnProperty(field)) {
          fields.push(field);
        }
      }
    }

    loadTable();
  }
  /**
   * With options set, load the table
   */


  function loadTable() {
    var jsConfig;
    options.data = tableData;
    options.columns = [];
    config.columns = [];
    config.fields = Array.isArray(fields) ? fields.slice() : []; // build columns, read for column definition

    if (config.id && window['cdc_datatable_' + config.id]) {
      jsConfig = window['cdc_datatable_' + config.id]; // originally jsConfig _just_ had columns. If this is the case, just popuplate columns

      if (Array.isArray(jsConfig)) {
        config.columns = jsConfig;
      } else if ('object' === _typeof(jsConfig)) {
        // the updated window js object config is an object
        config = $.extend({}, config, jsConfig);

        if (!Array.isArray(config.columns)) {
          config.columns = [];
        }
      }
    } // read column config


    $.each(config.columns, function (index, columnConfig) {
      // if columnConfig name should exist in found fields, else ignore
      columnConfig.name = String(columnConfig.name || '').trim();

      if (!columnConfig.name || -1 === fields.indexOf(columnConfig.name)) {
        return;
      } else {
        fields.splice(fields.indexOf(columnConfig.name), 1);
      }

      var column = {
        data: columnConfig.name,
        title: columnConfig.title || columnConfig.name
      }; // column ordering / initial order

      if (isTrue(columnConfig.sort)) {
        if (columnConfig.order) {
          options.order.push([index, columnConfig.order]);
        }
      } else {
        column.orderable = false;
      }

      switch (columnConfig.type) {
        case 'number':
          column.type = 'num';
          break;

        case 'text':
          column.render = CDC.Datatables.renderText;
          break;

        case 'url':
          column.render = CDC.Datatables.renderURL;
          break;

        case 'link':
          column.render = function (data, type, full) {
            return CDC.Datatables.renderLink(data, type, full, columnConfig.url);
          };

          break;

        case 'date':
          column.render = CDC.Datatables.renderDate;
          break;

        case 'datetime':
          column.render = CDC.Datatables.renderDateTime;
          break;

        case 'float':
          column.render = function (data, type) {
            return CDC.Datatables.renderFloat(data, type);
          };

          break;

        case 'float1':
          column.render = function (data, type) {
            return CDC.Datatables.renderFloat(data, type, 1);
          };

          break;

        case 'float2':
          column.render = function (data, type) {
            return CDC.Datatables.renderFloat(data, type, 2);
          };

          break;

        case 'float3':
          column.render = function (data, type) {
            return CDC.Datatables.renderFloat(data, type, 3);
          };

          break;

        default:
      } // Handle alignment


      switch (columnConfig.alignment) {
        case 'left':
          column.className = 'text-left';
          break;

        case 'center':
          column.className = 'text-center';
          break;

        case 'right':
          column.className = 'text-right';
          break;

        default:
      } // Width


      if (columnConfig.width) {
        column.width = columnConfig.width;
      } // if the column should be hidden, do so here


      if ('hide' === columnConfig.display) {
        column.visible = false;
      } // finally add to option columns


      options.columns.push(column);
    }); // if all columns should be displayed (default), load remaining fields as columns

    if (isTrue(config.allcolumns)) {
      for (var i = 0; i < fields.length; i++) {
        // start with default options
        options.columns.push({
          data: fields[i],
          title: fields[i]
        });
      }
    } // initialize table


    table = $table.DataTable(options); // send event to DOM for future watchers

    table.on('draw.dt', function () {
      $dom.trigger('datatable-refresh', [table, $dom]);
    }); // add scope to th elements

    $dom.find('thead th').attr('scope', scopeType); // add custom to table headers

    var table_head_theme_class = $dom.attr('data-tableheadtheme');
    $dom.find('table.dataTable').addClass('table');
    $dom.find('table thead').addClass('thead-' + table_head_theme_class); // $dom.searchField = $dom.find('.cdc-custom-search').on('keyup', function () {
    // 	table.columns(0).search(this.value).draw();
    // });

    if (isTrue(config.tabrows)) {
      var tableRows = document.querySelector('table > tbody').children;

      var _iterator = _createForOfIteratorHelper(tableRows),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var row = _step.value;
          row.setAttribute('tabindex', 0);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } //custom search


    $dom.searchField = $dom.find('.cdc-custom-search');

    if (config.enablesearch) {
      var searchId = 'CDCDataTableSearch_' + num;
      $dom.wrap = $('<div class="wrap d-flex col-md-12 mb-2"></div>');
      $dom.wrap.addClass('float-right').safehtml('<label for="' + searchId + '">Search</label>');
      $dom.search = $('<input type="text" class="search ml-2 form-control form-control-sm" id="' + searchId + '"/>');
      $dom.wrap.append($dom.search);
      $dom.searchField.append($dom.wrap);
      $dom.find('.search').on('keyup', function () {
        table.search(this.value).draw();
        $dom.filter && $dom.filter.val('');
      });
    } // add a custom filter if configured


    $dom.filterField = $dom.find('.cdc-custom-filter');

    if (config.enablecustomfilter && config.filter && Array.isArray(config.filter.values)) {
      var label = config.filter.name ? config.filter.name : 'Filter';
      var filterId = 'CDCDataTableFilter_' + num;
      $dom.filterField.addClass('float-right').safehtml('<label for="' + filterId + '">' + label + '</label>');
      $dom.filter = $('<select class="d-inline-block ml-2 form-control form-control-sm" id="' + filterId + '"></select>');
      $dom.filter.safeappend('<option value="">Select</option>'); // loop through values, add options

      $.each(config.filter.values, function (j, value) {
        $dom.filter.safeappend('<option value="' + CDC.cleanAttr(value) + '">' + value + '</option>');
      });
      $dom.filterField.append($dom.filter);
      $dom.filter.on('change', function () {
        filter($dom.filter.val());
      });
    } //add column filters


    if (config.enablecolumnsfilter) {
      $(table.header()[0].firstChild).clone(true).addClass('filters filter_' + table.nodes()[0].id).appendTo(table.header()[0]);
      table.columns().eq(0).each(function (index) {
        $dom.find('.filter_' + table.nodes()[0].id + ' th').removeClass('sorting');
        $dom.find('.filters input').css({
          width: '100%'
        });
        var cell = $dom.find('.filter_' + table.nodes()[0].id + ' th').eq($(table.column(index).header()).index());
        var title = $(cell).text();

        if ($(table.column(index).header()).index() >= 0) {
          $(cell).html("<input type=\"text\" placeholder=\"Filter ".concat(title.toLowerCase(), "\"/>"));
        }

        $('input', $('.filter_' + table.nodes()[0].id + ' th').eq($(table.column(index).header()).index())).off('keyup change').on('change', function () {
          // Get the search value
          $(this).attr('title', $(this).val());
          var regexr = '({search})';
          table.column(index).search(this.value !== '' ? regexr.replace('{search}', '(((' + this.value + ')))') : '', this.value !== '', this.value === '').draw();
        }).on('keyup', function (e) {
          e.stopPropagation();
          $(this).trigger('change');
          $(this).focus()[0].setSelectionRange(this.selectionStart, this.selectionStart);
        });
      });
    }
  }
  /**
   * Filter table rows on given value
   * @param value
   */


  function filter(value) {
    table.search(value, 0, 0, 0).draw();
  } // finally initialize


  init();
}; // Logic for handling Datatable widgets in general


CDC.Datatables = CDC.Datatables || function ($) {
  var allowedTags = ['<a>', '<p>', '<br>', '<sup>', '<sub>', '<i>', '<b>', '<strong>', '<em>', '<h1>', '<h2>', '<h3>', '<cite>'];
  var datatables = [];

  function init() {
    if (!$('.cdc-datatable-module').length) {
      return;
    }

    var lib = CDC.tpPath + '/TemplatePackage/contrib/libs/datatables/latest';
    CDC.Common.loadCSS([lib + '/css/jquery.dataTables.min.css', lib + '/css/dataTables.bootstrap4.min.css']);
    CDC.Common.loadJS([lib + '/js/jquery.dataTables.min.js', lib + '/js/dataTables.bootstrap4.min.js'], function () {
      load();
    });
  } // After JS libraries are loaded, initialize each datatable


  function load() {
    // turn off datatable errors
    if (window.$ && $.fn && $.fn.dataTable) {
      $.fn.dataTable.ext.errMode = 'none';
    }

    $('.cdc-datatable-module').each(function (i) {
      datatables.push(new CDC.Datatable($(this), i));
    });
  }

  $(function () {
    init();
  });
  return {
    init: init,
    // helper fields for output of cell data
    renderURL: function renderURL(data, type) {
      var out = data;
      var url = String(out).replace(/["<>]+/g, '');

      if ('display' === type && data && url) {
        out = '<a href="' + url + '">' + data + '</a>';
      }

      return out;
    },
    renderText: function renderText(data) {
      var out = String(data).trim();

      if (out.match(/<.*>/)) {
        out = CDC.Common.stripTags(out, allowedTags);
        out = CDC.Common.cleanHTML(out);
      }

      return out;
    },
    renderFloat: function renderFloat(data, type, digits) {
      var out = parseFloat(data);

      if (isNaN(out)) {
        out = 0;
      }

      if ('display' === type) {
        if (digits) {
          out = out.toFixed(parseInt(digits, 10));
        } else {
          out = String(out);
        }
      }

      return out;
    },
    renderDate: function renderDate(data, type) {
      return CDC.Datatables.outputDateTime(data, type, false);
    },
    renderDateTime: function renderDateTime(data, type) {
      return CDC.Datatables.outputDateTime(data, type, true);
    },
    outputDateTime: function outputDateTime(data, type, showTime) {
      var date = data;
      var out = date;
      var options = {};

      if (!date) {
        return out;
      }

      try {
        date = new Date(date);

        if ('display' === type) {
          if (showTime) {
            options = {
              hour: 'numeric',
              minute: 'numeric'
            };
          }

          out = date.toLocaleDateString('en-US', options);
        } else {
          out = date.valueOf();
        }
      } catch (e) {
        return date;
      }

      return out;
    },
    // method for rendering a link
    renderLink: function renderLink(data, type, full, urlField) {
      var url = CDC.cleanUrl(String(full[urlField] || '').trim());

      if (url) {
        return '<a href="' + CDC.cleanAttr(url) + '">' + CDC.Datatables.renderText(data) + '</a>';
      } else {
        return CDC.Datatables.renderText(data);
      }
    }
  };
}(jQuery);
'use strict';
/**
 * tp-dropdown.js
 * @fileOverview Contains tp-dropdown.js code that is for all environments.
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

$('.small-search').on('show.bs.dropdown', function () {
  $('.dropdown-menu-small-search').width($(window).width() - 10);
});
$('button.search-button').on('click', function () {
  if ('true' === $(this).attr('aria-expanded')) {
    $(this).trigger('metrics-capture', ['dropdown-search-button', 'close']);
  } else {
    $(this).trigger('metrics-capture', ['dropdown-search-button', 'open']);
  }
});
'use strict';
/**
 * tp-external-links.js
 * @fileOverview Contains module and constructors to handle navigation behavior outside of the scope of bootstrap
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($) {
  window.CDC = window.CDC || {};
  window.CDC.tp4 = window.CDC.tp4 || {};

  window.CDC.tp4.extLinks = window.CDC.tp4.extLinks || function () {
    var extLinkReturn = {
      init: function init(config) {
        $(document).ready(function () {
          var popExtModal = function popExtModal(linkTarget, targetAttr, linkExtension) {
            var $extModal = $('#cdcExtLink');

            if ('gov' === linkExtension || String(linkTarget).match(/www\.youtube\.com/) || !$extModal.length) {
              if ('_blank' === targetAttr || 'new' === targetAttr) {
                window.open(linkTarget);
              } else {
                window.location.href = linkTarget;
              }
            } else {
              var cookieSet = Boolean(document.cookie.match(/^(.*;)?\s*cdcExtModalOnce\s*=\s*[^;]+(.*)?$/));

              if (false === cookieSet) {
                $extModal.modal();
                $extModal.find('.extlink-url-notice').attr('href', linkTarget).html(linkTarget);
                $extModal.find('.cdcExtLinkContinue').on('click', function () {
                  document.cookie = 'cdcExtModalOnce=true';

                  if ('_blank' === targetAttr || 'new' === targetAttr) {
                    window.open(linkTarget);
                  } else {
                    window.location.href = linkTarget;
                  }
                });
              } else if ('_blank' === targetAttr || 'new' === targetAttr) {
                window.open(linkTarget);
              } else {
                window.location.href = linkTarget;
              }
            }
          };

          $('.tp-link-policy').on('click', function (e) {
            var $e = e,
                //target = $(e.target),
            target = $(this),
                linkTarget = target.attr('href'),
                targetAttr = target.attr('target'),
                linkExtension = target.attr('data-domain-ext'); // fixes svg clicking issue where it takes over e.target

            if (target.is('svg')) {
              linkTarget = target.parent('a').attr('href');
              targetAttr = target.parent('a').attr('target');
              linkExtension = target.parent('a').attr('data-domain-ext');
            } // if "external" linkTarget isn't external, stop here


            if (CDC.parseUrl().hostname === CDC.parseUrl(linkTarget).hostname) {
              return true;
            }

            e.preventDefault();
            popExtModal(linkTarget, targetAttr, linkExtension);
          });
        });
        return true;
      }
    };
    return extLinkReturn;
  }();
})(window.jQuery);
"use strict";

/**
 * JS for FAQ modules
 */
CDC = window.CDC || {};

CDC.FAQs = function () {
  // When the hash points to an FAQ accordion anchor, expand answer
  function anchorExpand() {
    var hash = String(CDC.parseUrl().hash).replace(/^#/, '');
    var hashID = $.escapeSelector(hash);
    var answerID = hashID + '-answer';

    if (hashID.match(/-question$/)) {
      answerID = hashID.replace(/-question$/, '-answer');
    }

    if (hash && $('.cdc-faq #' + hashID).length && $('.cdc-faq #' + answerID).length) {
      $('#' + answerID).collapse('show');
    }
  } // init on load


  $(function () {
    // when there's faqs on the page watch for hash changes
    if ($('.cdc-faq').length) {
      anchorExpand();
      $(window).on('hashchange', function () {
        anchorExpand();
      });
    }
  });
}();
'use strict';
/**
 * tp-forms.js
 * @fileOverview Event handling for the HTML forms
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

$(function () {
  if ($('.cdc-datepicker').length) {
    $.ajax({
      url: CDC.tpPath + '/TemplatePackage/contrib/libs/gijgo/js/gijgo.min.js',
      dataType: 'script',
      cache: true
    }).done(function () {
      $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: CDC.tpPath + '/TemplatePackage/contrib/libs/gijgo/css/gijgo.min.css'
      }).appendTo('head');
      $('.cdc-datepicker').each(function () {
        $(this).datepicker({
          uiLibrary: 'bootstrap4'
        });
      });
    });
  }

  $('.has-clear input[type="text"]').on('input propertychange', function () {
    var $this = $(this);
    var visible = Boolean($this.val());
    $this.siblings('.form-control-clear').toggleClass('d-none', !visible);
  }).trigger('propertychange');
  $('.form-control-clear').click(function () {
    $(this).siblings('input[type="text"]').val('').trigger('propertychange').focus();
  }); //Added for WCMSRD-6819

  $('.forms .dropdown-menu a.dropdown-item').on('click', function (e) {
    e.preventDefault();
    $(this).parents('.dropdown').find('[data-toggle="dropdown"]').text($(this).text());
    $(this).addClass('selected');
    $(this).siblings().removeClass('selected');
  }); // This is causing odd behavior
  // $('.multiselect-forms option').on('click', function(){ //conflict with CSS with :checked. Can't override.
  // 	$(this).toggleClass('selected');
  // });
  //end added
});
'use strict';
/**
 * images.js
 * @fileOverview Event CDC images
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var pluginName = 'cdc_images';

  function CDCPlugin(element, options) {
    this.element = element;
    this.options = $.extend({}, options);
    this._name = pluginName;
  }

  CDCPlugin.prototype = {}; // don't let the plugin load multiple times

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new CDCPlugin(this, options));
      }
    });
  };
})(jQuery, window, document);
'use strict';
/**
 * tp-interactions.js
 * @fileOverview Contains module and constructors to tracking interaction metrics.
 * @version 0.1.0.0
 * @copyright 2019 Centers for Disease Control
 */

(function ($, window, document) {
  window.CDC = window.CDC || {};
  window.CDC.tp4 = window.CDC.tp4 || {};

  window.CDC.tp4.interactionMetrics = window.CDC.tp4.interactionMetrics || function () {
    // Local Methods
    var bindEvents;

    bindEvents = function bindEvents(config) {
      // Generic interaction tracking for any other element that raises the custom event.
      $(document).on('metrics-capture', function (e, label, interaction, navigate) {
        var result = true;

        if ('undefined' === typeof navigate) {
          navigate = true;
        }

        var element = $(e.target);

        if (window.hasOwnProperty('_satellite')) {
          var dataObject = {};
          var _satellite = window._satellite;
          dataObject.label = label;
          dataObject.interactionType = 'lnk_o';
          dataObject.interactionValue = 'ci-' + label + ': ' + interaction;

          _satellite.track('interaction', dataObject);
        }

        if ('a' === element.prop('tagName').toLowerCase() && navigate) {
          // Determine the type of link and only use navigate option on s.tl for standard links off page.
          var href = element.attr('href');
          var target = element.attr('target');

          if (target && '_blank' === target) {
            //if target exists and _blank === target
            navigate = true;
          } else if (href && 0 < href.length && '#' === href[0]) {
            //href exists, href.length < 0, and href="#"
            navigate = false;
          }

          if (navigate) {
            if ('_blank' === target) {
              window.open(CDC.cleanUrl(href), '_blank');
            } else if (href && 0 < href.length && '#' === href[0]) {//do nothing
            } else {
              window.location = CDC.cleanUrl(href);
            }

            result = true;
          } else {
            result = false;
          }
        } else {
          result = false;
        }

        return result;
      });
    };

    return {
      init: function init(config) {
        bindEvents(config);
        return true;
      }
    };
  }();
})(window.jQuery, window, window.document);
'use strict';

(function ($, window, document, undefined) {
  // on proxy, replace top search header form with proxy host
  if (String(window.location.hostname).match(/\.msappproxy\.net$/)) {
    var searchpage = '//' + window.location.hostname + '/connects/search/';
    $('.headerSearch-intranet form').attr('action', searchpage);
  }

  $('.intranet-mobile-menu-btn').click(function () {
    $('.intranet-horizontal-nav .yamm #navbar-collapse-grid').toggleClass('d-block');
    $('.intranet-mobile-menu-btn').toggleClass('active');
    $('.intranet-mobile-menu-btn .open-smallmenu').toggleClass('d-none');
    $('.intranet-mobile-menu-btn .close-smallmenu').toggleClass('d-none');
    $('.mobile-overlay').toggleClass('d-none');
  });
  var link_plus = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>plus</title><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"></path></svg>';
  var link_minus = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>collapse</title><path d="M19,13H5V11H19V13Z"></path></svg>';
  $('.more-link').append(link_plus);
  $('.more-link').click(function () {
    $(this).toggleClass('open').next('.sub-menu').toggleClass('show');

    if ($(this).hasClass('open')) {
      $(this).html('VIEW LESS' + link_minus);
    } else {
      $(this).html('VIEW MORE' + link_plus);
    }
  }); //https://davidwalsh.name/javascript-debounce-function
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
          args = arguments;

      var later = function later() {
        timeout = null;

        if (!immediate) {
          func.apply(context, args);
        }
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(context, args);
      }
    };
  }

  var setSubMenus = function setSubMenus() {
    $('.more-link').removeClass('open').html('VIEW MORE' + link_plus);

    if (753 > $(window).width()) {
      $('.more-link').show();
      $('.sub-menu').removeClass('show');
    } else {
      $('.more-link').hide();
      $('.sub-menu').addClass('show');
    }

    if (990 > $(window).width()) {
      $('.intranet-horizontal-nav .navbar.yamm').addClass('is_mobile');
    } else {
      $('.intranet-horizontal-nav .navbar.yamm').removeClass('is_mobile');
    }

    $('.intranet-horizontal-nav .navbar.yamm.is_mobile .more-link').on('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
  };

  setSubMenus();
  var removeOverlayOnResize = debounce(function () {
    $('.body-wrapper .overlay').toggleClass('d-none');
    setSubMenus();
  }, 500);
  $(window).on('resize', removeOverlayOnResize);
})(jQuery, window, document);
"use strict";

/**
 * CDC.MegaNav
 *
 * Logic for the meganav bar. Assumes to be run at the bottom of the page after app.js
 */
window.CDC = window.CDC || {};

window.CDC.MegaNav = window.MegaNav || function ($) {
  var $meganav;
  var $leftnav;
  var currentLeftNav = 0;
  var initialized = false;
  var onCovidHome = '/coronavirus/2019-ncov/' === CDC.parseUrl().pathname.replace(/index\.html$/, '').toLowerCase();
  /**
   * Steps:
   *  1. CONFIGURE MEGANAV
   *  2. MOVE MOBILE SITE TITLE FEATURE IMAGE TO CORRECT SPOT IN DOM
   *  3. BUILD MOBILE NAV
   *  4. MEGANAV METRICS
   */

  function init() {
    // must be cdc-2020 template and uninitialized
    if (!$('html.cdc-2020').length || initialized) {
      return;
    }

    $meganav = $('#cdc-meganav-bar');
    $leftnav = $('#cdc-left-nav-menu');
    var $overlay = $('.cdc-meganav-overlay:first');
    var $siteTitle = $('.site-title');
    var $siteTitleFeatureImg = $('.site-title-image-mobile'); // If no meganav is present, stop

    if (!$meganav.length) {
      return;
    } // 1. CONFIGURE MEGANAV


    if ($meganav.length) {
      if (onCovidHome) {
        $meganav.find('.nav-home .nav-link:first').addClass('active');
      } else if ($leftnav.length) {
        currentLeftNav = parseInt($leftnav.data('menu-id'), 10); // make the current leftnav active in meganav

        if (currentLeftNav) {
          $meganav.find('[data-menu-id="' + String(currentLeftNav) + '"]').addClass('active');
        }

        if (window.CDC_MEGANAV_MENUS && 'number' === typeof CDC_MEGANAV_MENUS[currentLeftNav]) {
          $meganav.find('.nav-item:nth-child(' + CDC_MEGANAV_MENUS[currentLeftNav] + ') .nav-link').addClass('active');
        }
      } // show backdrop on dropdown


      $meganav.find('.dropdown').on('shown.bs.dropdown', function () {
        $meganav.addClass('opened');
        $overlay.addClass('show').show();
      }).on('hide.bs.dropdown', function () {
        $meganav.removeClass('opened');
        $overlay.removeClass('show').hide();
      });
    } // 2. MOVE MOBILE SITE TITLE FEATURE IMAGE TO CORRECT SPOT IN DOM


    if ($siteTitleFeatureImg.length) {
      $siteTitle.after($siteTitleFeatureImg);
    } // 2b. Add a mobile breadcrumb


    var $breadcrumb = $('.cdc-2020-breadcrumb:first');

    if (!onCovidHome && $breadcrumb.length && !$breadcrumb.find('a.home-link').length) {
      var hometitle = String(window.CDC_SITE_TITLE || 'COVID-19');
      var homelink = $('.site-title:first a:first').attr('href');

      if (homelink && homelink) {
        var $navHome = $('<a class="home-link">').attr('href', homelink).safehtml('<span class="cdc-icon-chevron-right"></span> Back to ' + hometitle + ' Home');
        $breadcrumb.append($navHome);
      }
    } // Add metrics to site title feature image links


    $('.cdc-2020 .site-title-image a, .cdc-2020 .site-title-image-mobile a').on('click', function (e) {
      $(this).trigger('metrics-capture', ['site-title-feature-image', 'click']);
    }); // 3. BUILD MOBILE NAV
    // adding minimum-scale=1 to keep the pinch from pinching in too small causing swiping issues in mobile

    document.head.querySelector('meta[name="viewport"]').content = 'width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no'; // One tweak for large viewport - change body classes to break on xl view port

    var $body = $('div.container.body-wrapper');

    if ($body.length) {
      $body.children().each(function () {
        var className = $(this).attr('class');

        if (className) {
          $(this).attr('class', String(className).replace(/-lg-/g, '-xl-'));
        }
      });
    } // init the new nav


    makeNewNav(); // we want to capture resize, but not scroll events

    var ww = $(window).width();
    $(window).on('resize', function () {
      var nw = $(window).width(); // if the new window width isn't the same as the old window width

      if (nw !== ww) {
        // reset the mobile nav
        resetNewNav();
      }
    }); // 4. MEGANAV METRICS
    //TOP nav bar click

    $('#cdc-meganav-bar .nav-link.dropdown-toggle').on('click', function () {
      var linktext = String($(this).text()).toLowerCase().trim().replace(/\W+/g, '-');

      if ('true' === $(this).attr('aria-expanded')) {
        $(this).trigger('metrics-capture', ['meganav-topnav-dropdown-bar-' + linktext, 'close']);
      } else {
        $(this).trigger('metrics-capture', ['meganav-topnav-dropdown-bar-' + linktext, 'open']);
      }
    }); //TOP dropdown nav item click

    $('#cdc-meganav-bar .linked-list .list-item').on('click', function () {
      $(this).trigger('metrics-capture', ['meganav-top-nav-item', 'click']);
    }); //Dynamically generate level as a data attr
    //This will help with determining item level later

    var $allNavItems = $('#covid-nav-mobile, #cdc-left-nav-menu').find('.list-group-item');
    $allNavItems.each(function () {
      if ($(this).hasClass('nav-lvl1')) {
        $(this).attr('data-level', 1);
      } else if ($(this).hasClass('nav-lvl2')) {
        $(this).attr('data-level', 2);
      } else if ($(this).hasClass('nav-lvl3')) {
        $(this).attr('data-level', 3);
      }
    }); //LEFT/BOTTOM Nav 'Level' Metrics

    $('.cdc-2020 #covid-nav-mobile a').on('click', function () {
      var level = $(this).parent('.list-group-item').attr('data-level');
      var isIcon = $(this).hasClass('nav-expandcollapse');
      var leftOrBottom = -1 < $.inArray(CDC.tp4["public"].getViewport(), [1, 2, 3]) ? 'bottom' : 'left';
      var linktext = String($(this).text()).toLowerCase().trim().replace(/\W+/g, '-'); //IF is an icon

      if (isIcon) {
        //when the anchor receives 'nav-plus' class, it is being collapsed
        if ($(this).hasClass('nav-plus')) {
          $(this).trigger('metrics-capture', ['meganav-' + leftOrBottom + 'nav-collapse-lvl' + level, 'click']);
        } else {
          $(this).trigger('metrics-capture', ['meganav-' + leftOrBottom + 'nav-expand-lvl' + level, 'click']);
        }
      } else if (level) {
        $(this).trigger('metrics-capture', ['meganav-' + leftOrBottom + 'nav-item-lvl' + level + '-' + linktext, 'click']);
      } else {
        $(this).trigger('metrics-capture', ['meganav-' + leftOrBottom + 'nav-item-' + linktext, 'click']);
      }
    }); //Meganav Back Button Metrics

    $('#covid-nav-mobile .nav-back').on('click', function () {
      $(this).trigger('metrics-capture', ['meganav-nav-back-btn', 'click']);
    }); //Meganav All Links to Pages Metrics

    $('#covid-nav-mobile .list-under-item a:first-child').on('click', function (e) {
      //e.preventDefault();
      //Rename prop40
      var linktext = String($(this).text()).toLowerCase().trim().replace(/\W+/g, '-');
      $(this).trigger('metrics-capture', ['meganav-mobile-nav-item-' + linktext, 'click']); // $( this ).trigger( 'metrics-capture', [ 'meganav-mobile-bottom-nav-item', 'click' ] );
      //return false;
    }); //Meganav Overlay Metrics Trigger

    var eventsToWatch = 'click touchstart';

    if (window.PointerEvent) {
      eventsToWatch = 'pointerup';
    }

    $('.covid-mobile-overlay').on(eventsToWatch, function (e) {
      $(this).trigger('metrics-capture', ['meganav-mobile-overlay', 'click']);
    });
    initialized = true;
  } //end init

  /***************************************
   COVID mobile nav
  
   The COVID mobile nav is a sticky drill-down menu used in XS through L viewports.
  
   1. This nav is built from the existing left nav on a page
   2. If a left nav doesn't appear on the page (.tp-main-nav) an empty replacement is substituted for it
   ***************************************/


  var lang = document.documentElement.lang,
      menutext = 'MENU',
      closetext = 'CLOSE',
      searchtext = 'Search COVID-19 Site',
      searchword = 'Search',
      searchurl = 'https://search.cdc.gov/search/index.html?query=';

  if ('es-us' === lang || 'es' === lang) {
    menutext = 'MENÚ';
    closetext = 'CERRAR';
    searchtext = 'Buscar en el sitio web de COVID-19';
    searchword = 'Buscar';
    searchurl = 'https://search.cdc.gov/search/spanish/?query=';
  }

  function makeNewNav() {
    var isCoronavirus = -1 < window.location.pathname.indexOf('/coronavirus/'),
        $t = $('.tp-nav-main'),
        clone = isCoronavirus && !onCovidHome && $t.clone().length ? $t.clone() : $('<ul class="list-group" />'),
        // HP doesn't have a nav to clone, so make a temp UL for it
    search = '<div class="input-group p-3 no-print covid-mobile-search"><input aria-label="' + searchtext + '" class="form-control mobile-covid-search-input border-none" placeholder="' + searchtext + '" type="text"><div class="input-group-append"><button class="btn btn-mobile-covid-search bg-white" type="button"><span class="x16 fill-p dark cdc-icon-search-light"></span><span class="sr-only">' + searchword + '</span></button></div></div>',
        undernav = '<li class="list-under-item list-item-first"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-ncov/index.html"><span class="x16 fill-p cdc-icon-home-lg-light"></span>COVID-19 Home</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-ncov/your-health/index.html"><span class="x16 fill-p cdc-icon-user-light"></span>Your Health</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-ncov/vaccines/index.html"><span class="x16 fill-p cdc-icon-band-aid-light" style="transform:rotate(45deg)"></span>Vaccines</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://covid.cdc.gov/covid-data-tracker/#datatracker-home"><span class="x16 fill-p cdc-icon-chart-bar-light"></span>Cases &amp; Data</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-ncov/community/index.html"><span class="x16 fill-p cdc-icon-building-light"></span>Specific Settings</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-nCoV/hcp/index.html"><span class="x16 fill-p cdc-icon-user-md-light"></span>Healthcare Workers</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-nCoV/lab/index.html"><span class="x16 fill-p cdc-icon-vial-light"></span>Laboratories</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-ncov/php/index.html"><span class="x16 fill-p cdc-icon-notes-medical-light"></span>Health Departments</a></li>' + '<li class="list-under-item"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-ncov/science/science-and-research.html"><span class="x16 fill-p cdc-icon-virus-light"></span>Science &amp; Research</a></li>' + '<li class="list-under-item list-item-last"><a class="list-group-item-action" href="https://www.cdc.gov/coronavirus/2019-ncov/more/index.html"><span class="x16 fill-p cdc-icon-ballot-check-light"></span>More Resources</a></li>',
        menubtn = $('<button class="btn btn-quaternary no-print btn-mobile-menu menu-closed d-xl-none"><span class="fs1 px-1 c-primary fw-600">' + menutext + '</span><span class="x16 ml-2 fill-p cdc-icon-chevron-right"></span></button><button class="btn btn-primary btn-mobile-search menu-closed d-xl-none float-right no-print" aria-label="Search"><span class="x28 fill-w cdc-icon-search-light"></span></button>'),
        nav = '<nav role="navigation" aria-label="New Mobile Navigation Menu" id="covid-nav-mobile" class="d-xl-none hide no-print"></nav>',
        url = window.location.href;
    clone.find('a[href="' + url + '"]').parentsUntil('#covid-nav-mobile', 'li').css('background-color', '#f0f0f0'); // for each plus icon in the left nav

    clone.find('.cdc-icon-plus').addClass('cdc-icon-single_arrow') // add single arrow icon
    .removeClass('cdc-icon-plus') // change plus to arrow
    .attr('style', ''); // remove any styles
    // for each minus icon in the left nav

    clone.find('.cdc-icon-minus').addClass('cdc-icon-single_arrow') // add single arrow icon
    .removeClass('cdc-icon-minus') // change minus to arrow
    .attr('style', ''); // remove any styles

    clone.find('.collapse').removeClass('collapse'); // remove collapse

    clone.find('a[data-toggle]').removeAttr('data-toggle'); // remove data-toggle

    clone.find('.active').removeClass('active');
    clone.removeClass('tp-nav-main'); // remove class

    clone.find('[id]').each(function () {
      // fix dupe id's
      this.id += '_clone';
    }); // make sure the li has a nav-link class

    clone.find('li').each(function () {
      $(this).addClass('nav-link');
    }); // append the clone after the site title

    $('.site-title').after(clone); //.addClass( 'sticky-top' );

    clone.wrap(nav).parent(); // append the top nav links to the clone

    clone.append(undernav); // if we're on the HP, we don't have any child links so change the top level
    // links that appear under the mobile nav to appear like standard mobile nav links

    if (onCovidHome) {
      $(clone).find('.list-under-item').addClass('list-group-item') // add single arrow icon
      .removeClass('list-under-item'); // change plus to arrow
    } // prepend the search to the clone


    clone.parent().prepend(search); // add the overlay to the body

    $('body').prepend('<div class="covid-mobile-overlay"></div>'); // if the button isn't already on the page, append it

    if (0 === $('.btn-mobile-menu').length) {
      $('.display-6.text-white.fw-500.pt-1.pb-1').append(menubtn);
    } // the +/- in the current nav


    var expand = clone.find('.nav-expandcollapse'); // store the container height

    var height = clone.parent().height(); // loop over the expand nodes in the nav

    expand.each(function () {
      var t = $(this),
          ul = t.next('ul'),
          back = $('<li class="list-group-item nav-back cur-pointer"><span class="cdc-arrow cdc-arrow-left cdc-arrow-thin mr-2"></span>Back</li>'),
          url2 = t.prev('a').attr('href'),
          txt = t.prev('a').text(),
          newli = '<li class="list-group-item nav-parent"><a href="' + url2 + '">' + txt + '<u class="float-right text-capitalize"><small>View</small></u></a>'; // add the li

      ul.prepend(newli); // add the back link

      ul.prepend(back); // set the height to match the container
      // console.log( ul.height() );
      // ul.css( 'height', height + 'px' );
      // set the ULs to the full height of the document to resolve swiping issues in older iOS devices
      // ul.height( $( document ).height() );

      ul.css('width', '0px'); //items are to right side of overflow, and must be excluded when hidden
    }); // Set fixed height: position and height also changes with scroll function below

    var navHeight = window.innerHeight - $('.site-title').offset().top - $('.site-title').height();
    $('#covid-nav-mobile').css('height', navHeight + 'px'); //Search icon inside the mobile nav

    $('.cdc-2020 .btn-mobile-covid-search').on('click', function (e) {
      $(this).trigger('metrics-capture', ['meganav-mobile-search', 'click']);
    }); // opening and closing the menu

    $('.btn-mobile-menu, .btn-mobile-search').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!$(this).hasClass('menu-opened')) {
        if ($(this).hasClass('btn-mobile-search')) {
          $(this).trigger('metrics-capture', ['meganav-mobile-search', 'open']);
        } else {
          $(this).trigger('metrics-capture', ['meganav-mobile-menu-btn', 'open']);
        }
      } else {
        $(this).trigger('metrics-capture', ['meganav-mobile-menu-btn', 'close']);
      }

      var mb = $('.btn-mobile-menu'),
          sm = $('.btn-mobile-search'),
          cloned_nav = clone.parent('nav'),
          over = $('.covid-mobile-overlay'),
          targetElement = document.querySelector('#covid-nav-mobile'); // *** JS version of menu show and slide

      if (cloned_nav.hasClass('hide')) {
        // left position is the 100% - the VP nav-mobile width. e.g. 100% - 90% (mobile width) = 10%
        var left = '10%'; // if the window is wider than 992, move the left

        if (992 < $(window).width()) {
          left = '67%';
        } // NOTE: nav is hidden to prevent iOS overflow scrolling
        // opening the menu


        cloned_nav.show({
          done: function done() {
            // once the nav is visible, toggle classes and then animate
            bodyScrollLock.disableBodyScroll(targetElement);
            sm.hide(); // hide the search icon

            over.show(); // show the overlay

            cloned_nav.show(); // show the nav

            cloned_nav.removeClass('hide'); // remove the hide class

            mb.toggleClass('menu-closed menu-opened'); // toggle the menu-* class for metrics
            // animate the nav left

            cloned_nav.animate({
              left: left
            }, function () {
              // change the button icon and text
              mb.html('<span class="x24 fill-p cdc-icon-close mr-2"></span><span class="fw-600 fs1 px-1 c-primary">' + closetext + '</span>');
            });
          }
        });
      } else {
        // closing the menu
        cloned_nav.animate({
          left: '100%'
        }, function () {
          $('#covid-nav-mobile')[0].scrollTop = 0; // reset the menu to the top when closing
          // there is no callback on jQuery animate,
          // so wait 400ms for the animation to complete in order to toggle and hide

          setTimeout(function () {
            bodyScrollLock.enableBodyScroll(targetElement); // re-enable body scroll

            sm.show(); // show the search icon

            cloned_nav.hide(); // hide the nav

            over.hide(); // then hide the overlay

            cloned_nav.addClass('hide'); // add the hide class

            mb.toggleClass('menu-closed menu-opened'); // toggle the menu-* class for metrics

            mb.html('<span class="fw-600 fs1 px-1 c-primary">' + menutext + '<span class=" x16 ml-2 fill-p cdc-icon-chevron-right "></span>');
          }, 400);
        });
      }
    }); // When clicking on a .nav-link ( not just the anchor or the arrow )
    // Position the child UL and display it
    // NOTE: This repositioning happens when you click the link and not on load, since I couldn't find a reliable
    // way to do it on load. Some would position, others wouldn't, and even others would be in the wrong position!
    // CSS handles the animation, all this does is find the correct position and then sets the UL to active

    clone.find('.nav-link').on('click', function (evt) {
      // clicking on the nav LIs should either activate the sub menu or activate the link
      // so we're stopping any of the default behaviors here, and managing them in code
      evt.preventDefault();
      evt.stopPropagation();
      $(this).trigger('metrics-capture', ['meganav-mobile-nav-item', 'click']);
      /*
      since ULs are structured like this...
      |_
        |_
        |_
      	|_
      We need them all to appear at the top of the first Ul when they slide into place
      	1. Using position:absolute with top: 0 doesn't work, it only causes the child UL to appear at the top of its parent
      	2. We need all the child ULs to appear at the very top, underneath the .input-group
      	3. Here we determine where they need to appear and adjust all of them accordingly
      */

      var nl = $(this),
          searchbottom = $('#covid-nav-mobile .input-group')[0].getBoundingClientRect().bottom,
          // get the bottom of the
      newpos = 0,
          link = nl.find('a').first(); // if the link has a child ul, we need to position it and set some classes

      var ul = nl.find('ul:first');

      if (ul.length) {
        var top = ul[0].getBoundingClientRect().top; // setting styling for showing child ul

        ul.css('width', '100%');
        var listHeight = screen.height - $('.container-fuid.header-wrapper').height() - $('.site-tile').height() - $('.covid-mobile-search').height(); // window height within area of mobile nav (under search input)

        navHeight = listHeight > ul.height() ? listHeight : ul.height();
        navHeight += $('.covid-mobile-search').height() * 2;
        $('#covid-nav-mobile').css('height', navHeight + 'px'); // newpos is where the child UL should appear, often a negative top position

        newpos = searchbottom - top + 'px'; // if the new position has already been set, don't reset it

        if (ul.hasClass('set')) {
          ul.addClass('active');
        } else {
          // reposition the UL
          ul.css({
            top: newpos
          }).addClass('set active');
        } // Keep the nav at the top when navigating


        $('#covid-nav-mobile')[0].scrollTop = 0;
      } else {
        // it's just a link, simply redirect
        location.href = link[0].href;
      }
    }); // if current page is in submenu, add set it as active state on page load

    $(window).on('load', function (evt) {
      evt.preventDefault();
      evt.stopPropagation();
      var selected = clone.find('li.selected.list-group-item'),
          ul = selected.parent('ul.show');

      if (ul) {
        $(this).addClass('selected-ul');

        if (ul.parents('ul.show')) {
          ul.parents('ul.show').each(function () {
            $(this).addClass('set active');
          });
        }

        ul.addClass('set active selected-ul');
      }
    }); //if current page is in submenu, set  it in menu

    $('.btn-mobile-menu').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var ul = $('ul.selected-ul');

      if (ul) {
        $('ul.show.active').css('width', '100%');
        var searchbottom = $('#covid-nav-mobile .input-group')[0].getBoundingClientRect().bottom,
            nl = ul.parents('.nav-link'),
            parentUl = nl.find('ul.show').first(),
            top = parentUl.length && parentUl[0].getBoundingClientRect().top || 0,
            newPos = 0;

        if (top && $(this).hasClass('menu-closed')) {
          if (ul.parents('ul.show')) {
            newPos = searchbottom - top;
            ul.parents('ul.show').each(function () {
              $(this).css({
                top: newPos + 'px',
                width: '100%'
              });
            });
          }

          newPos = searchbottom - ul[0].getBoundingClientRect().top;
          ul.css({
            top: newPos + 'px',
            width: '100%'
          });
        } else {
          // reset position on close
          $('ul.set.active').css('width', '0px');
          newPos = 0;
          ul.css('top', newPos + 'px');

          if (ul.parents('ul.show')) {
            ul.parents('ul.show').each(function () {
              $(this).css('top', newPos + 'px');
            });
          }
        }
      }
    }); // we're disabling links in the nav-link click event, so we have to check here if we
    // explicitly click on a link in the nav, allow the link to work if it doesn't have a sibling UL

    clone.find('.list-group-item a').on('click', function () {
      if (0 === $(this).siblings('ul').length) {
        location.href = $(this)[0].href;
      }
    }); // clicking on the back link

    $('.nav-back').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).parent().css('width', '0px'); // setting back to 0 to correct nav overflow
      // reset nav height

      if (currentHeight > maxHeight) {
        $('#covid-nav-mobile').css('height', maxHeight + 'px');
      } else {
        $('#covid-nav-mobile').css('height', currentHeight + 'px');
      } // show the parent


      $(this).parent('ul').removeClass('active');
    }); // reset the nav if the overlay is clicked on

    $('.covid-mobile-overlay').on('click', function () {
      resetNewNav();
    });
    var position = $(window).scrollTop();
    var headerHeight = $('.site-title').offset().top + $('.site-title').height();
    var siteTitleHeight = $('.site-title').height(); // position the top of the mobile nav on scroll/swipe

    $(window).on('scroll', function () {
      var scroll = $(window).scrollTop(),
          wheight = $(document).height(),
          breakpoint = wheight / 3,
          stbm = $('.site-title').height();

      if (scroll > position) {
        // going down
        if (breakpoint < window.scrollY) {
          // if we're past 300px from the top hide the site title
          $('.site-title').addClass('up');
        }
      } else {
        // going up - show the site title
        $('.site-title').removeClass('up');
      }

      position = scroll; // overlay can't cover the logo, meaning it has to be positioned
      // We can't simply position it 75px down, because when the site title sticks 75px is too far.
      // Set the overlay-up class to move the overlay up if we're past the 75px for the title area

      if (75 < position) {
        $('body').addClass('overlay-up');
      } else {
        $('body').removeClass('overlay-up');
      } // line the mobile nav up with the bottom of the site-title


      var newpos = position + stbm; // if we're at or near the very top, sticky hasn't positioned the title bar so
      // remove any styling. ***Adding a condition for the activeElement because if you click
      // the search input using an older iphone model, it triggers a resize event which cause this
      // block of code to execute and inadvertently hides the mobile nav.
      // fix nav to bottom of header when at top of page

      if (siteTitleHeight > position) {
        $('#covid-nav-mobile').css({
          top: headerHeight + 'px'
        });
      } else if (siteTitleHeight < position) {
        $('#covid-nav-mobile').css({
          top: newpos
        }); //make sure nav height is tall enough when scroll has gone past header area

        $('#covid-nav-mobile').css('height', window.innerHeight + 'px');
      }
    }); // SEARCH

    $('.btn-mobile-covid-search').on('click', function () {
      var uri = $('.mobile-covid-search-input').val(),
          searchval = encodeURI(uri);
      CDC.open(searchurl + searchval + '&sitelimit=coronavirus');
    }); // clear button should remove the text from the search input and hide itself

    $('.btn-mobile-covid-search-clear').on('click', function () {
      $('.mobile-covid-search-input').val('');
      $(this).addClass('d-none');
    }); // handle enter key on input ( shouldn't be necessary on mobile... )

    $('.mobile-covid-search-input').on('keypress', function (e) {
      // if the user presses enter in the input, send the click event
      if (13 === e.charCode) {
        $('.btn-mobile-covid-search').click();
      }
    }).on('focus', function () {
      // activate the search button
      $('.btn-mobile-covid-search').attr('style', 'background-color: #007b91!important').find('.fill-p').addClass('active');
    }).on('blur', function () {
      $('.btn-mobile-covid-search').removeAttr('style').find('.fill-p').removeClass('active');
    }).on('keyup', function () {
      var tt = $(this),
          btnclear = $('.btn-mobile-covid-search-clear'); // if the input has text, add the clear button

      if (tt.val().length) {
        btnclear.removeClass('d-none');
      } else {
        btnclear.addClass('d-none');
      }
    }); //*******************************************************
    // END SEARCH
  } // remove all actives and close menu


  function resetNewNav() {
    var cloned_nav = $('#covid-nav-mobile'),
        over = $('.covid-mobile-overlay'),
        mb = $('.btn-mobile-menu');
    cloned_nav.animate({
      left: '100%'
    }, function () {
      // timeout to let the menu animate before hiding
      setTimeout(function () {
        cloned_nav[0].scrollTop = 0; // reset the menu to the top

        bodyScrollLock.clearAllBodyScrollLocks(); // re-enable body scroll

        cloned_nav.hide(); // hide the nav

        over.hide(); // then hide the overlay

        cloned_nav.addClass('hide'); // add the hide class

        mb.removeClass('menu-opened'); // toggle the menu-* class for metrics

        mb.html('<span class="c-primary fw-600 fs1 px-1">' + menutext + '</span><span class="x16 ml-2 fill-p cdc-icon-chevron-right"></span>');
        mb.addClass('menu-closed');
      }, 400);
    });
  }

  $(function () {
    init();
  }); // expose meganav init

  return {
    init: init
  };
}(window.jQuery);
'use strict';
/**
 * tp-multipage-nav.js
 * @fileOverview Contains module for multipage nav controls
 * @version 0.2.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var pluginName = 'cdc_multipagenav';

  function CDCPlugin(element, options) {
    this.element = element;
    this._name = pluginName;
    this.init();
  }

  CDCPlugin.prototype = {
    init: function init(config) {
      var $currentPageHighlight = $(".multi-page li.list-group-item a[href$='" + CDC.cleanUrl(location.pathname) + "']");
      $currentPageHighlight.addClass('active');
    }
  }; // don't let the plugin load multiple times

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new CDCPlugin(this, options));
      }
    });
  };
})(jQuery, window, document);
'use strict';
/**
 * tp-nav.js
 * @fileOverview Contains module and constructors to handle navigation behavior outside of the scope of bootstrap
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

(function ($) {
  window.CDC = window.CDC || {};
  window.CDC.tp4 = window.CDC.tp4 || {};

  window.CDC.tp4.nav = window.CDC.tp4.nav || function () {
    var iconMinus = 'M19,13H5V11H19V13Z',
        iconPlus = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
        config = config || {},
        $fourthLevelNav = $(''),
        $nav = $('nav .tp-nav-main'); // Local Methods

    var bindEvents, togglePlusMinus, cloneAndCleanNav, buildMobileSectionNav, insertNavItem, _selectActiveNavItems, buildBreadCrumbs, saveFourthLevelNav, checkHiddenLinks;

    function _isMobileNavEnabled() {
      var mobileNavEnabled = Boolean($('div.leftnav-wrapper .tp-nav-main').length);

      if ( // don't display mobile nav on Covid site
      0 === CDC.parseUrl().pathname.indexOf('/coronavirus/') || // don't display on Home 2022 pages
      $('html').hasClass('home-2022') || // don't display on intranet
      $('html').hasClass('intranet') || // switch to disable
      $('html').hasClass('no-mobile-nav') || // JS switch to disable
      window.NO_MOBILE_NAV) {
        mobileNavEnabled = false;
      }

      return mobileNavEnabled;
    }

    bindEvents = function bindEvents() {
      // Left / Bottom Nav Expand / Collapse
      // Note: Not seeing any svg's in nav dom (3/9/21)
      $nav.find('a svg').on('click', function (e) {
        var leftOrBottom = -1 < $.inArray(CDC.tp4["public"].getViewport(), [1, 2, 3]) ? 'bottom' : 'left';
        $(this).trigger('metrics-capture', [leftOrBottom + '-nav-expand-collapse', $(this).parent('a').hasClass('nav-plus') ? 'expand' : 'collapse']);
        togglePlusMinus(this);
      });
      $nav.find('a .fi').on('click', function (e) {
        e.preventDefault();
        var leftOrBottom = -1 < $.inArray(CDC.tp4["public"].getViewport(), [1, 2, 3]) ? 'bottom' : 'left';
        $(this).trigger('metrics-capture', [leftOrBottom + '-nav-anchor-child', 'click']);
        togglePlusMinus(this);
      }); // Left / Bottom Nav Child Anchor Click

      $nav.find('li a:first-child').on('click', function (e) {
        e.preventDefault(); //don't run this metrics call on /coronavirus site

        var leftOrBottom = -1 < $.inArray(CDC.tp4["public"].getViewport(), [1, 2, 3]) ? 'bottom' : 'left';
        $(this).trigger('metrics-capture', [leftOrBottom + '-nav-anchor-child', 'click']);
        return false;
      }); // Left / Bottom Nav "Home" Anchor Click

      $nav.parent('nav').find('.nav-section-home a').on('click', function (e) {
        e.preventDefault();
        var leftOrBottom = -1 < $.inArray(CDC.tp4["public"].getViewport(), [1, 2, 3]) ? 'bottom' : 'left';
        $(this).trigger('metrics-capture', [leftOrBottom + '-nav-anchor-home', 'click']);
        return false;
      }); // Left / Bottom Nav Keyboard Accessibility

      $(document).on('keyup', window.CDC.Common.debounce(function (e) {
        if (13 === e.which) {
          if ($(e.currentTarget.activeElement).hasClass('nav-plus') || $(e.currentTarget.activeElement).hasClass('nav-minus')) {
            var leftOrBottom = -1 < $.inArray(CDC.tp4["public"].getViewport(), [1, 2, 3]) ? 'bottom' : 'left';
            $(e.currentTarget.activeElement).trigger('metrics-capture', [leftOrBottom + '-nav-expand-collapse', $(e.target).hasClass('nav-plus') ? 'expand' : 'collapse']);
            togglePlusMinus($(e.target).find('svg'));
            togglePlusMinus($(e.target).find('.fi'));
          }
        }
      }, 250)); // Mobile Section Nav Interactions

      if (config.mobileSectionNav.enabled) {
        var eventsToWatch = 'click touchstart';
        var $mobileNavLinks;
        var mobileNavVersion = 1;

        if (window.PointerEvent) {
          eventsToWatch = 'pointerup';
        }

        if ($('#mobileNav-dropdown nav').length) {
          $mobileNavLinks = $('#mobileNav-dropdown nav');
        } else {
          mobileNavVersion = 2;
          $mobileNavLinks = $('.mobile-section-nav .mobile-section-nav-menu');
        }

        var mobileNavAppear = function mobileNavAppear() {
          $('.modalMask').fadeIn();

          if (2 === mobileNavVersion) {
            $('.mobile-section-nav .mobile-section-nav-menu, .mobile-section-nav-foot').addClass('show');
          }

          $('.mobile-section-nav .toggleMask #svg-down').css('transform', 'rotate(180deg)');
          $('#sectionNavButton').attr('aria-expanded', 'true');
        };

        var mobileNavDisappear = function mobileNavDisappear() {
          $('.modalMask').fadeOut();

          if (2 === mobileNavVersion) {
            $('.mobile-section-nav .mobile-section-nav-menu, .mobile-section-nav-foot').removeClass('show');
          }

          $('.mobile-section-nav .toggleMask #svg-down').css('transform', '');
          $('#sectionNavButton').attr('aria-expanded', 'false');
        }; // Hide if user clicks/taps a link inside the mobile navigation


        $mobileNavLinks.find('a').on(eventsToWatch, function (e) {
          mobileNavDisappear();
          $(this).trigger('metrics-capture', ['section-nav-anchor-child', 'click']);
          return false;
        }); // Hide if user clicks/taps the footer link inside the mobile navigation

        $mobileNavLinks.find('a.list-group-item.mobile-section-nav-foot').on(eventsToWatch, function (e) {
          e.preventDefault();
          mobileNavDisappear();
          $(this).trigger('metrics-capture', ['section-nav-anchor-home', 'click']);
          return false;
        }); // Hide if user clicks/taps the modal background area

        $('.modalMask').on(eventsToWatch, function (e) {
          mobileNavDisappear();
          $(this).trigger('metrics-capture', ['section-nav-expand-collapse-outside', 'collapse']);
        }); // Toggle if user taps the section title bar or arrow icon

        $('.mobile-section-nav .toggleMask').on(eventsToWatch, function (e) {
          var clickedElement = 'svg-down' === e.target.id ? 'image' : 'header';

          if ('true' === $('#sectionNavButton').attr('aria-expanded')) {
            mobileNavDisappear();
            $(this).trigger('metrics-capture', ['section-nav-expand-collapse-' + clickedElement, 'collapse']);
          } else {
            mobileNavAppear();
            $(this).trigger('metrics-capture', ['section-nav-expand-collapse-' + clickedElement, 'expand']);
          }
        });
      }
    };

    togglePlusMinus = function togglePlusMinus(target) {
      var $this = $(target),
          $thisAnchor = $this.parent();

      if ($thisAnchor.hasClass('nav-plus')) {
        $thisAnchor.removeClass('nav-plus').addClass('nav-minus');
        $thisAnchor.find('.cdc-icon-plus').css('transform', 'rotate(-180deg)').removeClass('cdc-icon-plus').addClass('cdc-icon-minus');
        $thisAnchor.find('svg title').text('collapse');
        $thisAnchor.find('svg path').attr('d', iconMinus);
        $thisAnchor.find('title').text('collapse');
      } else if ($thisAnchor.hasClass('nav-minus')) {
        $thisAnchor.removeClass('nav-minus').addClass('nav-plus');
        $thisAnchor.find('.cdc-icon-minus').css('transform', 'rotate(0deg)').removeClass('cdc-icon-minus').addClass('cdc-icon-plus');
        $thisAnchor.find('svg title').text('expand');
        $thisAnchor.find('svg path').attr('d', iconPlus);
        $thisAnchor.find('title').text('plus');
      }
    };

    checkHiddenLinks = function checkHiddenLinks() {
      var $leftNavLinks = $('ul[id^=nav-group-]');

      if ($leftNavLinks.length > 0) {
        var _iterator = _createForOfIteratorHelper($leftNavLinks),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var linkList = _step.value;
            var allHidden = Array.from(linkList.children).every(function (link) {
              return link.classList.contains('cdc-nav-item-hidden');
            });

            if (allHidden) {
              $(linkList).siblings('a.nav-expandcollapse').hide();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        console.log('No Links to Hide');
      }
    };

    cloneAndCleanNav = function cloneAndCleanNav(nav) {
      var clonedNav = nav.clone();
      clonedNav.find('.cdc-icon-plus').addClass('cdc-icon-single_arrow') // add single arrow icon
      .removeClass('cdc-icon-plus') // change plus to arrow
      .attr('style', ''); // remove any styles
      // for each minus icon in the left nav

      clonedNav.find('.cdc-icon-minus').addClass('cdc-icon-single_arrow') // add single arrow icon
      .removeClass('cdc-icon-minus') // change minus to arrow
      .attr('style', ''); // remove any styles
      // clonedNav.find( '.list-group' ).removeClass( 'list-group' );

      clonedNav.find('.list-group-item').removeClass('list-group-item');
      clonedNav.find('.collapse').removeClass('collapse'); // remove collapse

      clonedNav.find('a[data-toggle]').removeAttr('data-toggle'); // remove data-toggle

      clonedNav.find('.active').removeClass('active'); // remove active

      clonedNav.removeClass('tp-nav-main'); // remove class

      clonedNav.find('[id]').each(function () {
        // fix dupe id's
        this.id += '_clone';
      }); // make sure the ul has a nav-expand-content class

      clonedNav.find('ul').each(function () {
        $(this).addClass('nav-expand-content');
      }); // Add a Class to Level 2 ul

      clonedNav.find('li.nav-lvl1 > ul').addClass('nav-items-lvl2'); // Add a Class to Level 3 ul

      clonedNav.find('ul.nav-expand-content li.nav-lvl2 ul').addClass('nav-items-lvl3'); // Disable Level 3

      clonedNav.find('li.nav-lvl2.nav-item.nav-expand > a').removeClass('nav-anchor'); // we're not using the +/- in the current nav so remove it

      clonedNav.find('.nav-expandcollapse').remove(); // make sure the li has a nav-item class

      clonedNav.find('li').each(function () {
        $(this).addClass('nav-item');
      }); // make sure the a has a nav-anchor class

      clonedNav.find('a').each(function () {
        $(this).addClass('nav-anchor');
      });
      return clonedNav;
    };

    buildMobileSectionNav = function buildMobileSectionNav(configSectionNav, $targetAnchor) {
      config = configSectionNav || {};
      var sitePath = config.pathToSelect; //if (config.mobileSectionNav.enabled) {

      if (_isMobileNavEnabled()) {
        var setHeight = function setHeight() {
          var menuHeight = $('nav#new-nav-mobile').height();

          if (2 === level) {
            $('#new-nav-mobile li.nav-item.selected').closest('ul').closest('li.nav-expand').addClass('active');
            menuHeight = $('#new-nav-mobile .mobile-nav-search').height();
            $('#new-nav-mobile li.active ul.nav-items-lvl2 > li').each(function () {
              menuHeight += $(this).outerHeight();
            });
          }

          if (3 === level) {
            $('#new-nav-mobile li.nav-item.selected').closest('li.nav-expand').addClass('active');
            $('#new-nav-mobile li.nav-item.selected').closest('.nav-items-lvl2').closest('li.nav-expand').addClass('active');
            menuHeight = $('#new-nav-mobile .mobile-nav-search').height();
            $('li.active ul.nav-items-lvl3 li:not(.nav-back-link:nth-child(2))').each(function () {
              menuHeight += $(this).outerHeight();
            });
          }

          if (4 === level) {
            $('#new-nav-mobile li.nav-item.selected').closest('li.nav-expand').addClass('active');
            $('li.nav-lvl3.active').closest('.nav-items-lvl3').closest('li.nav-expand').addClass('active');
            $('.nav-lvl2.active').closest('ul.nav-items-lvl2').closest('li.nav-expand').addClass('active');
            menuHeight = $('#new-nav-mobile .mobile-nav-search').height();
            $('li.active ul.nav-items-lvl4 li:not(.nav-back-link:nth-child(2)):not(.nav-back-link:nth-child(3))').each(function () {
              menuHeight += $(this).outerHeight();
            });
          }

          return menuHeight;
        };

        var resetNav = function resetNav(e) {
          $('nav#new-nav-mobile').css({
            'width': 0
          });
          $('html').css({
            'overflow-y': 'auto',
            'height': 'auto',
            'margin-top': 0
          });
          $('.header-wrapper').css({
            'overflow-y': 'visible',
            'height': '75px'
          });

          if ($('body').hasClass('nav-is-toggled')) {
            var svgString = "".concat(hamburgerIcon, "<span class=\"sr-only\">Navigation Menu</span>");
            $('#ham').html(svgString);
            $('#ham').removeClass('nav-close');
            $('#mag').removeClass('disable');
            $('body').removeClass('nav-is-toggled');
          }
        };

        var resetSearch = function resetSearch(e) {
          $('#mag').html('');
          $('#search-nav-mobile').animate({
            'height': 0
          }, 300);
          setTimeout(function () {
            $('#search-nav-mobile').addClass('d-none');
          }, 500);
          $('html').css({
            'overflow-y': 'auto'
          });

          if ($('body').hasClass('search-is-toggled')) {
            $('#ham').removeClass('disable');
            $('#mag').removeClass('nav-close');
            $('body').removeClass('search-is-toggled');
          }
        };

        var currentTitle = config.mobileSectionNav.title ? config.mobileSectionNav.title : $($targetAnchor).html() || '';
        $('#mobilenav').hide();
        var site_link = $("div.site-title div.col div.display-6.text-white a").attr('href') || '/'; // for limiting styling

        $('html').addClass('mobile-nav'); // Remove All Exisiting Moblile Navs

        $('#mobilenav').remove(); // forcing icons to stay right [new design]

        $('.tp-search').closest('.row').addClass('d-flex'); // tp-search contains a few classes which are related to the one button that's currently in there

        $('.tp-search').removeClass().addClass('tp-search ml-auto'); // some site left navs have more than one ul: consolidate them first

        var mainNav = $('<ul class="list-group tp-mobile-nav-main d-none"></ul>');

        if (1 < $('.tp-nav-main').length) {
          $('.tp-nav-main').each(function (i, item) {
            mainNav.append($(item).children().clone());
          });
        } else {
          mainNav.append($('.tp-nav-main').children().clone());
        }

        var clone = cloneAndCleanNav(mainNav),
            nav = '<nav role="navigation" aria-label="Mobile Navigation Menu" id="new-nav-mobile" class="nav-drill d-flex hide no-print"></nav>',
            search = '<div class="mobile-nav-search"><div class="input-group p-3"><input type="text" class="form-control" placeholder="SEARCH CDC.GOV" aria-label="Search CDC.gov" aria-describedby="basic-addon2"><div class="input-group-append"><button class="search btn btn-light" type="button"><i class="fa cdc-icon-magnify" aria-hidden="true"></i></button></div></div></div>'; // Add Our Clone after the Site Title

        $('.header-wrapper').append(clone);
        var hamburgerIcon = '<span class="cdc-icon-menu-bars"></span>';
        var toggleButtonStr = "<div id=\"mobile-nav-toggles\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"magnifying\" id=\"mag\"><span class=\"sr-only\">Search Menu</span></div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"hamburger\" id=\"ham\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t".concat(hamburgerIcon, "\n\t\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"sr-only\">Navigation Menu</span>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>");
        $('.header-wrapper .dropdown-menu-search').before(toggleButtonStr);
        var navSearch = '<div role="navigation" aria-label="Mobile Search Menu" id="search-nav-mobile" class="nav-search no-print"></div>';
        $('.header-wrapper').append(navSearch);
        $('#search-nav-mobile').append(search).height(0);
        clone.wrap(nav);
        $('#new-nav-mobile .tp-mobile-nav-main').removeClass('d-none');
        $('#new-nav-mobile ul ').each(function () {
          $(this).addClass('nav-items').removeClass('list-group');
        });
        $('#new-nav-mobile > ul.nav-items').wrap('<div class="mobile-nav-items"></div>');
        $('.mobile-nav-items').before(search); // add nav-expand-link to each anchor before the UL with nav items

        $('.nav-expand-content').each(function () {
          $(this).prev().addClass('nav-expand-link');
        });
        $('.nav-expand-link').parent().each(function () {
          $(this).addClass('nav-expand');
        });
        var backLink = "<li class=\"nav-item nav-back-link\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"row\"><div class=\"back\">\n\t\t\t\t\t\t\t\t\t\t\t<a class=\"nav-anchor\" href=\"#\">\n\t\t\t\t\t\t\t\t\t\t\t\t<span>BACK</span>\n\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t</div><div class=\"col\"></div></div>\n\t\t\t\t\t\t\t\t\t\t</li>"; // the home link at the bottom

        var homeLink = "<li class=\"nav-item site-title-home\">\n\t\t\t\t\t\t\t<a class=\"nav-anchor\" href=\"".concat(site_link, "\">").concat($("div.site-title div.col > div.display-6.text-white a").text().trim(), " Home</a>\n\t\t\t\t\t\t\t</li>");
        $('.nav-expand').each(function (event) {
          // Get Current Item
          var $item = $(this);
          var html = $item.children('a').html();
          $item.children('a').html('<span>' + html + '</span>');
          $item.find('.nav-expand-content').prepend(backLink); // If there is already a back link, Remove it and add the new one.

          $item.find('.nav-back-link .col').append('<b>' + $item.find('.nav-expand-link').html() + '</b>');
          $item.find('.nav-anchor').on('click', function (e) {
            if (e.offsetX > $(this).width()) {
              e.preventDefault();

              if ($item.find('.nav-back-link').siblings('.nav-back-link')) {
                $item.find('.nav-back-link ~ .nav-back-link').remove();
              }

              $item.addClass('active');
            }
          });
          $item.find('.nav-back-link').on('click', function () {
            $item.removeClass('active');
          });
        });
        $('.nav-items').append('<li class="nav-item site-title-home"><a class="nav-anchor" href="' + site_link + '">' + '<span class="cdc-icon-home-lg-alt-light"></span>' + $('.site-title .site-title-inner').text().trim() + ' Home</a></li>');
        var mobileHome = "<div class=\"container mobile-home\"><div class=\"row\"><a class=\"col-12\" href=\"".concat(site_link, "\">").concat($("div.site-title div.col > div.display-6.text-white a").text().trim(), " Home</a></div>");
        var checkSiteLink = false;
        var pagePath = window.location.pathname.toLowerCase();
        site_link.toLowerCase();

        if (-1 < pagePath.indexOf('.htm') || -1 < pagePath.indexOf('.asp')) {
          if (-1 === site_link.indexOf(pagePath)) {
            checkSiteLink = true;
          }
        }

        if (checkSiteLink) {
          $('#page_banner > .site-title').after(mobileHome);
        } // make sure header wrapper is 100% width of screen


        var windowWidth = $(window).width();
        $('#page_banner .header-wrapper').css('width', windowWidth + 'px'); // Check for current page in nav

        if (true === checkSiteLink) {
          var setSelected = true;
          $('#new-nav-mobile .nav-items li a').each(function (i, item) {
            var attr = $(item).attr('href').toLowerCase();

            if (-1 < attr.indexOf(pagePath) && setSelected) {
              $(item).closest('li:not(.site-title-home)').addClass('selected');
              setSelected = false;
            }
          });
        } // Check if there's level 4 items, if so make sure ul classname isn't lvl3


        $('#new-nav-mobile li.nav-item.nav-lvl4').closest('ul').removeClass('nav-items-lvl3');
        $('#new-nav-mobile li.nav-item.nav-lvl4').closest('ul').addClass('nav-items-lvl4');
        $('ul.nav-items-lvl4').css('top', '0');
        var menuToggle;
        $('#new-nav-mobile .nav-item.selected > a').on('click', function (e) {
          menuToggle = false;
          var $item = $(this);

          if (!$item.hasClass('nav-expand-link') || e.offsetX < $(this).width()) {
            e.preventDefault();
            e.stopPropagation();
            resetNav();
            setTimeout(function () {
              // resetting nav to page
              $('li.nav-expand.active').removeClass('active');

              if ($item.hasClass('nav-lvl2')) {
                $item.closest('.nav-items').children('li.nav-back-link').css('display', 'block');
                $item.closest('ul').find('li.nav-lvl2').css('display', 'block');
              } else if ($item.hasClass('nav-lvl3')) {
                $item.closest('.nav-items').children('li.nav-back-link').css('display', 'block');
                $item.closest('ul').find('li.nav-lvl3').css('display', 'block');
              } else if ($item.hasClass('nav-lvl4')) {
                $item.closest('.nav-items').children('li.nav-back-link').css('display', 'block');
                $item.closest('ul').find('li.nav-lvl4').css({
                  'display': 'block',
                  'top': 0
                });
              }
            }, 700);
          }
        }); // Set initial nav menu height from list that has current page

        var level = 1;

        if ($('#new-nav-mobile li.nav-item.selected').hasClass('nav-lvl2')) {
          level = 2;
        } else if ($('#new-nav-mobile li.nav-item.selected').hasClass('nav-lvl3')) {
          level = 3;
        } else if ($('#new-nav-mobile li.nav-item.selected').hasClass('nav-lvl4')) {
          level = 4;
        }

        var mainNavHeight = setHeight();
        console.log(mainNavHeight); // for page issues, make sure nav width is first 0

        $('nav#new-nav-mobile').css({
          'height': 'auto',
          'width': '0',
          'transition': '0s'
        });
        var ham = document.getElementById('ham'),
            mag = document.getElementById('mag'); // For displaying properly and making inactive, toggle current page to div instead of a

        var $item = $('#new-nav-mobile li.nav-item.selected');

        if (ham) {
          ham.addEventListener('click', function () {
            $('nav#new-nav-mobile').css({
              'transition': '0.5s'
            });

            if ($('body').hasClass('search-is-toggled')) {
              resetSearch();
              menuToggle = false;
            }

            document.body.classList.remove('search-is-toggled');
            document.body.classList.toggle('nav-is-toggled');
            mag.disabled = document.body.classList.contains('nav-is-toggled');
            $(this).toggleClass('nav-close');
            $('#mag').toggleClass('disable');
            var menuHeight = mainNavHeight;
            var hamburgerIcon = '<span class="cdc-icon-menu-bars"></span>';

            if (document.body.classList.contains('nav-is-toggled')) {
              $(this).trigger('metrics-capture', ['mobile-nav-dropdown-button', 'open']); // setting nav to page

              if ($item.hasClass('nav-lvl2')) {
                $item.closest('ul').closest('li.nav-expand').addClass('active');
                $item.closest('.tp-mobile-nav-main.nav-items').find('li.nav-lvl1:not(.active)').css('display', 'none');
              } else if ($item.hasClass('nav-lvl3')) {
                $item.closest('ul').closest('li.nav-expand').addClass('active');
                $item.closest('.nav-items-lvl2').closest('li.nav-expand').addClass('active');
                $item.closest('ul.nav-items-lvl2').find('li.nav-back-link').css('display', 'none'); //sometimes there's a bad second back link

                $item.closest('.nav-items').find('li.nav-back-link').first().css('display', 'block');
                $item.closest('.nav-items').find('li.nav-lvl2:not(.active)').css('display', 'none');
                $item.closest('.tp-mobile-nav-main.nav-items').find('li.nav-lvl1:not(.active)').css('display', 'none');
              } else if ($item.hasClass('nav-lvl4')) {
                $item.closest('ul').closest('li.nav-expand').addClass('active');
                $('li.nav-lvl3.active').closest('.nav-items-lvl3').closest('li.nav-expand').addClass('active');
                $('.nav-lvl2.active').closest('ul.nav-items-lvl2').closest('li.nav-expand').addClass('active');
                $item.closest('ul.nav-items-lvl3').find('li.nav-back-link').css('display', 'none'); //sometimes there's a bad second back link

                $item.closest('.nav-items').find('li.nav-back-link').first().css('display', 'block');
                $('li.nav-lvl2:not(.active)').css('display', 'none');
                $('li.nav-lvl3:not(.active)').css('display', 'none');
                $item.closest('.tp-mobile-nav-main.nav-items').find('li.nav-lvl1:not(.active)').css('display', 'none');
              } else {
                $('#new-nav-mobile li.nav-lvl1').css('display', 'block');
              }

              menuToggle = 'navIsToggled';
              $('#ham').html('<span class="style-text">CLOSE</span>');

              if ($(window).height() > menuHeight + 70) {
                menuHeight = $(window).height() - 75;
              }

              $('html').css({
                'overflow-y': 'hidden',
                'height': '100%'
              });
              $('.header-wrapper').css({
                'overflow-y': 'scroll',
                'height': '100%'
              });
              $('#new-nav-mobile').css({
                'height': menuHeight,
                'width': $(window).width()
              });
            } else {
              $(this).trigger('metrics-capture', ['mobile-nav-dropdown-button', 'close']);
              var svgString = "".concat(hamburgerIcon, "<span class=\"sr-only\">Navigation Menu</span>");
              $('#ham').html(svgString);
              resetNav();
              menuToggle = false; //delaying so this is after transition

              setTimeout(function () {
                // resetting nav to page
                $('li.nav-expand.active').removeClass('active');

                if ($item.hasClass('nav-lvl2')) {
                  $item.closest('.nav-items').children('li.nav-back-link').css('display', 'block');
                  $item.closest('ul').find('li.nav-lvl2').css('display', 'block');
                } else if ($item.hasClass('nav-lvl3')) {
                  $item.closest('.nav-items').children('li.nav-back-link').css('display', 'block');
                  $item.closest('ul').find('li.nav-lvl3').css('display', 'block');
                }
              }, 700);
            }
          });
        }

        if (mag) {
          mag.addEventListener('click', function () {
            if (!$(this).hasClass('disable')) {
              document.body.classList.remove('nav-is-toggled');
              document.body.classList.toggle('search-is-toggled');
              $(this).toggleClass('nav-close');

              if (document.body.classList.contains('search-is-toggled')) {
                $(this).trigger('metrics-capture', ['mobile-nav-search-dropdown-button', 'open']);
                $('.mobile-nav-search input').val('');
                $('#mag').html('<span class="style-text">CLOSE</span>');
                $('#search-nav-mobile').removeClass('d-none'); //$('#search-nav-mobile').animate({'height': ($('html').height() - $('.header-wrapper').height())}, 500);

                $('#search-nav-mobile').animate({
                  'height': $('html').height()
                }, 800);
                menuToggle = 'searchIsToggled';
                $('html').css({
                  'overflow-y': 'hidden'
                });
              } else {
                $(this).trigger('metrics-capture', ['mobile-nav-search-dropdown-button', 'close']);
                resetSearch();
                menuToggle = false;
              }
            }
          });
        }

        window.addEventListener('resize', function () {
          if (window.screen.width > 990) {
            $('body').removeClass('nav-is-toggled');
          } else {
            if ('navIsToggled' === menuToggle) {
              $('body').addClass('nav-is-toggled');
            }

            if ('searchIsToggled' === menuToggle) {
              $('body').addClass('search-is-toggled');
            }
          }

          if (!$('body').hasClass('nav-is-toggled')) {
            //$('nav#new-nav-mobile').width(0);
            $('nav#new-nav-mobile').css({
              'width': '0',
              'transition': '0s'
            });
            $('html').css({
              'overflow-y': 'auto',
              'height': 'auto',
              'margin-top': 0
            });
            $('.header-wrapper').css({
              'overflow-y': 'visible',
              'height': '75px'
            });
          } else {
            $('nav#new-nav-mobile').css({
              'width': $(window).width(),
              'transition': '0s'
            });
            $('html').css({
              'overflow-y': 'hidden',
              'height': '100%'
            });
            $('.header-wrapper').css({
              'overflow-y': 'scroll',
              'height': '100%'
            });
          }

          windowWidth = $('body').width();
          $('#page_banner .header-wrapper').css('width', windowWidth + 'px');
        }); // hide placeholder on focus

        $('.mobile-nav-search input').focus(function () {
          $(this).attr('placeholder', '');
        }).focusout(function () {
          $(this).attr('placeholder', 'SEARCH CDC.GOV');
        });
        $('.mobile-nav-search .search').on('click', function () {
          var nav = $(this).closest('[role="navigation"]');

          if (nav.is('#search-nav-mobile')) {
            $(this).trigger('metrics-capture', ['mobile-nav-search-dropdown-search', 'submit']);
          } else {
            $(this).trigger('metrics-capture', ['mobile-nav-nav-dropdown-search', 'submit']);
          }

          var inputVal = $(this).closest('.mobile-nav-search').find('input').val();
          CDC.open('https://search.cdc.gov/search/?query=' + inputVal);
        });
        $('.mobile-nav-search input').on('keypress', function (e) {
          if ('Enter' === e.key) {
            var _nav = $(this).closest('[role="navigation"]');

            if (_nav.is('#search-nav-mobile')) {
              $(this).trigger('metrics-capture', ['mobile-nav-search-dropdown-search', 'submit']);
            } else {
              $(this).trigger('metrics-capture', ['mobile-nav-nav-dropdown-search', 'submit']);
            }

            var inputVal = $(this).closest('.mobile-nav-search').find('input').val();
            CDC.open('https://search.cdc.gov/search/?query=' + inputVal);
          }
        });
        $('#new-nav-mobile').on('click', function (e) {
          if (this !== e.target) {
            return;
          }

          $(this).trigger('metrics-capture', ['mobile-nav-nav-mask', 'close']);
          resetNav();
        });
        $('#search-nav-mobile').on('click', function (e) {
          if (this !== e.target) {
            return;
          }

          $(this).trigger('metrics-capture', ['mobile-nav-search-mask', 'close']);
          resetSearch();
        });
      } else {
        $('#mobilenav').hide();
      }
    };

    insertNavItem = function insertNavItem($targetNav, $targetLink, configNav) {
      config = configNav || {};
      /* returns the $ version of the inserted link (<a>, not li, etc.) */

      if (config.addNavigation && !$nav.find("a[href$='" + config.addNavigationHref + "']").length) {
        // Did we find the nav menu?
        if ($targetLink.length) {
          var $parentListItem,
              $ulToInsertInto,
              newLinkMarkup = "\n\t\t\t\t\t\t<li class=\"list-group-item\">\n\t\t\t\t\t\t\t<a href=\"".concat(config.addNavigationHref, "\">").concat(config.addNavigationText, "</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t\t"),
              newUlMarkup = "\n\t\t\t\t\t\t<ul id=\"nav-group-navinsert\" class=\"collapse\">".concat(newLinkMarkup, "</ul>\n\t\t\t\t\t\t"),
              newUlToggleMarkup = "\n\t\t\t\t\t\t<a href=\"#nav-group-navinsert\" class=\"nav-plus nav-expandcollapse\" data-toggle=\"collapse\" aria-controls=\"nav-group-navinsert\">\n\t\t\t\t\t\t\t<svg viewBox=\"0 0 24 24\"><title>expand</title><path d=\"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z\" /></svg>\n\t\t\t\t\t\t</a>\n\t\t\t\t\t\t"; // Did we find a parent to highlight or insert next to or under?

          if ($targetLink.length) {
            // Get the links' parent <li>
            $parentListItem = $($targetLink.parent('li')); // Did we find it?

            if ($parentListItem.length) {
              // Check this <li> for a pre-existing child <ul> for us to insert into
              $ulToInsertInto = $('ul.collapse', $parentListItem); // Did we find it?

              if ($ulToInsertInto.length) {
                // Yes, just insert link into the <ul>
                // Insert the new link to the target <ul>
                $ulToInsertInto.append(newLinkMarkup);
              } else {
                // No, We need to create the <ul> and toggle <a> tag
                // Append the toggle to the parent list item
                $parentListItem.append(newUlToggleMarkup); // Append the new ul to the parent list item

                $parentListItem.append(newUlMarkup);
              }
            }

            return $parentListItem.find('a[href*="' + config.addNavigationHref + '"]').last();
          } // Faux false (this returns a zero length array, which will be checked for success)


          return [];
        }
      }

      return $targetLink;
    };

    _selectActiveNavItems = function selectActiveNavItems($targetAnchor, arrBreadcrumbs, level) {
      // Only expand nav for desktop view
      var isDesktop = 990 < $(window).width(); // Is target anchor passed?

      if ($targetAnchor.length) {
        // Push the text and href of this target anchor to the level tracker
        arrBreadcrumbs.push({
          text: $targetAnchor.text(),
          href: $targetAnchor.attr('href')
        });
      } else if (window.location.pathname === $nav.parent().find('.nav-section-home a').attr('href')) {
        // Check for Topic homepage
        $nav.parent().find('.nav-section-home').addClass('selected');
        window.CDC.tp4.nav.isTopicHome = true;
      } // (get or default level) then auto incement it


      level = (level || 0) + 1; // Get the links' parent <li>

      var $parentListItem, $toggleLink; // Update the class of the target anchor

      $targetAnchor.addClass('list-group-item-action'); // Get the links' parent <li>

      $parentListItem = $($targetAnchor.parent('li')); // Get the toggle link in this <li>

      $toggleLink = $('.nav-expandcollapse:first', $parentListItem); // Show the <li>

      if (isDesktop) {
        $parentListItem.addClass('active'); // if level = 1 (if this is the actual active item, then add active class)

        if (1 === level) {
          $parentListItem.addClass('selected');
        } // Expand the first <ul> below this <li> if if exists


        $('ul', $parentListItem).first().addClass('show'); // Then change the path pf the <svg> icon to the minus path

        $('svg path', $toggleLink).attr('d', 'M19,13H5V11H19V13Z'); // Then (508) update the text to collapse

        $('svg title', $toggleLink).text('collapse'); // update active icon classes

        $toggleLink.removeClass('nav-plus').addClass('nav-minus');
        $toggleLink.find('.cdc-icon-plus').css('transform', 'rotate(180deg)').removeClass('cdc-icon-plus').addClass('cdc-icon-minus');
      } // Climb up to next li: Get the parent <ul> of this <li>, then get its direct parent <li>


      var $parentUlsParentLi = $parentListItem.parent('ul').parent('li'); // Do we have a higher level nav <li>?

      if ($parentUlsParentLi.length) {
        // Yes, get the first Anchor in that list item (which will be the new target anchor)
        var $newTargetAnchor = $('a:first', $parentUlsParentLi); // Did we find it?

        if ($newTargetAnchor) {
          // Acrivate the parent
          arrBreadcrumbs = _selectActiveNavItems($newTargetAnchor, arrBreadcrumbs, level);
        }
      }

      return arrBreadcrumbs;
    };

    buildBreadCrumbs = function buildBreadCrumbs() {
      var $breadcrumbTarget = $('nav.breadcrumbs ol');
      var $NavSectionHomeLink = $(config.navSelector).parent().find('.nav-section-home a').attr('href');
      var $NavSectionHomeText = $(config.navSelector).parent().find('.nav-section-home a').text(); // Do we have data to use, and does the mode selected dictate we use that data?

      if (config.breadcrumbs.data && ('auto' === config.breadcrumbs.mode || 'manual' === config.breadcrumbs.mode)) {
        // Clear existing breadcrumbs
        $breadcrumbTarget.empty();

        if ($('html').hasClass('cdc-2020')) {
          $breadcrumbTarget.prepend($('<li class="breadcrumb-item"></li>').html($('<a></a>').attr('href', $NavSectionHomeLink).text($NavSectionHomeText)));
          $('.breadcrumbs .breadcrumb-item').on('click', function () {
            $(this).trigger('metrics-capture', ['breadcrumb-link', 'click']);
            return false;
          });
        } else {
          if (config.breadcrumbs.prefix) {
            // Is ths a mult prefix array?
            if (Array.isArray(config.breadcrumbs.prefix)) {
              // Yes, Reverse the array for proper ordering
              config.breadcrumbs.prefix = config.breadcrumbs.prefix.reverse();
            } else {
              // No, just place the prefix in an array for uniform handling
              config.breadcrumbs.prefix = [config.breadcrumbs.prefix];
            } //add the nav-section-home to the breadcrumbs


            if ($NavSectionHomeLink && $NavSectionHomeText && true !== config.breadcrumbs.removeHome) {
              config.breadcrumbs.data.splice(0, 0, {
                text: $NavSectionHomeText,
                href: $NavSectionHomeLink
              });
            } // Loop prefixes array


            config.breadcrumbs.prefix.forEach(function (currentPrefix) {
              // Push them to the front of the breadcrumbs array
              config.breadcrumbs.data.unshift(currentPrefix);
            });
          } else if (config.breadcrumbs.prefixes) {
            // Multiple Prefixes support option 2 (prefixes)
            config.breadcrumbs.prefixes.reverse(); //add the nav-section-home to the breadcrumbs

            if ($NavSectionHomeLink && $NavSectionHomeText && true !== config.breadcrumbs.removeHome) {
              config.breadcrumbs.data.splice(0, 0, {
                text: $NavSectionHomeText,
                href: $NavSectionHomeLink
              });
            } // Loop the multi prefix object


            for (var prop in config.breadcrumbs.prefixes) {
              config.breadcrumbs.data.unshift(config.breadcrumbs.prefixes[prop]);
            }
          } else if ($NavSectionHomeLink && $NavSectionHomeText && true !== config.breadcrumbs.removeHome) {
            $breadcrumbTarget.prepend("<li class=\"breadcrumb-item\"><a href=\"".concat($NavSectionHomeLink, "\">").concat($NavSectionHomeText, "</a></li>"));
          } // Loop new breadcrumb data


          config.breadcrumbs.data.forEach(function (breadCrumb, index, array) {
            // Boolean setting: Determine if we should include the current Item in the breadcrumbs
            var includeThisItem = // Manual Mode (SHow All Manual Data)
            'manual' === config.breadcrumbs.mode || // Auto Mode (Pulled from Left Nav)
            'auto' === config.breadcrumbs.mode && ( // Show if "show current page" is true OR if the index is less than the
            config.breadcrumbs.showCurrentPage || !config.breadcrumbs.showCurrentPage && index < array.length - 1); // Include if ok based on the above

            if (includeThisItem) {
              // Add each Anchor
              $breadcrumbTarget.append("<li class=\"breadcrumb-item\"><a href=\"".concat(breadCrumb.href, "\">").concat(breadCrumb.text, "</a></li>"));
            }
          });
        } //End CDC-2020

      } // Return $breadcrumb element


      return $breadcrumbTarget;
    };

    saveFourthLevelNav = function saveFourthLevelNav($targetAnchor) {
      var atThirdLevel = 3 === $($targetAnchor, config.navSelector).parents('ul').length;

      if (atThirdLevel) {
        $fourthLevelNav = $('ul', $targetAnchor.parent('li'));
      }

      return $fourthLevelNav;
    };

    return {
      getFourthLevelNav: function getFourthLevelNav() {
        return $fourthLevelNav;
      },
      init: function init(configOptions) {
        config = configOptions || {}; //For an archived page, we are disabling this functionality

        if (config.hasOwnProperty('disabled') && true === config.disabled) {
          return true;
        } // Base configuration (unlikely to be overridden)


        config.navSelector = config.navSelector || 'nav .tp-nav-main';
        config.pathToSelect = config.pathToSelect || CDC.parseUrl().pathname; // Add Navigation Config (Injects navigation items to left/bottom nav menu)

        config.addNavigation = config.addNavigation || false; // Taking h1 instead of document title

        var navigationTextElement = $('h1:first-child');
        var defaultNavigationText = navigationTextElement.text(); // Please don't use 'document.title' for anything!

        if (0 === navigationTextElement.length) {
          defaultNavigationText = '';
        }

        config.addNavigationText = config.addNavigation ? config.addNavigationText || defaultNavigationText : false;
        config.addNavigationHref = config.addNavigation ? CDC.cleanUrl(config.addNavigationHref || window.location.href) : false; // Allow for disabling of left / bottom nav

        config.mobileBottomNav = config.mobileBottomNav || {};
        config.mobileBottomNav.enabled = !(config.mobileBottomNav.hasOwnProperty('enabled') && false === config.mobileBottomNav.enabled); // Boolean reverse enable it as long as someone has NOT(manually set the configuration value to false)
        // Allow for disabling of mobile section nav

        config.mobileSectionNav = config.mobileSectionNav || {};
        config.mobileSectionNav.enabled = !(config.mobileSectionNav.hasOwnProperty('enabled') && false === config.mobileSectionNav.enabled); // Boolean reverse enable it as long as someone has NOT(manually set the configuration value to false)

        config.mobileSectionNav.title = config.mobileSectionNav.title || ''; // Breadcrumbs Configuration

        config.breadcrumbs = config.breadcrumbs || {};
        config.breadcrumbs.mode = config.breadcrumbs.mode || 'auto';
        config.breadcrumbs.prefix = config.breadcrumbs.prefix || null;
        config.breadcrumbs.prefixes = config.breadcrumbs.prefixes || null;
        /*
        To Specify Breadcrumb Data Manually, Use:
        	config.breadcrumbs.data = [{
        text: "My First Level",
        href: "www.cdc.gov/test-url.html"
        }, {
        text: "My Second Level",
        href: "www.cdc.gov/test-url.html"
        }];
        	To Specify Breadcrumb Prefix, Use:
        	config.breadcrumbs.prefix = {
        text: "My Link Text",
        href: "www.cdc.gov/test-url.html"
        }
        	Note: If you are providing the data object,
        you could simply add your prefix there vs.
        additionally using the prefix. In such a
        case, the idea would be to do what is
        easier to configure for you.
        */

        var removeParamsForComparison = function removeParamsForComparison(url, parameters) {
          var pIndex;
          var urlParts = url.split('?');
          var urlParams = urlParts[1].split(/[&;]/g);

          for (pIndex = 0; pIndex < parameters.length; ++pIndex) {
            var prefix = encodeURIComponent(parameters[pIndex]) + '=';

            for (var i = urlParams.length; 0 < i--;) {
              if (-1 !== urlParams[i].indexOf(prefix, 0)) {
                urlParams.splice(i, 1);
              }
            }

            url = urlParts[0] + (0 < urlParams.length ? '?' + urlParams.join('&') : '');
          }

          return url;
        };

        var paramsNotInNav = [// params compared in lowercase
        'source', 's_cid', 'cdc_aa_refval', 'mobile', 'utm', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_source'];
        var $nav_2 = $(config.navSelector),
            $targetAnchor = $(),
            $targetAnchorForInjection = $(),
            $selectionStart,
            breadCrumbData,
            currentPageIsInNav = false,
            windowLocationHref = window.location.href.toLowerCase();

        if ('' !== location.search) {
          windowLocationHref = removeParamsForComparison(windowLocationHref, paramsNotInNav);
        }

        var homes = ['', '/', 'default.asp', 'default.aspx', 'default.html', 'default.htm', 'index.asp', 'index.aspx', 'index.html', 'index.htm', 'index.php'];

        var findNavItemForURL = function findNavItemForURL(currentNavItem, url, thisItem) {
          for (var i = 0; i < homes.length; i++) {
            var home = homes[i];

            if (currentNavItem === url || currentNavItem === url + home) {
              $targetAnchor = $(thisItem);
              currentPageIsInNav = true;
            }
          }
        };

        $nav_2.find('a').each(function () {
          var currentNavItem = this.href.toLowerCase().substr(-window.location.href.toLowerCase()); // var currentNavItem = this.href.toLowerCase();

          findNavItemForURL(currentNavItem, windowLocationHref, this);
        }); //Remove hash for comparison if not already found in menu

        if (!currentPageIsInNav) {
          var urlNoHash = (location.origin + location.pathname).toLowerCase();
          $nav_2.find('a').each(function () {
            var currentNavItem = this.href.toLowerCase().substr(-window.location.href.toLowerCase());
            findNavItemForURL(currentNavItem, urlNoHash, this);
          });
        } //If page should be injected dynamically and it's not already in the nav


        if (!currentPageIsInNav && config.addNavigation) {
          $nav_2.find('a').each(function () {
            if (this.href.toLowerCase().substr(-config.pathToSelect.toLowerCase().length) === config.pathToSelect.toLowerCase()) {
              $targetAnchorForInjection = $(this);
            }
          }); // Add navigation item to menu if requested

          $targetAnchor = insertNavItem($nav_2, $targetAnchorForInjection, config);
        } // Activate Nav Items (return breadcrumbs.data from selection chain)


        breadCrumbData = _selectActiveNavItems($targetAnchor, []).reverse();

        if ('auto' === config.breadcrumbs.mode) {
          config.breadcrumbs.data = breadCrumbData;
        } // Create Breadcrumbs if needed


        buildBreadCrumbs(); // getFourthLevelNav

        saveFourthLevelNav(config, $targetAnchor); // make mobile nav

        buildMobileSectionNav(config, $targetAnchor); // finally bind metrics events

        bindEvents(); //Check for Hidden Links

        checkHiddenLinks();
        return true;
      },
      getCurrentPageNav: function getCurrentPageNav() {
        var $currentNav;
        var currentPath = String(CDC.parseUrl().pathname).toLowerCase().replace(/(index|default)\.[a-z]+$/, '');
        ;
        $('nav .tp-nav-main, nav .nav-section-home').find('a[href]').each(function () {
          if ($currentNav) {
            return;
          }

          var href = String($(this).attr('href') || '');

          if (!href || '#' === href.substring(0, 1)) {
            return;
          }

          href = String(CDC.parseUrl(href).pathname).toLowerCase().replace(/(index|default)\.[a-z]+$/, '');

          if (href === currentPath) {
            $currentNav = $(this);
          }
        });
        return $currentNav;
      },
      isMobileNavEnabled: function isMobileNavEnabled() {
        return _isMobileNavEnabled();
      }
    };
  }();
})(window.jQuery);
"use strict";

/**
 * JS for OTP modules
 */
CDC = window.CDC || {};

CDC.OnThisPage = function () {
  var otpModuleSelector = '.js-repopulate-anchors',
      anchorClassSelector = '.onThisPageAnchor',
      listSelector = '.list-group';

  function rebuildAnchorLinks() {
    var anchors = [],
        anchorElements = $(anchorClassSelector); //get current anchors on page

    anchorElements.each(function () {
      anchors[anchors.length] = '<li class="list-group-item"><a href="#' + $(this).attr('id') + '">' + $(this).attr('title') + '</a></li>';
    }); //update the on this page modules with new anchor html

    $(otpModuleSelector).each(function () {
      var columns = $(this).find(listSelector); //there could be 1 list or multiple depending on user selection

      if (1 === columns.length) {
        columns.html(anchors);
      } else {
        //this will split the anchors into even number groups and then change corresponding list group (ie. first group into first list )
        var groups = sliceIntoChunks(anchors, Math.ceil(anchors.length / columns.length));
        columns.each(function (index) {
          $(this).html(groups[index]);
        });
      }
    });
  }
  /**
   * Slice an array into equal number chunks (except last one)
   * @param {*} arr
   * @param {*} chunkSize
   * @returns
   */


  function sliceIntoChunks(arr, chunkSize) {
    var res = [];

    for (var i = 0; i < arr.length; i += chunkSize) {
      var chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }

    return res;
  }
  /**
   * The 2022 OTP module hides links past the 5th and injects a button to display the rest
   * @returns
   */


  function handleNewOTP() {
    var otp = $('.tp-on-this-page-2022'),
        lis = otp.find('li'),
        btn = $('<button class="btn btn-more">View All <span class="x32 fill-p cdc-icon-arrow-down"></span></button>');
    btn.on('click', function () {
      otp.find('ul').addClass('list-shown');
      $(this).hide();
    });

    if (1 === otp.length) {
      // more than 5 list items, add a button
      if (5 < lis.length) {
        otp.append(btn);
      }
    }
  } // init on load


  $(function () {
    // when there's faqs on the page watch for hash changes
    if ($(otpModuleSelector).length) {
      rebuildAnchorLinks();
    }

    if ($('.tp-on-this-page-2022').length) {
      handleNewOTP();
    }
  });
}();
'use strict';
/**
 * tp-search.js
 * @fileOverview Logic for the global header search form
 * @version 0.8
 * @copyright 2020 Centers for Disease Control
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

window.CDC = window.CDC || {};
/**
 * search.js
 * Event handling for resizing/responsive elements
 * @version 1.0.0.0
 * @copyright 2013 Centers for Disease Control
 * @memberof CDC
 * @param {object} $ - jQuery object
 * @param {object} w - window object
 * @param {object} g - CDC.Global object
 */

CDC.Search = CDC.Search || function () {
  /*global log:false */
  var env = 'local';
  var isIntranet = $('html:first').hasClass('intranet');
  var solrDomain = isIntranet ? 'intranetsearch.cdc.gov' : 'search.cdc.gov'; // actionHost is where the search occurs
  // webHost is where the main site content lives

  var isCDCProd = !isIntranet && ('prod' === env || 'wwwdev' === env);
  var actionHost = isCDCProd ? '//search.cdc.gov' : '';
  var webHost = isCDCProd ? 'https://www.cdc.gov' : '';

  if (isIntranet) {
    webHost = actionHost = 'https://intranet.cdc.gov';
  }

  var localConfig = 'object' === _typeof(window.CDC_SEARCH_CONFIG) ? window.CDC_SEARCH_CONFIG : {};

  if (localConfig.webHost) {
    webHost = String(localConfig.webHost).trim();
  }

  if (localConfig.actionHost) {
    actionHost = String(localConfig.actionHost).trim();
  }

  var siteLimit = CDC.getParam('sitelimit') || CDC.getParam('siteLimit') || '';
  var setLanguage = CDC.getParam('affiliate') || 'cdc-main';
  var language = 'es-us' === $('html').attr('lang') || 'cdc-es' === setLanguage ? 'es-us' : 'en-us';
  var advancedInit = false;
  var extendedInit = false;
  var initialized = false;
  var $dom = {};
  var isExtended = false; // should we allow extended fields from search-taxonomy.js

  var isCoronavirus = -1 < String(siteLimit).indexOf('coronavirus') || -1 < window.location.pathname.indexOf('/coronavirus/'); // should we allow extended fields from search-taxonomy.js

  var extendedfields = ['topic', 'audience', 'contenttype'];
  var taxonomy;
  var searchNetwork = isIntranet ? 'intranet' : 'internet';
  var searchTerm = CDC.getParam('query') || '';
  var searchInputs = {
    all: CDC.getParam('all') || '',
    none: CDC.getParam('none') || '',
    exact: CDC.getParam('exact') || '',
    any: CDC.getParam('any') || '',
    language: CDC.getParam('language') || '',
    url: CDC.getParam('url') || '',
    date1: CDC.getParam('date1') || '',
    date2: CDC.getParam('date2') || '',
    topic: CDC.getParam('topic') || '',
    audience: CDC.getParam('audience') || '',
    contenttype: CDC.getParam('contenttype') || ''
  };

  if ('es-us' === language && !isIntranet) {
    searchNetwork = 'internet_es';
  }

  var solrRoot = 'https://' + solrDomain + '/srch';

  if (window.CDC_SOLR_ROOT) {
    // allow local override for environments
    solrRoot = String(window.CDC_SOLR_ROOT).trim();
  }

  var solrBase = solrRoot + '/' + searchNetwork;
  var config = {
    typeAhead: 'en-us' === language,
    typeAheadLength: 2,
    webHost: webHost,
    actionHost: actionHost,
    env: env,
    solrRoot: solrRoot,
    searchNetwork: searchNetwork,
    solrBase: solrBase,
    isIntranet: isIntranet,
    isCoronavirus: isCoronavirus,
    defaultBestBetsPageSize: 3,
    defaultAutoSuggest: 5,
    useExtended: false // whether to use extended fields

  }; // get URL of results page

  if ('es-us' === language && !isIntranet) {
    config.resultsPage = actionHost + '/search/spanish/';
  } else {
    config.resultsPage = actionHost + '/search/';
  }

  if (isIntranet) {
    config.resultsPage = '/connects/search/';
  } // Optionally override config


  config = $.extend(config, localConfig); // Extended Search logic
  // Note: "Extended" just refers to 3 new taxonomy fields used for coronavirus content
  // Extended available only on English pages for Coronavirus site or during coronavirus local search

  if (config.useExtended) {
    isExtended = !isIntranet && isCoronavirus; // if the user is searching on a new extended term, isExtended is true

    if (searchInputs.topic || searchInputs.audience || searchInputs.contenttype) {
      isExtended = true;
    } // but on Spanish pages, it's always hidden


    if ('en-us' !== language) {
      isExtended = false;
    }
  }

  if (isExtended) {
    // for extendfields, pipe separate into arrays
    $.each(extendedfields, function (i, field) {
      if (searchInputs[field]) {
        searchInputs[field] = searchInputs[field].split('|');
      }
    });
  }
  /**
   * Persist user options to sessionStorage
   * @type {{set, get}}
   */


  var settings = function () {
    var field = 'cdc-search-settings';
    var userSettings;

    try {
      userSettings = JSON.parse(window.sessionStorage.getItem(field));
    } catch (e) {
      userSettings = {};
    }

    userSettings = userSettings || {};
    return {
      get: function get(setting) {
        if (undefined !== userSettings[setting]) {
          return userSettings[setting];
        } else {
          return null;
        }
      },
      set: function set(setting, value) {
        userSettings[setting] = value;

        try {
          window.sessionStorage.setItem(field, JSON.stringify(userSettings));
        } catch (e) {// do nothing
        }
      }
    };
  }(); // Update $dom pointers


  function getDOM() {
    // set DOM
    $dom = {
      form: $('.tp-search form:first'),
      advanced: $('#cdcAdvancedSearch'),
      advancedForm: null,
      inputs: {
        siteLimit: $('.tp-search input[type="hidden"][name="sitelimit"]'),
        query: $('.tp-search input[name="query"]'),
        affiliate: $('.tp-search .search-input input[name="affiliate"]'),
        any: $('#cdcAdvancedSearch #search-any'),
        all: $('#cdcAdvancedSearch #search-all'),
        exact: $('#cdcAdvancedSearch #search-exact'),
        none: $('#cdcAdvancedSearch #search-none'),
        language: $('#cdcAdvancedSearch #search-language'),
        url: $('#cdcAdvancedSearch #search-url'),
        date1: $('#cdcAdvancedSearch #search-date1'),
        date2: $('#cdcAdvancedSearch #search-date2'),
        topic: $('#cdcAdvancedSearch #search-topic'),
        audience: $('#cdcAdvancedSearch #search-audience'),
        contenttype: $('#cdcAdvancedSearch #search-contenttype')
      },
      buttons: {
        clear: $('.tp-search .form-control-clear, #search-clear'),
        advanced: $('#cdcAdvancedSearch #search-advanced'),
        close: $('#cdcAdvancedSearch #search-close')
      }
    }; // persist search term

    if (searchTerm && !$dom.inputs.query.val()) {
      $dom.inputs.query.val(searchTerm);
    } // Set the hidden field for siteLimit so that local search works as expected.


    if (siteLimit) {
      $dom.inputs.siteLimit.attr('value', siteLimit);
    }
  }
  /**
   * Page initialization, only allows to be called once
   */


  function init() {
    // allow only once
    if (initialized) {
      return;
    }

    initialized = true; // initialize advanced search

    getDOM();
    initAdvancedSearch();
    initLocalSearch();
    setupListeners();
  }
  /**
   * wwwnc.travel and other sites have app.js above the DOM for the form, so running on page load
   */


  function initAdvancedSearch() {
    // Here we load the advanced search form from header search SSI template
    var $advancedFormTmpl = $('#cdcAdvancedSearchTmpl');

    if (!$advancedFormTmpl.length) {
      return;
    }

    var $advancedForm = $($advancedFormTmpl.html());
    $('header[role="banner"]:first').append($advancedForm);
    $advancedFormTmpl.remove();
    $advancedForm.on('keypress', function (e) {
      if (13 === e.which) {
        handleAdvancedSearch();
      }
    }); // Update DOM pointers now that we have advanced form rendered

    getDOM(); // set the advancedForm setting

    $dom.advancedForm = $advancedForm; // if Spanish, remove dates field

    if ($dom.inputs.date1.length && 'es-us' === language) {
      $dom.inputs.date1.parents('.row:first').remove();
      searchInputs.date1 = null;
      searchInputs.date2 = null;
    } // if on search results page and is extended, load extended fields / left nav


    if (isExtended) {
      loadExendedFields();
    } // update fields


    $dom.inputs.all.val(searchInputs.all);
    $dom.inputs.none.val(searchInputs.none);
    $dom.inputs.exact.val(searchInputs.exact);
    $dom.inputs.any.val(searchInputs.any);
    $dom.inputs.url.val(searchInputs.url);
    $dom.inputs.date1.val(searchInputs.date1);
    $dom.inputs.date2.val(searchInputs.date2);
    $dom.buttons.advanced.on('click', function () {
      handleAdvancedSearch();
    }); // on clear button, clear inputs
    // @TODO: Clean up and tie with the clear button

    $dom.buttons.clear.on('click', function () {
      $.each($dom.inputs, function (i, $input) {
        if ($input.val && $input.attr && 'sitelimit' !== $input.attr('name')) {
          $input.val('');
        }
      });
    });
    $dom.buttons.close.on('click', function () {
      $advancedForm.collapse('hide');
      settings.set('advanced-form', 'closed');
    });

    if (searchInputs.language) {
      $dom.inputs.language.find('option[value="' + searchInputs.language + '"]').prop('selected', true);
    }

    $advancedForm.on('show.bs.collapse', function (e) {
      onOpenAdvancedForm();
    });
  }
  /**
   * Initialize local search
   * @TODO: use $dom pointers
   */


  function initLocalSearch() {
    // Local Search header init
    $('.dropdown-submenu .dropdown-toggle').on('click', function (e) {
      $(this).next('.dropdown-menu').toggle();
      e.stopPropagation();
    });
    $('.dropdown-submenu .dropdown-item').on('click', function (e) {
      e.stopPropagation();
      var update = {
        text: $(this).text(),
        value: $(this).attr('data-site-limit')
      };
      $('header .local-search-label').text(update.text);
      $('header input[name="sitelimit"]').val(update.value);
      $(this).parent('.dropdown-menu').toggle();
    });
    $('header').on('click', '.search-submit', function (e) {
      e.preventDefault();
      $(this).parents('form').first().submit();
    });
  }
  /**
   * Manually trigger advanced form open
   */


  function openAdvancedForm() {
    if ($dom.advancedForm) {
      $dom.advancedForm.collapse('show');
    }
  }
  /**
   * Just to initialize datepickers on first load
   */


  function onOpenAdvancedForm() {
    settings.set('advanced-form', 'open');

    if (advancedInit || !$dom.inputs.date1 || !$dom.inputs.date2) {
      return;
    } // load Extended Fields


    if (isExtended) {
      loadExendedFields();
    } // load datepicker library to handle date fields


    $.ajax({
      url: '/TemplatePackage/contrib/libs/jquery-ui/1.12.1/jquery-ui.min.js',
      dataType: 'script',
      cache: true
    }).done(function () {
      $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: '/TemplatePackage/contrib/libs/jquery-ui/1.12.1/jquery-ui.min.css'
      }).appendTo('head');
      $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: '/TemplatePackage/contrib/libs/jquery-ui/1.12.1/jquery-ui.structure.min.css'
      }).appendTo('head');
      var today = new Date();
      $dom.inputs.date1.datepicker({
        showOn: 'both',
        buttonText: '<span class="fi cdc-icon-calendar-day inline-block undefined " aria-hidden="true"></span>',
        uiLibrary: 'bootstrap4',
        maxDate: today
      });
      $dom.inputs.date2.datepicker({
        showOn: 'both',
        buttonText: '<span class="fi cdc-icon-calendar-day inline-block undefined " aria-hidden="true"></span>',
        uiLibrary: 'bootstrap4',
        maxDate: today
      });
      $dom.inputs.date1.val(searchInputs.date1);
      $dom.inputs.date2.val(searchInputs.date2);
    });
    advancedInit = true;
  }
  /**
   * Load JS for extended fields, search-taxonomy.js
   */


  function loadExendedFields() {
    if (!isExtended || extendedInit) {
      return;
    } // fetch taxonomy and apply extended if necessary


    taxonomy = window.CDC_SEARCH_TAXONOMY;

    if ('object' === _typeof(taxonomy)) {
      renderExtendedFields();
      return;
    } // load datepicker library to handle date fields


    $.ajax({
      url: webHost + '/search/search-taxonomy.js',
      dataType: 'script',
      cache: true
    }).done(function () {
      renderExtendedFields();
    });
  }
  /**
   * Loads extended fields in advanced form and left nav on search results page
   */


  function renderExtendedFields() {
    taxonomy = taxonomy || window.CDC_SEARCH_TAXONOMY;

    if ('object' !== _typeof(taxonomy) || !isExtended || extendedInit) {
      return;
    } // Populate the extended fields in advanced form


    if ($dom.advanced && $dom.advanced.length) {
      $dom.advanced.addClass('is-extended');
      $.each(extendedfields, function (i, field) {
        if (!Array.isArray(taxonomy[field])) {
          return;
        }

        var list = taxonomy[field].sort();
        $.each(list, function (j, item) {
          var $option = $('<option>');
          $option.val(cleanTerm(item)).text(item);
          $dom.inputs[field].append($option);
        });

        if (Array.isArray(searchInputs[field]) && searchInputs[field].length) {
          // if we have multiple values, switch select to a multi select
          if (1 < searchInputs[field].length) {
            $dom.inputs[field].attr('multiple', 'multiple');
            $dom.inputs[field].find('option').prop('selected', false);
          } // select the present values


          $.each(searchInputs[field], function (j, value) {
            $dom.inputs[field].find('option[value="' + cleanTerm(value) + '"]').prop('selected', true);
          });
        }
      });
    } // finally initialize left nav if on search results page


    extendedInit = true;
  }

  function setupListeners() {
    if ($('.tp-search').length) {
      $('.tp-search').each(function () {
        var input = $(this).find('input[name="query"]'),
            $cancelButton = $(this).find('.form-control-clear'),
            form = $(this).find('form'),
            isSubmit = false,
            code;
        form.on('submit', function (e) {
          code = e.keyCode ? e.keyCode : e.which;
        }).on('keydown', function (e) {
          code = e.keyCode ? e.keyCode : e.which;
          isSubmit = 13 === code;
        });
        $cancelButton.on('click', function (e) {
          if (!isSubmit) {
            input.val('');
            input.focus(); // Also need to clear out the "hidden" VP1/VP2 search box.

            input.val('');
            $('.searchTypeAhead').remove();
            $(this).css('visibility', 'hidden');
            e.preventDefault();
          }
        }); // Search Key Up

        input.each(function () {
          handleSearchKeyEvents(input, $cancelButton);
        }).on('keyup', function () {
          handleSearchKeyEvents(input, $cancelButton);

          if (config.typeAhead) {
            handleTypeAhead($(this));
          }
        }); // Spanish clean up

        if ('es-us' === language) {
          $('html').attr('lang', 'es-us').addClass('esp'); // set placeholder

          $dom.inputs.query.attr('placeholder', 'Buscar');
          $dom.inputs.affiliate.attr('value', 'cdc-es');
          $dom.form.attr('action', config.searchResultsLocationESP);
        }
      });
    }
  }

  function handleSearchKeyEvents(t, b) {
    // set all the search inputs to the same value
    if (0 < t.val().length) {
      b.css('visibility', 'visible');
    } else {
      b.css('visibility', 'hidden');
    }
  }

  var handleTypeAhead = function handleTypeAhead(input, callback) {
    var $input = $(input),
        $searchWrapper = $input.parent(),
        typeValue = String($input.val()).trim(),
        $typeahead = $searchWrapper.find('.searchTypeAhead');

    if (!$typeahead.length) {
      $typeahead = $('<div class="searchTypeAhead"><div class="searchTypeAheadWrap"><ul></ul></div></div>');
      $searchWrapper.append($typeahead);
    }

    if (config.typeAheadLength < typeValue.length) {
      getTypeAheadValues($typeahead, typeValue, callback);
    } else {
      $typeahead.hide().find('ul').html('');
    }
  };
  /**
   * Handle advanced search form
   */


  function handleAdvancedSearch() {
    if (!$dom.form.length) {
      return;
    } // metrics call for interaction


    $dom.buttons.advanced.trigger('metrics-capture', ['cdcsitesearch-advanced-search', 'click']);
    var target = $dom.form.attr('action');
    var params = {};
    $.each($dom.inputs, function (field, $input) {
      if ($input.length && $input.val()) {
        params[field] = $input.val();

        if (-1 < extendedfields.indexOf(field) && Array.isArray(params[field])) {
          params[field] = params[field].join('|');
        }
      }
    });
    window.location.href = target + '?' + $.param(params);
  }

  var getTypeAheadValues = function getTypeAheadValues($typeahead, val, callback) {
    var searchType;
    var typeAheadHtml = [];
    var typeAheadUrl = config.solrBase + '/terms?wt=json&terms=true&terms.fl=suggest_term&terms.prefix=' + val + '&indent=true&omitHeader=true&terms.sort=count&terms.limit=' + config.defaultAutoSuggest;

    if (isIntranet) {
      var $search = $('#searchSelected-intranet:first');

      if ($search.length) {
        searchType = $search.text().trim();
      }
    }

    if ('People Finder' === searchType) {
      return;
    } // hit api


    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: typeAheadUrl
    }).done(function (response) {
      // not sure why this is needed, but it is ??
      var terms = response && response.terms && response.terms.suggest_term || [];

      if (Array.isArray(terms) && terms.length) {
        $.each(terms, function (i, term) {
          if ('number' === typeof term) {
            return;
          }

          term = cleanTerm(term);
          typeAheadHtml.push('<li><a href="#" data-searchterm="' + term + '">' + term + '</a></li>');
        });
      } // inject back to the list


      if (typeAheadHtml.length) {
        $typeahead.show();
        $typeahead.find('ul').safehtml(typeAheadHtml.join('')); // assign clicks

        $typeahead.find('ul a').on('click', function (e) {
          e.preventDefault();
          var clickTerm = $(this).attr('data-searchterm');
          var forwardTo = config.resultsPage + '?query=' + clickTerm;
          var getSiteLimit = $dom.inputs.siteLimit.val();
          $typeahead.hide().find('ul').html('');

          if ('function' === typeof callback) {
            return callback(clickTerm);
          }

          if (getSiteLimit) {
            forwardTo += '&sitelimit=' + getSiteLimit;
          }

          window.location = forwardTo;
        });
      } else {
        $typeahead.hide().find('ul').html('');
      }
    });
  };
  /**
   * Make a string safe for SOLR search
   * @param term
   * @returns {string}
   */


  function cleanTerm(term) {
    return String(term).replace(/["|;&$%#<>()+\?\~\*]/g, '').replace(/\s\s+/g, ' ');
  } // trigger CDC.Search.init() on page load


  $(function () {
    if (window.CDC && window.CDC.Search) {
      window.CDC.Search.init();
    }
  });
  return {
    /**
     * @method init
     * @access public
     * @desc Initiate search module
     * @param {Object} [c]
     */
    init: init,
    hide: function hide(vp) {},
    // deprecated
    // expose attributes
    config: config,
    searchTerm: searchTerm,
    cleanTerm: cleanTerm,
    siteLimit: siteLimit,
    searchInputs: searchInputs,
    isExtended: isExtended,
    settings: settings,
    openAdvancedForm: openAdvancedForm,
    initLocalSearch: initLocalSearch,
    handleTypeAhead: handleTypeAhead
  };
}();
'use strict';
/**
 * tp-tables.js
 * @fileOverview Contains table code.
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var vps = ['unknown', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      vp = '',
      viewport;
  $(window).on('load resize', function () {
    vp = window.CDC && window.CDC.tp4 && window.CDC.tp4["public"] ? window.CDC.tp4["public"].getViewport() : null;
    viewport = vps.indexOf(vp);

    if (4 > viewport) {
      $('.opt-in > tbody > tr').slice(0, 5).addClass('expanded').last().addClass('faded');
    }
  });
  $('.opt-in + div > .expander').click(function (e) {
    e.preventDefault(); //https://websupport.cdc.gov/browse/WCMSRD-6157

    var $table = $(this).parent().prev('table');
    $table.addClass('expanded');
    $table.find('tr.faded').removeClass('faded');
  });
})(jQuery, window, document);
'use strict';
/**
 * tp-tabs.js
 * @fileOverview Contains tabs code.
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  // fraught with peril
  // if a user is using the arrow keys to navigate tabs
  $(document).on('keyup', function (e) {
    if (document.hasFocus()) {
      if ('tab' === $(document.activeElement).attr('role')) {
        if (39 === e.keyCode) {
          if ($(document.activeElement).parent('li').next().length) {
            $(document.activeElement).parent('li').next().find('a').trigger('click').focus();
          }
        }

        if (37 === e.keyCode) {
          if ($(document.activeElement).parent('li').prev().length) {
            $(document.activeElement).parent('li').prev().find('a').trigger('click').focus();
          }
        }
      }
    }
  });
  $('.card-accordion .card-header').on('click', function () {
    if ('true' === $(this).attr('aria-expanded')) {
      $(this).trigger('metrics-capture', ['accordion-header-collapse', 'close']);
    } else {
      $(this).trigger('metrics-capture', ['accordion-header-collapse', 'open']);
    }
  });
})(jQuery, window, document);
'use strict';
/**
 * video.js
 * @fileOverview Contains the Video Player module
 * @version 0.2.0.0
 * @copyright 2018 Centers for Disease Control
 */

(function ($, window, document, undefined) {
  var pluginName = 'cdc_videoPlayer',
      defaults = {
    container: '.video-container'
  };

  function CDCPlugin(element, options) {
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  CDCPlugin.prototype = {
    init: function init() {
      //var defaults = this._defaults;
      this.bindEvents();
    },
    bindEvents: function bindEvents() {
      var t = this,
          x = 0;
      $('.videoPlay').on('click', function (e) {
        t.playPause();
        $(this).find('i').toggleClass('fa-play').toggleClass('fa-pause');
      });
      $('.videoDownload').on('click', function (e) {
        if ($(this).attr('data-href')) {
          window.location = $(this).attr('data-href');
        } else {// No Video Download
        }
      });
    },
    playPause: function playPause() {
      var container = $(this._defaults.container).get(0);

      if (container.paused) {
        container.play();
      } else {
        container.pause();
      }
    }
  };
  $('.modal-video-container').on('hidden.bs.modal', function () {
    $(this).find('iframe').each(function () {
      // this.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      $(this).attr('src', $(this).attr('src'));
    });
  }); // don't let the plugin load multiple times

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new CDCPlugin(this, options));
      }
    });
  };
})(jQuery, window, document);
"use strict";

// CDC 2020 general theme features
CDC.Theme2020 = function () {
  function init() {
    // header search focus
    var $headerSearch = $('.headerSearch form');

    if ($headerSearch.length) {
      $headerSearch.on('focusout', function () {
        $headerSearch.find('.search-submit').removeClass('active');
      }).on('focusin', function () {
        $headerSearch.find('.search-submit').addClass('active');
      });
    }
  }

  return {
    init: init
  };
}();

$(function () {
  if ($('html:first').hasClass('cdc-2020')) {
    CDC.Theme2020.init();
  }
});
'use strict';
/**
 * tp-2022.js
 * @fileOverview Contains code to manage updates as part of 2022 TP wrapper updates
 * @version 0.1.0.0
 * @copyright 2022 Centers for Disease Control
 */

$(function () {
  var subtheme = $('html').hasClass('cdc-subtheme');
  var cdc2022 = $('html').hasClass('cdc-2022');
  var lang = -1 < $('html').attr('lang').indexOf('es') ? 'es' : 'en';
  var $title = $('main h1#content:first').not('.sr-only'); // Don't run on subthemes

  if (subtheme || !String(location.hostname).match(/(.wcms|cdc.gov)/)) {
    return;
  }

  var $currentNav = CDC.tp4.nav.getCurrentPageNav(); // 1: 2022 UPDATES
  // Update Mobile title

  if ($title.length && !$('html').hasClass('home-2022')) {
    var mobileTitle = $title.html();
    var pageOptions = window.pageOptions;
    var mobileTitleOverride = pageOptions && pageOptions.navigation && pageOptions.navigation.mobileSectionNav && pageOptions.navigation.mobileSectionNav.title;

    if (mobileTitleOverride) {
      mobileTitle = mobileTitleOverride;
    } else if ($currentNav && $currentNav.length) {
      mobileTitle = $currentNav.html();
    }

    var $titleMobile = null;

    if ($('.cdc-2020-mobile-title').length) {
      $titleMobile = $('.cdc-2020-mobile-title').safehtml(mobileTitle);
    } else {
      $titleMobile = $('<div class="h1 page-title-mobile p-none"></div>').safehtml(mobileTitle);
      $titleMobile.insertAfter($title);
    } // if we're on a COVID page, ignore, they already have a print


    if (!$('.print-link').length && !$('a[href="#print"]').length) {
      var printWord = 'es' === lang ? 'Imprimir' : 'Print';
      var print = '<a href="#print" class="print-link" aria-label="Click to print page" onclick="window.print()">' + printWord + '</a>'; // if there's a language link, add after the last one else add after H1

      if (0 < $('.cdc-2020-bar .last-updated').length) {
        // if we get here, it should only be the last-updated text on the page so append the Print after it
        $('.cdc-2020-bar .last-updated').after(print);
        $('.print-link').addClass('bar-item');
      } else if (0 < $('#languageDropDownMenu').length) {
        $('#languageDropDownMenu').parent().addClass('d-inline').after($(print).addClass('ml-3'));
      } else if (0 < $('.language-link a').length) {
        $('.language-link a').last().after(print);
        $('.print-link').before('<span class="d-none p-none d-md-inline"> | </span>');
      } else if (0 < $title.length) {
        $title.after(print);
      }
    }
  } // 2: PRE-2022 PAGE FIXES
  // CDC 2022 has these html updates


  if (!cdc2022 && !$('html').hasClass('intranet')) {
    // breadcrumbs
    $('.breadcrumbs').parent().removeClass().addClass('col');
    $('.breadcrumb-share').removeClass('container').addClass('bg-quaternary-40');
    $('.breadcrumb-share > .d-none').addClass('container'); // Page share

    $('.page-share').removeClass('col col-sm-4 col-xl-3').insertAfter('.last-reviewed').addClass('col-md ml-auto');
    $('.last-reviewed').removeClass('col col-sm-8 col-xl-9').addClass('col-md');
  } // Add print QR Code


  CDC.Common.loadJS('https://www.cdc.gov/TemplatePackage/contrib/libs/qrcodejs/latest/qrcode.min.js', function () {
    var pageUrl = CDC.cleanUrl(location.href).replace(/[\?#].*$/, '');
    var qrCodeDiv = $('#cdc-qrcode-placeholder:first');

    if (!qrCodeDiv.length) {
      qrCodeDiv = $('<div id="cdc-qrcode-placeholder" class="d-none d-print-block" />').hide();
      $('.col.cdc-logo:first').after(qrCodeDiv);
    }

    if (!window.QRCode) {
      return;
    } // latest version


    window.QRCode.toDataURL(pageUrl + '?s_cid=qr2022', {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.3,
      margin: 0,
      scale: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, function (err, url) {
      if (!err && url) {
        qrCodeDiv.safeappend($('<img />').attr('src', url)).show();
      }
    });
  });
});
'use strict';

(function () {
  var sitePath = window.location.pathname;

  if (CDC.tp4.nav.isMobileNavEnabled()) {
    var w = window;
    var lastScrollTop = 0;
    var toggleMenu; // UX waffles between having site title or page title for sticky

    var site_title = $("div.site-title div.col > div.display-6.text-white a").text() || 'CDC Home';
    var mobile_title = $('.mobile_title').text() || $(document).attr('title');

    if (mobile_title.indexOf('|') > -1) {
      mobile_title = mobile_title.split('|')[0];
    }

    var site_link = $("div.site-title div.col div.display-6.text-white a").attr('href') || '/';
    var backDiv = $('<div></div>').addClass('title-back-link');
    var backLink = $('<a></a>').attr({
      'target': '_self',
      'href': site_link,
      'class': 'return-link cdc-back-link col'
    }).html(site_title);
    backDiv.append(backLink);
    $("div.cdc-logo").parent().prepend(backDiv);

    var checkScroll = function checkScroll() {
      var title = $('.header-wrapper');
      var titleHeight = title.height();
      var scrollLoc = Math.round(w.scrollY);
      var scrollDirection = 'down';
      var st = $(this).scrollTop();

      if (st > lastScrollTop) {
        scrollDirection = 'down';
      } else {
        scrollDirection = 'up';
      }

      lastScrollTop = st;

      if (scrollLoc >= titleHeight) {
        $('header .cdc-logo').hide();
        $('.title-back-link').show();
      } else {
        $('header .cdc-logo').show();
        $('.title-back-link').hide();
      }

      if ('down' === scrollDirection) {
        if (scrollLoc === 0) {
          title.css({
            'top': 0
          });
        }

        if (scrollLoc + 5 < titleHeight || scrollLoc - 5 > titleHeight) {
          title.css({
            'top': 0
          });
        }

        if (scrollLoc > titleHeight + titleHeight) {
          title.css({
            'top': 0,
            'box-shadow': '-3px 0px 6px 4px rgba(000,000,000,0.3)'
          });
        }

        if (scrollLoc > 400) {
          title.css({
            'top': -titleHeight,
            'box-shadow': 'none'
          });
        }
      }

      if ('up' === scrollDirection) {
        title.css({
          'top': 0,
          'box-shadow': '-3px 0px 6px 4px rgba(000,000,000,0.3)'
        });

        if (scrollLoc < titleHeight + $('.site-title').height()) {
          title.css({
            'box-shadow': 'none'
          });
        }
      }
    };

    window.addEventListener('scroll', checkScroll);
    $(window).on('resize', function () {
      if ($('body').hasClass('nav-is-toggled')) {
        var level = 1;

        if ($('.nav-items .nav-lvl1').hasClass('active')) {
          level = 2;
        }

        if ($('.nav-items .nav-lvl2').hasClass('active')) {
          level = 3;
        }

        if ($('.nav-items .nav-lvl3').hasClass('active')) {
          level = 4;
        }

        toggleMenu(level);
      }
    });
    $(document).on('click', '.nav-anchor', function (e) {
      var $item = $(this);
      var level = 1;

      if ($item.next('ul').hasClass('nav-items-lvl2')) {
        $item.closest('.nav-items').find('li.nav-lvl1:not(.active)').css('display', 'none');
        level = 2;
      } else if ($item.next('ul').hasClass('nav-items-lvl3')) {
        $item.closest('.nav-items').children('li.nav-back-link').css('display', 'none');
        $item.closest('.nav-items').find('li.nav-lvl2:not(.active)').css('display', 'none');
        level = 3;
      } else if ($item.next('ul').hasClass('nav-items-lvl4')) {
        $item.closest('.nav-items').children('li.nav-back-link').css('display', 'none');
        $item.closest('.nav-items').find('li.nav-lvl3:not(.active)').css('display', 'none');
        $item.closest('.nav-items').find('li.nav-lvl2:not(.active)').css('display', 'none');
        level = 4;
      }

      toggleMenu(level);
      $(this).parent('li:not(.nav-back-link)').trigger('metrics-capture', ['mobile-nav-anchor-l' + level, 'click']);
    });
    $(document).on('click', '.nav-back-link', function (e) {
      var $item = $(this);
      var level = 1;

      if ($item.closest('ul').hasClass('nav-items-lvl2')) {
        //$item.next('ul.nav-items-lvl2').find('li.nav-back-link').css('display', 'none');
        $('.mobile-nav-items > .nav-items').find('li.nav-lvl1:not(.active)').css('display', 'block');
      } else if ($item.closest('ul').hasClass('nav-items-lvl3')) {
        $('.nav-items ul.nav-items-lvl2').find('li.nav-back-link').css('display', 'block');
        $('.mobile-nav-items > .nav-items').find('li.nav-lvl2:not(.active)').css('display', 'block');
        level = 2;
      } else if ($item.closest('ul').hasClass('nav-items-lvl4')) {
        $('.nav-items ul.nav-items-lvl3').find('li.nav-back-link').css('display', 'block');
        $('.mobile-nav-items .nav-lvl2.active').find('li.nav-lvl3').css('display', 'block');
        $('.mobile-nav-items .nav-lvl2.active').find('.nav-items-lvl3 .nav-back-link:nth-child(2)').css('display', 'none');
        level = 3;
      }

      $(this).trigger('metrics-capture', ['mobile-nav-back-link-l' + level, 'click']);
      toggleMenu(level);
    });

    toggleMenu = function toggleMenu(level) {
      if (document.body.classList.contains('nav-is-toggled')) {
        $('nav#new-nav-mobile').css({
          'width': $(window).width(),
          'height': 'auto'
        });
        var menuHeight = $('#new-nav-mobile').height();

        if (level) {
          if (2 === level) {
            menuHeight = $('#new-nav-mobile .mobile-nav-search').height();
            $('li.active ul.nav-items-lvl2 > li').each(function () {
              menuHeight += $(this).outerHeight();
            });
          }

          if (3 === level) {
            menuHeight = $('#new-nav-mobile .mobile-nav-search').height();
            $('li.active ul.nav-items-lvl3 > li:not(.nav-back-link:nth-child(2))').each(function () {
              menuHeight += $(this).outerHeight();
            });
          }

          if (4 === level) {
            menuHeight = $('#new-nav-mobile .mobile-nav-search').height();
            $('li.active ul.nav-items-lvl4 > li:not(.nav-back-link:nth-child(2)):not(.nav-back-link:nth-child(3))').each(function () {
              menuHeight += $(this).outerHeight();
            });
          }
        }

        if ($(window).height() > menuHeight) {
          menuHeight = $(window).height() - 75;
        }

        $('html').css({
          'overflow-y': 'hidden',
          'height': '100%'
        });
        $('.header-wrapper').css({
          'overflow-y': 'scroll',
          'height': '100%'
        });
        $('#new-nav-mobile').css({
          'height': menuHeight
        });
      } else {
        $('nav#new-nav-mobile').css({
          'width': 0
        });
        $('html').css({
          'overflow-y': 'auto',
          'height': 'auto',
          'margin-top': 0
        });
        $('.header-wrapper').css({
          'overflow-y': 'visible',
          'height': '75px'
        });
      }
    };
  }
})();
'use strict';
/**
 * app.js
 * @fileOverview Contains module and constructors to initiate any global application functionality outside the scope of bootstrap, contents ported from prototypical examples
 * @version 0.1.0.0
 * @copyright 2018 Centers for Disease Control
 */

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function ($, window, document, undefined) {
  $(document.body).toggleClass('no-js js');
  /*jshint esversion: 6 */
  // VIEWPORT SNIFFER

  var vps = ['unknown', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      vpName = '',
      vpNumber = null; // Scans and removes skip links on the page that don't go anywhere to prevent 508 issues.

  $('#skipmenu a').each(function () {
    var elementId = $(this).attr('href');

    if (0 === $(elementId).length) {
      $(this).remove();
    }
  });

  function deepLink() {
    //handles initial load only, no resizing
    var tabs = $('.nav-tabs').length,
        accordions = $('.accordion').length,
        hash = String(window.location.hash).trim();
    var hashValue = $.escapeSelector(hash.substr(1)); // if we have a hash and it exists on the page... else kick us back out

    if (hash && $('#' + hashValue).length) {
      hash = '#' + hashValue;
    } else {
      return false;
    } // tabs have a different target than accordions


    if (tabs) {
      if ($('.nav-tabs ').has('a[href="' + hash + '"]')) {
        $('.nav-tabs a[href="' + hash + '"]').tab('show'); //tabs --> accordions

        if ($('.accordion').children('.tab-content')) {
          var $header = $('#heading-' + hashValue);

          if ($header.length) {
            var target = $.escapeSelector(String($header.data('target')).substr(1));
            var $target = $('#' + target);
            $target.collapse('show');
            $header.parent().siblings().find('.collapse').collapse('hide');
            hash = '#' + target;
          }
        }
      } else {
        $('.tab-content').find(hash).closest('[role^="tab"]').collapse('show');
      }
    }

    if (accordions) {
      var test = $('.accordion').find(hash).data('parent');

      if (_typeof(test) !== _typeof(undefined)) {
        $(hash).collapse('show');
        $(hash).siblings('[role="tab"]').collapse('hide');
      } else {
        var panel = $('.accordion').find(hash).closest('[role^="tab"]');
        panel.collapse('show');
        panel.siblings('[role="tab"]').collapse('hide');
      }
    } // scroll into view - small timeout to allow for redraw


    setTimeout(function () {
      $(hash)[0].scrollIntoView();
    }, 500);
  }

  var handleOnEvents = window.CDC.Common.debounce(function (eType) {
    window.console.log('Event:', eType, '\nViewport:', window.CDC.tp4["public"].getViewport('number')); // Is the an onload event?

    if ('onload' === eType) {
      // Initialize the application
      // window.CDC.tp4.public.appInit({
      //     metrics: {
      //         pageName: 'custom - from init'
      //     }
      // });
      if (0 < window.location.hash.length) {
        return deepLink();
      }
    } else if (window.CDC.Common.metrics) {
      // Metrics updates (must happen after appInit, otherwise metrics won't exist)
      // Update CDC Common
      window.CDC.Common.metrics.updateParams({
        c49: window.CDC.tp4["public"].getViewport('name') // Update Viewport on change

      });
    }

    return true;
  }, 300);

  window.onresize = function () {
    return handleOnEvents('onresize');
  };

  window.onload = function () {
    return handleOnEvents('onload');
  };

  $(window).on('hashchange', function () {
    return deepLink();
  });
  window.CDC = window.CDC || {};
  window.CDC.tp4 = window.CDC.tp4 || {};
  window.CDC.tp4["public"] = window.CDC.tp4["public"] || {};

  window.CDC.tp4["public"].getViewport = function (returnType) {
    returnType = returnType || 'number';
    vpName = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\"/g, '').replace(/\'/g, '');
    vpNumber = vps.indexOf(vpName);

    if ('name' === returnType) {
      return vpName;
    }

    return vpNumber;
  };

  window.CDC.tp4["public"].metricsInit = function (settingsDirectlyPassed, interactionsListenerArray) {
    // The intent of this method is to allow for updating of metrics properties in a few different ways:
    // 1. data attributes on a configurable meta tag -> so markup can provide metrics data (data-propX="valX")
    // 2. Directly set via the app init -> which is usually passed to the app init (appInit(objSettings[...metrics settings in here]))
    // 3. Apply interaction level listeners (via jquery) to the DOM based ona configuration map -> So the listeners are consistent, configurable, and in a single location (configureInteractionTracking($, interactionsListenerArray))
    var settingsMetaTag = $('meta[name=site-metrics-settings]'),
        settingsFromMeta = {}; // Set defaults for interaction listeners array

    interactionsListenerArray = interactionsListenerArray || []; // Supplement args pased with metrics-settings meta tag attributes

    if (settingsMetaTag.length) {
      $.each(settingsMetaTag[0].attributes, function (i, attrib) {
        if (-1 < attrib.name.indexOf('data-metrics-')) {
          settingsFromMeta[attrib.name.replace('data-metrics-', '')] = attrib.value;
        }
      });
    } // Set settingsFinal = settingDefaults, overridden by settingsFromMeta, overridden by settingsDirectlyPassed, overridden by manual values;


    var settingsFinal = Object.assign({}, settingsFromMeta, settingsDirectlyPassed, {
      c49: window.CDC.tp4["public"].getViewport('name')
    });
    console.log('FINAL METRICS SETTINGS', settingsFinal); // CDC METRICS INIT

    window.CDC.Common.metrics.init({
      trackAs: 'webPage',
      loadPageLevel: false,
      translation: {
        fromKey: 'omnitureJsVarName',
        appendTranslations: false
      }
    }); // Update common metrics param values from omnitures settings

    window.CDC.Common.metrics.updateFromOmniture('webPage'); // Update common metrics param values with final settings (from settingsFinal object above)

    window.CDC.Common.metrics.updateParams(settingsFinal); // Initialize Interaction Tracking

    window.CDC.Common.metrics.configureInteractionTracking($, interactionsListenerArray); // Update Omniture with latest latest updated settings

    window.CDC.Common.metrics.updateOmniture();
  };

  window.CDC.tp4["public"].metricsTrackPage = function () {
    // Update common metrics from omniture
    window.CDC.Common.metrics.updateParams(window.s); // Track the page level beacon

    if (window.s && window.s.t) {
      if (!window._satellite) {
        // Update the level variables here.
        window.updateVariables(window.s);
        console.log('Updating Variables', window.s);
        /************* A: DO NOT ALTER ANYTHING BETWEEN HERE AND B ! **************/

        var s_code = window.s.t();

        if (s_code) {
          document.write(s_code);
        }

        if (0 <= navigator.appVersion.indexOf('MSIE')) {
          document.write(unescape('%3C') + '\!--');
        }
        /************* B: DO NOT ALTER ANYTHING BETWEEN HERE AND A ! **************/


        return s_code;
      }
    } else {
      //throw 'Error, unable to initialize metrics for Template Package 4.0';
      console.log('Error, unable to initialize metrics for Template Package 4.0');
    }
  };

  window.CDC.tp4["public"].metricsUpdate = function (objProperties) {
    return window.CDC.Common.metrics.updateParameters(objProperties);
  };

  window.CDC.tp4.updateSocialSyndLink = function () {
    var socialUrl = "https://tools.cdc.gov/medialibrary/index.aspx#/sharecontent/";
    var canonicalMeta = $('[rel="canonical"]').attr('href');
    socialUrl = canonicalMeta ? socialUrl + canonicalMeta : socialUrl + window.location; // update social bar

    if ($('.page-share-syndication').length) {
      $('.page-share-syndication').attr('href', encodeURI(socialUrl));
    } // update footer


    $('.footer-syndlink').attr('href', encodeURI(socialUrl));
  };

  window.CDC.tp4.cdcCarouselInit = function (objDefaultOverrides) {
    if ($().slick && $().cdcCarousel) {
      // initialize the carousel plugin, just not on the thumbnailscarousel-
      $('[data-cdc-slider]').not('.slick-initialized').cdcCarousel(objDefaultOverrides);
    } else if (console.error) {
      console.error('The Slick jQuery plugin is required.');
    } else {
      console.log('The Slick jQuery plugin is required.');
    }
  };

  window.CDC.tp4.cdcAudioInit = function () {
    if ($().audioly) {
      $('audio').audioly();
    } else if (console.error) {
      console.error('The Bootstrap 4 Audio plugin is required.');
    } else {
      console.log('The Bootstrap 4 Audio plugin is required.');
    }
  };

  window.CDC.tp4.govdAlertInit = function () {
    var domains = ['lnks.gd', 'links.govdelivery.com'],
        // referral domains to run against, could add cdc.gov to test against
    a = document.createElement('a'),
        // create an "a" element to validate host against
    tp3 = document.getElementsByClassName('span24').length,
        // only BS2 has span## elements, so using as an indicator
    target = tp3 ? 'content' : 'content',
        // ID of the target element of the alert e.g. "skipmenu"
    dateparse = true,
        // do we want to run between two dates?
    startdate = '03/08/2019',
        enddate = '11/22/2019',
        dismissable = true,
        // is the banner dismissable?
    position = tp3 ? 'afterbegin' : 'afterend',
        // "afterbegin, afterend, beforebegin, beforeend"
    managesubscriptionsurl = 'https://tools.cdc.gov/campaignproxyservice/subscriptions.aspx',
        title = 'CDC Has a New Email Service',
        message = 'We recently changed email services; new email will be sent from <a href="mailto:subscriptions@cdc.gov">subscriptions@cdc.gov</a>. If you wish to continue to receive emails from us, please sign up at <a href="' + managesubscriptionsurl + '">the Manage your subscription page.</a>';

    if (document.getElementById('govdMessage')) {
      // if the message is already on the page, exit
      return;
    }

    if (dateparse) {
      // if the message should appear between two dates
      var start = Date.parse(startdate),
          // start date
      end = Date.parse(enddate),
          // end date
      now = Date.now(); // today

      if (isNaN(start) || isNaN(end)) {
        // if the dates aren't valid dates, exit
        console.log('Please check start and end dates for valid dates. Each date should be formatted as MM/DD/YYYY');
        return;
      } // if the start and end dates are backwards
      // OR if today is on or after the end date
      // OR if today is before the start date


      if (start > end || now >= end || now < start) {
        return;
      }
    }

    var referrerHost = CDC.parseUrl(CDC.cleanUrl(document.referrer)).hostname; // referring URL

    if (0 < domains.indexOf(referrerHost)) {
      // if the referring hostname is in the domains array
      var domelement = document.getElementById(target); // find the element to append the message to

      if (domelement) {
        // if it exists, append the message
        var button = '';

        if (tp3) {
          // the alert is different for TP3 than TP4
          if (dismissable) {
            // if the alert is dismissable, add the classes and button required
            button = '<button type="button" class="close" data-dismiss="alert">&times;</button>';
          }

          domelement.insertAdjacentHTML(position, '<div id="govdMessage" class="alert alert-info">' + button + '<h4>' + title + '</h4><p>' + message + '</p></div>');
        } else {
          if (dismissable) {
            // if the alert is dismissable, add the classes and button required
            button = '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
          }

          domelement.insertAdjacentHTML(position, '<div id="govdMessage" class="alert alert-info rounded-0 alert-dismissible fade show" role="alert"><p class="h4 alert-heading">' + title + '</p><p>' + message + '</p>' + button + '</div>');
        }
      }
    }
  };

  window.CDC.tp4.cdcInitSharedComponents = function () {
    /* ITEMS TO BE INITIALIZED WHICH ARE COMMON TO
          BOTH TP4 AND OTHER CHANNELS LIKE SYNDICATION */
    window.CDC.tp4.cdcAudioInit();
    window.CDC.tp4.cdcCarouselInit();
    $(document).cdc_collapse();
    $(document).cdc_videoPlayer();
    $(document).cdc_images();
    window.CDC.tp4.govdAlertInit();
  }; // Application Initialization


  window.CDC.tp4["public"].appInit = function (settings) {
    settings = settings || {};
    settings.navigation = settings.navigation || {};
    settings.metrics = settings.metrics || {}; // The following interaction tracking mechanism does not appear to work as expected for built-in TP4 features.  Metrics
    // tracking was moved to tp-interactions.js.

    settings.interactionTrackList = settings.interactionTrackList || [];
    /* ITEMS TO BE INITIALIZED WHICH ARE SPECIFIC TO TP4
          (NOT USED IN OTHER CHANNELS LIKE SYNDICATION) */

    window.CDC.tp4["public"].metricsInit(settings.metrics, settings.interactionTrackList);
    window.CDC.tp4["public"].metricsTrackPage();
    window.CDC.tp4.interactionMetrics.init({});
    window.CDC.tp4.nav.init(settings.navigation);
    window.CDC.tp4.updateSocialSyndLink();
    window.CDC.tp4.extLinks.init();
    $(document).cdc_multipagenav();
    $(document).cdc_levelnav(settings.navigation);
    $(document).cdc_social_media(); // INIT COMMON COMPONENTS

    window.CDC.tp4.cdcInitSharedComponents();
    $(window).trigger('CDCTPAppLoaded');
    console.log('TP App Fully Initialized (appInit), CDCTPAppLoaded event fired.');
  }; // Syndication Widget Initialization


  window.CDC.tp4["public"].syndInit = function (settings) {
    settings = settings || {}; // Stubbed out for future use
    // INIT COMMON COMPONENTS

    window.CDC.tp4.cdcInitSharedComponents();
    $(window).trigger('CDCTPAppLoaded');
    console.log('TP App Fully Initialized (syndInit), CDCTPAppLoaded event fired.');
  };

  $('.match-height > .splash-col .card').matchHeight();
  $('.match-height > .splash-col .card.card-multi').matchHeight();
  $('.match-height > .splash-col .card.card-multi .card-body .card').matchHeight();
  $('.match-height .card').matchHeight();
  $('.match-height .card.card-multi').matchHeight();
  $('.match-height .card.card-multi .card-body .card').matchHeight();
  $('.match-height .nav-btn.card .card-body').matchHeight();
  $('.match-height .nav-btn.card').matchHeight({
    byRow: true,
    property: 'height',
    target: null,
    remove: false
  }); // Focus Trap for Modals so screen readers ignore modal container

  $('div.modal').on('focus', function () {
    $(this).find("button.close, [aria-label='close']").first().focus();
  });
})(jQuery, window, document);

console.log('tp-app.js complete');