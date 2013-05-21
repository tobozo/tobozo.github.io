  /********************************

    jQuery Color Picker
    another plugin brought
    to you by tobozo
    copyleft (c+) 2013
    twitter : @TobozoTagada

    Creates a color picker on a given image.
    The color picker returns the pixel color value under the cursor.
    The color can also be picked from the palette built from the image.
    
    Applies to    : static <img> tag only
    Limitations   : medium and small image (use at your own risk)
    Works with    : src, data-uri
    Requires      : canvas support
    Usage example :

    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>jquery.colorpicker.js example</title>
      <style type="text/css">
        .colorPaletteIcon { opacity:0.5; }
        .colorPaletteIcon:hover { opacity:1; }
        .colorPaletteIcon {
          background-image:url("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgEIBwEBCgkLDQoDDQwMARsIFRAWFB0WIiAdHx8kHCgsJCYxJxMfLT0tMSk3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIABAAEAMBEQACEQEDEQH/xAAWAAEBAQAAAAAAAAAAAAAAAAAFBgT/xAApEAABAwIDBwUBAAAAAAAAAAACAQMEBREGEiEHCBMjMUJRCRUWIjIU/8QAGAEAAgMAAAAAAAAAAAAAAAAAAgMBBAX/xAAnEQABAwMCBAcAAAAAAAAAAAABAgMRAARBITESUYHBBRMiIzJhkf/aAAwDAQACEQMRAD8ApmHG2Hdojsranu3BECn0+oi2W6DxibI0jXJS4C5rqZdy/rpppVULp99TNsocWAek45TTxe+GNtJS4k8aflvEaxn7TSkeoUV6bhaJDxFslOc2lHr6i3uyLFVBcON9kLhimqOppfu6eCatPE2ni5cKHlxEDfiETjaQrNJU/buaNDXfpjtRA+6m1jBk8V7SG45wYFEaZP0jHpStuNpHzZlWIWZOWfcqap4S2kwbdtYcj1ZI0P7M8qBDbJX7qZGdK2Qm3fc8IH8SxQamlGo2YfSudp5XaOLmVT/mCw8olspWRLaaJYXXSuRJiSd6gobCyUCB2r//2Q==");
          background-position:left top; background-repeat:no-repeat;
          width:15px; height:15px; position:absolute; display:block;
          content:" "; float:left;
        }
      </style>
      <script type="text/javascript">
      //<![CDATA[
      (window.jQuery)||document.write('<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js"><\/script>');
      //]]>
      </script>
      <script type="text/javascript" src="/js/jquery/colorpicker.js"></script>
      <script type="text/javascript">
       $(document).ready(function() {
         
        $('#img').colorPicker({
          startpicking:false, // initiate color picking mode, don't wait for user prompt
          dropafteruse:false, // use and detach
          palette:true, // build and enable palette picker
          oncolorchange:function() {
            // this is fired when a color is picked
            console.log(this.color); // html hex color
            $('#img').css({border:'2px solid '+color});
          }
        });
        // disable/cleanup color picker
        // $('#img').trigger('clear');
        
       });
      </script>
    </head>
    <body>
      <img id="img" src="/img/lolcat.gif" />
      <div id="result" style="display:none"></div>
    </body>
    </html>

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

      $.fn.colorPicker = function(options) {
        if(!options) {
          options = {
            palette:false, // build and enable palette picker
            dropafteruse:false, // use and detach
            startpicking:false, // initiate color picking mode, don't wait for user prompt
            oncolorchange: function() {
                $('#result').css({borderRightColor:color}).html(color).show();
            }
          }
        }
        this.each(function() {
          var element = $(this);
          $.fn.colorPicker.addPicker(element, options);
        });
        return this;
      };



      $.fn.colorPicker.pickerReady = function(element) {
        var $colorPaletteIcon = element.data('color-palette-icon');
        $(element).on('mouseenter', function() {
          $colorPaletteIcon.show();
        });
        $colorPaletteIcon.on('mouseleave', function(event) {
          $(this).hide();
        })
      };



      $.fn.colorPicker.pickerHide = function(element, options) {
        var $colorPalette = element.data('color-palette');
        var $colorPaletteIcon = element.data('color-palette-icon');
        $colorPalette.remove();
        $colorPaletteIcon.remove();
        element.off().css({outline:element.data('outline-style'),cursor:'auto'});
      };



      $.fn.colorPicker.loadPalette = function(element, options) {
        var img = new Image();
        img.onload = function(){

          var canvas = document.createElement('canvas');
          canvas.width  = this.width;
          canvas.height = this.height;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img,0,0);

          // only parse pixels if the image is small
          if( (this.width*this.height) > 100*100) {
            // TODO : read color palette from file header using file api
            return false;
          }
          window.colormatrix = {};
          var matrixsize = 0;

          for(var x=0;x<this.width;x++) {
            for(var y=0;y<this.height;y++) {
              // give up if more than 256 colors found
              // TODO : use true color palette plugin
              if(matrixsize>256) return false;
              
              var imgd = ctx.getImageData(x, y, 1, 1);
              var data = imgd.data;
              var hexString = RGBtoHex(data[0],data[1],data[2]);
              if(!colormatrix[hexString]) {
                matrixsize++;
                colormatrix[hexString] = {
                  r:data[0],
                  g:data[1],
                  b:data[2]
                }
              }
            }
          }
          element.data('colorpalette', colormatrix);
          element.data('colorpalettesize', matrixsize);

          element.on('colorpalette', function() {
            var sq = Math.ceil(Math.sqrt(matrixsize));
            var wh = Math.floor( 1 / sq *100 ); // color swatch size depends on palette size
            var $colorPalette = element.data('color-palette');
            var $colorPaletteIcon = element.data('color-palette-icon');
            $colorPalette.empty().css({
              left:$(element).offset().left + $(element).width() +2,
              top: $(element).offset().top,
              display:'none',
              width:$(element).width()/2,
              height:$(element).width()/2,
              position:'absolute'
            }).appendTo('body');

            for(color in colormatrix) {
              $('<div class="colorSwatch"></div>').css({
                  backgroundColor:'#' + color,
                  width:wh+'%',
                  height:wh+'%',
                  float:'left'
              }).data('color', '#'+color)
                .attr("title", '#'+color)
                .appendTo($colorPalette);
            }
            $('.colorSwatch').off().on('click', function() {
                var color = $(this).data('color');
                if(options.oncolorchange) {
                  options.oncolorchange.call({color:color});
                } else {
                  $('#result').css({borderRightColor:color}).html(color).show();
                }
                element.off().css({outline:element.data('outline-style'),cursor:'auto'});
                $(this).parent().remove();
                if(options.dropafteruse) {
                  $colorPaletteIcon.remove();
                } else {
                  $.fn.colorPicker.pickerReady(element);
                }
            });
            $colorPalette.show();
          });
          if(options.startpicking) {
            element.trigger('colorpalette');
          }
        }
        img.src = element.attr("src");
      };



      $.fn.colorPicker.addPicker = function(element, options) {
        var $colorPalette = $('<div class="colorPalette"></div>');
        var $colorPaletteIcon = $('<div class="colorPaletteIcon"></div>');
        $colorPaletteIcon.css({
          left:$(element).offset().left ,
          top: $(element).offset().top,
          display:'none',
          width:$(element).width(),
          height:$(element).height()
        }).appendTo('body');

        element.data('color-palette-icon', $colorPaletteIcon);
        element.data('outline-style', element.css('outline'));

        $.fn.colorPicker.pickerReady(element);

        $colorPaletteIcon.on('click', function() {
          // hide color palette icon
          $(this).hide();
          //  start picking
          element.css({cursor:'crosshair'});
          if(options.palette) {
            $colorPalette.empty();
            element.data('color-palette', $colorPalette);
            $.fn.colorPicker.loadPalette(element, options);
          }
          // start mouseover capture
          var img = new Image();
          img.onload = function(){
            // disable any other event capture until a color is clicked
            if(options.palette) {
              element.trigger("colorpalette");
            }
            element.off();

            $(element).on('clear', function() {
              $.fn.colorPicker.pickerHide( element );
            })
            // TODO highlight element

            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img,0,0);

            element.on('click mouseover mousemove', function(event){
              var x = event.pageX - $(this).offset().left;
              var y = event.pageY - $(this).offset().top;
              var imgd = ctx.getImageData(x, y, 1, 1);
              var data = imgd.data;
              var hexString = RGBtoHex(data[0],data[1],data[2]);
              if(event.type=='click') {
                // end mouseover capture
                if(options.oncolorchange) {
                  options.oncolorchange.call({color:'#' + hexString});
                } else {
                  $('#result').css({borderRightColor:'#' + hexString}).html('#' + hexString).show();
                }
                element.off().css({outline:element.data('outline-style'),cursor:'auto'});
                $colorPalette.off().remove();
                if(options.dropafteruse) {
                  $colorPaletteIcon.off().remove();
                } else {
                  $colorPalette.hide();
                  $.fn.colorPicker.pickerReady(element);
                }
              } else {
                element.css({outline:'2px solid #'+hexString})
              }
            });
          }
          img.src = element.attr("src");

        });

        // bind custom event to image to allow remote trigger
        $(element).on('startpalette', function() {
          $colorPaletteIcon.click();
        });

        if(options.startpicking) {
          $colorPaletteIcon.click();
        }

      };

      //from http://www.linuxtopia.org/online_books/javascript_guides/javascript_faq/rgbtohex.htm
      function RGBtoHex(R,G,B) { return toHex(R)+toHex(G)+toHex(B); }
      function toHex(N) {
            if (N==null) return "00";
            N=parseInt(N); if (N==0 || isNaN(N)) return "00";
            N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
            return "0123456789ABCDEF".charAt((N-N%16)/16)
                + "0123456789ABCDEF".charAt(N%16);
      }

})(jQuery);