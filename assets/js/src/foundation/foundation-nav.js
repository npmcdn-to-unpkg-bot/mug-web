/**
 * NAV
 * Top-level navigation
 * Currently, tabs
 * Could be easily repurposed for side menu
 * Search mode needs work.
 */

var Nav = function(opts){
	this.$el = null;
	this.current_view = null;
	// this.actions = null;
	// this.navItems = false;
	this.show(opts);
}

Nav.prototype = {
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
				'hide_nav': function(event) {
					self.hide(event);
				}
			});
			// reveal
			setTimeout(function() {

				$('#main').waypoint({
					handler: function(dir) {
						$('.view-head').toggleClass('view-head--sticky');
					}
				});

			}, 1);
		}

		// ON TEARDOWN
		var onteardown = function() {
			self.current_view = null;
			self.showing = false;
			self.$el.detach();
		}

		// HANDLE NAV CLICKS AND TAPS
		// this.navItems = {};
		// if (opts.buttons && opts.buttons.length > 0) {
		// 	for (var i = 0; i < opts.buttons.length; i++) {
		// 		opts.buttons[i].action = "action" + i;
		// 		this.navItems[opts.buttons[i].action] = opts.buttons[i].fn; // handler
		// 	}
		// }

		// ATTACH AND RENDER
		this.$el = $('<nav class="mainNav row"></nav>');
		$('body').addClass('hasNav').prepend(this.$el);

		this.current_view = new Components.Nav({
			el: this.$el,
			data: opts,
			magic: true,
			noIntro: true,
			oncomplete: onrender,
			onteardown: onteardown
		});
	},


	hide: function(){
		this.$el.hide();
		$('body').removeClass('hasNav');
		this.showing = false;
	}


};
