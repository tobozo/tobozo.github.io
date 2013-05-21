  /***************************************************************
 
    jQuery Factory UI
    another Web App brought
    to you by tobozo
    copyleft (c+) 2013
    twitter : @TobozoTagada

    Sheep Factory is a jQuery (kind of) GIF Animator Web App.
    
    It lets you select images from a collection to create a
    scenario that will be rendered into a GIF image.

    On loading, the app opens a big sprite image and cuts it in
    40x40 smaller images. The images are then stacked in the UI
    and made available to the user.

    When the UI is ready, clicking on any of the generated image
    will add the image to the animation scenario.
    
    Features:
    ----------
    
      - Some controls are given per image such as the delay,
        the rotation value, the flip value, play/pause,
        next frame/prev frame, delete frame, clear animation.
      - Global transparency color can be changed or picked
        from the image palette, or from the image itself.
      - The animation can be exported to GIF
      - The resulting GIF can be shared on imgur.com
      - There's even an easter egg (look for the apple)

    Limitations:
    ------------    
    
     - It will only let you animate sheeps
     - Image size is stuck at 40px * 40px and must be square
     - A modern browser is required, no fallback is given
     - Most CSS3 declarations have no vendor prefix

    History:
    --------
    
      The Stray Sheep Poe was a Screen Mate software categorized
      as 'desktop companion pet'. The program went viral, and
      translated copies of it were distributed everywhere.
      However, Village Center decided to 'clean the internet':
    
        http://web.archive.org/web/20060619111216/http://www.villagecenter.co.jp/wanted/

      They probably never heard of the Streisand effect :-)
      
      Anyway, this little sheep has saved me hours of boredom
      while waiting for Windows 95 to update, so I've decided
      I'll save him a few hours of life by giving him a modern
      tool that'll help restoring his old image,

    Technical Motivations:
    ----------------------
    
      The idea behind this Web App is to provide a small interface
      with minimal text, and use the content as the layout for the
      action buttons.

      Learning how to handle canvas objects, exploring CSS3 and its
      new features, discovering the GIF and its palette limitations,
      and so on...

      The building of every feature brought its part of adventure and
      offered me new experiences.

      Doing useless stuff can be useful :-)
      
    JS Stack:
    ---------

      jquery-1.8.2.js
      jquery-ui.1.10.3.js
      jquery.mousewheel.js
      
      jquery.nouislider.js << external plugin (requires mousewheel)
      jquery.hoverunzoom.js << home made plugin
      jquery.loopcontainer.js << home made app component
      jquery.gifanimator.js << home made app controler (requires jsGIF)
            b64.js << external lib (jsGIF dep.)
            LZWEncoder.js << external lib (jsGIF dep.)
            NeuQuant.js << external lib (jsGIF dep.)
            GIFEncoder.js << external lib (jsGIF lib)
      jquery.colorpicker.js << home made plugin
      jquery.poptext.js << home made plugin
      jquery.sheepfactory.js << home made app controller


    External JavaScript Sources:
    ----------------------------
    
      jQuery / jQuery UI / jQuery mousewheel : http://jquery.com
      NouiSlider : http://refreshless.com/nouislider/
      jsGIF : https://github.com/antimatter15/jsgif/

      
    CSS Stack:
    ----------

      ... is a big mess ...

      "Vendor prefixes are fucking bathsit crazy"

        http://www.quirksmode.org/blog/archives/2012/07/vendor_prefixes.html

        
    ********************************************************************
    
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
    
  ***********************************************************************/

