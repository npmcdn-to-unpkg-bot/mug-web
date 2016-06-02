var gimme = {

	apiKey: null,
	accessToken: null,

	get: function (shoppingList, useJsonp) {
		if(!this.apiKey){
			console.log('Need to set your API key. See docs: https://github.com/meetup/gimme');
		}

		var apiUrl = 'https://api.meetup.com/';
		var calls = shoppingList.length;
		var callsCompleted = 0;
		var completeData = {};
		var useJsonp = useJsonp || false;
		var _this = this;


		return new Promise(function(resolve, reject){

			// child shopping list requires a bit of parsing out values from the parents
			// and matching up keys of individual parent items
			var buildChildShoppingList = function(parentData, children){
				var shoppingList = [];
				for(var c=0; c<children.length; c++){
					console.log(children[c]);
					var child = children[c];
					var match = child.match;

					for(var m=0; m<match.length; m++){
						console.log(match[m]);
						var parent_match, child_match;
						if( Array.isArray(match[m]) ){
							parent_match = match[m][0];
							child_match = match[m][1];
						}
						else{
							parent_match = match[m];
							child_match = match[m];
						}
						if(!child["data"])
							child["data"] = {};

						child["data"][child_match] = getDescendantProp( parentData, parent_match );
					}
					//delete child.match;
					shoppingList.push(child);
				}
				return shoppingList;
			};

			// this request is complete
			// but are ALL the requests complete?
			var finish = function(data, item){
				completeData[item.key] = data;
				callsCompleted++


				if(callsCompleted >= calls){
					resolve( completeData );
				}
			};

			// data has been returned
			// and should be already JSONified
			var success = function(data, item){

				// API problems?
				// you might need to de-throttle https://admin.meetup.com/py_admin/throttled
				if(data.code){
					console.log(data.code+': '+data.details);
					//alert('Meetup API error, check console');
				}
				if(data.errors){
					for(var e=0; e<errors.length; e++){
						var err = errors[e];
						console.log(code+': '+message);
					}
					//alert('Meetup API error, check console');
				}

				// Ok, let's assume it all worked
				var data = item.parse(data, item);

				if(item.children){
					// fetch child requests before returning
					var childGimmes = (Array.isArray(data)) ? data.length : 1;
					var childGimmesCompleted = 0;

					var fetchChildren = function(parentData){

						var childShoppingList = buildChildShoppingList(parentData, item.children);
						_this.get( childShoppingList, useJsonp )
							.then(function(childCompleteData){
								for (var child in childCompleteData){
									parentData[child] = childCompleteData[child];
								}
								childGimmesCompleted++
								if(childGimmesCompleted >= childGimmes){
									finish(data, item);
								}
							});
					};

					// is the parent data an array or just one?
					if(Array.isArray(data)){
						for(var i=0; i<data.length; i++){
							fetchChildren(data[i]);
						}
					}
					else{
						// no child requests, so just return
						fetchChildren(data);
					}

				}
				else{
					finish(data, item);
				}

			};


			// let's run through the shopping list
			// and get some data
			if( shoppingList.length > 0 ){
				for(var i=0; i<shoppingList.length; i++){
					var item = merge( inventory[ shoppingList[i].gimme ]( shoppingList[i].data ), shoppingList[i] );

					// optionally specified key
					if(!item.key){
						item.key = item.gimme;
					}

					// fetch (browsers might need JSONp depending on domain)
					var url = apiUrl+item.method;
					var data;
					if (_this.accessToken) {
						data = merge(item.data, {"access_token": _this.accessToken});
					} else {
						data = merge(item.data, {"key": _this.apiKey});
					}

					if(useJsonp){
						(function(item){
							JSONP( url, data, function(data){
								success(data, item);
							});
						})(item); // closure!
					}
					else{
						(function(item){
							fetch( url+"?"+objectToQuerystring(data) )
								.then(function(response){ return response.text(); })
								.then(function(responseText) { return JSON.parse(responseText) })
								.then(function(data) { return success(data, item) })
								.catch(function(error){
									console.warn(error);
								});
						})(item); // closure!
					}
				}
			}
			else{
				// apparently no shopping list?
				// just resolve with nothing.
				resolve({});
			}
		}, _this);
	}
}

