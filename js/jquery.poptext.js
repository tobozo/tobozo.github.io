
  /********************************

    jQuery PopText
    another plugin brought
    to you by tobozo
    copyleft (c+) 2013
    twitter : @TobozoTagada

    Pops a text message inside a given box using a zoom in + wait + zoom out effect
    Requires   : transform:scale(), transform-scale-origin and transition supports
    Usage      : $('#targetBox').popText( 'message or html' );

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
  

  $.fn.popText = function(message) {
    var elements = $(this);
    if($('body').attr('data-poptext-loaded')!='true') {
      // use the css3, luke !
      $('<style type="text/css"> '
        +'.messageBox { position:absolute; left:50%; top:50%; width:100%; margin-left:-50%; color:black; text-align:center; transform:scale(0.1); transition:all 0.3s ease-out; transform-origin: 50% 50%; font-size: 14px; font-weight: bold;  } '
        +'.messageBox.appearing { transform:scale(1); transition:all 0.7s ease-in; opacity:1; text-shadow:1px 1px 2px #858585, 1px -1px 2px #858585, -1px 1px 2px #a5a5a5, -1px -1px 2px #a5a5a5; } '
        +'.messageBox.appearing.appeared { transform:scale(8); opacity:0; } '
        +'</style>'
      ).appendTo('body');
      $('body').attr('data-poptext-loaded', 'true');
    }

    elements.each(function() {
      var $zoomHolder = $('<div style="position:absolute;";overflow:hidden;></div>');
      var $zoomSizer  = $('<div style="position:relative;width:100%;height:100%;overflow:hidden;"></div>');
      var $messageBox = $('<div class="messageBox">'+message+'</div>').css({opacity:0});
      $zoomSizer.appendTo( $zoomHolder );
      $zoomHolder.appendTo( $('body') );
      $zoomHolder.css({
        top: $(this).offset().top,
        left: $(this).offset().left,
        width: $(this).width(),
        height: $(this).height()
      });
      $messageBox.appendTo($zoomSizer)
        .animate({opacity:0.1}, 100, function() {
        $messageBox.css({opacity:1});
        $messageBox.addClass('appearing')
          .animate({color:'#000000'}, 1700, function() {
          $messageBox.css({opacity:0});
          $(this).addClass('appeared')
            .animate({color:'#ffffff'}, 1000, function() {
            $zoomHolder.remove();
          });
        });
      });
    })
    return this;
  }


})(jQuery);