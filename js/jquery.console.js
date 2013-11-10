/*
Created by brijeshb42 for TV Show Manager chrome app.

HTML scaffolding for creating custom confirm box.

		<div class="consoleDialog">
            <div class="overlay"></div>
            <div class="content">
                <div class="message">
                	<p class=heading></p>
                	<p class=console></p>
                	<p class=console success></p>
                	<p class=console error></p>
                	<!-- Any of the above four -->
                </div>
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
		console: function(options){
			var cls = "consoleDialog";
			var defaults = {
				heading: "Please wait...",
				message: "Default message",
				type: "",
				overlay: true,
				closeText: "Close",
				onclose: null,
				time: 100
			};

			var options = $.extend(defaults,options);

			if($('.'+cls).length==1){
				$p = $('<p></p>').addClass('console').addClass(options.type).html(options.message);
				$('.'+cls).find('.message').append($p);
				return;
			}

			function dialogClosed(callback){
				if(callback){
					callback();
				}				
				$box.fadeOut(options.time,function(){
					$(this).remove();
				});
			}

			if($('.'+cls).length>0)
				$('.'+cls).remove();

			var $box = $('<div></div>').addClass(cls).hide();

			if(options.overlay && options.overlay===true){
				$overlay = $('<div></div>').addClass('overlay');
				$box.append($overlay);
			}
			//.appendTo($('body'));
			$content = $('<div></div>').addClass('content');
			$message = $('<div></div>').addClass('message');
			$heading = $('<p></p>').addClass('heading').html(options.heading);
			$log = $('<p></p>').addClass('console').addClass(options.type).html(options.message);
			$message.append($heading).append($log);
			$footer = $('<div></div>').addClass('footer');
			$controls = $('<div></div>').addClass('controls');

			$cancelBtn = $('<button></button>').addClass('error').html(options.closeText);
			$cancelBtn.click(function(){
				dialogClosed(options.onclose);
			});
			$controls.append($cancelBtn).appendTo($footer);
			$content.append($message).append($footer).appendTo($box);
			$box.appendTo('body').fadeIn(options.time);
		}
	});

})(jQuery);