/*
Created by brijeshb42 for TV Show Manager chrome app.

HTML scaffolding for creating custom confirm box.

		<div class="confirmDialog">
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
		confirm: function(options){
			var cls = 'confirmDialog';
			var defaults = {
				message: "Are you sure?",
				okText: "OK",
				cancelText: "Cancel",
				overlay: true,
				onconfirm: null,
				oncancel: null
			};

			var options = $.extend(defaults,options);

			$(document).bind("keydown",function(e){
				if(e.keyCode==27){
					dialogClosed();
				}
			});

			function dialogClosed(callback){
				if(callback){
					callback();
				}				
				$box.fadeOut(300,function(){
					$(this).remove();
				});
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
			$message.html(options.message);
			$footer = $('<div></div>').addClass('footer');
			$controls = $('<div></div>').addClass('controls');
			
			$okBtn = $('<button></button>').addClass('ok').html(options.okText);
			$okBtn.click(function(){
				dialogClosed(options.onconfirm);
			});

			$cancelBtn = $('<button></button>').addClass('error').html(options.cancelText);
			$cancelBtn.click(function(){
				dialogClosed(options.oncancel);
			});

			$controls.append($okBtn).append($cancelBtn).appendTo($footer);
			$content.append($message).append($footer).appendTo($box);
			$box.fadeIn(300);
		}
	});

})(jQuery);