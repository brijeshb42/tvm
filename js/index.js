(function($){
    $(window).load(function(){
        $('a').on("click",function(){
            return false;
        });
        $("#content").slimscroll({
            height: "475px",
            railVisible: true
        });
        $(document).on("contextmenu",function(e){
            e.preventDefault();
        });
        tv.indexedDB.open();
    });
})(jQuery);

function NavController($scope){

    $scope.menuVisible = false;
    $scope.selectedNav = 0;
    $scope.navItems = [{href:"#todayList",title:"Latest"},
                       {href:"#addShow",title:"Add Shows"},
                       {href:"#showList",title:"All Shows"}];
    $scope.changeView = function(index){
        $scope.selectedNav = index;
        /*if($scope.selectedNav==1){
        }*/
    };

    $scope.showAppMenu = function(){
        $scope.menuVisible = !$scope.menuVisible;
    };

    $scope.checkUpdate = function(){
        $scope.menuVisible = false;
        $.console({message:"Updating"});
        var updateUrl = "https://raw.github.com/brijeshb42/tvm/master/latest.json"
        $http({method: 'GET', url: updateUrl}).
                success(function(data,status,header,config){
                    $.console({message:data});
                }).
                error(function(data,status,header,config){
                    $.console({message:"There was an error while retrieving version."});
                });
    };

    $scope.about = function(){
        $scope.menuVisible = false;
        $.console({message:"Created by <a href='mailto:brijeshb42@gmail.com'>b2</a>"});
    };

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
        tv.network.getAllData(d,"save");
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
        return true;
    };

    $scope.updateEpisode = function(id,showname){
        //console.log(index);
        tv.network.getEpisode(id,showname);
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

    $scope.updateShow = function(index){
        $.confirm(
            {   message: "Reupdate "+$scope.shows[index].data.title+" ?",
                okText: "Yes",
                cancelText: "No",
                onconfirm:function(){
                    var d = $scope.shows[index].data;
                    tv.network.getAllData(d,"update");
                }
            }
        );
    };

    $scope.deleteShow = function(index){
        $.confirm(
            {   message: "Do you want to delete "+$scope.shows[index].data.title+" ?",
                okText: "Yes",
                cancelText: "No",
                onconfirm:function(){
                    tv.indexedDB.deleteShowComplete($scope.shows[index].data.showid,"noupdate",null);
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