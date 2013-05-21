/********************************

    jQuery loopContainer
    another plugin brought
    to you by tobozo
    copyleft (c+) 2013
    twitter : @TobozoTagada

    Generates a looped animation from a collection of images found in a specific container.
    Has control on the delay between images, per-image or globally.
    Can build an animated GIF from the animation scenario.
    Applies to GIF images only, and all images must have identical size.
    Requires a modern browser (IE10+, FF20+)

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
  
  $.fn.loopContainer = function(options) {
    options = $.extend({}, $.fn.loopContainer.defaultOptions, options);
    if(!window.loops || options.reset) {
      window.loops = {
        items:{},
        isLooping:{},
        timers:{},
        currentItems:{},
        numberOfItems:{},
        itemIntervals:{}
      }

      window.setVariableInterval = function(callbackFunc, timing) {
        var variableInterval = {
          interval: timing,
          callback: callbackFunc,
          stopped: false,
          runLoop: function() {
            if (variableInterval.stopped) return;
            var result = variableInterval.callback.call(variableInterval);
            if (typeof result == 'number')
            {
              if (result === 0) return;
              variableInterval.interval = result;
            }
            variableInterval.loop();
          },
          stop: function() {
            this.stopped = true;
            window.clearTimeout(this.timeout);
          },
          start: function() {
            this.stopped = false;
            return this.loop();
          },
          loop: function() {
            this.timeout = window.setTimeout(this.runLoop, this.interval);
            return this;
          }
        };

        return variableInterval.start();
      };
      
    }
    if(!this.length) return;
    this.each(function() {
        var element = $(this);
        $.fn.loopContainer.loop( element, options.infinite, options.delay );
    });
    return this;
  };
  $.fn.loopContainer.defaultOptions = {
    what      : 'img', // what to loop inside the container
    delay     : '200', // 200ms default delay between animations
    infinite  : true
  };
  $.fn.loopContainer.loop = function(element, boolLoop, delay) {
    var elemId = $(element).attr('id') || ('loop'+uniqId());
    if(!window.loops.isLooping[elemId]) {
      window.loops.isLooping[elemId] = true;
      //window.loops.currentItems[elemId] = 0;
    } else {
      window.loops.timers[elemId].stop();
      //clearInterval(window.loops.timers[elemId]);
      window.loops.isLooping[elemId] = false;
      return;
    }
    // get sub elements
    var elements = $(element).find($.fn.loopContainer.defaultOptions.what);

    if(!elements.length) {
      window.loops.isLooping[elemId] = false;
      resetBgPos();
      updateStats();
      updateFrameCount();
      return;
    }
    //set current item
    var currentItem = window.loops.currentItems[elemId];

    //interval between items (in milliseconds)
    window.loops.itemIntervals[elemId] = $(elements).eq(currentItem).attr('data-delay') || delay;

    //count number of items
    var numberOfItems = $(elements).length;
    window.loops.numberOfItems[elemId] = numberOfItems;

    // infinite or single loop
    var doLoop = boolLoop;

    //show first item
    $(elements).hide();
    $(elements).eq(currentItem).show();

    window.loops.timers[elemId] = setVariableInterval(function(){
        var currentItem = window.loops.currentItems[elemId];
        $(elements).eq(currentItem).hide();
        if(currentItem == numberOfItems -1){
          currentItem = 0;
          if(!doLoop) {
            window.loops.timers[elemId].stop();
            $(elements).eq(numberOfItems -1).show();
            updateStats();
            updateBgPos();
            updateFrameCount();
            return;
          }
        }else{
          currentItem++;
        }
        $(elements).eq(currentItem).show();
        window.loops.itemIntervals[elemId] = $(elements).eq(currentItem).attr('data-delay') || $.fn.loopContainer.defaultOptions.delay;
        window.loops.timers[elemId].interval = window.loops.itemIntervals[elemId];
        $('#output').scrollLeft(currentItem*40);
        window.loops.currentItems[elemId] = currentItem;
        updateStats();
        updateBgPos();
        updateFrameCount();
    }, window.loops.itemIntervals[elemId]);
  };
  
})(jQuery);


  function uniqId() {
    if(!window.uniqueID) {
      window.uniqueID = 1;
    } else {
      window.uniqueID++;
    }
    return window.uniqueID;
  }

  function updateStats() {
    try {
      var framepos = window.loops.currentItems.render;
      var delay = $('#output img').eq(framepos).attr("data-delay"); // window.loops.items.render[window.loops.currentItems.render].delay();
      var uid   = $('#output img').eq(framepos).attr("data-id"); // window.loops.items.render[window.loops.currentItems.render].id;
      var color = $('#render img').eq(framepos).attr("data-color") || '[not set]';
    } catch(e) {
      $('#stats').html('');
      return;
    }
    $('#stats').html(
      'Delay: <span class="delay" onclick="setDelay('+uid+')">' + delay +'</span><br>'
      + 'Position: ' + framepos
      +'<br>'
      + 'ID: <span class="uid">' + uid + '</span>'
      + '<div class="colorPaletteIconStats" onclick="setPalette()" title="Pick a different color for transparency"></div>'
      + '<div class="colorPaletteColorBox" style="background-color:'+color+'"></div>'
      + '<div class="colorPaletteValueStats" onclick="setColorValue('+uid+')" title="Manually edit color for transparency">'+color+'</div>'
    );
  };

  function animDuration() {
    var duration = 0;
    $('#renderHolder img').each(function() {
      duration+=parseInt($(this).attr('data-delay'));
    });
    return duration;
  }

  function updateBgPos() {
    if(!$.support.BackgroundSize) { return; }
    try {
      var pos = 100 - Math.round( ( ( parseInt(window.loops.currentItems.render) + 1) / window.loops.numberOfItems.render ) * 20);
      $('#factory').css({
        backgroundSize:'110%',
        backgroundPosition:pos+'%'
      });
    }  catch(e) { ;  }
  }

  function updateFrameCount() {
    try {
      $('#outputHolderFrames').html('#' + window.loops.currentItems.render);
    } catch(e) {
      $('#outputHolderFrames').html('#0');
    }
  }

  function resetBgPos() {
    if(!$.support.BackgroundSize) { return; }
    $('#factory').css({
      backgroundSize:'100%',
      backgroundPosition:"center center"
    });
  }

  function setDelay(id) {
    if(loops.isLooping.render) {
      return false;
    }
    var newdelay;
    if(newdelay = prompt('New delay', $('.delay').html())) {
      $('[data-id="'+ id +'"]').attr("data-delay", newdelay);
      $('.delay').html(newdelay);
      $('#animDuration').html( animDuration() );
    }
  }

  function setPalette() {
    if(loops.isLooping.render) {
      return false;
    }
    $('#factory').trigger('colorset');
  }

  function setColorValue(id) {
    if(loops.isLooping.render) {
      return false;
    }
    $('#render img').trigger('clear');
    var newcolor;
    var oldcolor = $('.colorPaletteValueStats').html();
    if(newcolor = prompt('New color', oldcolor)) {
      if($.fn.gifAnimator.forceColorToHex(newcolor)!=null) {
        $('#render img').attr("data-color", newcolor);
        $('#output img').attr("data-color", newcolor);
        $('.colorPaletteValueStats').html(newcolor);
      } else {
        $('#factory').popText("Invalid color value (valid values are hex/rgb)");
      }
    }
  }



  function AddZero(num) {
    return (num >= 0 && num < 10) ? "0" + num : num + "";
  }

  (function (window) {
    'use strict';

    var $ = window.jQuery,
        supportCORS = (function () {
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new window.XMLHttpRequest();
                return (xhr.hasOwnProperty && xhr.hasOwnProperty('withCredentials'));
            }
        }()),
        dataType = supportCORS ? 'json' : 'jsonp';

    $.cors = function (url, fn) {

        if (url === undefined) {
            throw new Error('$.cors: url must be defined');
        }

        var options = {
            'type': 'GET',
            'dataType': dataType
        };

        if (typeof fn === 'function') {
            options.success = fn;
        }

        if (typeof url === 'string') {
            options.url = url;

        } else if (typeof url === 'object') {
            $.extend(options, url);
        }

        $.ajax(options);

        return this;
    };

  }(this));


  function shareDataUri(img){
      var clientId = 'e914d06a1155ff1',
           albumId = 'Vjs2A',
         albumHash = 'oPdso06NfhDHcfD';
    
      $('#uploadProgressHolder').show();
      $('#sheepStockOverlay').show();
      $('#uploadProgressMessage').removeClass();
      $('#uploadProgressMessage').html('Uploading...');
      
      // expecting base64 uri-encoded GIF files here anyway
      img = img.split('data:image/gif;base64,')[1];
      $('#uploadImage').html('<div class=loading></div>');

      $.ajaxSetup({
          beforeSend: function (request)  {
            $('#uploadProgressMessage').html('Contacting imgur.com');
            request.setRequestHeader("Authorization", 'Client-ID '+clientId);
          },
          complete: function(jqXHR, textStatus) {
            //$('#uploadProgressMessage').html('Sending Complete');
          }
      });

      var now = new Date();
      var strDateTime = [[AddZero(now.getFullYear()), AddZero(now.getMonth() + 1), now.getDate()].join("-"), 'at', [AddZero(now.getHours()), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");

      $.get('https://api.imgur.com/3/album/'+albumId, function(response) {
          var albumImages;
          
          try {
            response = $.parseJSON(response);
            // console.log("Album", response);
            // albumId = response.data.id;
            albumImages = response.data.images;
          } catch(e) {
            // duh !
            $('#uploadProgressMessage').addClass('error').html('Imgur album not found, trying orphaned submission...');
            albumHash = '';
          }
          
          $.post('https://api.imgur.com/3/upload.json', {
               type: 'base64',
               name: 'phpsecure.info-sheep-factory.php-sheep.gif',
              title: 'Contributed on ' + strDateTime,
            caption: 'Generated by the Sheep Factory http://phpsecure.info/sheep-factory.php on '+strDateTime,
              image: img,
              album: albumHash
          }).success(function(response) {
              try {
                response = $.parseJSON(response);
                $('#uploadProgressMessage').addClass('success').html('Uploaded with success');
              } catch(e) { 
                $('#uploadProgressMessage').addClass('error').html('Imgur upload succeeded but returned an invalid response.');
                $('#uploadImage').html('<a href="http://imgur.com/a/'+albumId+'">View the album</a>');
                return;
              }
              // console.log(response);
              // response.data.id
              // response.data.deletehash
              $('#uploadImage').html('<img src="'+response.data.link+'" />');
              $('#uploadUrl').html('<input id="sheep-imgur-url" value="'+response.data.link+'" />');
              $('#sheep-imgur-url').on('focus blur click', function() { $(this).select(); });
          }).error(function(e,f,g) {
              $('#uploadProgressMessage').addClass('error').html('Could not reach api.imgur.com. Sorry :(');
          });
         
      }).error(function() {
          $.post('https://api.imgur.com/3/album/', {
               type: 'base64',
               name: 'phpsecure.info-sheep-factory.php-sheep.gif',
              title: 'Contributed on ' + strDateTime,
            caption: 'Generated by the Sheep Factory http://phpsecure.info/sheep-factory.php '+strDateTime,
              image: img,
              album: albumHash
          }).success(function(response) {
             // console.log('response ', response);
          })
      });

      return false;

  }