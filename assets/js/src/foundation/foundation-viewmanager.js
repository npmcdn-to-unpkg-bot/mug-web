/**
 * COMPONENTS
 * Object to hold reusable Ractive templates
 * Declaring it here so all views can use it
 * Consider moving into View prototype?
 */
var Components = {};


/**
 * VIEWMANAGER
 * Simple interface for manipulating views
 * Standardizes between-view magic, making sure page state doesn't get wacky
 */
var ViewManager = function(oninit) {
	this.oninit = oninit || function() {};

	// data is shared across all views (not available in headers)
	this.data = {};

	// views
	this._main = null;
	this._modal = null;
	this._media = null;
	// this._split = null;
	this._splitList = null;
	this._splitDetail = null;

	// momentary
	this._momentary = null;

	// toast
	this._toast = null;

	// dialog
	this._dialog = null;

	// System message
	this._sysmsg = null;

	// Nav
	this._nav = null;

	// not really a view, just an element
	this._$shade = null;

	this.last_scrollTop = 0;

	// let's go
	var self = this;
	Ractive.load({
		Header: '/shared-templates/header.html',
		Nav: '/shared-templates/nav.html',
		Momentary: '/shared-templates/momentary.html',
		Toast: '/shared-templates/toast.html',
		Dialog: '/shared-templates/dialog.html',
		Sysmsg: '/shared-templates/sysmsg.html'
	}).then(function(components) {

		// make components globally available
		Components = components;

		// let's go
		self.init();
	});

}

