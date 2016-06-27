//
// For more info on how this magic works:
// https://github.com/meetup/gimme
//
var views;
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

// ------------------------------------------------
// processData() 
// Used to manipulate data pulled by Gimme
// ------------------------------------------------
var processData = function(){

	// ----------------------------------------------
	// Data manipulation
	// ----------------------------------------------

	// Hero photo
	views.data.group.keyPhoto = views.data.group.photo;
	// views.data.group.logo = "group_photo" in views.data.group ? views.data.group.group_photo.photo_link : null;

	// Membership states
	views.data.membership = {
		alien: 0,
		new_member: 1,
		member: 2,
		organizer: 3,
		blocked: 4,
		pending: 5
	};

	// Default current user
	views.data.current_member = {
		photo: "https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg",
		name: "Sally Smeetup",
		membership: getParameterByName('membership') || views.data.membership.organizer
		// membership: 1
	};

	// Containers for uploaded photos
	views.data.previewPhotos = [];
	views.data.uploadedPhotos = [];

	// Store data about a link
	views.data.linkPost = {};

	// Spark a Meetup defaults - shown in creation modal
	views.data.sparkedMeetup = {
		date : {
			value: "Next week",
			isGeneral: true
		},
		time : {
			value: "In the evening",
			isGeneral: true
		},
		suggestions: [
			"Go to happy hour",
			"Have a discussion",
			"Share a meal"
		],
		description : "",
		interested : []
	};

	views.data.preMUPs = [
		{
			id: 1,
			member : {
				photo: "https://s3.amazonaws.com/uifaces/faces/twitter/tonypeterson/128.jpg",
				name: "John Doe",
				membership: 1
			},
			sugDate : {
				value: "Next week",
				isGeneral: true
			},
			sugTime : {
				value: "In the evening",
				isGeneral: true
			},
			time : moment().subtract(1, 'days').utc(),
			description : "Lets meet up and do something cool!",
			interested : [
				{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/jsa/128.jpg"},
				{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/sauro/128.jpg"},
				{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/jina/128.jpg"}
			],
			userInterested: false,
			feed: [{"type":"discussion","top_post":{"member":{"name":"Sally Smeetup","photo":{"thumb":"https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"}},"body":"Are we going to meet up around a specific topic, or are we just getting together for a social event?"},"time":1466525030604,"posts":[],"showCommentBox":false,"like_count":0},{"type":"discussion","top_post":{"member":{"name":"Sally Smeetup","photo":{"thumb":"https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"}},"body":"Could you share a bit more info here with everyone? Like time/location?"},"time":1466524610715,"posts":[{"member":{"photo":{"thumb":"https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"},"name":"Sally Smeetup"},"created":"2016-06-21T15:57:39.091Z","updated":"2016-06-21T15:57:39.091Z","time":"2016-06-21T15:57:39.091Z","like_count":0,"body":"It hasn't been nailed down yet. You'll get an update as soon as we figure it out! :)"}],"showCommentBox":false,"like_count":0,"latest_comment":{"replyCount":1}}]
		},
		{
			id: 123,
			member : {
				photo: "https://s3.amazonaws.com/uifaces/faces/twitter/jina/128.jpg",
				name: "Gina Doe",
				membership: 1
			},
			sugDate : {
				value: "Next week",
				isGeneral: true
			},
			sugTime : {
				value: "In the evening",
				isGeneral: true
			},
			time : moment().subtract(2, 'days').utc(),
			description : "Have a Kiki",
			interested : [
				{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/tonypeterson/128.jpg"},
				{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/jsa/128.jpg"},
				{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/sauro/128.jpg"}
			],
			userInterested: false,
			feed: [{"type":"discussion","top_post":{"member":{"name":"Sally Smeetup","photo":{"thumb":"https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"}},"body":"Hope this actually gets scheduled!"},"time":1466525674747,"posts":[],"showCommentBox":false,"like_count":0},{"type":"discussion","top_post":{"member":{"name":"Sally Smeetup","photo":{"thumb":"https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"}},"body":"I've done meetups like this with other groups. It's usually most successful in smaller venues"},"time":1466525591085,"posts":[{"member":{"photo":{"thumb":"https://s3.amazonaws.com/uifaces/faces/twitter/adellecharles/128.jpg"},"name":"Sally Smeetup"},"created":"2016-06-21T16:14:01.348Z","updated":"2016-06-21T16:14:01.348Z","time":"2016-06-21T16:14:01.348Z","like_count":0,"body":"Bedford Hill, a cafe by my house, would be perfect"}],"showCommentBox":false,"like_count":0,"latest_comment":{"replyCount":1}}]
		}
	];

	// TEMPORARY - add a sparked MUP into the feed
	/*
	var newSparkedEvent = new Items.SparkedEvent({
		member : views.data.current_member,
		sugDate : {
			value: "Next week",
			isGeneral: true
		},
		sugTime : {
			value: "In the evening",
			isGeneral: true
		},
		time : moment().subtract(3, 'days').utc(),
		description : "Lets meet up and do something cool!",
		interested : [
			{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/zeldman/128.jpg"},
			{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/jsa/128.jpg"},
			{ Name : "Mike P", "photo" : "https://s3.amazonaws.com/uifaces/faces/twitter/sauro/128.jpg"}
		],
		userInterested: false
	});

	views.data.news.unshift( newSparkedEvent );
	// end adding a sparked MUP into the feed
	*/

	// ----------------------------------------------
	// Create the news feed
	// The magic happens in `data-buildNews.js`
	// ----------------------------------------------
	views.data.news = buildNews({
		events: views.data.events_short,
		events_recent: views.data.events_recent,
		discussions: views.data.boards_posts,
		preMUPs: views.data.preMUPs
	});

	views.data.preMUPRendered = {};

	console.log(views.data);

	// // quickfix for caching API data
	// localStorage.setItem('cachedAPI', JSON.stringify(views.data));
	// localStorage.setItem('setupTime', now);

	// Now that the data is all ready, go ahead and start the router
	window.addEventListener('hashchange', processHash);
	processHash();
};


// ------------------------------------------------
// Load the data
// Either pull with Gimme, or use cached data,
// then process it using `processData()`
// ------------------------------------------------
gimme.apiKey = "1e84f701a17435513a17796245794d"; // 7060231d422c3421e3c13406e606631 715d68731b3913292f447f4c45547
gimme.get([{"gimme": "group", "data": {"group_id": groupId} }], true).then(function(data){
	urlname = data.group.urlname;

	views = new ViewManager(function(){
		// ↓ ↓ ↓ ↓ Where we pick which data we want ↓ ↓ ↓ ↓
		var shoppingList = [
				// {"gimme": "groups", "data": {"page": 8, "zip": zip}},
				{"gimme": "group", "data": {"group_id": groupId} },

				{"gimme": "events", "key": "events_short", "data": {"group_id": groupId, "page": 3}}, // for feed
				// {"gimme": "events", "key": "events_long", "data": {"group_id": groupId, "page": 20}}, // for calendar

				{"gimme": "events", "key": "events_recent", "data": {"status": "past", "group_id": groupId, "page": 3, "desc": true}},

				// {"gimme": "events_meta", "data": {"page": 20, "group_id": groupId}},
				// {"gimme": "members", "data":{"group_id": groupId, "page": 32}},
				// {"gimme": "members", "key":"inviteWho", "data":{"group_id": groupId, "page": 10}}

				// {"gimme": "photo_albums", "data": {"page": 10, "group_id": groupId}},
				// {"gimme": "photos", "key": "mup_photos", "data": {"page": 20, "group_id": groupId}},

				// {"gimme": "boards", "key": "boards_posts", data:{"urlkey": urlname, "page": 2}, children: [ // Which boards to pull?
				// 	{"gimme": "discussions", data:{"urlkey": urlname, "page": 2}, "match": [["id", "board_id"]], children: [ // Which threads from those boards?
				// 		{"gimme": "posts", data:{"urlkey": urlname,  "page": 2}, "match": [["id", "discussion_id"],["board.id", "board_id"]] } // Which posts from those threads?
				// 	]}
				// ]}

		];
		// ↑ ↑ ↑ ↑ Where we pick which data we want ↑ ↑ ↑ ↑

		var hours = 4, // how many hours before refreshing data
				now = new Date().getTime(),
				setupTime = localStorage.getItem('setupTime');

		if (localStorage.getItem('cachedAPI') === null || setupTime === null || now-setupTime > hours*60*60*1000 || getParameterByName('mugID')) {
			localStorage.clear();
			gimme.get(shoppingList, true).then(function(data){
				console.log('pulling API data');

				$.extend(views.data, data);

				// quickfix for caching API data
				localStorage.setItem('cachedAPI', JSON.stringify(views.data));
				localStorage.setItem('setupTime', now);

				processData();

			});
		} else {
			var localData = JSON.parse(localStorage.getItem('cachedAPI'));
			console.log('pulling local data');

			$.extend(views.data, localData);

			processData();
		}

	});
});