/*
* DEFAULTS
* If you don't care / don't specify, we'll just give you results based on this stuff
*/


var defaults = {
	page: 20,
	event_id: 223601492,
	group_id: 1227102,
	photo_id: 450326858,
	photo_album_id: 26970146,
	urlkey: 'shutterbugexcursions',
	board_id: 854675,
	member_id: 95860782,
	event_status: 'upcoming',
	event_desc: false,
	zip: 15205,
};


/*
* INVENTORY
* These are methods that build setup objects for the API calls to be run
* In the parse method, you can massage data into more easily iteratable structures, if necessary
*/

var inventory = {

// single event - THIS IS DEPRACATED
/*
event: function( item ){
	var event_id = item.event_id || defaults.event_id;
	delete item.event_id; // api does not like alphanumic ghost ids as a param
	console.log(event_id);
	return {
		method: '2/event/'+event_id,
		parse: function(data){
			return data;
		},
		data: {
			"fields": "comment_count"
		}
	};
},
*/

// non-private events from groups across the system
open_events: function( item ){
	return {
		method: '2/open_events/',
		parse: function(data){
			return data.results;
		},
		data: {
			zip: defaults.zip,
			page: defaults.page
		}
	};
},

// same as open_events, except events are grouped by date
// array of objects that each contain a date and an array of events on that date
// good for grouped views of events, like the top-level calendar view
dates_with_open_events: function( item ){
	return {
		method: '2/open_events/',
		parse: function(data){
			var open_events = data.results;
			var dates = [];
			var last_date = 0;
			// nest those events
			if(open_events && open_events.length > 0){
				for(var i=0; i<open_events.length; i++){
					var ev = open_events[i];
					if(!moment( ev.time ).isSame(last_date, 'day')){
						var this_date = moment( ev.time ).startOf('day');
						dates.push({date: this_date, events: [] });
						last_date = this_date;
					}
					dates[dates.length-1].events.push(ev);
				}
			}
			return dates;
		},
		data: {
			zip: defaults.zip,
			page: defaults.page * 2,
			order: 'time',
			status: 'upcoming'
		}
	};
},


// events from a single group
events: function( item ){
	return {
		method: '2/events/',
		parse: function(data){
			var events = data.results.map( function(n, i){
				if( typeof n.group.photos !== 'undefined' && n.group.photos.length > 0 ){
					n.group.photo = n.group.photos[0].photo_link;
					n.group.photo_large = n.group.photos[0].highres_link;
				}
				else if( typeof n.group.group_photo !== 'undefined'){
					n.group.photo = n.group.group_photo.photo_link;
					n.group.photo_large = n.group.group_photo.highres_link;
				}
				return n;
			});

			return events;
		},
		data: {
			group_id: defaults.group_id,
			page: defaults.page,
			status: defaults.event_status,
            limited_events: true,
            text_format: 'plain',
			"fields": "venue_visibility,comment_count,photo_count,rsvp_rules,group_photo",
			desc: defaults.event_desc
		}
	};
},

// get a single event by event_id
event: function( item ){
	return {
		method: '2/events/',
		parse: function(data){
			var events = data.results.map( function(n, i){
				if( typeof n.group.photos !== 'undefined' && n.group.photos.length > 0 ){
					n.group.photo = n.group.photos[0].photo_link;
					n.group.photo_large = n.group.photos[0].highres_link;
				}
				else if( typeof n.group.group_photo !== 'undefined'){
					n.group.photo = n.group.group_photo.photo_link;
					n.group.photo_large = n.group.group_photo.highres_link;
				}
				return n;
			});

			return events;
		},
		data: {
			event_id: defaults.event_id,
			page: defaults.page,
			status: defaults.event_status,
            limited_events: true,
            text_format: 'plain',
			"fields": "venue_visibility,comment_count,photo_count,rsvp_rules,group_photo",
			desc: defaults.event_desc
		}
	};
},

events_meta: function( item ){
	return {
		method: '2/events/',
		parse: function(data){
			return data.meta;
		},
		data: {
			group_id: defaults.group_id,
			page: defaults.page,
			status: defaults.event_status,
            limited_events: true,
            text_format: 'plain',
			"fields": "comment_count,photo_count,rsvp_rules",
			desc: defaults.event_desc
		}
	};
},

// events from a single group
events_for_member: function( item ){
	return {
		method: '2/events/',
		parse: function(data){
			return data.results;
		},
		data: {
			member_id: defaults.member_id,
			page: defaults.page,
            limited_events: true,
            text_format: 'plain',
            "fields": "venue"
		}
	};
},


event_comments: function( item ){
	return {
		method: '2/event_comments/',
		parse: function(data){
			// reconstruct event commment nesting
			var raw_comments = data.results;
			var event_comments = [];
			var this_thread;

			var parseComment = function(c){
				if(c.member_photo && c.member_photo.photo_link){
					c.photo = c.member_photo.photo_link;
				}
				if(c.like_count > 0){
					c.likes = {like_count: c.like_count};
				}
				//c.datetime = format_date(c.time);
				return c;
			}

			if(raw_comments && raw_comments.length > 0){

				/*
				// nest comments - USED TO BE COMMENTED OUT
				for(var i=0; i<raw_comments.length; i++){

					this_thread = raw_comments[i];
					event_comments.push( parseComment(raw_comments[i]) );

					if(raw_comments[i+1]){
						while(this_thread.event_comment_id == raw_comments[i+1].in_reply_to){
							if(typeof this_thread.replies == 'undefined'){
								this_thread.replies = [];
								this_thread.has_replies = true;
							}
							this_thread.replies.push( parseComment(raw_comments[i+1]) );
							i++;
						}
					}
				}
				// END nest comments
				*/

			}

			event_comments = raw_comments;
			return event_comments;
		},
		data: {
			"order": "thread",
			"fields": "like_count,member_photo",
			"page": defaults.page,
			"event_id": defaults.event_id
		}
	};
},

rsvps: function( item ){
	return {
		method: '2/rsvps',
		parse: function(data){
			// add additional data massaging here
			var rsvps = data.results.map( function(n, i){

				var r = {
					id: n.member.member_id,
					name: n.member.name,
					match: n.member.name.toUpperCase()
				};

				// easier to not have guests field when 0 guests
				if(n.guests > 0){
					r.guests = n.guests;
				}

				// this is total fakery, but simulates info from the social server
				if(i == 0){
					r.host = true;
				}
				else if(i > 0 && i <= 2){
					r.friend = true
				}
				else if(i > 2 && i <= 4){
					r.fof = true
				}

				// flatten photo link
				if( typeof n.member != 'undefined' && typeof n.member_photo != 'undefined' ){
					r.photo = n.member_photo.photo_link;
				}
				r.index = i;
				r.response = n.response;

				return r;
			});
			return rsvps;
		},
		data: {
			event_id: defaults.event_id
		}
	};
},


recommended_groups: function( item ){
	return {
		method: 'recommended/groups',
		parse: function(data){
			// add additional data massaging here
			var groups = data.map( function(n, i){
				if( typeof n.photos !== 'undefined' && n.photos.length > 0 ){
					n.photo = n.photos[0].photo_link;
					n.photo_large = n.photos[0].highres_link;
				}
				else if( typeof n.group_photo !== 'undefined'){
					n.photo = n.group_photo.photo_link;
					n.photo_large = n.group_photo.highres_link;
				}
                n.description = (n.description) ? n.description.replace(/<p>(&nbsp;)*<\/p>/g,"") : '';
                n.events = [];
				n.relationship = null;
				n.index = i;
				return n;
			});
			return groups;

		},
		data: {
			zip: defaults.zip,
			fields: 'photos,next_event,join_info'
		}
	};
},


find_groups: function( item ){
	return {
		method: 'find/groups',
		parse: function(data){
			var groups = data.map( function(n, i){
				if( typeof n.photos !== 'undefined' && n.photos.length > 0 ){
					n.photo = n.photos[0].photo_link;
					n.photo_large = n.photos[0].highres_link;
				}
				else if( typeof n.group_photo !== 'undefined'){
					n.photo = n.group_photo.photo_link;
					n.photo_large = n.group_photo.highres_link;
				}
                n.description = (n.description) ? n.description.replace(/<p>(&nbsp;)*<\/p>/g,"") : '';
                n.events = [];
				n.relationship = null;
				n.index = i;
				return n;
			});
			return groups;

		},
		data: {
			zip: defaults.zip,
			fields: 'photos,next_event,join_info',
			order: 'members'
		}
	};
},

groups: function( item ){
	return {
		method: '2/groups',
		parse: function(data){
			// add additional data massaging here
			var groups = data.results.map( function(n, i){
				if( typeof n.photos !== 'undefined' && n.photos.length > 0 ){
					n.photo = n.photos[0].photo_link;
					n.photo_large = n.photos[0].highres_link;
				}
				else if( typeof n.group_photo !== 'undefined'){
					n.photo = n.group_photo.photo_link;
					n.photo_large = n.group_photo.highres_link;
				}
                n.description = (n.description) ? n.description.replace(/<p>(&nbsp;)*<\/p>/g,"") : '';
                n.events = [];
				n.relationship = null;
				n.index = i;
				return n;
			});
			return groups;

		},
		data: {
			zip: defaults.zip,
			fields: 'photos,next_event,join_info',
			order: 'members'
		}
	};
},

// there's not a singular group API method, but let's emulate one for consistency
group: function( item ){
	return {
		method: '2/groups',
		parse: function(data){
			var group = data.results[0];

            if( typeof group.group_photo !== 'undefined' ){
			    group.logo = group.group_photo.photo_link;
            }

			if( typeof group.photos !== 'undefined' && group.photos.length > 0){
				group.photo = group.photos[0].photo_link;
			}
			else if( typeof group.group_photo !== 'undefined' ){
				group.photo = group.group_photo.photo_link;
			}


			return group;
		},
		data: {
			page: 1,
			fields: 'photos,sponsors,topics,join_info,similar_groups,simple_html_description',
			group_id: defaults.group_id
		}
	};
},

photo_albums: function( item ){
	return {
		method: '2/photo_albums',
		parse: function(data){
			return data.results;
		},
		data: {
			photo_album_id: defaults.photo_album_id,
			group_id: defaults.group_id
		}
	};
},

photos: function( item ){
	return {
		method: '2/photos',
		parse: function(data){
			return data.results;
		},
		data: {
			group_id: defaults.group_id,
			fields: 'member_photo'
		}
	};
},

photo: function( item ){
	return {
		method: '2/photos',
		parse: function(data){
			return data.results;
		},
		data: {
			photo_id: defaults.photo_id
		}
	};
},

members: function( item ){
	return {
		method: '2/members',
		parse: function(data){
			// add additional data massaging here

			var members = data.results;

			// sort people with bios to the top
			members.sort(function(a, b){
					var keyA = (a.bio)? a.bio.length : 0;
					var keyB = (b.bio)? b.bio.length : 0;
					if(keyA > keyB) return -1;
					if(keyA < keyB) return 1;
					return 0;
			});

			members = members.map( function(n, i){
				n.match = n.name.toUpperCase();
				if( (typeof n.photo !== 'undefined') && (typeof n.photo.photo_link !== 'undefined') ){
					n.photo = n.photo.photo_link;
				}
				n.index = i;

				return n;
			});
			return members;
		},
		data: {
			group_id: defaults.group_id,
			page: defaults.page,
			order: 'visited',
			desc: true
		}
	};
},

profile: function( item ){
	var gid = item.group_id || defaults.group_id;
	var mid = item.member_id || defaults.member_id;
	return {
		method: '2/profile/'+gid+"/"+mid,
		parse: function(data){
			if( (typeof data.photo !== 'undefined') && (typeof data.photo.photo_link !== 'undefined') ){
				data.photo = data.photo.photo_link;
			}
			return data;
		},
		data: {}
	};
},


member: function( item ){
	var mid = item.member_id || defaults.member_id;
	return {
		method: '2/member/'+mid,
		parse: function(data){
			if( (typeof data.photo !== 'undefined') && (typeof data.photo.photo_link !== 'undefined') ){
				data.photo = data.photo.photo_link;
			}
			return data;
		},
		data: {
			"fields": "membership_count"
		}
	};
},

topic_categories: function( item ){
	return {
		method: '2/topic_categories/',
		parse: function(data){
			return data.results;
		},
		data: {
		    "fields": "best_topics"
		}
	};
},

recommended_topics: function( item ){
	return {
		method: 'recommended/group_topics',
		parse: function(data){
			return data;
		},
		data: {}
	};
},


categories: function( item ){
	return {
		method: '2/categories/',
		parse: function(data){
			return data.results;
		},
		data: {}
	};
},

dashboard: function( item ){
	return {
		method: 'dashboard',
		parse: function(data){
			return data;
		},
		data: {}
	};
},

boards: function( item ){
	var uk = item.urlkey || defaults.urlkey;

	return {
		method: uk+'/boards',
		parse: function(data, opts){
			var boards = data.data; // this one is "data", not "results"

			boards = boards.map( function(n, i){
				n.urlkey = opts.data.urlkey;
				return n;
			});
			return boards;
		},
		data: {}
	};
},


discussions: function( item ){
	var uk = item.urlkey || defaults.urlkey;
	var bid = item.board_id || defaults.board_id;

	return {
		method: uk+'/boards/'+bid+'/discussions',
		parse: function(data, opts){
			var discussions = data.data; // this one is "data", not "results"
			discussions = discussions.map( function(n, i){

				// pass along urlkey
				n.urlkey = opts.data.urlkey;

				// strip bbcode
				n.body = n.body.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '');
				var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

				return n;
			});

			return discussions;
		},
		data: {}
	};
},

