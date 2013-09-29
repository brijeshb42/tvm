(function($){
    $(window).load(function(){
    	$('a').on("click",function(){
    		return false;
    	});
    	$("#content").slimscroll({
    		height: "475px",
    		railVisible: true
    	});
    	$(".navLink").on("click",function(){
    		$(".navLink").each(function(index){
    			$($(this).attr("href")).hide();
    			$(this).parent().removeClass("active");
    		});
    		$($(this).attr("href")).show();
    		$(this).parent().addClass("active");
    		if($(this).attr("href")==="#addShow"){
    			$("#searchShow").focus();
    		}
    	});
    	$("form").submit(function(){
    		return false;
    	});
    });
})(jQuery);