//
// For more info on how this magic works:
// https://github.com/meetup/gimme
//

var groupId = getParameterByName('mugID') || '1579989',
		urlname = 'ChicagoHOS', // could get this dynamically, but meh
		// eventId = getParameterByName('mupID') || 223601492,
		// topic   = getParameterByName('topic') || 'hiking',
		// topicID = 638, //hiking
		zip     = 60606;

		// Chicago lat/lon and zip
		// lat     = 41.8369,
		// lon     = 87.6847;
		// zip     = 60606

var views = new ViewManager(function(){
	gimme.apiKey = "7060231d422c3421e3c13406e606631"; // 1e84f701a17435513a17796245794d 715d68731b3913292f447f4c45547

	// ↓ ↓ ↓ ↓ Where we pick which data we want ↓ ↓ ↓ ↓
	var shoppingList = [
			// {"gimme": "groups", "data": {"page": 8, "zip": zip}},
			{"gimme": "group", "data": {"group_id": groupId} },

			// {"gimme": "events", "key": "events_short", "data": {"group_id": groupId, "page": 3}},
			// {"gimme": "events", "key": "events_long", "data": {"group_id": groupId, "page": 20}},

			{"gimme": "events", "key": "events_recent", "data": {"status": "past", "group_id": groupId, "page": 3, "desc": true}},

			// {"gimme": "events_meta", "data": {"page": 20, "group_id": groupId}},
			// {"gimme": "photo_albums", "data": {"page": 30, "group_id": groupId}},
			// {"gimme": "members", "data":{"group_id": groupId, "page": 32}},

			// {"gimme": "photo_albums", "data": {"page": 10, "group_id": groupId}},
			{"gimme": "photos", "key": "mup_photos", "data": {"page": 20, "group_id": groupId}},

			// {"gimme": "boards", "key": "boards_posts", data:{"urlkey": urlname, "page": 2}, children: [ // Which boards to pull?
			// 	{"gimme": "discussions", data:{"urlkey": urlname, "page": 2}, "match": [["id", "board_id"]], children: [ // Which threads from those boards?
			// 		{"gimme": "posts", data:{"urlkey": urlname,  "page": 2}, "match": [["id", "discussion_id"],["board.id", "board_id"]] } // Which posts from those threads?
			// 	]}
			// ]}

	];
	// ↑ ↑ ↑ ↑ Where we pick which data we want ↑ ↑ ↑ ↑

	gimme.get(shoppingList, true).then(function(data){

		$.extend(views.data, data);

		// ----------------------------------------------
		// Create the news feed
		// The magic happens in `data-buildNews.js`
		// ----------------------------------------------
		views.data.news = buildNews({
			events: views.data.events_short,
			events_recent: views.data.events_recent,
			discussions: views.data.boards_posts
		});

		// ----------------------------------------------
		// Data manipulation
		// ----------------------------------------------

		// Hero photo
		views.data.group.keyPhoto = views.data.group.photo;
		// views.data.group.logo = "group_photo" in views.data.group ? views.data.group.group_photo.photo_link : null;

		// Default current user
		views.data.current_member = {
			photo: "https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg",
			name: "Sally Smeetup",
			// membership: getParameterByName('membership') || views.data.MEMBERSHIP.ALIEN
			membership: 1
		};

		// Containers for uploaded photos
		views.data.previewPhotos = [];
		views.data.uploadedPhotos = [];

		// Store data about a link
		views.data.linkPost = {};

		console.log(views.data);

		// Now that the data is all ready, go ahead and start the router
		window.addEventListener('hashchange', processHash);
		processHash();

	});

});



