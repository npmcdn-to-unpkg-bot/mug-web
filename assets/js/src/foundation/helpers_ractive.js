

Ractive.defaults.data.helpers = {};
var helpers = Ractive.defaults.data.helpers;

helpers.dateFormat = function(timeString, format){
	if (window.moment) {
	  var f = format || "MMM Do, YYYY";
	  return moment( timeString ).format(f);
	}else{
	  return timeString;   //  moment plugin not available. return data as is.
	};
};

helpers.dateRelative = function(timeString){
	if (window.moment) {
	  return moment( timeString ).fromNow();
	}else{
	  return timeString;   //  moment plugin not available. return data as is.
	};
};

helpers.linkify = function(linkableString){
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return linkableString.replace(exp,"<a href='$1'>$1</a>");
};

helpers.random = function(min,max){
	return Math.floor(Math.random() * (max - min)) + min;
};


helpers.numberFormat = function(numberString){
	//Seperates the components of the number
	var n= numberString.toString().split(".");
	//Comma-fies the first part
	n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	//Combines the two sections
	return n.join(".");
};

helpers.truncate = function(str, len){
	if (str.length > len && str.length > 0) {
		var new_str = str + " ";
		new_str = str.substr (0, len);
		new_str = str.substr (0, new_str.lastIndexOf(" "));
		new_str = (new_str.length > 0) ? new_str : str.substr (0, len);

		return new_str +'...';
	}
	return str;
};

helpers.truncateMean = function(str, len){
	if (str.length > len) {
		var new_str = str.substr (0, len+1);

		while (new_str.length) {
			var ch = new_str.substr ( -1 );
			new_str = new_str.substr ( 0, -1 );

			if (ch == ' ') {
				break;
			}
		}

		if ( new_str == '' ) {
			new_str = str.substr ( 0, len );
		}

		return  new_str +'...' ;
	}
	return str;
};


helpers.json = function(obj){
	return JSON.stringify(obj);
}

helpers.times = function(times){
	return array[times];
}

helpers.whoDid = function(namedArr, totalInt){
	var str = namedArr[0].name;
	if(totalInt == 2){
		str += " and "+namedArr[1].name;
	}
	else if(totalInt > 2){
		var remain = totalInt - 1;
		str += " and "+remain+" others";
	}
	console.log(str);
	return str;
}

helpers.svgIcon = function(svgName, customClasses){
	if(typeof customClasses === "undefined") {
		svgName = svgName;
		extraClasses = null;
	}
	var extraClasses = customClasses ? customClasses : '';
	var svgString = '<svg class="icon icon-' + svgName + ' ' + extraClasses + '"><use xlink:href="#icon-' + svgName + '"/></svg>';

	return svgString;
}

$.fn.exactlist = function(){
	return this.each(function(){
		var $first = $(this).find(' > li:first');
		var h = Math.ceil($first[0].getBoundingClientRect().height); // jquery rounds it
		var $wrap = $('<div class="exactlist-wrap" />');
		$wrap.css({"height": Math.ceil(h)});
		$(this).wrap($wrap);
	});
}


$.fn.hscroll = function(){
	return this.each(function(){
		if( !$(this).data('init') ){
			var $first = $(this).find(' > li:first');
			var qty = $(this).find(' > li:visible').length;
			var h = $first.height();
			var w = $first.outerWidth(true);
			var rows = $(this).data('rows') || 1;

			$(this).wrap('<div class="hscroll-wrap-wrap" />').wrap('<div class="hscroll-wrap" />');
			// $(this).css({width: (w * Math.ceil(qty / rows))});
			$(this).data('init', true);

			// Mike's temporary code (to delete)
			// if (qty * w > $(this).parents('.hscroll-wrap').width()) {
			// 	$(this).parents('.hscroll-wrap-wrap').prepend('<a href="#" class="hscroll-arrow hscroll-prev"><i class="fa fa-chevron-left hscroll-arrow"></i></a> <a href="#" class="hscroll-arrow hscroll-next"><i class="fa fa-chevron-right hscroll-arrow"></i></a>');
			// 	$(this).on('mouseover', function(){
			// 		$(this).parents('.hscroll-wrap-wrap').addClass('is-hovered');
			// 	}).on('mouseleave', function(){
			// 		$(this).parents('.hscroll-wrap-wrap').removeClass('is-hovered');
			// 	});
			// } else if ($(this).hasClass('hscroll--backfill')) {
			// 	$(this).find(' > li:last').addClass('backfiller');
			// }
		}

		// Mike's temporary code
		$(this).parents('.hscroll-wrap').on('scroll', function(){
			if($(this).scrollLeft() > 0) {
				$(this).siblings('.hscroll-prev').removeClass('none');
			} else {
				$(this).siblings('.hscroll-prev').addClass('none');
			}
		});

	});
};




