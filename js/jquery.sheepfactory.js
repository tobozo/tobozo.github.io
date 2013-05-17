
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

  $('#toGifButton').on('click', function() {
    var items  = [],
        delays = [],
        rotate = [],
        flip   = [];
    $('#output img').each(function() {
       items.push($(this).attr('src'));
      delays.push($(this).attr('data-delay'));
      rotate.push($(this).attr('data-rotate'));
        flip.push($(this).attr('data-flip'));
    });
    if(items.length<=0 || delays.length<=0) return;

    try {
      $('#generated').gifAnimator({sheepData:{images:items,delays:delays,rotations:rotate,flips:flip}});
    } catch(e) {
      // use php as a fallback
      // WARNING : soon deprecated
      $.ajax({
        type:'POST',
        url:'?',
        data:{frames:items,framed:delays,rotate:rotate,flip:flip},
        dataType:'json',
        success:function(data) {
          if(data.data && data.duration) {
            $('#generated').empty();
            $('<img>').attr('src', 'data:image/gif;base64,'+data.data).attr("data-duration", data.duration).appendTo('#generated');
          }
        }
      });
    }
  });

  $('#nextButton,#prevButton').on('click', function() {
    if(!$('#render img').length) return false;
    if(!window.loops) return false;
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
    if(!$('#render img').length) return false;
    try {
      if(window.loops.isLooping.render) {
        $('#playPauseButton').click();
      }
    } catch(e) { ; }
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
    if(!$('#render img').length) return false;
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
    if(!$('#render img').length) return false;
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
    if(!window.sheeps) {
      $.getScript('/sheep.php/jquery.sheep.js', function() {
        setTimeout(function() {
          $('#homeButton').trigger('sheepSpawn');
        }, 200);
      });
    } else {
      $('#homeButton').trigger('sheepSpawn');
    }
  });

  $('#homeButton').on('sheepSpawn', function() {
      var sheepId;
      if( $('#generated img').length ) {
        sheepId = 'generated-' + uniqId();
        $.fn.sheep();
        window.sheeps.imgData[sheepId] = {
          data:$('#generated img').attr("src"),
          duration:parseInt( $('#generated img').attr("data-duration") ),
          width:40,
          height:40
        }
        $('#factory').sheep({sheepType:sheepId});
      } else {
        $('#factory').sheep();
      };
  });

  
  if(!$.supports('transform')) {
    $('#flipHButton,#flipVButton,#rotate90Button').hide();
  } else {
    $('#rotate90Button').on('click', function() {
      if(!$('#render img').length) return false;
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

    if($.support.localStorage) {
     
      $.getScript('/js/jquery.storage.js', function() {
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

          var img = $('#generated img');
          if(!img.length) return false;
          img = img.attr('src');
          shareDataUri(img);

        });
        
      });


    } else {
      try {
        console.log('no local storage');
      } catch(e) {
        
      }
    }


    
    $('#flipHButton').on('click', function() {
      if(!$('#render img').length) return false;
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
      if(!$('#render img').length) return false;
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

  // prevent location.hash to spam history
  $('.buttonHolder li a').on('click', function(evt) { evt.preventDefault(); });

  $('.noUiSlider').noUiSlider({
    handles:1,
    range: [50, 3500],
    start: [$.fn.loopContainer.defaultOptions.delay],
    step: 50,
    slide: function(){
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
      event.preventDefault();
      (delta<0) ? $('#nextButton').click() : $('#prevButton').click();
  });
  
});

