/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
	DOCUMENT READY
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/
function main_onComplete() {
	console.log('DOM is ready');

	// Line-clamp style text truncation
	$('.js-expandableContent--desc').each(function() {
		var el = $(this);
		ellipsis(el, 5, { wrapWith: '<p>', title: false, more: true, moreHref: '#!/about' });
	});

	$('.js-expandableContent').each(function() {
		var el = $(this);
		ellipsis(el, 7, { wrapWith: '<p>', title: false, more: true });
	});
	$(document.body).on('click', '[data-ellipsis-applied] [data-toggle-ellipsis]', function(e) { toggleEllipsis(e) });

	$('.js-expandableContent--inline').each(function() {
		var el = $(this);
		ellipsis(el, 5, { wrapWith: '<span>', title: false, more: true });
	});
	$(document.body).on('click', '[data-ellipsis-applied] [data-toggle-ellipsis]', function(e) { toggleEllipsis(e) });
}

/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
	GLOBAL NAVIGATION
----------------------------------------------------------
//////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////
----------------------------------------------------------
POST TO CONVERSATION
----------------------------------------------------------
//////////////////////////////////////////////////////////
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
	var newDiscussion = new Items.Discussion(),
			baseURI       = event.node.baseURI,
			isPreMUPPage  = baseURI.indexOf('preMup') > -1,
			$postBtn      = $(event.node.offsetParent).find('.js-postBtnContainer');

	newDiscussion.top_post = {
		member: {
			name: views.data.current_member.name,
			photo: {thumb: views.data.current_member.photo}
		},
		body: document.getElementById('post-textarea').value
	};
	if (Object.keys(views.data.linkPost).length > 0) {
		newDiscussion.link = views.data.linkPost;
	}

	if (isPreMUPPage) {
		views.data.preMUPRendered.feed.unshift(newDiscussion);
		document.getElementById('post-textarea').value = '';
		$postBtn.addClass('display--none');
	} else {
		views.data.news.unshift(newDiscussion);
		views.data.linkPost = {};
	}
}

//
// Text post woth link
//
function linkPosting() {
	var $postTextarea = $('#post-textarea'),
			$swarmLoader   = $('<div class="_proto_swarm _proto_abs-center"></div>');
	var render = function(data, options) {
		var route = "/:gid/events/:eid/";
		var routeMatcher = new RegExp(route.replace(/:[^\s/]+/g, '([\\w-]+)'));
		// var url = "http://www.meetup.com/Designers-Who-Code-NYC/events/230998394/";
		var inputUrl = data.original_url;
		var isMeetup = /https?:\/\/(.+?\.)?meetup\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?/.test(inputUrl);

		if (isMeetup) {
			console.log(inputUrl.match(routeMatcher));
		}

		var selectorHTML = [
		'<div class="row chunk attachment">',
			'<div class="row-item row-item--shrink">',
				'<div class="thumb media--m" style=background-image:url(\'' + data.thumbnail_url + '\');"></div>',
			'</div>',
			'<div class="row-item valign--middle">',
				'<a href="' + data.original_url + '" class="link">' + data.title + '</a>',
			'</div>',
			'<div class="row-item row-item--shrink">',
				'<a href="javascript:void(0)" id="removeLink">' + helpers.svgIcon('cross', 'icon--s icon--hint') + '</a>',
			'</div>',
		'</div>',
		'<p>' + data.description + '</p>',
		'<div class="row text--caption">',
			'<div class="thumb row-item row-item--shrink valign--middle" style="background-image:url(\'' + data.favicon_url + '\'); background-color: transparent; width: 16px; height: auto;"></div>',
			'<p class="row-item valign--middle">' + data.provider_display + '</p>',
		'</div>'
		].join('');

		$('.selector-wrapper').html(selectorHTML).show();

		$('#removeLink').on('click', function(){
			$('#post-textarea').trigger('close');
		});

		// remove the preview box
		$(this).on('close', function(e){
			$(this).siblings('.selector-wrapper').hide();
			views.data.linkPost = undefined;
		});

	};

	$postTextarea.preview({
		key     : '3ed15b53335b475b850d014fdb84c97a',
		render  : render,
		bind    : false,
		success : function(obj) {
			views.data.linkPost = obj;
		}
	}).on('paste keyup blur', function(e){
		$(this).trigger('preview');
	}).on('loading', function(e){
		setTimeout($(this).after($swarmLoader), 50);
		// console.log('loading');
	}).on('loaded', function(e){
		$swarmLoader.remove();
		// console.log('loaded');
	});
}

