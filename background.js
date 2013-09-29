chrome.app.runtime.onLaunched.addListener(function(){
	chrome.app.window.create('index.html',{
		bounds: {
			width: 450,
			height: 600
		}
	});
	chrome.app.window.onBoundsChanged.addListener(function(){
		alert("hello");
	});
	/*var notification = webkitNotifications.createNotification(
  		'tv128.png',  // icon url - can be relative
  		'Hello!',  // notification title
  		'Lorem ipsum...'  // notification body text
	);
	notification.show();*/
});