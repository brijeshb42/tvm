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
        tv.network.getAllData(d);
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

    $scope.showBtn = function(index){
        if($scope.shows[index].data.overview=="" || $scope.shows[index].data.overview.length<10)
            return true;
        return false;
    };

    $scope.updateEpisode = function(index,showname){
        //console.log($scope.shows[index].data);
        tv.network.getEpisode(index,$scope.shows[index].data.episodeID,$scope.shows[index].data.showname);
    };
}

function ShowListController($scope,$http){
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
        var scope = angular.element($('body')).scope();
        scope.changeView(3);
        var scope2 = angular.element($("#showInfo")).scope();
        scope2.show = $scope.shows[index];
        scope2.episode = {};
    };
}

function ShowInfoController($scope){
    $scope.show = {};
    $scope.episode = {name:"",overview:"",airdate:""};
    $scope.showDetails = false;
    $scope.error = false;
    $scope.message = "Enter both season and episode number.";

    $scope.getBack = function(){
        var scope = angular.element($('body')).scope();
        scope.changeView(2);
    };

    $scope.status = function(st){
        return (st)?"Ended":"Continuing";
    };

    $scope.getEpisode = function(){
        if(!$scope.seasonNum || !$scope.episodeNum || $scope.seasonNum=="" || $scope.episodeNum==""){
            $scope.error = true;
            $scope.showDetails = false;
            $scope.message = "Enter both season and episode number.";
            return;
        }
        $scope.error = false;
        $scope.showDetails = true;
        tv.indexedDB.getEpisodeDetail($scope.show.data.showid,$scope.seasonNum,$scope.episodeNum);
    };

    $scope.getDate = function(date){
        if(!date || date.length<10)
            return "";
        return "Premiered on: "+tv.ui.formatDate(date);
    };
}