posts: function( item ){
	var uk = item.urlkey || defaults.urlkey;
	var bid = item.board_id || defaults.board_id;
	var did = item.discussion_id || 0;

	return {
		method: uk+'/boards/'+bid+'/discussions/'+did,
		parse: function(data, opts){
			var posts = data.data; // this one is "data", not "results"
			posts = posts.map( function(n, i){
				//console.log(n);

				// pass along urlkey
				n.urlkey = opts.data.urlkey;

				// strip bbcode
				if(n.body){
					n.body = n.body.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '');
					var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
				}

				// attach random likes
				n.likes = 0;
				has_likes = Math.floor(Math.random()*2); // does it have likes at all?
				if (has_likes == 1){
					n.likes = Math.floor(Math.random()*9); // between 1 and 9 likes
				}

				return n;
			});

			return posts;
		},
		data: {}
	};

},

notifications: function( item ){
	return {
		method: 'notifications',
		parse: function(data){
			return data;
		},
		data: {
			page: defaults.page
		}
	};
},



// hardcoded, sorry
conversations: function( item ){

	return {
		parse: function(){

			var people = [
				{name: "Bob Smeetup", photo: "http://api.randomuser.me/0.3/portraits/men/1.jpg", chattiness: 3},
				{name: "Sally Smeetup", photo: "http://api.randomuser.me/0.3/portraits/women/1.jpg", chattiness: 4},
				{name: "Mike", photo: "http://api.randomuser.me/0.3/portraits/men/2.jpg", chattiness: 7},
				{name: "Jolene", photo: "http://api.randomuser.me/0.3/portraits/women/2.jpg", chattiness: 5},
				{name: "Awesomedude3000", photo: "http://api.randomuser.me/0.3/portraits/men/3.jpg", chattiness: 4},
				{name: "Pug Mama", photo: "http://api.randomuser.me/0.3/portraits/women/3.jpg", chattiness: 6}
			];
			var starter = [
				"Hey, it was great seeing you at the Meetup yesterday.",
				"What's new? I just saw the movie you told me about",
				"You weren't at the Meetup yesterday! I was looking all over for you.",
				"Your dog is the cutest. Watch out or else I'll steal him LOL.",
				"Good times, good times.",
				"Today has been the longest day ever.",
				"That book was really upsetting! I can't believe any of that real."
			];
			var vagueness = [
				"Oh yeah?",
				"That's really interesting. I was thinking the same thing, but I wasn't sure.",
				"Wow, well that's something to think about for sure. Glad you mentioned it",
				"I'm not entirely sure I agree, but it's possible.",
				"Hahaha. Yeah, I guess that's true. What can you do, really?",
				"I can't argue with that. ",
				"Absolutely! I'm glad we agree",
				"You know, this reminds me of the time that I hitchiked across Texas and I got stranded on the side of the road with nothing but two dollars and and a bag of doritos. Some days are just like that.",
				"I'm glad we met."
			];

			var double = [
				"Oh wait, actually I'm not sure now.",
				"LOL",
				":) Yep."
			];


			var conversations = people.map( function(p, i){

				var conversation = {
					messages: [],
					recipient: p
				};

				for(var n=0; n < p.chattiness; n++){

					var author = (n % 2 == 0 ) ? p : false;
					var source = (n == 0) ? starter : vagueness;
					var content = source[Math.floor(Math.random() *  source.length)];
					var message = {
						"author": author,
						"content": [ content ]
					};

					// demo burst content
					if(n == 5){
						var content = double[Math.floor(Math.random() *  double.length)];
						message.content.push(content);
					}
					conversation.messages.push(message);
				}

				return conversation;
			});

			return conversations;
		},
		data: {}
	}
}

};




