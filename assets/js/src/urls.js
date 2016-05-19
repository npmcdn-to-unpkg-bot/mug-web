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
			"complete"            : main_onComplete,
			"toggle_post_popover" : toggle_post_popover,
			"choosePhotos"        : choosePhotos,
			"voteForPoll"         : voteForPoll
		},
		header : {
			title: "View Head Title",
			isRoot: false,
			buttons: [
				{ label: "Actions", icon: "ellipsis-h", fn: function(){ alert('tapped overflow'); } }
			]
		},
		observe: {
			'uploadedPhotos': processUploadedPhotos
		}

	});

});

// ROUTE: Text post
router.add('create-new-post', function(context){
	views.modal_show({
		template: "postBox",
		events: {
			"post_text": post_text,
			"choosePhotos": choosePhotos
			// "expand_summary": expand_summary,
			// "toggle_comment_popover": toggle_comment_popover
		},
		header : {
			title: "Post something",
			//subtitle: views.data.group.name,
			buttons: [
				//{ label: "Post", fn: post_text }
			]
		},
		observe: {
			'uploadedPhotos': processUploadedPhotos
		}
	});
});

	// ROUTE: Photo post
	router.add('create-photo-post', function(context){
		var modalType = views.data.uploadedPhotos.length > 1 || views.data.previewPhotos.length > 1 ? 'large' : 'snap';

		views.modal_show({
			template: "photoPost",
			modalType: modalType,
			events: {
				"post_photo": post_photo,
				// "choose_recent_mup": choose_recent_mup,
				// "toggle_tag_overlay": toggle_tag_overlay,
				// "save_tags": save_tags,
				// "cancel_tags": cancel_tags,
				// "expand_summary": expand_summary
			},
			header : {
				title: "Photos",
				//subtitle: views.data.group.name,
				buttons: [
					//{ label: "Post", fn: post_photo }
				]
			}
		});

		views.data.uploadedPhotos = "";

	});


	// ROUTE: Poll post
	router.add('create-poll-post', function(context){
		views.modal_show({
			template: "pollPost",
			events: {
				"post_poll": post_poll,
				// "expand_summary": expand_summary,
				"addPollOption": function(){
					$('<div class="group"><input type="text" class="choice" /></div>').appendTo('#pollOptions').find('input').focus();
				}
			},
			header : {
				title: "Poll",
				//subtitle: views.data.group.name,
				buttons: [
					{ label: "Post", fn: post_poll }
				]
			}
		});
	});