ViewManager.prototype = {

	show: function(options) {

		this.modal_hide();
		this.split_hide();
		this.media_hide();

		if (this._main.show(options.template)) {
			if(options.events)
				this._main.current_view.on(options.events);
			if(options.observe)
				this._main.current_view.observe(options.observe);
			if(options.header)
				this._main.update_header(options.header);
				if (options.header.hidden) {
					this._main.$header.detach();
				}
				$(window).scrollTop(0);
		}

	},

	split_show: function(split_options, main_options) {
		var self = this;
		this.modal_hide();
		this.media_hide();

		var completeSplit = function() {
			self._split.$header.detach();
			$(self._split.$body).append(self._splitList.$el);
			$(self._split.$body).append(self._splitDetail.$el);
			self._main.$el.hide();
			self._split.$el.removeClass('off').show();
			self._splitList.$el.show();
			self._splitDetail.$el.show();
		};

		if (this._splitList.show(split_options.template)) {
			if(split_options.events)
				this._splitList.current_view.on(split_options.events);
			if(split_options.observe)
				this._splitList.current_view.observe(split_options.observe);
			if(split_options.header)
				this._splitList.update_header(split_options.header);
		}

		if (this._splitDetail.show(main_options.template, completeSplit)) {
			if(main_options.events)
				this._splitDetail.current_view.on(main_options.events);
			if(main_options.observe)
				this._splitDetail.current_view.observe(main_options.observe);
			if(main_options.header)
				this._splitDetail.update_header(main_options.header);
		}

	},

	split_hide: function() {
		this._main.$el.show();
		this._split.$el.addClass('off').hide();
		this._splitList.$el.hide();
		this._splitDetail.$el.hide();
	},

	focus: function(view) {
		switch (view) {
			case "splitList":
				this._splitDetail.$el.removeClass('focus');
				this._splitList.$el.addClass('focus');
				break;
			default:
				this._splitDetail.$el.addClass('focus');
				this._splitList.$el.removeClass('focus');
				break;
		}
		$(window).scrollTop(0);
	},

	modal_show: function(options) {
		var self = this;

		this.momentary_hide();

		var reveal = function() {

			self.last_scrollTop = $(window).scrollTop();
			self._modal.$el.show();
			self._$shade.show();
			self._modal.$el.css({
				top: self.last_scrollTop
			});

			setTimeout(function() {
				self._modal.$el.removeClass('off');
				self._$shade.removeClass('off');
				if(options.modalType) {
					var prefix = "view--modal";
					var classes = self._modal.$el[0].className.split(" ").filter(function(c) {
						return c.lastIndexOf(prefix, 0) !== 0;
					});
					self._modal.$el[0].className = $.trim(classes.join(" ")) + ' view--modal-' + options.modalType;

					// console.log(self._modal.$el[0].className);
				}
			}, 100);
		};

		if (this._modal.show(options.template, reveal)) {
			if(options.events)
				this._modal.current_view.on(options.events);
			if(options.observe)
				this._modal.current_view.observe(options.observe);
			if(options.header)
				this._modal.update_header(options.header);
			// if it's a large modal, make it large
		}
	},


	modal_hide: function() {
		var self = this;

		if (!this._modal || !this._modal.open) {
			// already closed
			return;
		}
		this._modal.open = false;

		$(window).scrollTop(self.last_scrollTop); // back to pre-modal scrolltop
		this._modal.$el.addClass('off');
		this._modal.$el.one('transitionend', function() {
			self._modal.$el.hide();
			if (self._modal.current_view) {
				self._modal.teardown();
				self._modal.current_href = null;
			}
		});

		this.momentary_hide();
		this._$shade.addClass('off');
		this._$shade.one('transitionend', function() {
			$(this).hide();
		});

	},

	media_show: function(options) {
		var self = this;
		this.modal_hide();
		this.momentary_hide();

		var reveal = function() {
			self.last_scrollTop = $(window).scrollTop();
			self._media.$el.show();
			self._media.$body.find('.view--mediaContent').prepend(self._media.$header);
			self._media.$el.css({
				top: self.last_scrollTop
			});

			setTimeout(function() {
				self._media.$el.removeClass('off');
				// self._$shade.removeClass('off');
			}, 100);
		};

		if (this._media.show(options.template, reveal)) {
			if(options.events)
				this._media.current_view.on(options.events);
			if(options.observe)
				this._media.current_view.observe(options.observe);
			if(options.header)
				this._media.update_header(options.header);
		}
	},


	media_hide: function() {
		var self = this;

		if (!this._media || !this._media.open) {
			// already closed
			return;
		}
		this._media.open = false;

		$(window).scrollTop(self.last_scrollTop); // back to pre-modal scrolltop
		this._media.$el.addClass('off');
		this._media.$el.one('transitionend', function() {
			self._media.$el.hide();
			if (self._media.current_view) {
				self._media.teardown();
				self._media.current_href = null;
			}
		});

		this.momentary_hide();
		// this._$shade.addClass('off');
		// this._$shade.one('transitionend', function() {
		// 	$(this).hide();
		// });
	},

	momentary_show: function(opts) {
		var opts = opts || {};
		this.momentary_hide();
		this._momentary = new Momentary(opts);
	},

	momentary_hide: function() {
		if (this._momentary) {
			this._momentary.hide();
			// this._momentary = null;
		}
		//this._momentary = null; // might need to put this in a callback
	},

	dialog_show: function(opts) {
		var opts = opts || {};
		this.momentary_hide();
		this.dialog_hide();
		this._dialog = new Dialog(opts);
	},

	dialog_hide: function() {
		if (this._dialog) {
			this._dialog.hide();
			this._dialog = null;
		}
	},

	sysmsg_show: function(opts) {
		var opts = opts || {};
		this._sysmsg = new Sysmsg(opts);
	},

	sysmsg_hide: function() {
		if (this._sysmsg) {
			this._sysmsg.hide();
			this._sysmsg = null;
		}
	},

	handle_dialog_outclick: function(e) {
		if (!this._dialog || !this._dialog.showing) {
			return false;
		}
		if (!this._dialog.$el.is(e.target) && this._dialog.$el.has(e.target).length === 0) {
			// if the target of the click isn't the container
			// nor a descendant of the container
			this.dialog_hide();
		}
	},

	toast_show: function(opts){
		var opts = opts || {};
		this._toast = new Toast(opts);
	},

	nav_show: function(opts) {
		var opts = opts || {};
		this._nav = new Nav(opts);
	},

	handle_modal_outclick: function(e) {

		// overlayClicked is a hack. Will require user to click twice to close the modal on desktop if a momentary is open
		var overlayClicked = $(e.target).is('.overlayScreen');

		// momentaryClicked is a hack. Should handle this in a more graceful way
		var momentaryClicked = $(e.target.offsetParent).is('.momentary');

		if (!this._modal.open || overlayClicked || momentaryClicked) {
			return false;
		}
		if (!this._modal.$el.is(e.target) && this._modal.$el.has(e.target).length === 0) {
			// if the target of the click isn't the container
			// nor a descendant of the container
			this.modal_hide();

			// this.escape();
			// Welcome to Hack City. Population: this if/else
			if (!this._media.open) {
				this.escape();
			} else {
				this.back();
			}

		}
	},

	handle_momentary_outclick: function(e) {
		if (!this._momentary || !this._momentary.showing) {
			return false;
		}
		if (!this._momentary.$el.is(e.target) && this._momentary.$el.has(e.target).length === 0) {
			// if the target of the click isn't the container
			// nor a descendant of the container
			this.momentary_hide();
		}
	},

	escape: function() {
		location.hash = '#!/';
	},

	back: function() {
		window.history.back();
	},


	init: function() {

		// platform
		this.data.platform = $.cookie('platform') || 'web';
		$('body').addClass(this.data.platform);

		// init views
		this._main = new View("main", this.data);
		this._media = new View("media", this.data, "media");
		this._modal = new View("modal", this.data, "modal-snap");
		this._split = new View("split", this.data, "split");
		this._splitList = new View("splitList", this.data, "splitList");
		this._splitDetail = new View("splitDetail", this.data, "splitDetail");

		// shade -- the x should get pulled out into css
		this._$shade = $('<div class="shade off"><div class="x">close</div></div>').appendTo('body').hide();

		// attach "escape" and "back" events
		var self = this;
		$.each([this._main, this._split, this._splitList, this._splitDetail, this._modal, this._media], function(i, v) {
			v.header_view.on({
				'back': function(event) {
					self.back();
					return false;
				},
				'escape': function(event) {
					self.escape();
					return false;
				}
			});
		});

		// set up outclick event
		var self = this;
		$(document).click(function(e) {
			self.handle_modal_outclick(e);
			self.handle_momentary_outclick(e);
			self.handle_dialog_outclick(e);
		});

		this.oninit();
	}
};
