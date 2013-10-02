(function($){
    $(window).load(function(){
    	$('a').on("click",function(){
    		return false;
    	});
    	$("#content").slimscroll({
    		height: "525px",
    		railVisible: true
    	});
    	tv.indexedDB.open("info");
    });

})(jQuery);

function ShowController($scope){
	$scope.show = SHOW;

	$scope.getStatus = function(st){
		return (st)?"Endend":"Continuing";
	};
}

function EpisodeController($scope){
	$scope.info = {};
}