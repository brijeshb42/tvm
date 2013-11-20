window.indexedDB 		= window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction   = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange 		= window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

urls = {
    proxy : "http://b2-proxy.appspot.com/",
    api : "www.thetvdb.com/api/",
    id : "C973590B1E212580",
    banner : "www.thetvdb.com/banners/",
    search : "GetSeries.php",
    update : "https://raw.github.com/brijeshb42/tvm/master/latest.json",
    trakt : "http://api.trakt.tv/",
    trakt_api : "b3795664d41ef84ecdbf1dae6dfab099",
    img_url : "slurm.trakt.us/"
};

u = {
    search: urls.trakt+"search/shows.json/"+urls.trakt_api+"/",
    img: urls.proxy+urls.img_url,
    episode: urls.trakt+"show/season.json/"+urls.trakt_api+"/",
    poster: "slurm.trakt.us/images/posters/"
};

var tv = {};
tv.ui = {};
tv.network = {};
tv.indexedDB = {};
var DB = "tv_man";
var DB_show = "tv_shows";
var DB_epi = "tv_episodes";
var DB_img = "tv_images";

tv.ui.getDate = function(d){
	if(d==null){
		d=0;
	}
	var yDate = "";
	var yest = new Date();
	yest.setDate(yest.getDate()+d);
	var dd = yest.getDate();
	var mm = yest.getMonth()+1;
	var yyyy = yest.getFullYear();
	if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm}
		yDate = yyyy+'-'+mm+'-'+dd;
	return yDate;
};

tv.ui.formatDate =  function(date){
		if(date==null || date==undefined || date.length<10){
			return "Not specified";
		}
		var d = date.split('-');
		var dt = d[2]+'-'+d[1]+'-'+d[0];
		return dt;
};

tv.ui.getDataUrl = function(show,episodes,blob,from) {
	var im = URL.createObjectURL(blob);
	var image = new Image();
	var canvas = document.createElement("canvas");
	image.onload = function(){
    	var width = 300;
    	var height = width*((this.height)/(this.width));
    	canvas.width = width;
    	canvas.height = height;
    	var ctx = canvas.getContext("2d");
    	ctx.drawImage(this, 0, 0,width,height);
    	var dataURL = canvas.toDataURL(blob.type);
    	URL.revokeObjectURL(im);
    	var sho = {};
    	sho.showid = show.showid;
    	sho.img = dataURL;
    	if(from==="update"){
    		var dat = {};
    		dat.show = show;
    		dat.episodes = episodes;
    		dat.image = sho;
    		tv.indexedDB.deleteShowComplete(show.showid,from,dat)
    	}
    	else
    		tv.indexedDB.addShow(show,episodes,sho,from);
	};
	image.src = im;
};

tv.ui.getImgId = function(url){
    var s = url.substring(url.lastIndexOf('/')+1,url.length);
    return s;
};

tv.network.downloadUpdate = function(updateUrl){
	var crx = new XMLHttpRequest();
    crx.responseType = 'blob';
    crx.onload = function(){
        $.console({message:"Poster downloaded."});
        console.log(this.response);
    };
    crx.onerror = function(e){
        console.log(e);
    };
    crx.open('GET',updateUrl, true);
    crx.send();
};


tv.network.getAllData = function(sho,from){
    $.console({message:"Downloading episode details."});
        $.ajax({
            url : urls.proxy+urls.api+urls.id+"/series/"+sho.showid+"/all/en.xml",
            type: "GET",
            dataType: "xml",
            success: function(data){
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
                //console.log(data);

                //var total = 0;

                var imgUrl = urls.proxy+u.poster+tv.ui.getImgId(sho.images.poster);
                $.console({message:"Downloading show poster."});
                var img = new XMLHttpRequest();
                img.responseType = 'blob';
                img.onload = function(){
                    $.console({message:"Poster downloaded."});
                    tv.ui.getDataUrl(sho,episodes,this.response,from);
                };
                img.onerror = function(e){
                    console.log(e);
                };
                img.open('GET',imgUrl, true);
                img.send();
            },
            error: function(xhr,status){
                $.console({message:"Episode list not downloaded. Try to add the show again.",type:"error"});
                //console.log(xhr);
                //console.log(status);
                //transaction.abort();
            }
        });
};

