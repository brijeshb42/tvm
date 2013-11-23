onload = function(){

	var auth = "https://www.dropbox.com/1/oauth2/authorize";
	var authUrl = "https://www.dropbox.com/1/oauth2/authorize?client_id=8zoic1cz1npxp3z&response_type=code";

	/*var $ = function(sel){
		return document.querySelector(sel);
	};*/

	var db = document.querySelector("#dropbox");
	db.addEventListener('loadstop',function(e){
		$.console("close");
		db.executeScript({code:"document.getElementById('page-full-footer').remove();document.getElementById('page-header').remove();document.getElementById('page-logo-header').remove()"})
		if(db.src===auth){
			$.console({heading:"Copy the code",message:"Copy the code and paste into the prompt box."});
			/*chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
				console.log(response.farewell);
			});*/
		}
		console.log(e);
	});
	db.addEventListener('loadstart',function(e){
		$.console({message:"Loading. Please wait..."});
		console.log(e);
	});
	db.addEventListener('permissionrequest', function(e){
		e.request.deny();
	});
	window.addEventListener('message', function(e){
		console.log(e);
	});
	db.src = authUrl;
}