// TABS
// super-ez tabs
// <ul class="tabs">
// <li data-show="thing-1" class="selected">Thing One</li>
// <li data-show="thing-2">Thing Two</li>
// </ul>
// <div id="thing-1">...</div>
// <div id="thing-2">...</div>


// TODO: activesize is hacktacular


$.fn.tabs = function(){
	function show_tab($ul, $li){
		$($ul.data('tab-selectors')).hide();
		$('#'+$li.data('show')).show();
		$ul.find('.tabs-tab').removeClass('tabs-tab--selected');
		$li.addClass('tabs-tab--selected');
	}
	return this.each(function(){
		var $ul = $(this);
		var selectors = [];
		var activesize = $ul.data('activesize');
		$ul.find('.tabs-tab').each(function(){
			selectors.push('#'+$(this).data('show'));
		});
		$ul.data('tab-selectors', selectors.join(','));
		$ul.delegate('.tabs-tab', 'click', function(){
			show_tab($ul, $(this));
		});

		function setupTabs(){
			var w = $(window).width();

			if( !activesize ||
				(activesize == 'handheld' && w <= 500) ||
				(activesize == 'medium' && w <= 900)){
				$ul.show();
				show_tab($ul, $ul.find('.tabs-tab.tabs-tab--selected:first'));
			}
			else{
				$($ul.data('tab-selectors')).show();
				$ul.hide();
			}

		}

		setupTabs();
		$(window).resize(setupTabs);

	});
};

//
// PRIORITY PLUS PATTERN
//
function priorityPlusSetup() {

	if ($('.priorityPlus').length) {
		var $container        = $('.priorityPlus');
		var $showAll          = $('.priorityPlus-showAll');
		var $list             = $('.priorityPlus-list');
		var priorityPlusWidth = 0;
		$('.priorityPlus-list li').each(function(idx, el){
			priorityPlusWidth += $(el).outerWidth(true);
		});

		function updateNav() {
			var availableSpace = $showAll.hasClass('display--none') ? $container.width() : $container.width() - $showAll.width() - 30;

			// console.log('priorityPlusWidth = ' + priorityPlusWidth);
			// console.log('$container.width() = ' + $container.width());
			// console.log('$list.width() = ' + $list.width());

			// The visible list is overflowing the nav

			if(priorityPlusWidth > availableSpace) {

				// Show the dropdown btn
				if($showAll.hasClass('display--none')) {
					$showAll.removeClass('display--none');
					$container.addClass('priorityPlus--overflowing');
				}

				// The visible list is not overflowing
			} else {
				$showAll.addClass('display--none');
				$container.removeClass('priorityPlus--overflowing');
			}

		}

		// Window listeners

		$(window).resize(function() {
			updateNav();
		});

		updateNav();
	}

}

//
// LINE-CLAMP STYLE TRUNCATION
//
// truncating text
function emsToPixels(element, ems) {
	var el = $(element),
		ruler = el.find('[data-ruler]');
	if (ruler.length === 0) {
		ruler = $('<div data-ruler style="position:absolute;top:-9999px;display:block;height:1em;width:0;visibility:hidden;padding:0;margin:0;border:none;overflow:hidden"></div>');
		el.append(ruler);
	}
	return ems * ruler.height();
}