$(document).ready(function() {

  $.supports = (function() {
    var div = document.createElement('div'),
        vendors = 'Khtml Ms O Moz Webkit'.split(' '),
        len = vendors.length;
    return function(prop) {
      if (prop in div.style) {  return true;  }
      prop = prop.replace(/^[a-z]/, function(val) { return val.toUpperCase(); });
      while (len--) {
          if (vendors[len] + prop in div.style) {
            return true;
          }
      }
      return false;
    };
  })();

  $.support.localStorage = function() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }








  
  if(!$.fn.gifAnimator.isCanvasSupported()) {
    $('#factory').popText("Canvas not supported, conversion to GIF is disabled.");
    $('#toGifButton').hide();
  } else {

    $('#factory').on('colorset', function() {
      if(!$('#render img').length || !window.loops) {
        $('#factory').popText("You must add an image first :-)");
        return false;
      }
      $('#render img').trigger('clear');
      $('#render img').eq(window.loops.currentItems.render).colorPicker({
        startpicking:true,
        dropafteruse:true,
        palette:true,
        oncolorchange:function() {
          console.log(this.color);
          $('#render img')/*.eq(window.loops.currentItems.render).trigger('clear')*/.attr("data-color", this.color);
          $('#output img')/*.eq(window.loops.currentItems.render)*/.attr("data-color", this.color);
          updateStats();
        }
      });
    });

    $('#toGifButton').on('click', function() {
      if(!$('#render img').length || $('#render img').length == 1) {
        $('#factory').popText("Add more images...");
        return false;
      }
      $('#render img').trigger('clear');
      var items  = [],
          delays = [],
          rotate = [],
          flip   = [],
         colors  = [];
      $('#output img').each(function() {
         items.push($(this).attr('src'));
        delays.push($(this).attr('data-delay'));
        rotate.push($(this).attr('data-rotate'));
          flip.push($(this).attr('data-flip'));
        colors.push($(this).attr('data-color'));
      });
      if(items.length<=0 || delays.length<=0) return;
      $('#generated').gifAnimator({animationData:{images:items,delays:delays,rotations:rotate,flips:flip,colors:colors}});
    });
    
  }; // end if(canvas supported)

  $('#nextButton,#prevButton').on('click', function() {
    if(!$('#render img').length || !window.loops) {
      $('#factory').popText("You must add an image first :-)");
      return false;
    }
    $('#render img').trigger('clear');
    switch(this.id) {
      case 'nextButton':
          if(window.loops.numberOfItems.render > window.loops.currentItems.render+1) {
            var targetItem = window.loops.currentItems.render+1;
          } else {
            var targetItem = 0;
          }
      break;
      case 'prevButton':
          if(window.loops.currentItems.render>0) {
            var targetItem = window.loops.currentItems.render-1;
          } else {
            var targetItem = window.loops.numberOfItems.render -1;
          }
      break;
      default:
         return false;
    }
    $('#render img').hide().eq(targetItem).show();
    $('#output').scrollLeft(targetItem*40);
    window.loops.currentItems.render = targetItem;
    updateStats();
    updateBgPos();
    updateFrameCount();
  });

  $('#resetButton').on('click', function() {
    if(!$('#render img').length) {
      $('#factory').popText("You must add an image first :-)");
      return false;
    }
    try {
      if(window.loops.isLooping.render) {
        $('#playPauseButton').click();
      }
    } catch(e) { ; }
    $('#render img').trigger('clear');
    $('#render,#stats').empty();
    $('#output img').each(function() { $(this).remove(); });
    $('#animDuration').html( animDuration() );
    window.loops = false;
    resetBgPos();
    updateStats();
    updateFrameCount();
    return false;
  });

  $('#deleteButton').on('click', function() {
    if(!$('#render img').length) {
      $('#factory').popText("You must add an image first :-)");
      return false;
    }
    $('#render img').trigger('clear');
    if(window.loops.numberOfItems.render>0) {
      window.loops.items.render.splice( window.loops.currentItems.render, 1 );
      $('#output img').eq(window.loops.currentItems.render).remove();
      $('#render img').eq(window.loops.currentItems.render).remove();

      window.loops.numberOfItems.render--;
      if(window.loops.currentItems.render==window.loops.numberOfItems.render && window.loops.currentItems.render!=0) {
        window.loops.currentItems.render--;
      }

      $('#render img').eq(window.loops.currentItems.render).show();
      $('#output').scrollLeft(window.loops.currentItems.render*40);
    }
    updateStats();
    updateBgPos();
    updateFrameCount();
    $('#animDuration').html( animDuration() );
  });

  $('#playPauseButton').on('click', function() {
    if(!$('#render img').length) {
      $('#factory').popText("You must add an image first :-)");
      return false;
    }
    $('#render img').trigger('clear');
    try {
      if(window.loops.isLooping.render) {
        $(this).removeClass('pause').addClass('play');
        resetBgPos();
      } else {
        $(this).removeClass('play').addClass('pause');
      }
    } catch(e) { ; }
    $('#render').loopContainer();
    $('#animDuration').html( animDuration() );
    return false;
  });

  $('#homeButton').on('click', function() {
    $('#render img').trigger('clear');
    if( $('body').attr('sheeps-loaded')!='true' ) {
      $.getScript('/sheep.php/jquery.sheep.js', function() {
        setTimeout(function() {
          //$.fn.sheep();
          $('body').attr('sheeps-loaded', 'true');
          $('#homeButton').trigger('sheepSpawn');
        }, 200);
      });
    } else {
      $('#homeButton').trigger('sheepSpawn');
    }
  });

  $('#homeButton').on('sheepSpawn', function() {
      $('div.sheep').remove();
      var sheepId;
      if( $('#generated img').length==1) {

        sheepId = 'generated-' + uniqId();

        window.sheeps = window.sheeps || {
          index : [],
          sound : 'off',
          sheepCount : [],
          allSheepIDs : [],
          imgDataPrefix: "data:image/gif;base64,",
          transform:$.fn.sheep.detectTransform2d(),
          transformOrigin : $.fn.sheep.detectTransformOrigin()
        };
        window.sheeps.imgData = window.sheeps.imgData || {};
        //$.fn.sheep.checkSounds();
        //$.fn.sheep.checkAudio();
       
        window.sheeps.imgData[sheepId] = {
          data:$('#generated img').attr("src").split('data:image/gif;base64,')[1],
          duration:0- -$('#generated img').attr("data-duration") ,
          width:40,
          height:40
        }
        $.fn.sheep.initSheeps();
        
        $('#factory').sheep({sheepType:sheepId});
      } else {
        $('#factory').sheep();
      };
  });







  
  if(!$.supports('transform')) {
    $('#factory').popText("2D Transforms not supported, some features will be disabled.");
    $('#flipHButton,#flipVButton,#rotate90Button').hide();
  } else {
    $('#rotate90Button').on('click', function() {
      if(!$('#render img').length) {
        $('#factory').popText("You must add an image first :-)");
        return false;
      }
      $('#render img').trigger('clear');
      var       className = "",
          removeClassName = "",
               dataRotate = $('#output img').eq(window.loops.currentItems.render).attr('data-rotate'),
            newDataRotate = "";
      switch( dataRotate ) {
        case '':
        case '0':
          newDataRotate = "90";
          className = "rotate90";
          removeClassName = "";
          // rotate 90
        break;
        case '90':
          className = "rotate180";
          newDataRotate = "180";
          removeClassName = "rotate90";
          // rotate 180
        break;
        case '180':
          className = "rotate270";
          newDataRotate = "270";
          removeClassName = "rotate180";
          // rotate 270
        break;
        case '270':
          className = "";
          newDataRotate = "";
          removeClassName = "rotate270";
          // rotate 0
        break;
        default:
          // duh !
      }

      $('#output img').eq(window.loops.currentItems.render).attr("data-rotate", newDataRotate).css({padding:0}).removeClass(removeClassName).addClass(className);
      $('#render img').eq(window.loops.currentItems.render).attr("data-rotate", newDataRotate).removeClass(removeClassName).addClass(className);
    });

    $('#flipHButton').on('click', function() {
      if(!$('#render img').length) {
        $('#factory').popText("You must add an image first :-)");
        return false;
      }
      $('#render img').trigger('clear');
      var       className = "",
          removeClassName = "",
                 dataFlip = $('#output img').eq(window.loops.currentItems.render).attr('data-flip'),
              newDataFlip = "";
      switch( dataFlip ) {
        case 'h':
          newDataFlip = "";
          className = "";
          removeClassName = "flipH";
        break;
        case 'vh':
          newDataFlip = "v";
          className = "flipV";
          removeClassName = "flipH";
        break;
        case 'v':
          newDataFlip = "vh";
          className = "flipH flipV";
          removeClassName = "";
        break;
        default:
          newDataFlip = "h";
          className = "flipH";
          removeClassName = "";
        break;
      }
      $('#output img').eq(window.loops.currentItems.render).attr("data-flip", newDataFlip).css({padding:0}).removeClass(removeClassName).addClass(className);
      $('#render img').eq(window.loops.currentItems.render).attr("data-flip", newDataFlip).removeClass(removeClassName).addClass(className);
    });

    $('#flipVButton').on('click', function() {
      if(!$('#render img').length) {
        $('#factory').popText("You must add an image first :-)");
        return false;
      }
      $('#render img').trigger('clear');
      var       className = "",
          removeClassName = "";
                 dataFlip = $('#output img').eq(window.loops.currentItems.render).attr('data-flip'),
              newDataFlip = "";
      switch( dataFlip ) {
        case 'h':
          newDataFlip = "vh";
          className = "flipV flipH";
          removeClassName = "";
        break;
        case 'vh':
          newDataFlip = "h";
          className = "flipH";
          removeClassName = "flipV";
        break;
        case 'v':
          newDataFlip = "";
          className = "";
          removeClassName = "flipV";
        break;
        default:
          newDataFlip = "v";
          className = "flipV";
          removeClassName = "";
        break;
      }
      $('#output img').eq(window.loops.currentItems.render).attr("data-flip", newDataFlip).css({padding:0}).removeClass(removeClassName).addClass(className);
      $('#render img').eq(window.loops.currentItems.render).attr("data-flip", newDataFlip).removeClass(removeClassName).addClass(className);
    });

  }
  
  /* imgur share+gallery button */
  $('#saveAnimationButton').parent().show();
  $('#saveAnimationButton').show();
  $('<div id="uploadProgressHolder"></div>').appendTo('#factory');
  $('<div id="uploadProgressBox"></div>').appendTo('#uploadProgressHolder');
  $('<div id="uploadProgressMessage"></div>').appendTo('#uploadProgressBox');
  $('<div id="uploadImageBox"></div>').appendTo('#uploadProgressHolder');
  $('<div id="uploadImage"></div>').appendTo('#uploadImageBox');
  $('<div id="uploadUrl"></div>').appendTo('#uploadImageBox');
  $('<div id="okButton"></div>').appendTo('#uploadProgressHolder');
  $('<button id="forOkButton">ok</button>').on('click', function() { $('#uploadProgressHolder,#sheepStockOverlay').hide(); } ).appendTo('#okButton');
  $('<div id="sheepStockOverlay"></div>').css({display:'none'}).appendTo( $('#sheepStock') );
  $('#saveAnimationButton').on('click', function() {
    $('#render img').trigger('clear');
    var img = $('#generated img');
    if(!img.length) {
      $('#factory').popText("You must convert animation to GIF before sharing");
      return false;
    }
    img = img.attr('src');
    shareDataUri(img);
  });

  // prevent location.hash to spam history
  $('.buttonHolder li a').on('click', function(evt) { evt.preventDefault(); });

  $('.noUiSlider').noUiSlider({
    handles:1,
    range: [50, 3500],
    start: [$.fn.loopContainer.defaultOptions.delay],
    step: 50,
    slide: function(){
        $('#render img').trigger('clear');
        var $thisVal = $(this).val(),
            $thisImages = $('#renderHolder img, #output img');
        if($.supports('boxShadow')) {
          var boxShadow = Math.round( ( ( 3500 / ($(this).val() + 1750) )*6 ) -7)+"px 1px 2px";
          $('.noUiSlider.horizontal div').css({
            boxShadow:boxShadow
          });
        }
        $('#delayHolder').html($thisVal);
        $.fn.loopContainer.defaultOptions.delay = $thisVal;
        $thisImages.attr('data-delay', parseInt($thisVal));
        $('#animDuration').html( animDuration() );
        updateStats();
    }
  });

  $('#delayHolder').html($.fn.loopContainer.defaultOptions.delay);
  $('#animDuration').html( animDuration() );
  $('#factory').mousewheel(function(event, delta) {
      $('#render img').trigger('clear');
      event.preventDefault();
      (delta<0) ? $('#nextButton').click() : $('#prevButton').click();
  });

  //$('<div id="gifLoader" class="ajax-loader"></div>').appendTo('#sheepStock');
  
  var img = new Image;

  $.fn.gifAnimator(false, function() {
    
    img.onload = function() {
      //$('#gifLoader').html('Sprite Loaded');
      var x = 0;
      var y = 0;
      var out = {};
      var prefix = 'data:image/gif;base64,';

      for(y=40;y<480;y=y+40) {
        out[y] = {};
        for(x=0;x<640;x=x+40) {
          //$('#gifLoader').html('Cutting image at '+x+', '+y);
          out[y][x] = getImageAt(x,y,40,40);
          $('#sheepStock').append('<img class="sheepFrame" height="40" width="40" src="'+prefix+out[y][x]+'" />');
        }
      }
      //$('#gifLoader').html('Preparing images');
      
      $('.sheepFrame').hoverUnZoom({always:true}).on('click', function() {
        var imgSrc = $(this).attr('data-src'),
            uid = uniqId(),
            imgHtml = '<img src="'+imgSrc+'" data-delay="'+$.fn.loopContainer.defaultOptions.delay+'" data-flip="" data-rotate="" data-id="'+ uid +'">',
            $thisPos      = $(this).offset(),
            $targetPos    = $('#render').offset();

        if(!window.loops){
          $.fn.loopContainer();
          window.loops.items.render = [];
          window.loops.numberOfItems.render = 0;
          window.loops.currentItems.render = 0;
        }

        window.loops.items.render.splice(
          window.loops.currentItems.render,
          0,
          {
          id:uid,
          delay:function() { return $('[data-id="'+uid+'"]').attr('data-delay') || $.fn.loopContainer.defaultOptions.delay; }
        });
        $('#render img').hide();
        if(window.loops.currentItems.render>=0 && window.loops.numberOfItems.render>0) {
          $( imgHtml ).insertAfter( $('#output img').eq(window.loops.currentItems.render) );
          $( imgHtml ).css({
            position:'absolute',
            left:$thisPos.left-$targetPos.left,
              top:$thisPos.top-$targetPos.top
          }).insertAfter( $('#render img').eq(window.loops.currentItems.render) ).animate({
            left:0,
            top:0
          }, 500);
        } else {
          $( imgHtml ).insertBefore( $('#spacer') );
          $( imgHtml ).css({
            position:'absolute',
            left:$thisPos.left-$targetPos.left,
              top:$thisPos.top-$targetPos.top
          }).appendTo('#render').animate({
            left:0,
            top:0
          }, 500);
        }
        window.loops.numberOfItems.render++;
        $('#nextButton').click();
        $('#animDuration').html( animDuration() );
      });

      //$('#gifLoader').animate({opacity:0}, 1500, function() { $(this).remove()});
      
    };

    //$('#gifLoader').html('Loading Sprite');
    img.src = "/img/sheepFactory/StraySheepPoe.trans.gif";

  });
  


  function getImageAt(x, y, w, h) {
    var encoder = new GIFEncoder();
    encoder.setQuality(2);
    if(!encoder.start()) {
      //console.log('encoder failed to start');
      $('#factory').popText("GIF Encoder failed to start, operation aborted.");
      return false;
    }
    encoder.setTransparent(0x0000ff);
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(0,0,255)';
    ctx.fillRect(0,0, w, h);
    ctx.translate(-x,-y);
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = imageData.data;
    ctx.putImageData(imageData, 0, 0);
    if(!encoder.addFrame(ctx)) {
      $('#factory').popText("GIF Encoder refused ton add image chunk (scanning out of bounds?)");
      // console.log('duh !');
    }
    encoder.finish();
    return encode64(encoder.stream().getData());
  }

  
});

