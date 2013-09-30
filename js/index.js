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
    $scope.navItems = [{href:"#todayList",title:"Recent"},
                       {href:"#addShow",title:"Add Shows"},
                       {href:"#showList",title:"All Shows"}];
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
        console.log(d);
        $http({method: 'GET',url:urls.proxy+urls.api+urls.id+"/series/"+d.showid+"/all/en.xml"}).
            success(function(data,status,header,config){
                var show = {};
                $(data).find("Series").each(function(){
                    show.showid = $(this).find("id").text();
                    show.poster = $(this).find("poster").text();
                    show.name = $(this).find("SeriesName").text();
                });
                var episodes = [];
                $(data).find("Episode").each(function(){
                    var epi = {};
                    epi.name = $(this).find("EpisodeName").text();
                    epi.showname = show.name;
                    epi.showid = $(this).find("seriesid").text();
                    epi.episodeID = $(this).find("id").text();
                    epi.overview = $(this).find("Overview").text();
                    epi.guestStars = $(this).find("GuestStars").text();
                    epi.airdate = $(this).find("FirstAired").text();
                    epi.season = $(this).find("SeasonNumber").text();
                    epi.episode = $(this).find("EpisodeNumber").text();
                    epi.lastUpdated = $(this).find("lastupdated").text();
                    episodes.push(epi);
                });
                //console.log(episodes);
                tv.indexedDB.addEpisodes(episodes,show);
            }).
            error(function(data,status,header,config){
                $scope.msg = "There was an error while downloading episode list.";
                $scope.class = "error";
            });
        /*var u = urls.proxy+urls.banner+show.poster;
        var img = new Image();
        img.addEventListener("load",function(e){
            //window.removeEventListener("beforeunload",tv.network.progressError,false);
            var dataUrl = tv.ui.getDataUrl(img);
            var s = {};
            s.showid = show.showid;
            s.poster = dataUrl;
            tv.indexedDB.savePoster(s);
        });
        img.src = u;*/
    };
}

function ShowListController($scope){
    $scope.shows = [];
}

function UpcomingController($scope){
    $scope.shows = [{showname:"Loading..."}];
}