function ellipsis(element, lines, options) {
	var el = $(element),
			options = options || {},
			more = options.more || false,
			title = typeof options.title === "undefined" ? true : options.title,
			lineHeight = options.lineHeight || 1.5,
			wrapWith = options.wrapWith || false,
			em = emsToPixels(el, 1),
			height = ((lines * lineHeight) + 0.5) * em,
			originalHtml = el.data('original-html') || el.html(),
			originalText = el.data('original-text') || el.text(),
			text = originalText,
			moreHref = options.moreHref || 'javascript:void(0)',
			moreLinkHtml = options.moreHref ? '<a href="' + options.moreHref + '" class="link">read more</a>' : '<a href="javascript:void(0)" class="link" data-toggle-ellipsis>read more</a>';

	while (el.outerHeight() > height && text.match(/\s/)) {
		text = text.replace(/\W*\s(\S)*$/, '...');
		el.text(text);
		if (more) { el.append(' ' + moreLinkHtml); }
	}

	if (wrapWith) { el.wrapInner(wrapWith); }

	el.data('trimmed-text', text);
	el.data('original-html', originalHtml);
	if (title) { el.attr('title', originalText); }

	el.attr('data-ellipsis-applied', true);
}

function toggleEllipsis(e) {
	var target = $(e.target),
			el = target.parents('[data-ellipsis-applied]'),
			html = el.data('original-html');

	el.html(html);
}

// CSS transition end callback
// via https://davidwalsh.name/css-animation-callback
// TODO: stop from firing for each transitioned property
function whichTransitionEvent(){
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };

    for(t in transitions){
        if( el.style[t] !== undefined ){
            return transitions[t];
        }
    }
}
var transitionEvent = whichTransitionEvent();
function transEndCallback(el, handler) {
	transitionEvent && el.addEventListener(transitionEvent, handler);
}

Ractive.transitions.scale = function ( t, params ) {

	var defaults = {
		duration: 160,
		easing: 'ease-out',
		from: 0,
		to: 1
	};

	params = t.processParams( params, defaults);

	params.duration = 160;

	var scaleTo = 'scale('+params.to+')';
	var scaleFrom = 'scale('+params.from+')';
	var anim = {};

	if ( t.isIntro ) {
		t.setStyle('transform', scaleFrom);
	}

	setTimeout(function(){
		anim.transform = t.isIntro ? scaleTo : scaleFrom;
		t.animateStyle(anim, params).then(t.complete);
	}, 1);
};

// clean this animation up
Ractive.transitions.scaleFlash = function ( t, params ) {

	var defaults = {
		duration: 160,
		easing: 'ease-out',
		from: 0,
		to: 1
	};

	params = t.processParams( params, defaults);

	params.duration = 160;

	var scaleTo = 'scale('+params.to+')';
	var scaleFrom = 'scale('+params.from+')';
	var anim = {
		transform: scaleTo,
		background: 'rgba(255,255,255,0)',
		boxShadow: '0 0 0 20px rgba(255,255,255,0)'
	};

	if ( t.isIntro ) {
		t.setStyle({
			transform: scaleFrom,
			borderRadius: '999px',
			boxShadow: '0 0 0 0 rgba(255,255,255,.8)',
			background: 'rgba(255,255,255,.8)',
			transitionDelay: '400ms'
		});
	}


	setTimeout(function(){
		t.animateStyle(anim, params).then(t.complete);
	}, 1);
};

Ractive.transitions.float = function ( t, params ) {

	var defaults = {
		duration: 160,
		easing: 'ease-out',
		fade: true,
		distance: 48
	};

	params = t.processParams( params, defaults);

	params.duration = 125;

	if ( t.isIntro ) {
		t.setStyle({
			'transform': 'translateY('+params.distance+'px)',
			'opacity': 0
		});
		var anim = {
			'transform': 'translateY(0)',
			'opacity': 1
		}
	} else {
		var anim = {
			height: 0,
			'transform': 'translateY(-'+params.distance+'px)',
			'opacity': 0
		}
	}

	setTimeout(function(){
		t.animateStyle(anim, params).then(t.complete);
	}, 1);
};

// Nice to just make some simple Jquery magic available by default
// Should probably have complementary defaultDestroyActions
// to undo these before takedown.
function defaultRenderCompleteActions($el){
	$el = $el || $('body');
	//$el.find('.hscroll').hscroll();
	//$el.find('.exactlist').exactlist();
	// $el.find('.tabs').tabs();
	// autosize($el.find('textarea'));
	priorityPlusSetup();

	$el.css({backgroundColor: $el.find('[class^=stripe]:last').css('backgroundColor')}); // make last color extend to bottom
}
