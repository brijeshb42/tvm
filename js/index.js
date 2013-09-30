urls = {
    proxy : "http://b2-apps.appspot.com/",
    api : "www.thetvdb.com/api/",
    id : "C973590B1E212580",
    banner : "www.thetvdb.com/banners/",
    search : "GetSeries.php",
    update : "https://dl.dropbox.com/u/51320501/tv-version.json",
    trakt : "http://api.trakt.tv/",
    trakt_api : "b3795664d41ef84ecdbf1dae6dfab099",
    img_url : "slurm.trakt.us/"
};

u = {
    search: urls.trakt+"search/shows.json/"+urls.trakt_api+"/",
    img: urls.proxy+urls.img_url,
    episode: urls.trakt+"show/season.json/"+urls.trakt_api+"/",
};

(function($){
    $(window).load(function(){
    	$('a').on("click",function(){
    		return false;
    	});
    	$("#content").slimscroll({
    		height: "475px",
    		railVisible: true
    	});
        tv.indexedDB.open();
    });
})(jQuery);

function NavController($scope){
    $scope.selectedNav = 0;
    $scope.navItems = [{href:"#todayList",title:"Today"},
                       {href:"#addShow",title:"Add Shows"},
                       {href:"#showList",title:"Shows List"}];
    $scope.changeView = function(index){
        $scope.selectedNav = index;
        if($scope.selectedNav==1){
        }
    }
}

function SearchShowsController($scope,$http){
    $scope.msg = "";
    $scope.class = "message";
    $scope.shows = [];
    $scope.isShown = false;
    $scope.getShows = function(){
        $scope.shows = [];
        if($scope.searchName==""){
            $scope.msg="Enter a show to search for.";
            $scope.class = "error";
            $scope.shows = [];
            $scope.isShown = false;
        }else{
            $scope.msg = "Searching for "+$scope.searchName;
            $scope.class = "message";
            $http({method: 'GET', url:u.search+$scope.searchName}).
                success(function(data,status,header,config){
                    $scope.msg = "";
                    $scope.isShown = true;
                    $scope.shows = data;
                }).
                error(function(data,status,header,config){
                    $scope.msg = "There was an error.";
                    $scope.class = "error";
                    $scope.isShown = false;
                    $scope.shows = [];
                });
        }
    };
    $scope.saveShow = function(index){
        var d = $scope.shows[index];
        d.showid = d.tvdb_id;
        delete d["tvdb_id"];
        tv.indexedDB.addShow(d);
    };
}

function ShowListController($scope){
    $scope.shows = [];
    /*var db = tv.indexedDB.db;
    var trans = db.transaction([DB_show],"readwrite");
    var store = trans.objectStore(DB_show);
    var request = store.count();
    request.onsuccess = function(e){
        if(request.result){
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            cursorRequest.onsuccess = function(e){
                var result = e.target.result;
                console.log(result);
                if(!!result == false)
                    return;
                $scope.shows = result.value;
                result.continue();
            }
            cursorRequest.onerror = function(e){
                console.log("Error during cursor");
            }
        }
        else{
            //tv.ui.renderShows(0);
            console.log("else");
        }
    };
    request.onerror = function(e){
        console.log("Error opening tv_shows");
        console.log(e);
    };*/
}
