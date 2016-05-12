/*
-----------------------------
	DOCUMENT READY
-----------------------------
*/
function main_onComplete() {
	// Initialize app carousel
	console.log('DOM is ready');
}

/*
-----------------------------
	GLOBAL NAVIGATION
-----------------------------
*/
function renderNavigation() {
	if ($('.mainNav').length < 1) {
		views.nav_show({
			"loggedIn": false,
			"isModern": false
		});

		// Change to sticky nav
		
		setTimeout(function() { // using this to deal with weird Waypoints bug
			$('.mainNav').waypoint({
				handler: function(direction) {
					if (direction == 'up') {
						// over photo
						$(this).addClass('mainNav--photoOverlay inverted'); // change nav bg
						$(this).find('.button--bordered').addClass('button--contrast').removeClass('button--bordered'); // change button
						$(this).find('.js_logo--script').removeClass('display--none').addClass('display--inlineBlock'); // show script logo
						$(this).find('.js_logo--swarm').removeClass('display--inlineBlock').addClass('display--none'); // hide swarm logo
						$(this).find('.js_signUp').toggleClass('display--none');
						//console.log($(this).find('.js_signUp'));
					} else {
						// over content
						$(this).removeClass('mainNav--photoOverlay inverted');
						$(this).find('.button--contrast').addClass('button--bordered').removeClass('button--contrast');
						$(this).find('.js_logo--script').removeClass('display--inlineBlock').addClass('display--none'); // show script logo
						$(this).find('.js_logo--swarm').removeClass('display--none').addClass('display--inlineBlock'); // hide swarm logo
						$(this).find('.js_signUp').toggleClass('display--none');
					}
				},
				offset: function() {
					return -1 * $('.stripe-heroContent').height();
				}
			});
		}, 1);
		$('.mainNav').addClass('mainNav--sticky mainNav--photoOverlay inverted');
		
	}
}
