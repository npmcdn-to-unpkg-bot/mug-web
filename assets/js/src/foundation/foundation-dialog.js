/**
 * DIALOG
 * Just a fancy alert message with a primary action and the option for an img
 */

var Dialog = function(opts){
	this.$el = null;
	this.primaryAction = null;
	this.current_view = null;
	this.showing = false;
	this.show(opts);
}

Dialog.prototype = {
	show: function(opts) {
		var self = this;

		// ON RENDER
		var onrender = function() {
			self.current_view = this;
			self.showing = true;

			this.on({
				'action': function(event) {
					self.primaryAction.call(self, event);
				},
				'hide_dialog': function() {
					self.hide();
				}
			});

			// reveal
			self.last_scrollTop = $(window).scrollTop();
			self.$el.show();
			$('.shade').show();
			self.$el.css({
				top: self.last_scrollTop
			});

			setTimeout(function() {
				self.$el.removeClass("off");
				$('.shade').removeClass("off");
			}, 1);
		}

		// ON TEARDOWN
		var onteardown = function() {
			self.current_view = null;
			self.showing = false;
			self.$el.detach();
			$('.shade').addClass('off');
			$('.shade').one(transitionEnd, function() {
				$(this).hide();
			});
		}

		if (opts.primaryAction) {
			this.primaryAction = opts.primaryAction.fn;
		}

		// ATTACH AND RENDER
		this.$el = $('<div class="dialog view off"></div>');
		$('body').append(this.$el);

		this.current_view = new Components.Dialog({
			el: this.$el,
			data: opts,
			magic: true,
			noIntro: true,
			oncomplete: onrender,
			onteardown: onteardown
		});

		// on screen resize, hide popover
		$(window).one('resize', function() {
			self.hide();
		});

	},


	hide: function(){
		var self = this;
			// console.log('_dialog.hide');
			self.$el.addClass('off');
			self.$el.one(transitionEnd, function(){
				self.current_view.teardown();
			});
	}

};
