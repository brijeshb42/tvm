chrome.app.runtime.onLaunched.addListener(function(){
	chrome.app.window.create('index.html',{
		bounds: {
			width: 450,
			height: 600
		},
		resizable: false
	});
	/*var notification = webkitNotifications.createNotification(
  		'tv128.png',  // icon url - can be relative
  		'Hello!',  // notification title
  		'Lorem ipsum...'  // notification body text
	);
	notification.show();*/
});