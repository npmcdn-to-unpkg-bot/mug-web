/*
-----------------------------
	DOCUMENT READY
-----------------------------
*/
function main_onComplete() {
	console.log('DOM is ready');

	// this is weird, make it easier
	$('.js-fndTextTrunc').each(function() {
		var $el = $(this);
		ellipsis($el, 7, { wrapWith: '<p>', more: true, title: false }); // see js/src/foundation/foundationTextTrunc for this code
	});

	$(document.body).on('click', '[data-ellipsis-applied] [data-toggle-ellipsis]', function(e) { toggleEllipsis(e) });
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

/*
-----------------------------
POST TO CONVERSATION
-----------------------------
*/

//
// Open posting interface
//
function toggle_post_popover(event){
	var changeHash = function(){ window.location.hash = '#!/create-new-post'; return false; };
	// console.log(event);
	changeHash();
}

//
// Text post
//
function post_text(event){
	views.modal_hide();
	var newDiscussion = new Items.Discussion();

	newDiscussion.top_post = {
		member: {
			name: views.data.current_member.name,
			photo: {thumb: views.data.current_member.photo}
		},
		body: document.getElementById('post-textarea').value
	};

	console.log(newDiscussion);

	views.data.news.unshift( newDiscussion );
}

//
// Photo post
//
function choosePhotos(event){
	$('#photoFileInput').click();
	return false;
}

function processUploadedPhotos(){
	views.data.previewPhotos = [];
	var photos = views.data.uploadedPhotos;

	if(photos.length > 0 ){
		for(var i=0; i<photos.length; i++){
			var photo = photos[i];
				if (photos) {
					 var reader = new FileReader();
					 reader.onload = function (e) {
					 views.data.previewPhotos.push(e.target.result);
					 }
					 reader.readAsDataURL(photo);
			}
		}
		window.location.hash = '#!/create-photo-post';
	}
}

function post_photo(event){
	views.modal_hide();
	var dropdown       = document.getElementById('recent-mup-list'),
			chosenAlbum    = dropdown.value !== 'none' ? dropdown.value : 'none',
			newPhotos;

	var getEvent = function(chosenAlbum){
		var album;

		for (var i = 0; i < views.data.events_short.length; i++) {
			var obj = views.data.events_short[i];

			for(var prop in obj) {
				if (obj.hasOwnProperty(prop) && obj[prop] == chosenAlbum) {
					album = obj;
				}
			}
		}

		return album;

	};

	photoUpload = $.map(views.data.previewPhotos, function(p, i){
		return {
			member: { name: views.data.current_member.name },
			member_photo: { thumb_link: views.data.current_member.photo },
			photo_link: p,
			uploadTime: (new Date).getTime(),
			link: "http://disneyworld.com/"
		};
	});
	newPhotos = new Items.EventPhotos(getEvent(chosenAlbum),photoUpload);
	views.data.news.unshift( newPhotos );
}

//
// Poll post
//
function post_poll(event){
	views.modal_hide();

	var newPoll = new Items.Poll({
		question: document.getElementById('poll-question').value,
		member: {
			name: views.data.current_member.name,
			photo: views.data.current_member.photo
		}
	});

	var answerEls =	document.querySelectorAll('.choice');
	newPoll.answers = $.map(answerEls, function(a, i){
		return {
			multiple: document.getElementById('multiple').checked,
			answer: a.value,
			voteCount: 0,
			userPicked: false
		};
	});

	views.data.news.unshift( newPoll );
	console.log(views.data.news);
}

// Poll voting
function voteForPoll(event){
	var str          = event.keypath,
			tokens       = str.split('.').slice(0, 2),
			truncKeypath = tokens.join('.'),
			poll         = this.get(truncKeypath);

	for (var i=0; i < poll.answers.length; i++) {

		if(poll.answers[i].userPicked){
			this.add(truncKeypath + '.answers.'+i+'.voteCount');
			this.add(truncKeypath + '.totalVotes');
		}
		// else {
		// 	this.subtract(truncKeypath + '.answers.'+i+'.voteCount');
		// 	this.subtract(truncKeypath + '.totalVotes');
		// }
	}
	this.set(truncKeypath + '.isVoted', true);
	this.set(truncKeypath + '.resultsShown', true);
	return false;
}


function togglePollResults(event){
	var visible = this.get(event.keypath+'.resultsShown');
	this.set(event.keypath+'.resultsShown', !visible);
	return false;
}


