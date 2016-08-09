/**
 * VIEW
 * A view is the primary structure for content.
 * It has a wrapper, a header, and a body
 * A regular screen is a view
 * A modal is a view
 * A splitview has two views
 */

var View = function(id, data, type) {

	this.data = data;

	this.type = type || "default";

	this.id = id;
	this.$el = null;
	this.open = false;

	this.body_id = id + "_body";
	this.$body = null;
	this.current_view = null;
	this.current_href = null;

	this.header_id = id + "_header";
	this.$header = null;
	this.header_view = null;
	this.header_actions = null;
	this.header_data = {};
	this.search_onkeyup = function() {};
	this.search_onsubmit = function() {};
	this.cancel_action = function() {};

	this.init();
}

View.prototype = {

	setup_dom: function() {
		// console.log(this);
		this.$header = $('<header id="' + this.header_id + '" class="view-head row"></header>');
		this.$body = $('<div id="' + this.body_id + '" class="view-body"></div>');
		this.$el = $('<div id="' + this.id + '" class="view"></div>').append(this.$header, this.$body);

		this.set_type();
		$('body').append(this.$el);
	},

	set_type: function() {
		// special setups for special types
		switch (this.type) {
			case "split":
				this.$el.addClass('view--splitView view--modal-full off').hide();
				this.$body.addClass('flexParent--row');
				break;
			case "splitList":
				this.$el.addClass('view--splitList').hide();
				break;
			case "splitDetail":
				this.$el.addClass('view--splitDetail').hide();
				break;
			case "modal-full":
				// always full at all widths
				console.log('modal full detected');
				this.$el.addClass('view--modal-full off').hide();
				break;
			case "media":
				// always full at all widths
				this.$el.addClass('view--modal-full view--media off').hide();
				this.$body.addClass('spreadable spreadable--noGutters atLarge_spreadable--spread');
				this.$header.addClass('view-head--mediaContent inverted');
				break;
			case "modal-snap":
				// at wide screens, is dialog, at small screens is full
				console.log('modal snap detected');
				this.$el.addClass('view--modal-snap off').hide();
				break;
			case "modal-fixed":
				// Scroll modal content, not bg
				console.log('modal fixed detected');
				views._$shade.addClass('shade--fixed');
				views._main.addClass('view--fixed');
				break;
			default:
				break;
		}
	},

	show: function(template, fn) {


		var self = this;
		var fn = fn || function() {};
		var $hero;

		// ON RENDER

		function onrender() {

			// HERO HEADERS
			// maybe this should be explicit in the setup object
			// but it seems like just setting people up for failure
			// to not do it automatically
			$hero = self.$el.find('.stripe--hero, .stripe--photoHero').first();
			if ($hero.length > 0) {
				var headerClasses = ( $hero.hasClass('stripe--photoHero') && !$hero.hasClass('photoHero--noPhoto') )? "view-head--transparent view-head--photoOverlay" : "view-head--transparent";
				self.$header.addClass(headerClasses);
				$hero.waypoint({
					handler: function(direction) {
						if (direction == 'up') {
							self.$header.addClass(headerClasses);
						} else {
							self.$header.removeClass(headerClasses);
						}
					},
					offset: function() {
						return -1 * $(this).height();
					}
				});
			}
			else {
				self.$header.removeClass('view-head--transparent view-head--photoOverlay');
			}

			// BASIC VIEW MAGIC
			defaultRenderCompleteActions(self.$el);

			// POST-RENDER CALLBACK
			fn();
		}

		// ON TEARDOWN

		function onteardown() {
			$hero.waypoint("destroy");
			self.$header.removeClass('has-hero has-hero-photo');
		}


		// RENDER TEMPLATE
		// make sure we're not just re-rendering the same thing
		if (this.current_href == location.href) {
			onrender();
			console.log('same url');
			return false;
		} else {
			this.current_href = location.href;
		}

		this.teardown(); // if still around, clear out old template
		this.current_view = new Ractive({
			el: '#' + this.body_id,
			template: '#' + template,
			data: this.data,
			magic: true,
			noIntro: true,
			onrender: onrender,
			onteardown: onteardown
		});

		this.open = true;
		return true;


	},


	teardown: function() {
		if (this.current_view) {
			this.current_view.teardown();
		}
	},

	update_header: function(options) {

		this.set_mode();

		var options = options || {};
		this.header_data.title = options.title || "";
		this.header_data.subtitle = options.subtitle || "";
		this.header_data.subtitleLink = options.subtitleLink || "";
		this.header_data.intro = options.intro || "";
		this.header_data.isRoot = options.isRoot || false;
		this.header_data.goHome = options.goHome || false;
		this.header_data.platform = this.data.platform;
		this.header_data.hidden = options.hidden || false;

		if (options.search) {
			this.header_data.search = options.search;
			this.search_onkeyup = options.search.onkeyup || function() {
				console.log('keyup');
			};
			this.search_onsubmit = options.search.onsubmit || function() {
				console.log('submit');
			};
		} else {
			this.header_data.search = false;
			this.search_onkeyup = function() {
				console.log('keyup');
			};
			this.search_onsubmit = function() {
				console.log('submit');
			};
		}

		if (options.cancelMode) {
			this.header_data.cancelMode = options.cancelMode;
			this.cancel_action = options.cancelMode.fn || function() {
				console.log('no action for cancel defined');
			};
		} else {
			this.header_data.cancelMode = false;
			this.cancel_action = function() {
				console.log('no action for cancel defined');
			};
		}

		// buttons and handlers
		this.header_actions = {};
		this.header_data.buttons = [];
		if (options.buttons && options.buttons.length > 0) {
			for (var i = 0; i < options.buttons.length; i++) {
				options.buttons[i].action = "action" + i;
				this.header_data.buttons.push(options.buttons[i]); // button
				this.header_actions[options.buttons[i].action] = options.buttons[i].fn; // handler
			}
		}
	},

	// MODES
	// views can have modes. right now it's only default and search
	set_mode: function(mode) {
		switch (mode) {
			case "search":
				this.$el.addClass('view--searchMode');
				break;
			default:
				this.$el.removeClass('view--searchMode');
				break;
		}
	},



	init: function() {
		// ATTACH ROOT ELEMENTS
		this.setup_dom();

		// BUILD HEADER DATA OBJ
		this.header_data = {
			title: '',
			subtitle: '',
			subtitleLink: '',
			isRoot: false,
			goHome: false,
			platform: '',
			buttons: [],
			cancelMode: {},
			search: {},
			hidden: ''
		}

		// RENDER HEADER
		this.header_view = new Components.Header({
			el: '#' + this.header_id,
			data: this.header_data,
			magic: true,
			noIntro: true,
		});


		// SET UP PERSISTENT HEADER EVENTS
		var self = this;
		this.header_view.on({
			'action': function(event) {
				// every header action fires "action" on-click
				// this method then fires the correct handler
				// easier than setting a bunch of dynamic Ractive actions
				// and keeps nav bar concerns separated for future HYBRID APP awesomeness
				self.header_actions[event.node.dataset.action].call(self, event);
			},
			'openSearch': function(event) {
				self.set_mode("search"); // default
			},
			'closeSearch': function(event) {
				self.set_mode(); // default
			},
			'searchKeyUp': function(event) {
				self.search_onkeyup(event.node.value);
			},
			'searchSubmit': function(event) {
				self.search_onsubmit(self.header_view.find('input.search').value);
				return false; // stop
			},
			'cancelAction': function(event) {
				self.cancel_action();
			}
		});


	}
}