tv.network.getPoster = function(showid,url){
	$.console({message:"Downloading show poster."});
    var img = new XMLHttpRequest();
    img.responseType = 'blob';
    img.onload = function(){
    	$.console({message:"Poster downloaded."});
    	tv.ui.getDataUrl(this.response,showid);
    };
    img.open('GET',url, true);
    img.send();
};

tv.network.getEpisode = function(id,showname){
	$.console({message:"Updating episode information."});
	var URL = urls.proxy+urls.api+urls.id+"/episodes/"+id+"/en.xml";
	$.ajax({
		url: URL,
		type: 'GET',
		dataType: 'xml',
		success: function(data){
			var epi = {};
            $(data).find("Episode").each(function(){
                epi.name = $(this).find("EpisodeName").text();
                epi.showname = showname;
                epi.showid = $(this).find("seriesid").text();
                epi.episodeID = $(this).find("id").text();
                epi.overview = $(this).find("Overview").text();
                epi.guestStars = $(this).find("GuestStars").text();
                epi.airdate = $(this).find("FirstAired").text();
                epi.season = $(this).find("SeasonNumber").text();
                epi.episode = $(this).find("EpisodeNumber").text();
                epi.lastUpdated = $(this).find("lastupdated").text();
            });
            if(epi.overview=="" || epi.overview.length<5){
            	$.console({heading:"Not Available",message:"Detail of this episode is not yet available.",clear:true});
            	return;
            }
            tv.indexedDB.updateEpisode(epi);
            //console.log(epi);
		},
		error: function(){
			$.console({heading:"Error!",message:"Episode details could not be downloaded.",type:"error"});
		}
	});
};


tv.indexedDB.db = null;

tv.indexedDB.open = function(from){
	var version = 1;
	var request = indexedDB.open(DB,version);

	request.onupgradeneeded = function(e){
		var db = e.target.result;
		e.target.transaction.onerror = tv.indexedDB.onerror;
		/*if(db.objectStoreNames.contains(DB)){
			db.deleteObjectStore(DB);
		}*/
		var store = db.createObjectStore(DB_show,{keyPath:"showid"});
		store.createIndex("title","title",{unique:false});
		store.createIndex("air_day","air_day",{unique:false});
		//store.createIndex("deleted","deleted",{unique:false});

		var store2 = db.createObjectStore(DB_epi,{keyPath:"episodeID"});
		store2.createIndex("showid","showid",{unique:false});
		store2.createIndex("airdate","airdate",{unique:false});
		store2.createIndex("showSeason",["showid","season"],{unique:false});
		store2.createIndex("showSeasonEpisode",["showid","season","episode"],{unique:true});

		var store3 = db.createObjectStore(DB_img,{keyPath:"showid"});
	};

	request.onsuccess = function(e){
		tv.indexedDB.db = e.target.result;
		if(from==="back"){
			tv.indexedDB.getTodayCount();
		}else if(from==="info"){

		}
		else{
			tv.indexedDB.getAll();
		}
	};

	request.onerror = tv.indexedDB.onerror;
};

tv.indexedDB.getToday = function(){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_epi],"readwrite");
	var store = trans.objectStore(DB_epi);
	var date = tv.ui.getDate();
	//console.log(date);
	var index = store.index("airdate");
	var singleKeyRange = IDBKeyRange.only(date);
	var req = index.openCursor(singleKeyRange);
	req.onsuccess = function(e){
		var cursor = e.target.result;
		//console.log(e);
		if(cursor){
			tv.ui.renderPopup(cursor.value);
			console.log(cursor.value);
			cursor.continue();
		}
	};
};

