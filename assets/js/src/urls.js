//
// Setup tools for playing with routes and URL params
//
var router = new Rlite();

function processHash() {
	var hash = location.hash || '#!/';
	router.run(hash.substr(2));
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


//
// Stuff to do depending on what the URL is
//
router.add('', function(context){ // homepage
	views.show({
		template: 'main-template',
		events: {
			// "renderNavigation" : renderNavigation(),
			"complete"         : main_onComplete
		},
		header : {
			title: "View Head Title",
			isRoot: false,
			buttons: [
				{ label: "Actions", icon: "ellipsis-h", fn: function(){ alert('tapped overflow'); } }
			]
		}
	});

	// this is weird, make it easier
	$('.js-fndTextTrunc').each(function() {
		var $el = $(this);
		ellipsis($el, 7, { wrapWith: '<p>', more: true, title: false }); // see js/src/foundation/foundationTextTrunc for this code
	});

	$(document.body).on('click', '[data-ellipsis-applied] [data-toggle-ellipsis]', function(e) { toggleEllipsis(e) });

});
