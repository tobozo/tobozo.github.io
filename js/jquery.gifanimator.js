
   /********************************
    jQuery GIFAnimator
    another plugin brought
    to you by tobozo
    copyleft (c+) 2013
    twitter : @TobozoTagada

    Creates an animated GIF image from an animation description.
    {
        // must be an image source, file will be pulled
        "images":["sheep_360_400.gif","sheep_200_400.gif","sheep_240_400.gif","sheep_280_400.gif","sheep_320_400.gif"],
        // delays is in ms
        "delays":[200,200,200,200,200],
        // flips : h, v, hv
        "flips":["","","","",""],
        // rotations : 0, 90, 180, 270
        "rotations":["0","0","0","0","0"],
        "colors":['rgb(255,255,255)','rgb(255,255,255)','rgb(255,255,255)','rgb(255,255,255)']
    }

    Requires   : jquery-factory, jsgif (https://github.com/antimatter15/jsgif/)
    Method     : multiple gifs to canvas animation to gif animation rendering
    

  ********************************/


;(function() {

  $.fn.gifAnimator = function(options) {
    if(!options.sheepData) return this;
    if(!$.fn.gifAnimator.isCanvasSupported()) return this;
    var element = $(this);
    window.sheepData = options.sheepData;
    if( $('body').attr('data-gifanimator')!='loaded' ) {
      $('<div class="loader b64">[b64]</div>'
       +'<div class="loader LZWEncoder">[LZWEncoder]</div>'
       +'<div class="loader NeuQuant">[NeuQuant]</div>'
       +'<div class="loader GIFEncoder">[GIFEncoder]</div>').appendTo($('body'));
      $.getScript("/js/gif/b64.js", function() { $('.b64').remove(); });
      $.getScript("/js/gif/LZWEncoder.js", function() { $('.LZWEncoder').remove(); });
      $.getScript("/js/gif/NeuQuant.js", function() { $('.NeuQuant').remove(); });
      $.getScript("/js/gif/GIFEncoder.js", function() { $('.GIFEncoder').remove(); });
      var loadChecker = setInterval(function() {
        if( $('.loader').length==0 ) {
          clearInterval(loadChecker);
          $('body').attr('data-gifanimator', 'loaded')
          $.fn.gifAnimator.initEngine(element);
        }
      }, 200);
    } else {
      $.fn.gifAnimator.initEngine(element);
    }

    return this;
  }

  $.fn.gifAnimator.isCanvasSupported = function(){
      var elem = document.createElement('canvas');
      return !!(elem.getContext && elem.getContext('2d'));
  }

  $.fn.gifAnimator.initEngine = function(element) {
    var targetElement = element;

    $(targetElement).unbind('loadSheepData').on('loadSheepData', function() {
      sheepData.canvas = {};
      sheepData.colors = {}; // later
      $(sheepData.images).each(function(index) {
        sheepData.colors[index] = sheepData.colors[index] || 'rgb(1,12,123)'; // todo : detect any unused color and auto-assign
        imgEnqueue({
          index:index,
          src:sheepData.images[index],
          duration:sheepData.delays[index],
          transparentColor: sheepData.colors[index]
        });
      });
      var jobChecker = setInterval(function() {
        if($('.loader').length==0) {
          clearInterval(jobChecker);
          $(targetElement).trigger('encodeGif');
        }
      }, 100);
    });

    $(targetElement).unbind('encodeGif').on('encodeGif', function() {
      if( $('.loader').length>0) {
        // images are still loading, be patient !
        return false;
      }
      if(!sheepData.canvas) {
        // no canvas to animate
        return false;
      }
      if(sheepData.canvas.length==0) {
        // no canvas to animate
        return false;
      }

      var encoder = new GIFEncoder();
      var context;
      encoder.setRepeat(0); //auto-loop
      encoder.setDispose(2); //auto-loop
      encoder.setDelay(sheepData.delays[0]);
      if(!encoder.start()) {
        console.log('encoder failed to start');
        return false;
      }
      $(sheepData.delays).each(function(index) {
          encoder.setDelay(sheepData.delays[index]);
          encoder.setTransparent(rgb2hex(sheepData.colors[index]));
          context = sheepData.canvas[index].getContext('2d');
          if(!encoder.addFrame(context)) {
            console.log('duh !');
          }
      })
      encoder.finish();
      $(targetElement).empty();
      $('<img />').attr('src', 'data:image/gif;base64,'+encode64(encoder.stream().getData())).appendTo(targetElement);

    });

    $(targetElement).trigger('loadSheepData');

    function imgEnqueue(obj) {
      $('<span class="loader" id="loader_'+obj.index+'">*</span>').appendTo('body');
      var img = new Image;
      img.onload = function() {
        sheepData.canvas[obj.index] = getImage(img, {
          transparentColor:sheepData.colors[obj.index],
          rotate:sheepData.rotations[obj.index],
          flip:sheepData.flips[obj.index]
        });
        $('#loader_'+obj.index).remove();
      };
      img.src = obj.src;
    }

    function getImage(img, options) {
      var canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext('2d');
      switch(options.rotate) {
        case '90':
          ctx.translate(img.width/2,img.height/2);
          ctx.rotate(90 * Math.PI / 180);
          ctx.translate(-img.width/2,-img.height/2);
        break;
        case '180':
          ctx.translate(img.width/2,img.height/2);
          ctx.rotate(180 * Math.PI / 180);
          ctx.translate(-img.width/2,-img.height/2);
        break;
        case '270':
          ctx.translate(img.width/2,img.height/2);
          ctx.rotate(270 * Math.PI / 180);
          ctx.translate(-img.width/2,-img.height/2);
        break;
      }
      switch(options.flip) {
        case 'v':
          //console.log('flipv', options);
          ctx.scale(1,-1);
          ctx.translate(0,-img.height)
        break;
        case 'h':
          ctx.scale(-1,1);
          ctx.translate(-img.width,0)
        break;
        case 'vh':
        case 'hv':
          ctx.scale(-1,-1);
          ctx.translate(-img.width,-img.height);
        break;
      }
      ctx.fillStyle = options.transparentColor || 'rgb(255,255,255)';
      ctx.fillRect(0,0,img.width, img.height);
      // Draw image on canvas to get its pixel data
      ctx.drawImage(img, 0, 0);

      // Get image pixels
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var pixels = imageData.data;
      ctx.putImageData(imageData, 0, 0);
      return canvas;
    }

    function rgb2hex(rgb) {
      var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
      rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      return "0x" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
      function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
      }
    }

  };

})(jQuery);