tv.indexedDB.getTodayCount = function(){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_epi],"readwrite");
	var store = trans.objectStore(DB_epi);
	var date = tv.ui.getDate();
	//.log(date);
	var index = store.index("airdate");
	var singleKeyRange = IDBKeyRange.only(date);
	var req = index.count(singleKeyRange);
	req.onsuccess = function(e){
		var count = e.target.result;
		var c = count.toString();
		//console.log(count);
		var notification;
		if(count==0){
			notification = webkitNotifications.createNotification(
  				'tv128.png',  // icon url - can be relative
  				'Today on TV',  // notification title
  				'No show today.'  // notification body text
			);
			//tv.ui.renderPopup(0);
		}
		else{
			notification = webkitNotifications.createNotification(
  				'tv128.png',  // icon url - can be relative
  				'Today on TV',  // notification title
  				count+' '+(count>1?'shows':'show')+' today.'  // notification body text
			);
		}
		notification.show();
		setTimeout(function(){notification.cancel()},5000);
	};
};

tv.indexedDB.addShow = function(show,episodes,img){

	var db = tv.indexedDB.db;
	var transaction = db.transaction([DB_show,DB_epi,DB_img],"readwrite");

	transaction.oncomplete = function(e){
		$.console({heading:show.title+" added",message:"You can now close this box.",type:"success",clear:true});
		var scope = angular.element($("#addShow")).scope();
		scope.shows = [];
		scope.isShown = false;
		tv.indexedDB.getAll();
	};

	transaction.onabort = function(){
		$.console({message:"This show already exists or some error encountered. Show not saved."});
	};

	//var showCursor,epiCursor,imgCursor;

	var showStore = transaction.objectStore(DB_show);
	var epiStore = transaction.objectStore(DB_epi);
	var imgStore = transaction.objectStore(DB_img);

	var showRequest = showStore.add(show);
	showRequest.onerror = function(){
		$.console({message:"There was an error.",type:"error"});
		transaction.abort();
	};
	for(var i = 0;i<episodes.length;i++){
		var epiRequest = epiStore.add(episodes[i]);
	}
	var imgRequest = imgStore.add(img);
}

tv.indexedDB.getAll = function(){
	var showS = {};
	var epiS = {};
	var imgS = {};
	var sho = [],epi = [];
	var db = tv.indexedDB.db;
	var transaction = db.transaction([DB_show,DB_epi,DB_img],"readonly");
	
	var scopeUpcoming = angular.element($("#todayList")).scope();
	var scopeAll = angular.element($("#showList")).scope();
	scopeUpcoming.shows = scopeAll.shows = [];
	scopeUpcoming.noUpcoming = true;

	transaction.oncomplete = function(){
		for(var key in showS){
			showS[key].img = imgS[showS[key].data.showid].img;
			if(showS.hasOwnProperty(key)){
				sho.push(showS[key]);
			}
		}
		for(var key in epiS){
			epiS[key].img = imgS[epiS[key].data.showid].img;
			if(epiS.hasOwnProperty(key)){
				epi.push(epiS[key]);
			}
		}
		scopeUpcoming.$apply(function(){
			scopeUpcoming.shows = epi;
			if(scopeUpcoming.shows.length>0){
				scopeUpcoming.noUpcoming = false;
			}
			else{
				scopeUpcoming.noUpcoming = true;
				scopeUpcoming.info = "No upcoming shows.";
			}
		});
		scopeAll.$apply(function(){
			scopeAll.shows = sho;
			if(scopeAll.shows.length>0)
				scopeAll.noAdded = false;
			else{
				scopeAll.noAdded = true;
				scopeAll.info = "No shows added.";
			}
		});
	};

	var showCursor,epiCursor,imgCursor;

	var showStore = transaction.objectStore(DB_show);
	showStore.openCursor().onsuccess = function(event){
		showCursor = event.target.result;
		if(!showCursor)
			return;
		if(!showS[showCursor.value.showid]){
			showS[showCursor.value.showid] = {};
		}
		showS[showCursor.value.showid].data = showCursor.value;
		showCursor.continue();
	};

	var epiStore = transaction.objectStore(DB_epi);
	var y = tv.ui.getDate(-1);
	var n = tv.ui.getDate(5);
	var epiIndex = epiStore.index("airdate");
	var range = IDBKeyRange.bound(y,n,false,false);

	epiIndex.openCursor(range).onsuccess = function(event){
		epiCursor = event.target.result;
		if(!epiCursor)
			return;
		if(!epiS[epiCursor.value.episodeID]){
			epiS[epiCursor.value.episodeID] = {};
		}
		epiS[epiCursor.value.episodeID].data = epiCursor.value;
		epiCursor.continue();
	};

	var imgStore = transaction.objectStore(DB_img);
	imgStore.openCursor().onsuccess = function(event){
		imgCursor = event.target.result;
		if(!imgCursor)
			return;
		if(!imgS[imgCursor.value.showid]){
			imgS[imgCursor.value.showid] = {};
		}
		imgS[imgCursor.value.showid].img = imgCursor.value.img;
		imgCursor.continue();
	};
}

