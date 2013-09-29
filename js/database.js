window.indexedDB 		= window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction   = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange 		= window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

var tv = {};
tv.page = 1;
tv.indexedDB = {};
var DB = "tv_man";
var DB_show = "tv_shows";
var DB_epi = "tv_episodes";
var DB_img = "tv_images";

tv.indexedDB.db = null;
tv.indexedDB.open = function(){
	var version = 2;
	var request = indexedDB.open(DB,version);

	request.onupgradeneeded = function(e){
		var db = e.target.result;
		e.target.transaction.onerror = tv.indexedDB.onerror;
		if(db.objectStoreNames.contains(DB)){
			db.deleteObjectStore(DB);
		}
		var store = db.createObjectStore(DB_show,{keyPath:"showid"});
		store.createIndex("name","name",{unique:false});
		store.createIndex("day","day",{unique:false});
		store.createIndex("deleted","deleted",{unique:false});
		var store2 = db.createObjectStore(DB_epi,{keyPath:"episodeID"});
		store2.createIndex("showid","showid",{unique:false});
		store2.createIndex("airdate","airdate",{unique:false});
		store2.createIndex("season","season",{unique:false});
		store2.createIndex("episode","episode",{unique:false});
		var store3 = db.createObjectStore(DB_img,{keyPath:"showid"});
	};

	request.onsuccess = function(e){
		tv.indexedDB.db = e.target.result;
		if(tv.page==1){
			tv.indexedDB.getAllShows();
		}else if(tv.page==2){
			tv.indexedDB.getTodayCount();
		}else if(tv.page==3){
			tv.indexedDB.getUpcoming();
		}
	};

	request.onerror = tv.indexedDB.onerror;
};

tv.indexedDB.addShow = function(show){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_show],"readwrite");
	var store = trans.objectStore(DB_show);
	var request = store.add(show);

	request.onsuccess = function(e){
		bootbox.alert("Show added. Downloading Episode list.",function(){
			tv.network.getEpisodes(show.showid);
		});
	};

	request.onerror = function(e){
		$("#loadingBar").hide();
		bootbox.alert("Error");
		console.log(e);
	};
}

tv.indexedDB.getAllShows = function(){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_show],"readwrite");
	var store = trans.objectStore(DB_show);
	var req = store.count();
	req.onsuccess = function(e){
		if(req.result){
			var keyRange = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(keyRange);
			cursorRequest.onsuccess = function(e){
				var result = e.target.result;
				//console.log(result);
				if(!!result == false)
					return;
				tv.ui.renderShows(result.value);
				//console.log(result);
				tv.indexedDB.getPoster(result.value.showid);
				result.continue();
			};
			cursorRequest.onerror = function(e){
				bootbox.alert("Error.");
				console.log(e);
			};
		}
		else{
			tv.ui.renderShows(0);
		}
	};
	req.onerror = function(e){
		bootbox.alert("Error.");
		console.log(e);
	}
};

tv.indexedDB.addEpisodes = function(episodes,show){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_epi],"readwrite");
	var store = trans.objectStore(DB_epi);
	var total = 0;
	//var request = store.add(episodes);
	for (var i=0;i<episodes.length;i++) {
    	var request = store.add(episodes[i]);
    	request.onsuccess = function(e){
			total++;
			if(total==episodes.length){
				bootbox.alert("Episodes added. Downloading poster.",function(){
					tv.network.getPoster(show);
				});
			}
		};

		request.onerror = function(e){
			console.log(e);
		};
  	}
};

tv.indexedDB.getEpisodes = function(showid){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_epi],"readwrite");
	var store = trans.objectStore(DB_epi);
	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = store.openCursor(keyRange);

	cursorRequest.onsuccess = function(e){
		var result = e.target.result;
		if(!!result == false)
			return;
		//console.log(result.value.season);
		tv.ui.renderShows(result.value);
		result.continue();
	};

	cursorRequest.onerror = function(e){
		console.log(e);
	}
};

tv.indexedDB.deleteShow = function(id) {
  var db = tv.indexedDB.db;
  var trans = db.transaction([DB_show], "readwrite");
  var store = trans.objectStore(DB_show);

  var request = store.delete(id.toString());
  request.onsuccess = function(e) {
  	tv.ui.renderHome();
  	tv.indexedDB.deleteShowImg(id.toString());
  };

  request.onerror = function(e) {
    console.log(e);
  };
};

tv.indexedDB.deleteShowImg = function(id) {
  var db = tv.indexedDB.db;
  var trans = db.transaction([DB_img], "readwrite");
  var store = trans.objectStore(DB_img);

  var request = store.delete(id);

  request.onsuccess = function(e) {
    bootbox.alert("Show deleted.",function(){
    	tv.indexedDB.deleteShowEpisodes(id);
    	//window.location.reload();
	});
  };

  request.onerror = function(e) {
    console.log(e);
  };
};

tv.indexedDB.deleteShowEpisodes = function(id) {
  	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_epi],"readwrite");
	var store = trans.objectStore(DB_epi);
	var index = store.index("showid");
	var range = new IDBKeyRange.only(id);
	var req = index.openCursor(range);
	req.onsuccess = function(e){
		var cursor = e.target.result;
		//console.log(cursor);
		if(cursor){
			cursor.delete();
			cursor.continue();
		}
	};
	req.onerror = function(){
		bootbox.alert("Error opening DB.");
	};
};

tv.indexedDB.savePoster = function(show){
	//console.log(show);
  	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_img],"readwrite");
	var store = trans.objectStore(DB_img);
	var request = store.add(show);

	request.onsuccess = function(e){
		bootbox.hideAll();
		bootbox.alert("Poster Saved.");
		//setTimeout()
	};

	request.onerror = function(e){
		bootbox.alert("Error saving poster.");
		console.log(e);
	};
};


tv.indexedDB.getPoster = function(id){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_img],"readwrite");
	var store = trans.objectStore(DB_img);
	var req = store.get(id);
	req.onsuccess = function(e){
		tv.ui.renderImg(req.result);
		//console.log(req.result);
	};
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
		if(count==0){
			tv.ui.renderPopup(0);
		}
		else{
			tv.indexedDB.getToday();
		}
	};
};

tv.indexedDB.getUpcoming = function(){
	var db = tv.indexedDB.db;
	var trans = db.transaction([DB_epi],"readwrite");
	var store = trans.objectStore(DB_epi);
	var y = tv.ui.getDate(-1);
	var n = tv.ui.getDate(3);
	console.log(y+' '+n);
	var index = store.index("airdate");
	var range = IDBKeyRange.bound(y, n,false,false);
	var req = index.openCursor(range);
	req.onsuccess = function(e){
		var cursor = e.target.result;
		if(cursor){
			tv.ui.renderUpcoming(cursor.value);
			//console.log(cursor.value);
			cursor.continue();
		}
	};
	req.onerror = function(){
		bootbox.alert("Error opening DB.");
	};
};