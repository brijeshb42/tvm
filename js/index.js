function getImgId(url){
    var s = url.substring(url.lastIndexOf('/')+1,url.length);
    return s;
}

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
    $scope.navItems = [{href:"#todayList",title:"Latest"},
                       {href:"#addShow",title:"Add Shows"},
                       {href:"#showList",title:"All Shows"}];
    $scope.changeView = function(index){
        $scope.selectedNav = index;
        if($scope.selectedNav==1){
        }
    }
}

function SearchShowsController($scope,$http){
    $scope.epi = true;
    $scope.img = true;
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
                    $scope.msg = "There was an error. Try again.";
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
        if($scope.epi===false)
            return;
        $http({method: 'GET',url:urls.proxy+urls.api+urls.id+"/series/"+d.showid+"/all/en.xml"}).
            success(function(data,status,header,config){
                $.console({message:"Episode details downloaded."});
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
                tv.indexedDB.addEpisodes(episodes,show);
            }).
            error(function(data,status,header,config){
                $scope.msg = "There was an error while downloading episode list.";
                $scope.class = "error";
            });
        if($scope.img===false)
            return;
        var ur = urls.proxy+u.poster+getImgId(d.images.poster);
        //console.log(ur);
        tv.network.getPoster(d.showid,ur);
    };
}

function UpcomingController($scope){
    $scope.shows = [];
    $scope.info = "Loading shows...";
    $scope.noUpcoming = true;
    if($scope.shows.length>0)
        $scope.noUpcoming = false;
    else
        $scope.noUpcoming = true;

    $scope.formatDate = function(date){
        return tv.ui.formatDate(date);
    };

    $scope.dayType = function(date){
        var dt = tv.ui.getDate(0);
        var day = "";
        if(date<dt){
            return "yesterday";
        }else if(date==dt){
            return "today";
        }else if(date>dt){
            return "yet-to-come";
        }
    };
}

function ShowListController($scope){
    $scope.shows = [];
    $scope.info = "Loading shows...";
    $scope.noAdded = true;
    $scope.deletedIndex = null;

    if($scope.shows.length>0)
        $scope.noAdded = false;
    else
        $scope.noAdded = true;

    $scope.status = function(st){
        return (st)?"Ended":"Continuing";
    };

    $scope.deleteShow = function(index){
        $.confirm(
            {   message: "Do you want to delete "+$scope.shows[index].data.title+" ?",
                okText: "Yes",
                cancelText: "No",
                onconfirm:function(){
                    tv.indexedDB.deleteShowComplete($scope.shows[index].data.showid);
                }
            }
        );
    };

    $scope.showInfo = function(index){
        /*console.log("Info");
        chrome.app.window.create('../info.html',{
            bounds: {
                width: 450,
                height: 600
            },
            resizable: false
        },function(e){
            e.contentWindow.SHOW = $scope.shows[index];
        });*/
        var scope = angular.element($('body')).scope();
        scope.changeView(3);
        var scope2 = angular.element($("#showInfo")).scope();
        scope2.show = $scope.shows[index];
    };
}

function ShowInfoController($scope){
    $scope.show = {};

    $scope.getBack = function(){
        var scope = angular.element($('body')).scope();
        scope.changeView(2);
    };

    $scope.status = function(st){
        return (st)?"Ended":"Continuing";
    };
}
