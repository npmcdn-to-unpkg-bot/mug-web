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
		template : 'main-template',
		events : {
			// "renderNavigation"    : renderNavigation(),
			"complete"               : main_onComplete,
			"toggle_post_popover"    : toggle_post_popover,
			"choosePhotos1"          : choosePhotos1,
			"voteForPoll"            : voteForPoll,
			"likePost"               : likePost,
			"focusCommentBox"        : focusCommentBox,
			"toggleCommentPopover"   : toggleCommentPopover,
			"showPostBtn"            : showPostBtn,
			"postComment"            : postComment
		},
		header : {
			title: views.data.group.name,
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
			"choosePhotos2": choosePhotos2
			// "expand_summary": expand_summary,
			// "toggleCommentPopover": toggleCommentPopover
		},
		header : {
			title: "Post something",
			//subtitle: views.data.group.name,
			buttons: [
				//{ label: "Post", fn: post_text }
			]
		},
		// observe: {
		// 	'uploadedPhotos': processUploadedPhotos2
		// }
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

// Album split
function show_album_split(){

	// Split view accepts two options objs
	views.split_show({
		template: "album-listing-template",
		events: {
			"choosePhotos3": choosePhotos3,
			"activateItem": activateItem,
			"see_all_albums": see_all_albums
		},
		observe: {
			'uploadedPhotos': processUploadedPhotos3
		},
		header : {
			title: "Photo Albums",
			subtitle: views.data.group.name,
			subtitleLink: views.data.group.link,
			buttons: [
				{ label: "Create album", icon: "plus", fn: choosePhotos3 }
			]
		}
	}, {
		template: "album-photo-grid-template",
		events: {
			"choosePhotos3": choosePhotos3,
			"enter_album_edit_mode": enter_album_edit_mode,
			"delete_photo": delete_photo,
			"see_all_photos": see_all_photos
		},
		observe: {
			'uploadedPhotos': processUploadedPhotos3
		},
		header : {
			title: "Album Name",
			subtitle: "n photos",
			buttons: [
				{ label: "Edit", fn: enter_album_edit_mode }
			]
		}
	});

}

// ROUTE: photo album list (split)
router.add('albums', function(context){
	// set selected group
	// views.data.selectedAlbum = views.data.albums[0];

	show_album_split();
	views.focus('split');
});

// ROUTE: photo album photo grid (split)
router.add('albums/:i', function(context){
	// set selected group
	// views.data.selectedAlbum = views.data.albums[context.params.i];

	show_album_split();
	views.focus('detail');
});

// ROUTE: Photo detail screen
router.add('photo-detail/:i', function(context){

	views.media_show({
		template: "photoDetail",
		events: {
			"keyboard_photo_nav": keyboard_photo_nav()
		},
		header : {
			title: "Shallow Cliffs 9 Mile fast paced hike",
			subtitle: views.data.group.name,
			subtitleLink: views.data.group.link,
			buttons: [
			// { label: "Share", icon: "share-square-o", fn: toggle_photoDetail_share_popover},
			// 	{ label: "More", icon: "ellipsis-h", fn: toggle_photoDetail_popover }
			]
		}
	});
});