//
// Photo post
//
function choosePhotos1(event){
	$('#photoFileInput1').click();
	return false;
}
function choosePhotos2(event){
	$('#photoFileInput2').click();
	return false;
}
function choosePhotos3(event){
	$('#photoFileInput3').click();
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

//
// Spark a Meetup
//
function toggleDatePopover(e){
	e.original.preventDefault();

	views.momentary_show({
		$target: $(e.node),
		type	 : 'popover',
		buttons: [
			{label: 'Next week', fn: sparkedEventDate },
			{label: 'Next weekend', fn: sparkedEventDate },
			{label: 'Next month', fn: sparkedEventDate },
			{label: 'A specific date', fn: pickSpecificDate}
		]
	});
}

function toggleTimePopover(e){
	e.original.preventDefault();

	views.momentary_show({
		$target: $(e.node),
		type	 : 'popover',
		buttons: [
			{label: 'Morning', fn: sparkedEventTime },
			{label: 'Afternoon', fn: sparkedEventTime },
			{label: 'Evening', fn: sparkedEventTime },
			{label: 'A specific time', fn: pickSpecificTime}
		]
	});
}

function sparkedEventTime(e) {
	switch (e.node.text) {
		case "Morning":
			views.data.sparkedMeetup.time.value = "In the morning";
			break;
		case "Afternoon":
			views.data.sparkedMeetup.time.value = "In the afternoon";
			break;
		case "Evening":
			views.data.sparkedMeetup.time.value = "In the evening";
			break;
		default:
			views.data.sparkedMeetup.time.value = "In the evening";
			break;
	}
}

function pickSpecificTime(){
	$('#sparkTimeSpecific').removeClass('display--none');
	$('#sparkTimeLauncher').addClass('display--none');
	$('#sparkTimeInput').focus();
}

function pickGeneralTime(){
	$('#sparkTimeSpecific').addClass('display--none');
	$('#sparkTimeLauncher').removeClass('display--none');
}

function sparkedEventDate(e) {
	views.data.sparkedMeetup.date.value = e.node.text;
}

function pickSpecificDate(){
	$('#calendar-template-container').removeClass('display--none');
}

//
// Spark a Meetup - Calendar
//
function Calendar($el, events){
	this.$el = $el;
	this.$dates = null;
	this.$month = null;
	this.$back = null;
	this.$forward = null;
	this.events = events;
	this.calendarized_events = {};
	this.today = moment();
	this.cursor = moment();
	this.init();

}
Calendar.prototype = {

	update_month: function(months){
		this.cursor.add(months, "months");
		this.redraw();
	},

	redraw: function(){
		var calendarOutput = '';
		var month = this.calendarized_events[this.cursor.year()][this.cursor.month()] || false;
		var days = moment(this.cursor).daysInMonth();
		var startOfMonth = moment(this.cursor).startOf('month');
		var dayOfWeekOffset = parseInt(moment(startOfMonth).format("d"),10);

		// offset days to correct day of week
		for (i = 0; i < dayOfWeekOffset; i++) {
			calendarOutput += "<div class=\"_proto_calendar-date _proto_calendar-day\">";
			calendarOutput += "</div>";
		}

		// draw the actual days
		for (i = 1; i <= days; i++) {

			// if there's a mup, do this
			if( month && month[i] ){
				calendarOutput += "<div data-date=\"" + this.cursor + "\" class=\"_proto_calendar-date--hasEvents _proto_calendar-day _proto_calendar-date\">";
				calendarOutput += "<strong class=\"display--block\">"+i+"</strong>";

				// uncomment this to put event count
				// calendarOutput += "<span class=\"display--inlineBlock atMedium_display--block\">" + month[i].length + " Meetups</span>";

				// uncomment this to put actual events in the calendar
				$.map(month[i], function(val, n){
					calendarOutput += '<span class="display--inlineBlock _proto_calendar-event" href="' + val.event_url + '"></span>';
					// calendarOutput += '<a class="display--inlineBlock atMedium_display--block link _proto_calendar-event" href="' + val.event_url + '">'+val.name+'</a>';
				});

				calendarOutput += "</div>";
			}

			// if there's not a mup, do this
			else {
				calendarOutput += '<div data-date="' + this.cursor.format('YYYY') + ',' + this.cursor.format('MM') + ',' + i + '" class="_proto_calendar-day _proto_calendar-date">'; // data-date-formatted="' + this.cursor.format('MM') + '/' + i + '/' + this.cursor.format('YYYY') + ' 0:00' + '"
				calendarOutput += "<span class=\"display--block\">"+i+"</span>";
				calendarOutput += "</div>";
			}

		}
		this.$dates.html(calendarOutput);
		this.$month.text( this.cursor.format("MMMM YYYY") );
	},

	init: function(){
		// collate events into a nice data structure
		for(var i=0; i<this.events.length; i++){
			var event = this.events[i];
			var date = moment(event.time);
			if(!this.calendarized_events[ date.year() ])
				this.calendarized_events[ date.year() ] = {};
			if(!this.calendarized_events[ date.year() ][ date.month() ])
				this.calendarized_events[ date.year() ][ date.month() ] = {};
			if(!this.calendarized_events[ date.year() ][ date.month() ][ date.date() ])
				this.calendarized_events[ date.year() ][ date.month() ][ date.date() ] = [];
			this.calendarized_events[ date.year() ][ date.month() ][ date.date() ].push(event);
		}

		// set up DOM
		var self = this;
		this.$month = this.$el.find('._proto_calendar-month');
		this.$back = this.$el.find('._proto_calendarControl--back').click(function(){
			self.update_month(-1);
		});
		this.$forward = this.$el.find('._proto_calendarControl--forward').click(function(){
			self.update_month(1);
		});
		this.$dates = this.$el.find('._proto_calendar-dates');

		// let's go!
		this.redraw();

		$('#calendar-container').on('click', '._proto_calendar-date', function(e){
			e.preventDefault();

			var clickedDate    = new Date($(this).data('date')),
					clickedDateUTC = moment(clickedDate).utc();

			views.data.sparkedMeetup.date.value = clickedDateUTC;
			views.data.sparkedMeetup.date.isGeneral = false;
			$('#calendar-template-container').addClass('display--none');

		});

	}
};

function populateSparkedMup(e) {
	document.getElementById('sparkedMupSummary').value = e.node.textContent;
}

function postSparkedMeetup() {
	views.modal_hide();
	var generatedId = (new Date).getTime();

	var newSparkedEvent = new Items.SparkedEvent({
		id : generatedId,
		member : views.data.current_member,
		sugDate : {
			value: views.data.sparkedMeetup.date.value,
			isGeneral: views.data.sparkedMeetup.date.isGeneral
		},
		sugTime : {
			value: views.data.sparkedMeetup.time.value,
			isGeneral: views.data.sparkedMeetup.time.isGeneral
		},
		description : document.getElementById('sparkedMupSummary').value,
		time : (new Date).getTime(),
		interested : [
			{ Name : views.data.current_member.name, "photo" : views.data.current_member.photo }
		],
		userInterested: true,
		inviteWho: views.data.inviteWho
	});

	views.data.news.unshift( newSparkedEvent );
	views.data.preMUPs.unshift( newSparkedEvent );

	window.location.hash = '#!/preMup/' + generatedId;

}

function addInterested(event) {
	var interestArr = event.context.interested,
			newInterest  = {
				Name: views.data.current_member.name,
				photo: views.data.current_member.photo
			},
			preMUPsArr = views.data.preMUPs,
			newsArr    = views.data.news;

	// console.log(this.get(event.keypath+'.userInterested'));

	if(this.get(event.keypath+'.userInterested') == true){
		// interestArr.splice(-1,1);
		interestArr.shift();
		event.context.userInterested = false;

		//
		// HACK: Manually update the data so that it's reflected across views
		//
		// Update in views.data
		for(var i = 0; i < preMUPsArr.length; i++) {
			if (preMUPsArr[i].id == event.context.id) {
				preMUPsArr[i].userInterested = false;
				break;
			}
		}

		// Update in views.data.news
		for (var n = 0; n < newsArr.length; n++) {
			if (newsArr[n].type == 'sparkedEvent' && newsArr[n].id == event.context.id) {
				newsArr[n].userInterested = false;
			}
		}
		// end hack
	}
	else{
		interestArr.unshift(newInterest);
		event.context.userInterested = true;

		//
		// HACK: Manually update the data so that it's reflected across views
		//
		// Update in views.data
		for(var i = 0; i < preMUPsArr.length; i++) {
			if (preMUPsArr[i].id == event.context.id) {
				preMUPsArr[i].userInterested = true;
				break;
			}
		}

		// Update in views.data.news
		for (var n = 0; n < newsArr.length; n++) {
			if (newsArr[n].type == 'sparkedEvent' && newsArr[n].id == event.context.id) {
				newsArr[n].userInterested = true;
			}
		}
		// end hack
	}

	return false;
}

function toggleInviteStripe(){
	console.log(views.data.preMUPRendered);

// if the user is the only person interested
// if a user just liked the meetup
	if (views.data.preMUPRendered.userInterested == true && views.data.preMUPRendered.interested.length < 2) {
		// console.log('show the stripe');

		// main conditions have been met, 
		// BUT only show if the user didn't invite
		if(!views.data.preMUPRendered.didInvite){
			$('#inviteStripe').removeClass('display--none');
		}

	} else {
		// console.log('hide the stripe');

		// main conditions haven't been met, 
		// BUT hide if the user invited
		if(views.data.preMUPRendered.didInvite){
			$('#inviteStripe').addClass('display--none');
		}
	}

// if a user has invited people and re-visits the meetup
	// HIDE THE INVITE STRIPE
}

function userInvited(event) {
	views.data.preMUPRendered.didInvite = true;

	$(event.node).prop('disabled', true).text('Invited');

	console.log(event.context);

	// if (event.context.isInvited) {
	// 	event.context.isInvited = true;
	// } else {
	// 	event.context.isInvited = false;
	// }
}

/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
DISCUSSION FEED INTERACTIONS
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/

// "Like" a post
function likePost(event) {
	if(this.get(event.keypath+'.userLiked') == true){
		event.context.like_count--;
		this.set(event.keypath+'.userLiked', false);
	}
	else{
		event.context.like_count++;
		this.set(event.keypath+'.userLiked', true);
	}
	return false;
}

function focusCommentBox(event) {
	event.original.preventDefault();

	var textareaEl = $(event.node.offsetParent).find('textarea')[0];
	$(textareaEl).focus();
}


//
// NOT USED YET
// show comment box in post
//
/*
function showCommentBox(event) {
	console.log(this.get(event.keypath+'.showCommentBox'));
	this.set(event.keypath+'.showCommentBox', true);
	return false;
}
*/

// show the post button
function showPostBtn(event) {
	var $postBtn = $(event.node.offsetParent).find('.js-postBtnContainer');

	if (event.node.value.length < 1) {
		$postBtn.addClass('display--none');
	} else {
		$postBtn.removeClass('display--none');
	}
}

// function hidePostBtn(event) {
// 	var $postBtn = $(event.node.offsetParent).find('.js-postBtnContainer');
// 	$postBtn.addClass('display--none');
// }

// post the comment
function postComment(event) {
	var textareaEl    = $(event.node.parentNode).siblings('.chunk').find('textarea')[0],
			$postBtn      = $(event.node.offsetParent).find('.js-postBtnContainer'),
			replyCount    = this.get(event.keypath+'.latest_comment.replyCount'),
			$replyCounter = $(event.node.offsetParent).find('.replyCounter');

	if (replyCount) {
		this.set(event.keypath+'.latest_comment.replyCount', replyCount+1);
	} else {
		this.set(event.keypath+'.latest_comment.replyCount', 1);
	}

	this.push(event.keypath+'.posts', {
		"member": {
			"photo": {"thumb": views.data.current_member.photo },
			"name": views.data.current_member.name
		},
		"created": moment(),
		"updated": moment(),
		"time": moment(),
		"like_count": 0,
		"body": textareaEl.value //probably not the best way to do this...
	});

	// kind of hacky
	$replyCounter.addClass('anim--bounce');
	$postBtn.addClass('display--none');
	textareaEl.value = '';
	// this.set(event.keypath+'.showCommentBox', false);

	return false;
}

// Comment overflow actions
function toggleCommentPopover(event){
	event.original.preventDefault();

	views.momentary_show({
		$target: $(event.node),
		type	 : 'popover',
		buttons: [
			{label: 'Link to post', fn: function(){console.log('Open dialog with copy link input');}},
			{label: 'Report', fn: function(){console.log('Post reported');}},
			{label: 'Mute', fn: function(){console.log('Post muted');}}
		]
	});
}


/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
PHOTO BROWSING
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/
// Toggle edit mode in albums. Only orgs get this
function enter_album_edit_mode(event) {
	$('#albumHeroContent').addClass('display--none');
	$('#photoUploadNewContainer').css('display', 'none'); //adding '.display--none' doesn't work
	$('#photoAlbumGrid .thumb-content').removeClass('display--none');
	$('#photoAlbumGrid .thumb').addClass('thumbScrim');
	$(views._main.$header).removeClass('view-head--transparent view-head--photoOverlay');

	views._main.update_header({
		title: "Album Name",
		subtitle: "n photos",
		cancelMode: {
			label: "Cancel",
			icon: "arrow-left",
			fn: confirm_cancel_album_edits
		},
		buttons: [
			{ label: "Delete", icon: "trash", fn: confirm_delete_album },
			{ label: "Save", fn: exit_album_edit_mode}
		]
	});
}

// Delete photo (from album view)
function delete_photo(event) {
	var $thumbContainer = $(event.node).parents('li');
	$thumbContainer.remove();
}

// Delete photo (from photo detail view)
function delete_photo_fromPopover(event) {
	views.dialog_show({
		headline: "Delete this photo?",
		primaryAction: { label: "Delete photo", fn: function(){ alert('delete photo'); }},
		dismissText: "Cancel"
	});
}

function confirm_delete_album() {
	views.dialog_show({
		headline: "Delete this album?",
		body: "Deleting this album will remove this album and it's photos from your Meetup group",
		primaryAction: { label: "Delete album", fn: delete_album },
		dismissText: "Cancel"
	});
}

function delete_album() {
	views.dialog_hide();
	views.data.photo_albums.splice(0,1); //replace the '0' with the right number
	if(/\/\d+$/ig.test(window.location.href)) { //just checks if url contains a slash and a digit
		views.back();
	}
	views.toast_show({
		message	 : 'Album Name has been deleted',
		button: {label: "Undo", fn: function(){ alert('Reverse the action'); }}
	});
}

// pop up modal confirming to cancel changes
function confirm_cancel_album_edits() {
	views.dialog_show({
		headline: "Discard changes to this album?",
		// body: "This dialog had better be telling me something pretty god damn important since you decided to get all up in the face of the user",
		primaryAction: { label: "Discard changes", fn: exit_album_edit_mode },
		dismissText: "Continue Editing"
	});
}

// cancel any changes made to the album
function exit_album_edit_mode() {
	views.dialog_hide();
	$('#albumHeroContent').removeClass('display--none');
	$('#photoUploadNewContainer').removeAttr('style');
	$('#photoAlbumGrid li:not("#photoUploadNewContainer") .thumb-content').addClass('display--none');
	$('#photoAlbumGrid .thumb').removeClass('thumbScrim');
	$(views._main.$header).addClass('view-head--transparent view-head--photoOverlay');

	views._main.update_header({
		title: "Album Name",
		subtitle: "n photos",
		buttons: [
			{ label: "Edit", fn: enter_album_edit_mode }
		]
	});
}

function activateItem(event) {
	$(event.node.parentNode).find('.item--active').removeClass('item--active');
	$(event.node).addClass('item--active');
}

function paginate_list(evt, pg){
	var limit = $(evt.node.parentElement.previousElementSibling).children('li:not(".display--none")').length + pg;
	$(evt.node).addClass('display--none');
	$('<div class="endlessLoader"></div>').insertAfter($(evt.node));
	setTimeout(function(){ //artificially slowing it down
		$(evt.node.parentElement.previousElementSibling).children('li:lt(' + limit + ')').removeClass('display--none').removeAttr('style');
	}, 1000);
}

function see_all_albums(event) {
	paginate_list(event, 5);
}

function see_all_photos(event) {
	paginate_list(event, 20);
}

function keyboard_photo_nav(){
	window.addEventListener('keyup', function(event){

		switch(event.keyCode) {

			//left arrow
			case 39:
				alert('go to previous photo');
				break;

			//right arrow
			case 37:
				alert('go to next photo');
				break;

			//ESC
			case 27:
				views.media_hide();
				window.location.hash = "";
				break;

			default:
				return false;
		}
	});
}

function test_toast() {
	views.toast_show({
		message	 : 'Album Name has been deleted',
		button: {label: "Undo", fn: function(){ alert('Reverse the action'); }}
	});
}

/*
//////////////////////////////////////////////////////////
----------------------------------------------------------
PREMUP INTERACTIONS
----------------------------------------------------------
//////////////////////////////////////////////////////////
*/