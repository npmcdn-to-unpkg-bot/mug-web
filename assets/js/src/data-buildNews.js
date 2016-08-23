/*
-----------------------------------------------------------
SET UP DATA FOR ITEMS THAT MAKE UP OUR DISCUSSION FEED
-----------------------------------------------------------
*/

var Items = {

	Discussion: function(discussion){
		this.type = "discussion";
		this.discussion = discussion;
		this.top_post = {};
		this.time = (new Date).getTime();
		this.posts = [];
		this.top_post = {};
		this.showCommentBox = false;
		this.like_count = 0; // likes on discussion boards don't exist IRL
		this.link = undefined;
	},

	Event: function(event){
		this.type = "event";
		this.event = event;
		this.event.isPast = function(){
			return ( event.time < Date.now() );
		};
		this.time = event.created || (new Date).getTime();
		this.latest_comment = false;
	},

	Comment: function(comment){
		this.member = comment.member;
		this.body = comment.body;
		this.created = comment.created || (new Date).getTime();
		this.likes = comment.likes || 0;
		this.current_member_liked = false;
	},

	EventPhotos: function(event, photos){
		this.type = "eventphotos";
		this.event = event;
		this.photos = photos || [];
		this.showCommentBox = false; // remove this when the photo viewing/commenting UI is built 
		if (this.event !== undefined) {
			this.event.isPast = function(){
				return ( event.time < Date.now() );
			};
		}

		// Hacky conditional to handle both uploading photos and displaying photos in the feed
		if (photos !== undefined && photos.length > 0) {
			// photos[0].uploadTime is faked data for handling photo uploads
			this.time = photos[0].uploadTime || event.created || (new Date).getTime();
		} else {
			this.time = event.created || (new Date).getTime(); 
		}

	},

	Poll: function(poll){
		this.type = "poll";
		this.poll = poll;
		this.time = poll.created || (new Date).getTime();
		this.resultsShown = false;
		this.isVoted = false;
		this.totalVotes = 0;
		this.answers = [];
	},

	SparkedEvent: function(sparkedEvent) {
		this.id = sparkedEvent.id || 0;
		this.type = "sparkedEvent";
		this.sparkedEvent = sparkedEvent;
		this.time = sparkedEvent.time || (new Date).getTime();
		this.sugDate = sparkedEvent.sugDate;
		this.sugTime = sparkedEvent.sugTime;
		this.description = sparkedEvent.description || "";
		this.interested = sparkedEvent.interested || "no interest";
		this.userInterested = sparkedEvent.userInterested || false;
		this.inviteWho = sparkedEvent.inviteWho || views.data.inviteWho,
		this.feed = [];
	}

};


