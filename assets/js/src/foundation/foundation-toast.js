/**
 * TOAST
 * A toast is just a message letting you know something happened.
 * It's for things that aren't important enough to warrant an alert, but are still nice to let users know about.
 * Optionally, you can pass in one action, most likely "undo".
 */

var Toast = function(opts){
  this.$el = null;
  this.action = null;
  this.current_view = null;
  this.isHovered = false;
  this.show(opts);
};

Toast.prototype = {
  show: function(opts){

    var self      = this;

    var onrender = function(){
      self.current_view = this;
      this.on({
        'action': function(event){
          self.action.call(self, event);
        }
      });

      self.$el.on('mouseenter', '.toast-content', function(){
        self.isHovered = true;
      }).on('mouseleave', '.toast-content', function(){
        self.isHovered = false;
        self.hide();
      });

      // reveal
      setTimeout(function(){
        self.$el.removeClass("off");
      }, 1);

      // automatic timed hide - maybe we can just do this with CSS transition delay?
      // doesn't hide if there is a button and the user is hovering
      setTimeout(function(){
        if(! self.isHovered && opts.button) {
          self.hide();
        }
      }, 3000);

    };

    var onteardown = function(){
      self.current_view = null;
      self.$el.detach();
    };

    // buttons and handlers
    // not entirely necessary to do it this way
    // but keeps the setup object nice and clean
    // without having to arbitraily pick event names
    if( opts.button ){
      this.action = opts.button.fn; // handler
    }

    this.$el = $('<div class="toast off"></div>');
    $('body').append(this.$el);

    this.current_view = new Components.Toast( {
      el: this.$el,
      data: opts,
      oncomplete: onrender,
      onteardown: onteardown
    });

  },

  hide: function(){
    var self = this;
    self.$el.addClass('off');
    self.$el.one('transitionend', function(){
      self.current_view.teardown();
    });
  }
};
