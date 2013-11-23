/*
Created by brijeshb42 for TV Show Manager chrome app.

HTML scaffolding for creating custom confirm box.

		<div class="promptDialog">
            <div class="overlay"></div>
            <div class="content">
                <div class="message">Are You sure?</div>
                <div class="footer">
                    <div class="controls">
                        <button class="ok">OK</button><button class="error">Cancel</button>
                    </div>
                </div>
            </div>
        </div>-->
*/


(function($){

	$.extend({
		prompt: function(options){
			var cls = 'promptDialog';
			var defaults = {
				message: "Enter Value",
				okText: "OK",
				cancelText: "Cancel",
				overlay: true,
				onconfirm: null,
				oncancel: null,
				time: 100
			};

			var options = $.extend(defaults,options);

			$(document).bind("keydown",function(e){
				if(e.keyCode==27){
					dialogClosed();
				}
			});

			function dialogClosed(callback){
				$box.fadeOut(options.time,function(){
					$(this).remove();
				});
				if(callback){
					callback($input.val());
				}
				$(document).unbind("keydown");
			}

			if($('.'+cls).length>0)
				$('.'+cls).remove();

			var $box = $('<div></div>');
			$box.addClass(cls).hide().appendTo($('body'));
			if(options.overlay){
				$overlay = $('<div></div>').addClass('overlay');
				$overlay.click(function(){
					dialogClosed();
				});
				$box.append($overlay);
			}
			$content = $('<div></div>').addClass('content');
			$message = $('<div></div>').addClass('message');
			$heading = $('<p></p>').addClass('heading').html(options.message);
			$message.append($heading);
			
			$input = $('<input type="text"/>').addClass('promptInput');
			$input.keyup(function(e){
				if(e.keyCode==13){
					if($input.val()=="")
						return;
					dialogClosed(options.onconfirm);
				}
			});
			$message.append($input);
			
			$footer = $('<div></div>').addClass('footer');
			$controls = $('<div></div>').addClass('controls');
			
			$okBtn = $('<button></button>').addClass('ok').html(options.okText);
			$okBtn.click(function(){
				if($input.val()=="")
					return;
				dialogClosed(options.onconfirm);
			});

			$cancelBtn = $('<button></button>').addClass('error').html(options.cancelText);
			$cancelBtn.click(function(){
				dialogClosed(options.oncancel);
			});

			$controls.append($okBtn).append($cancelBtn).appendTo($footer);
			$content.append($message).append($footer).appendTo($box);
			
			$box.fadeIn(options.time,function(){
				$input.focus();
			});
		}
	});

})(jQuery);