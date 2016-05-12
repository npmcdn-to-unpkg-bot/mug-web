/**
 * MOMENTARY
 * Basic minor overlaid widget
 * A momentary comes in flavors like popovers, alerts, action sheets, pickers, but they're basically the same concept
 * These are not whole views or modals
 * Maybe there should only be one momentary at a time???
 */

var Momentary = function(opts){
	this.$el = null;
	this.actions = null;
	this.current_view = null;
	this.showing = false;
	this.show(opts);
}

Momentary.prototype = {
	show: function(opts) {
		var self = this;

		// ON RENDER
		var onrender = function() {
			self.current_view = this;
			self.showing = true;

			this.on({
				'action': function(event) {
					self.actions[event.node.dataset.action].call(self, event);
				},
				'hide_momentary': function() {
					self.hide();
				}
			});
			// reveal
			setTimeout(function() {
				self.$el.removeClass("off");
			}, 1);
		}

		// ON TEARDOWN
		var onteardown = function() {
			self.current_view = null;
			self.showing = false;
			self.$el.detach();
			$('.overlayScreen').detach();
		}

		// BUTTONS AND HANDLERS
		// not entirely necessary to do it this way but keeps the setup object nice and clean
		// without having to arbitraily pick event names
		this.actions = {};
		if (opts.buttons && opts.buttons.length > 0) {
			for (var i = 0; i < opts.buttons.length; i++) {
				opts.buttons[i].action = "action" + i;
				this.actions[opts.buttons[i].action] = opts.buttons[i].fn; // handler
			}
		}

		// ATTACH AND RENDER
		this.$el = $('<div class="momentary momentary-' + opts.type + ' off"></div>');
		var overlay = $('<div class="overlayScreen"></div>'); // can we reuse shade?
		$('body').append(this.$el, overlay);

		// Fix for touch screens
		overlay.on('click', function(){
			self.hide();
		});

		this.current_view = new Components.Momentary({
			el: this.$el,
			data: opts,
			magic: true,
			noIntro: true,
			oncomplete: onrender,
			onteardown: onteardown
		});

		// POSITIONING FOR POPOVER TYPE ONLY
		// Would be nice to make this simpler
		if (opts.$target && opts.type === 'popover') {
			var el_w = this.$el.width();
			var pos = opts.$target.offset();
			var target_w = opts.$target.outerWidth();
			var target_h = opts.$target.outerHeight();
			var window_w = $(window).width();

			if ($('body').hasClass('android')) { // just a hack until we have a better way to set/get platform
				if (pos.left < window_w / 2) {
					this.$el.css({
						left: pos.left,
						top: pos.top
					}).addClass('top-left');
				} else {
					this.$el.css({
						left: pos.left - el_w + target_w,
						top: pos.top
					}).addClass('top-right');
				}
			} else {
				if (pos.left < window_w / 2) {
					this.$el.css({
						left: pos.left + target_w / 2,
						top: pos.top + target_h
					}).addClass('top-left');
				} else {
					this.$el.css({
						left: pos.left + target_w / 2 - el_w,
						top: pos.top + target_h
					}).addClass('top-right');
				}
			}

			// on screen resize, hide popover
			$(window).one('resize', function() {
				self.hide();
			});
		}

	},


	hide: function(){
		var self = this;
    	self.$el.addClass('off');
    	self.$el.one(transitionEnd, function(){
			self.current_view.teardown();
    	});
    	console.log('hide firing');
	}

};
