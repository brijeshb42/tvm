(function($){

	$.extend({
		console: function(options){
			var cls = "confirmDialog";
			var defaults = {
				heading: "Please wait...",
				message: "Default message",
				type: "",
				overlay: true,
				closeText: "Close",
				onclose: null
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
				$box.fadeOut(300,function(){
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
			$box.appendTo('body').fadeIn(300);
		}
	});

})(jQuery);