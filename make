lessc -x less/main.less app/css/index.min.css
lessc -x less/dialog.less app/css/dialog.min.css
uglifyjs js/database.js -m -o app/js/database.min.js
uglifyjs js/jquery.confirm.js -m -o app/js/jquery.confirm.min.js
uglifyjs js/jquery.console.js -m -o app/js/jquery.console.min.js
uglifyjs js/index.js -o app/js/index.min.js