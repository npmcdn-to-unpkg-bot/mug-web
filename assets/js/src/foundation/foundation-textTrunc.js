//
// TODO: Things got a little crazy here. Clean it up
// Should just be a helper
//

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
			moreLinkHtml = '<a href="javascript:void(0)" class="link" data-toggle-ellipsis>read more</a>';

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

// just turn this into a helper?
// function fndTextTrunc(lines, more, moreLabel, wrapWith) {
// 	$(function() {
// 		var lineCount = lines || 7,
// 				showMore  = more || true,
// 				showMoreLabel = moreLabel || 'read more',
// 				wrapperEl = wrapperEl || '<p>';

// 		console.log('fndTextTrunc firing');
// 		console.log($('.js-fndTextTrunc').length);
// 		$('.js-fndTextTrunc').each(function() {
// 			var $el = $(this);
// 			ellipsis($el, lines, { more: showMore, moreLabel: showMoreLabel, wrapWith: wrapperEl });
// 		});

// 		$(document.body).on('click', '[data-ellipsis-applied] [data-toggle-ellipsis]', function(e) { toggleEllipsis(e) });
// 	});
// }