// merge
function merge() {
    var destination = {};
    var sources = [].slice.call( arguments, 0 );
    sources.forEach(function( source ) {
        var prop;
        for ( prop in source ) {
            if ( prop in destination && Array.isArray( destination[ prop ] ) ) {
                // Concat Arrays
                destination[ prop ] = destination[ prop ].concat( source[ prop ] );
            } else if ( prop in destination && typeof destination[ prop ] === "object" ) {
                // Merge Objects
                destination[ prop ] = merge( destination[ prop ], source[ prop ] );
            } else {
                // Set new values
                destination[ prop ] = source[ prop ];
            }
        }
    });
    return destination;
};

// jsonp
function JSONP(url,data,method,callback){
	//Set the defaults
	url = url || '';
	data = data || {};
	method = method || '';
	callback = callback || function(){};

	var getKeys = function(obj){
	  var keys = [];
	  for(var key in obj){
	    if (obj.hasOwnProperty(key)) {
	      keys.push(key);
	    }
	  }
	  return keys;
	}

	if(typeof data == 'object'){
	  var queryString = '';
	  var keys = getKeys(data);
	  for(var i = 0; i < keys.length; i++){
	    queryString += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(data[keys[i]])
	    if(i != keys.length - 1){
	      queryString += '&';
	    }
	  }
	  url += '?' + queryString;
	} else if(typeof data == 'function'){
	  method = data;
	  callback = method;
	}

	if(typeof method == 'function'){
	  callback = method;
	  method = 'callback';
	}

	if(!Date.now){
	  Date.now = function() { return new Date().getTime(); };
	}

	var timestamp = Date.now();
	var generatedFunction = 'jsonp'+Math.round(timestamp+Math.random()*1000001)

	window[generatedFunction] = function(json){
	  callback(json);
	  delete window[generatedFunction];
	};

	if(url.indexOf('?') === -1){ url = url+'?'; }
	else{ url = url+'&'; }

	//This generates the <script> tag
	var jsonpScript = document.createElement('script');
	jsonpScript.setAttribute("src", url+method+'='+generatedFunction);
	document.getElementsByTagName("head")[0].appendChild(jsonpScript)
}



// querystring
function objectToQuerystring (obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i) && i !== null) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
}

// go find the place to attach
function getDescendantProp(obj, desc) {
    var arr = desc.split(".");

    //while (arr.length && (obj = obj[arr.shift()]));

    while (arr.length && obj) {
        var comp = arr.shift();
        var match = new RegExp("(.+)\\[([0-9]*)\\]").exec(comp);
        if ((match !== null) && (match.length == 3)) {
            var arrayData = { arrName: match[1], arrIndex: match[2] };
            if (obj[arrayData.arrName] != undefined) {
                obj = obj[arrayData.arrName][arrayData.arrIndex];
            } else {
                obj = undefined;
            }
        } else {
            obj = obj[comp]
        }
    }
    return obj;
}

if(typeof module !== 'undefined' && module.exports){
	module.exports = gimme;
}