tv.indexedDB.deleteShowComplete = function(id,from,dat) {
  	var db = tv.indexedDB.db;
  	var trans = db.transaction([DB_show,DB_epi,DB_img], "readwrite");

  	trans.oncomplete = function(){
  		$.console({heading:"Deleted",message:"Show deleted."})
  		if(from==="update"){
  			tv.indexedDB.addShow(dat.show,dat.episodes,dat.image);
  			return;
  		}
  		tv.indexedDB.getAll();
  	};
  	trans.onerror = function(){
  		$.console({message:"Error during deletion.",type:"error"});
  	};
  
  	var showStore = trans.objectStore(DB_show);

  	var showDelRequest = showStore.delete(id);
  	/*showDelRequest.onsuccess = function(e) {
  		console.log("Show details deleted");
  	};

  	showDelRequest.onerror = function(e) {
    	console.log("Error deleting show details.");
  	};*/

  	var imgStore = trans.objectStore(DB_img);
  	var imgDelRequest = imgStore.delete(id);

  	/*imgDelRequest.onsuccess = function(e) {
    	console.log("show img deleted");
  	};

  	imgDelRequest.onerror = function(e) {
    	console.log("show img not deleted");
  	};*/

	var epiStore = trans.objectStore(DB_epi);
	var index = epiStore.index("showid");
	var range = new IDBKeyRange.only(id.toString());
	var req = index.openCursor(range);
	req.onsuccess = function(e){
		var cursor = e.target.result;
		if(cursor){
			cursor.delete();
			cursor.continue();
		}
	};
	/*req.onerror = function(){
		console.log("Error opening DB.");
	};*/
};

tv.indexedDB.getEpisodeDetail = function(showid,season,episode){
	var db = tv.indexedDB.db;
	var transaction = db.transaction([DB_epi],"readonly");
	var epiStore = transaction.objectStore(DB_epi);
	var epiIndex = epiStore.index("showSeasonEpisode");
	var range = new IDBKeyRange.only([showid.toString(),season.toString(),episode.toString()]);

	var scope = angular.element($("#showInfo")).scope();

	epiIndex.count(range).onsuccess = function(e){
		if(e.target.result>0){
			var req = epiIndex.openCursor(range);
			req.onsuccess = function(event){
				var cursor = event.target.result;
				if(!cursor)
					return;
				scope.episode = cursor.value;
				scope.error = false;
				scope.showDetails = true;
			};
		}else{
			$.console({message:"No info found for season "+season+" episode "+episode,heading:"Error..."});
		}
	};
};

tv.indexedDB.exists = function(showid){
	var db = tv.indexedDB.db;
	var transaction = db.transaction([DB_show],"readonly");
	var showStore = transaction.objectStore(DB_epi);
	var showIndex = epiStore.index("showid");
	var range = new IDBKeyRange.only(showid.toString());

	epiIndex.count(range).onsuccess = function(e){
		if(e.target.result>0){
			return true;
		}else{
			$.console({message:"This show already exists",type:"error"});
		}
	};
};

tv.indexedDB.updateEpisode = function(episode){
	var db = tv.indexedDB.db;
	var transaction = db.transaction([DB_epi],"readwrite");
	var store = transaction.objectStore(DB_epi);
	var range = IDBKeyRange.only(episode.episodeID);
	var cursor = store.openCursor(range);
	cursor.onsuccess = function(event){
		var cur = event.target.result;
		var req = cur.update(episode);
		req.onsuccess = function(){
			$.console({heading:"Updated!!!",message:"Episode details updated.",type:"success",clear:true});
			tv.indexedDB.getAll();
		};
	};
};