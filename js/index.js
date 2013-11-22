/* AngularJS start */

function NavController($scope,$http){

    $scope.menuVisible = false;
    $scope.selectedNav = 0;
    $scope.navItems = [{href:"#todayList",title:"Latest"},
                       {href:"#addShow",title:"Add Shows"},
                       {href:"#showList",title:"All Shows"}];

    $scope.menuItems = [{icon:"icon-refresh",title:"Check for Update"},
                        {icon:"icon-about",title:"About"}];

    $scope.doFunction = function(index){
        $scope.menuVisible = false;
        switch(index){
            case 0: $scope.checkUpdate();
                    break;
            case 1: $scope.about();
                    break;
            default: break;
        }
    };

    $scope.changeView = function(index){
        $scope.selectedNav = index;
        setTimeout(function(){ $("#searchShow").focus();},200);
    };

    $scope.showAppMenu = function(){
        $scope.menuVisible = !$scope.menuVisible;
    };

    $scope.checkUpdate = function(){
        $.console({message:"Checking for update..."});
        var updateUrl = "https://raw.github.com/brijeshb42/tvm/master/latest.json"
        $http({method: 'GET', url: updateUrl}).
                success(function(data,status,header,config){
                    if(data.version > chrome.runtime.getManifest().version){
                        $.console({heading:"Update Available",message:"New version is "+data.version+" is available for download <a href='"+data.url+"' target='_blank'>here</a>", type: "success", clear:true});
                    }else{
                        $.console({heading:"No update",message:"The app is already the most recent version.",clear:true});
                    }
                }).
                error(function(data,status,header,config){
                    $.console({heading:"Error",message:"There was an error while retrieving version information.", type: "error"});
                });
    };

    $scope.about = function(){
        $.console({heading:"About",message:"App version: "+chrome.runtime.getManifest().version+"<br />Created by <a href='mailto:brijeshb42@gmail.com' target='_blank'>b2</a>.<br /><a href='http://goo.gl/gxoEAD' target='_blank'>Visit app website.</a>"});
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

    $scope.init = function() {
        chrome.storage.local.get("date",function(d){
            console.log("first");
            console.log(d);
            if(d.date){
                console.log("2nd");
                console.log(d);
                if(d.date<tv.ui.getDate()){
                    console.log("3rd");
                    console.log(d);
                    chrome.storage.local.set({"date":tv.ui.getDate()});
                    var sc = $scope.shows;
                    if(sc.length>0){
                        for(var i=0;i<sc.length;i++){
                            if(sc[i].data.overview.length<1){
                                tv.network.getEpisode(sc[i].data.episodeID,sc[i].data.showname,"back");
                            }
                        }
                    }
                }
            }else{
                chrome.storage.local.set({"date":tv.ui.getDate()});
            }
        });
        
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
    //$scope.init();
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

/* Angular js end*/

function checkUpdateBackground(){
    $.ajax({
        url : urls.update,
        type: "GET",
        dataType: "json",
        success: function(data){
            if(data.version > chrome.runtime.getManifest().version){
                $.console({heading:"Update Available",message:"New version "+data.version+" is available for download <a href='"+data.url+"' target='_blank'>here</a>", type: "success", clear:true});
                if(data.changelog){
                    for(var i=0;i<data.changelog.length;i++){
                        $.console({heading:"Update Available",message:data.changelog[i]});
                    }
                }
            }
        }
    });
}

function makeDroppable(){
    var dropzone = document.getElementById("content");

    dropzone.ondragover = function(){
        return false;
    };
    dropzone.ondragend = function(){
        return false;
    };
    dropzone.ondrop = function(e){
        console.log(e);
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        $.console({message:file.name})
        //console.log(file);
        return false;
    };
}

/* JQuery functions */

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
        makeDroppable();
        setTimeout(function(){checkUpdateBackground()},5000);
    });
})(jQuery);