/*
-----------------------------------------------------------
CONSTRUCT AN ARRAY OF NEWS FEED ITEMS
-----------------------------------------------------------
*/
function buildNews(sources){

	var news = [];

	// ------------------------------------------------------
	// Comments from upcoming events
	// Items.Event
	// ------------------------------------------------------
	if(sources.events){

		var processEventData = function(thisEvent){
			var thisEvent = thisEvent;

			gimme.get([{"gimme": "event_comments", data:{"event_id": thisEvent.event.id, "page": 2}},{"gimme": "rsvps", "data": {"event_id": thisEvent.event.id, "page": 5}}], true).then(function(data){
				thisEvent.time = thisEvent.event.created;
				thisEvent.rsvps = data.rsvps;

				if(thisEvent.event.comment_count > 0){
						var this_thread;

						thisEvent.latest_comment = data.event_comments[0];
						thisEvent.posts = data.event_comments;
						thisEvent.time = thisEvent.latest_comment.time;

						for(var i=0; i<thisEvent.posts.length; i++){
							this_thread = thisEvent.posts[i];
							thisEvent.posts[i].isReply = false; // should probably do this with `in_reply_to`

							if(thisEvent.posts[i+1]){
								while(this_thread.event_comment_id == thisEvent.posts[i+1].in_reply_to){
									if(typeof thisEvent.posts.replies == 'undefined'){
										// this_thread.replies = [];
										// this_thread.has_replies = true;
										this_thread.replyCount = i+1;
									}
									// this_thread.replies.push( parseComment(thisEvent.posts[i+1]) );
									i++;
									thisEvent.posts[i].isReply = true; // should probably do this with `in_reply_to`
								}
							}
						}
				}

				/*
				// console.log('latest_comment: ' + thisEvent.latest_comment.time);
				console.log('latest_comment: ' + moment( thisEvent.latest_comment.time ).format("MMM Do, YYYY"));
				// console.log('created: ' + thisEvent.event.created);
				console.log('created: ' + moment( thisEvent.event.created ).format("MMM Do, YYYY"));
				// console.log('ternary: ' +  thisEvent.event.comment_count > 0 ? thisEvent.latest_comment.time : thisEvent.event.created);
				console.log('ternary: ' +  moment(thisEvent.latest_comment.time !== undefined ? thisEvent.latest_comment.time : thisEvent.event.created).format("MMM Do, YYYY"));
				console.log('thisEvent.time: ' +  moment(thisEvent.time).format("MMM Do, YYYY"));
				console.log('----------------------------------');
				*/
			});

		};

		for(var i=0; i<sources.events.length; i++){
			var thisEvent = new Items.Event(sources.events[i]);
			processEventData( thisEvent );
			news.push( thisEvent );
		}

	}

	// ------------------------------------------------------
	// Comments from recent (past) events
	// Items.Event
	// ------------------------------------------------------
	if(sources.events_recent){
		var processEventData = function(thisEvent){
			var thisEvent = thisEvent;

			gimme.get([{"gimme": "event_comments", data:{"event_id": thisEvent.event.id, "page": 2}},{"gimme": "rsvps", "data": {"event_id": thisEvent.event.id, "page": 5}}], true).then(function(data){
				thisEvent.time = thisEvent.event.time;
				thisEvent.rsvps = data.rsvps;

				if(thisEvent.event.comment_count > 0){
						var this_thread;

						thisEvent.latest_comment = data.event_comments[0];
						thisEvent.posts = data.event_comments;
						thisEvent.time = thisEvent.latest_comment.time;

						for(var i=0; i<thisEvent.posts.length; i++){
							this_thread = thisEvent.posts[i];
							thisEvent.posts[i].isReply = false; // should probably do this with `in_reply_to`

							if(thisEvent.posts[i+1]){
								while(this_thread.event_comment_id == thisEvent.posts[i+1].in_reply_to){
									if(typeof thisEvent.posts.replies == 'undefined'){
										// this_thread.replies = [];
										// this_thread.has_replies = true;
										this_thread.replyCount = i+1;
									}
									// this_thread.replies.push( parseComment(thisEvent.posts[i+1]) );
									i++;
									thisEvent.posts[i].isReply = true; // should probably do this with `in_reply_to`
								}
							}
						}
				}

				/*
				// console.log('latest_comment: ' + thisEvent.latest_comment.time);
				console.log('latest_comment: ' + moment( thisEvent.latest_comment.time ).format("MMM Do, YYYY"));
				// console.log('created: ' + thisEvent.event.created);
				console.log('created: ' + moment( thisEvent.event.created ).format("MMM Do, YYYY"));
				// console.log('ternary: ' +  thisEvent.event.comment_count > 0 ? thisEvent.latest_comment.time : thisEvent.event.created);
				console.log('ternary: ' +  moment(thisEvent.latest_comment.time !== undefined ? thisEvent.latest_comment.time : thisEvent.event.created).format("MMM Do, YYYY"));
				console.log('thisEvent.time: ' +  moment(thisEvent.time).format("MMM Do, YYYY"));
				console.log('----------------------------------');
				*/
			});

		};

		for(var i=0; i<sources.events_recent.length; i++){
			var thisEvent = new Items.Event( sources.events_recent[i] );
			processEventData( thisEvent );
			news.push( thisEvent );
		}
	}


	// ------------------------------------------------------
	// Photos from recent (past) events
	// Items.EventPhotos
	// ------------------------------------------------------
	if(sources.events_recent){
		var getPhotos = function(thisUpload){
			var thisUpload = thisUpload;
			gimme.get([{"gimme": "photos", data:{"page": 3, "group_id": groupId, "event_id": thisUpload.event.id}}], true).then(function(data){
				thisUpload.photos = data.photos;
				thisUpload.showCommentBox = data.photos.length < 2; // only shows comment box for 1 photo
				thisUpload.time = data.photos[0].created;
			});
		}
		for(var i=0; i<sources.events_recent.length; i++){
			if(sources.events_recent[i].photo_count > 0){
				var thisUpload = new Items.EventPhotos( sources.events_recent[i] );
				news.push( thisUpload );
				getPhotos( thisUpload );
			}
		}
	}

	// ------------------------------------------------------
	// UNCOMMENT THIS WHEN DESIGN IS DECIDED
	// Photos from upcoming events
	// Items.EventPhotos
	// ------------------------------------------------------
	// if(sources.events){
	// 	var getPhotos = function(thisUpload){
	// 		var thisUpload = thisUpload;
	// 		gimme.get([{"gimme": "photos", data:{"page": 3, "group_id": groupId, "event_id": thisUpload.event.id}}], true).then(function(data){
	// 			thisUpload.photos = data.photos;
	// 		});
	// 	}
	// 	for(var i=0; i<sources.events.length; i++){
	// 		if(sources.events[i].photo_count > 0){
	// 			var thisUpload = new Items.EventPhotos( sources.events[i] );
	// 			news.push( thisUpload );
	// 			getPhotos( thisUpload );
	// 		}
	// 	}
	// }

	// ------------------------------------------------------
	// Discussions
	// ------------------------------------------------------
	if(sources.discussions){
		var threads = [];
		var getPosts = function(thisThread){
			thisThread.posts    = 'replies' in thisThread.discussion ? thisThread.discussion.replies : [];
			thisThread.top_post = thisThread.discussion.posts[0];
			thisThread.time     = thisThread.top_post.created;
		};

		for (var i = 0; i < sources.discussions.length; i++) {

			for (var n = 0; n < sources.discussions[i].discussions.length; n++) {
				threads.push(sources.discussions[i].discussions[n]);
			}

		}

		for (var t = 0; t < threads.length; t++) {
			var threadReplies = [];
			if(threads[t].reply_count > 0){

				for (var p = 0; p < threads[t].posts.length; p++) {
					threadReplies.push(threads[t].posts[p+1]);
					threads[t].replies = [];
				}
				threads[t].replies = threadReplies.slice(0,1);

			}

			var thisThread = new Items.Discussion(threads[t]);
			getPosts(thisThread);
			news.push(thisThread);

		}
	}

	// ------------------------------------------------------
	// PreMUPs
	// ------------------------------------------------------
	if(sources.preMUPs){
		var getInviteWho = function(thisPreMUP){
			var thisPreMUP = thisPreMUP;
			gimme.get([{"gimme": "members", "data":{"group_id": groupId, "page": 10}}], true).then(function(data){
				thisPreMUP.inviteWho = data.members;
				// for (var i = 0; i < thisPreMUP.inviteWho.length; i++) {
				// 	thisPreMUP.inviteWho[i].isInvited = false;
				// }
				// console.log(thisPreMUP.inviteWho);
			});
		};

		for (var i = 0; i < sources.preMUPs.length; i++) {
			var thisPreMUP = new Items.SparkedEvent(sources.preMUPs[i]);
			getInviteWho(thisPreMUP);
			news.push(thisPreMUP);
		}
	}

	//
	// Order by time
	//
	// The 'setTimeout' is just an awful hack:
	// What I actually need is to wait to do `news.sort` until all of the data manipulation above has finished
	window.setTimeout(function(){
		news.sort(function(a,b){
			if (a.time < b.time)
				return 1;
			if (a.time > b.time)
				return -1;
			return 0;
		});
	}, 3000);

	return news;
}

