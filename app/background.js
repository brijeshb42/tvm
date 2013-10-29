chrome.app.runtime.onLaunched.addListener(function(){
	chrome.app.window.create('index.html',{
		bounds: {
			width: 450,
			height: 600
		},
		resizable: false
	});
	tv.indexedDB.open("back");
});