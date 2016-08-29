(function($){

    $.masonryGrid = function(el, options) {
        var base = this, o;
        base.el = el;
        base.$el = $(el);

        base.$el.data('masonryGrid', base);

        var containerWidth;

        base.init = function() {
            base.options = o = $.extend({}, $.masonryGrid.defaults, options);

            $(base.el).removeClass("_proto_masonryGrid--noJS");
            
            base.fit();

            $(window).on('resize', null, null, function() {
              base.fit()
            });
        }

        base.getAllItems = function() {
            return $(' ._proto_masonryGrid-asset', base.el);
        }

        base.getRowItems = function(start, numberOf) {
            var items = base.getAllItems();
            if (start > items.length)
                return false;
            if (start + numberOf > items.length)
                numberOf = items.length - start;
            return items.slice(start, start + numberOf);
        }

        base.getItemAspectRatio = function(item) {
            if ($(item).data('aspectRatio')) {
              return $(item).data('aspectRatio');
            } else if ($(item).width() && $(item).height()) {
              $(item).data('aspectRatio', $(item).width() / $(item).height());
              return $(item).width() / $(item).height();
            } else {
              return o.defaultAspectRatio;
            }
        }

        base.calcRowHeight = function(items) {
            var sumAspectRatios = 0;
            items.each(function() {
                sumAspectRatios += parseFloat(base.getItemAspectRatio(this));
            });
            return containerWidth / sumAspectRatios;
        }

        base.fit = function() {
            containerWidth = $(base.el).width();

            var items, height, allItems;
            var itemsPerRow = 1;
            var startIndex = 0;
            var didResize = false;
            while (true) {

              items = base.getRowItems(startIndex, itemsPerRow);
              height = base.calcRowHeight(items);
              allItems = base.getAllItems();

              // is this the last row? Then fit it and quit looping
              if (startIndex > allItems.length || startIndex + itemsPerRow > allItems.length) {
                if (items.length)
                    base.fitItemsToRow(items);
                break;
              }

              // do we need a resize? add them to the row
              if (height > o.maxRowHeight) {
                  itemsPerRow ++;
                  continue;
              }

              base.fitItemsToRow(items);
              startIndex += itemsPerRow;
              itemsPerRow = 1;
              didResize = true;

            }
        }

        base.fitItemsToRow = function(items) {
            var setSizeByHeight = function(item, height) {
                $(item).css({
                  'height' : Math.floor(base.calcRowHeight(items)),
                  'width' : Math.floor(height * base.getItemAspectRatio(item))
                });
            };
            var height = base.calcRowHeight(items);

            if (height > o.absMaxImgHeight)
              height = o.absMaxImgHeight;

            items.each(function() {
              setSizeByHeight(this, height);
            });
        }

        base.init();
    }

    $.masonryGrid.defaults = {
        maxRowHeight: 400, // The maximum desired height of rows
        absMaxImgHeight: 400 // No images will ever be higher than this, even when they wrap
    };

    $.fn.masonryGrid = function(options, params) {
      return this.each(function(){
        var me = $(this).data('masonryGrid');
        if ((typeof(options)).match('object|undefined'))
          new $.masonryGrid(this, options);
        else
          eval('me.'+options)(params);
      });
    }

})(jQuery);