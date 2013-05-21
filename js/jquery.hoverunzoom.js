
   /********************************
    jQuery HoverUnZoom
    another plugin brought
    to you by tobozo
    copyleft (c+) 2013
    twitter : @TobozoTagada

    Applies to : <img> tag only
    Requires   : background-size css3 support or a polyfill/plugin
    Method     : img-src to background-image substitution

    Helpful code to enable background-size support on non-supported browsers :
        - https://github.com/louisremi/background-size-polyfill
        - https://github.com/louisremi/jquery.backgroundSize.js/blob/master/jquery.backgroundSize.js
        
  ********************************/

;(function() {

 
  $.fn.hoverUnZoom = function(options) {
    $.support.BackgroundSize = false;
    $.each(['backgroundSize','MozBackgroundSize','WebkitbackgroundSize','ObackgroundSize'], function() {
        if(document.body.style[this] !== undefined) $.support.BackgroundSize = true;
    });
    if(!$.support.BackgroundSize) {
      try {
          console.log('Your browser has no background-size support, HoverUnZoom plugin is disabled');
          console.log('Hint: use a polyfill such as https://github.com/louisremi/background-size-polyfill');
      }  catch(e) { /* damn ie */ }
      return this;
    }
    var pixelTrans = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    this.each(function() {
      var element = $(this);
      if(!element.attr('data-src')) {
        element.attr('data-src', element.attr('src'));
        element.attr('data-width', element.width());
        element.attr('data-height',element.height());
      }
      if(options.always) {
        element.css({
          width:element.width(),
          height:element.height(),
          backgroundImage:"url("+element.attr('data-src')+')',
          backgroundSize:'100%',
          backgroundPosition:'center center',
          backgroundRepeat:'no-repeat',
          transition:"all 0.2s ease-out"
        }).attr('src', pixelTrans);

        element.on('mouseover', function() {
          $(this).css({
            backgroundSize:'90%'
          });
        }).on('mouseleave', function() {
          $(this).css({
            backgroundSize:'100%'
          });
        });
      } else {
        // if this makes your images flicker on hover, try with hoverUnZoom({always:true})
        element.on('mouseover', function() {
          $(this).css({
            width:element.width(),
            height:element.height(),
            backgroundImage:"url("+element.attr('data-src')+')',
            backgroundSize:'90%',
            backgroundPosition:'center center',
            backgroundRepeat:'no-repeat'
          });
          $(this).attr('src', pixelTrans);
        }).on('mouseleave', function() {
          $(this).css({
            width:element.width(),
            height:element.height(),
            backgroundImage:'none',
            backgroundSize:'100%',
            backgroundPosition:'center center'
          });
          $(this).attr('src', $(this).attr('data-src'));
        });
      }
      $(this).addClass('hoverUnZoom');
    });
    return this;
  };

})(jQuery);
