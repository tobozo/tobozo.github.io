
  /********************************

    jQuery GIFAnimator
    another plugin brought
    to you by tobozo
    copyleft (c+) 2013
    twitter : @TobozoTagada

    Creates an animated GIF image from an animation description.
    animationData = {
        // can be an image address or a data-uri, content will be pulled
        "images":["img1.gif","img2.gif","img3.gif","img4.gif","data:image/gif;base64,....."],
        // delays is in ms
        "delays":[200,200,200,200,200],
        // flips : h, v, hv
        "flips":["","","","",""],
        // rotations : 0, 90, 180, 270
        "rotations":["0","0","0","0","0"],
        "colors":['rgb(255,255,255)','rgb(255,255,255)','rgb(255,255,255)','rgb(255,255,255)'],
        // alpha : 0, 0.1, 0.2, 0.3 .... 1
        "alpha":[1,1,1,1]
    }

    Requires   : jquery-factory, jsgif (https://github.com/antimatter15/jsgif/)
    Method     : multiple gifs to canvas animation to gif animation rendering
    Usage      : $('#targetBox').gifAnimator( {animationData} | false, [opt] callback );

    This jQuery plugin is available under both the MIT and GPL license.

    MIT License

    Copyright (c) 2013 tobozo

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.


    GPL License

    Copyright (C) 2013 tobozo

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

  ********************************/


;(function($) {

  $.fn.gifAnimator = function(options, callback) {
    var gaCallback = callback;

    if(!$.fn.gifAnimator.isCanvasSupported()) return this;
    var element = $(this);

    window.animationData = options.animationData || {};

    // lazy loading, happens only once
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
          $('body').attr('data-gifanimator', 'loaded');
          if(animationData.images && animationData.images.length > 0) {
            // nothing to encode here
            $.fn.gifAnimator.initEngine(element, gaCallback);
          } else {
            $.fn.gifAnimator.finish(gaCallback);            
          }
        }
      }, 200);
    } else {
      $.fn.gifAnimator.initEngine(element, gaCallback);
    }

    return this;
  };

  $.fn.gifAnimator.isCanvasSupported = function(){
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  };


  
  $.fn.gifAnimator.finish = function(gaCallback) {
    if(undefined!==gaCallback) {
      gaCallback.call();
    }
  };



  $.fn.gifAnimator.forceColorToHex = function(color) {
    var result = /^(#([a-f0-9]{6})|#([a-f0-9]{3})|rgb *\( *([0-9]{1,3})%? *, *([0-9]{1,3})%? *, *([0-9]{1,3})%? *\)|rgba *\( *([0-9]{1,3})%? *, *([0-9]{1,3})%? *, *([0-9]{1,3})%? *, *([0-9.]{1,3})%? *\))$/i.exec(color);
    if(result!=null) {
      // console.log(result);
      if(result[2]) {
        // is a 6 char hex value
        return '0x'+result[2];
      }
      if(result[3]) {
        // is a 3 char hex value
        return '0x'+result[3];
      }
      if(result[10]) {
        // is a rgba value
        var rgb = Math.round(result[9]*result[10]) | (Math.round(result[8]*result[10]) << 8) | (Math.round(result[7]*result[10]) << 16);
        rgb = rgb.toString(16);
        return '0x' + zeroFill(rgb, 6);
      }
      if(result[4]) {
        // is a rgb value
        var rgb = result[6] | (result[5] << 8) | (result[4] << 16);
        return '0x' + zeroFill(rgb.toString(16), 6);
      }
    }
    return null;

    function zeroFill( number, width ) {
      width -= number.toString().length;
      if ( width > 0 ) {
        return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
      }
      return number + ""; // always return a string
    }

  };


  
  $.fn.gifAnimator.initEngine = function(element, gaCallback) {
    var targetElement = element;

    if(!animationData.images || animationData.images.length == 0) {
      // nothing to do here, give up with events
      $.fn.gifAnimator.finish(gaCallback);
      return false;
    }

    
    $(targetElement).unbind('loadSheepData').on('loadSheepData', function() {
      animationData.canvas = {};
      animationData.colors = animationData.colors || {}; // transparency colors
      animationData.alpha  = animationData.alpha || {}; // global transparency values
      $(animationData.images).each(function(index) {
        animationData.colors[index] = animationData.colors[index] || 'rgb(1,12,123)'; // todo : detect any unused color and auto-assign
        animationData.alpha[index]  = animationData.alpha[index] || 1;
        imgEnqueue({
                     index:index,
                       src: animationData.images[index],
                  duration: animationData.delays[index],
          transparentColor: animationData.colors[index]
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
        $.fn.gifAnimator.finish(gaCallback);
        return false;
      }
      if(!animationData.canvas) {
        // no canvas to animate
        $.fn.gifAnimator.finish(gaCallback);
        return false;
      }
      if(animationData.canvas.length==0) {
        // no canvas to animate
        $.fn.gifAnimator.finish(gaCallback);
        return false;
      }

      var encoder = new GIFEncoder();
      var context;
      var duration = 0;
      encoder.setRepeat(0); //auto-loop
      encoder.setDispose(2);
      encoder.setQuality(2);
      encoder.setDelay(animationData.delays[0]);
      if(!encoder.start()) {
        console.log('encoder failed to start');
        $.fn.gifAnimator.finish(gaCallback);
        return false;
      }
      $(animationData.delays).each(function(index) {
          var transparentColor = animationData.colors[index];
          encoder.setDelay(animationData.delays[index]);
          duration+=0- -animationData.delays[index];
          encoder.setTransparent($.fn.gifAnimator.forceColorToHex(transparentColor));
          context = animationData.canvas[index].getContext('2d');
          if(!encoder.addFrame(context)) {
            console.log('encoder failed to add frame #'+index);
          }
      })
      encoder.finish();
      $(targetElement).empty();
      $('<img />').attr('src', 'data:image/gif;base64,'+encode64(encoder.stream().getData())).appendTo(targetElement).attr("data-duration", duration/1000);
      $.fn.gifAnimator.finish(gaCallback);
    });

    if($(targetElement).length==0) {
      $.fn.gifAnimator.finish(gaCallback);
    } else {
      $(targetElement).trigger('loadSheepData');
    }

    function imgEnqueue(obj) {
      $('<span class="loader" id="loader_'+obj.index+'">*</span>').appendTo('body');
      var img = new Image;
      img.onload = function() {
        animationData.canvas[obj.index] = getImage(img, {
          transparentColor:animationData.colors[obj.index],
          rotate:animationData.rotations[obj.index],
          flip:animationData.flips[obj.index],
          alpha:animationData.alpha[obj.index],
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
      if(options.alpha) {
        ctx.globalAlpha = options.alpha;
      }
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

      ctx.drawImage(img, 0, 0);
      
      // Get image pixels
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      //var pixels = imageData.data;
      ctx.putImageData(imageData, 0, 0);
      return canvas;
    }

  };

})(jQuery);