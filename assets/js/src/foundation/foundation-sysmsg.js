/**
 * SYSTEM MESSAGE
 * Message that appears at the top of a page
 *
 * Used sparingly for things like:
 * warnings, important messages, app download banner
 *
 */

// TODO:
// Have an intro animation
// Have a better outro animation

var Sysmsg = function(opts){
	this.$el = null;
	this.actions = null;
	this.current_view = null;
	this.showing = false;
	this.show(opts);
}

Sysmsg.prototype = {
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
				'hide_sysmsg': function(event) {
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
		this.$el = $('<div class="sysmsg collapsable collapsable--grow"></div>');
		$('body').addClass('hasSysMsg').prepend(this.$el);

		this.current_view = new Components.Sysmsg({
			el: this.$el,
			data: opts,
			magic: true,
			noIntro: true,
			oncomplete: onrender,
			onteardown: onteardown
		});
	},


	hide: function(event){
		var self = this;
			// event.original.preventDefault();
			self.$el.removeClass('collapsable--grow').addClass('collapsable--shrink');

			self.$el.one(transitionEnd, function(){
				self.current_view.teardown();
				$('body').removeClass('hasSysMsg');
			});
			return false;
	}

};
