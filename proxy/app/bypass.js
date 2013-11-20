var title = document.getElementsByTagName('title')[0];
if(title.innerHTML == "Access Denied"){
	var proxy = "https://b2-apps.appspot.com/?url=";
	location.href = proxy + location.href;
}