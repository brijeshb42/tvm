import os
import json
import shutil

"""
make sure you have installed nodejs and its npm alogwith
packages less and uglify-js to compile and minify css and js.
Also don't forget to add location of chrome to system path
in windows.
"""

APP = "tvm"
app = "app"
CWD = os.getcwd()
APP_DIR = os.path.join(CWD,APP)
FILE_DIR = os.path.join(CWD,app)
JSON_FILE = "required.json"

def createAppDir():
	if os.path.isdir(APP_DIR):
		shutil.rmtree(APP_DIR)
	os.mkdir(APP_DIR)

def createFiles(directory,app_dir,data):
	for dirs in data:
		if dirs!="base":
			os.mkdir(os.path.join(app_dir,dirs))
		if isinstance(data[dirs],dict):
			createFiles(os.path.join(directory,dirs),os.path.join(app_dir,dirs),data[dirs])
		elif isinstance(data[dirs],list):
			if dirs == "base":
				for fil in data[dirs]:
					shutil.copyfile(os.path.join(directory,fil),os.path.join(app_dir,fil))
			else:
				for fil in data[dirs]:
					shutil.copyfile(os.path.join(os.path.join(directory,dirs),fil),os.path.join(os.path.join(app_dir,dirs),fil))

def createExtension(directory,app_dir):
	ext_file =  os.path.join(directory,APP+".pem")
	if os.path.exists(ext_file):
		if not os.path.isdir(ext_file):
			#print "chrome --pack-extension="+app_dir+" --pack-extension-key="+ext_file
			if os.name=="posix":
				os.system("google-chrome --pack-extension="+app_dir+" --pack-extension-key="+ext_file)
			else:
				os.system("chrome --pack-extension="+app_dir+" --pack-extension-key="+ext_file)
	else:
		if os.name=="posix":
			os.system("google-chrome --pack-extension="+app_dir)
		else:
			os.system("chrome --pack-extension="+app_dir)
	shutil.rmtree(APP_DIR)
	print "Extension created."

if __name__ == "__main__":
	if os.name=="posix":
		os.system("make")
	else:
		os.system("make.bat")
	createAppDir()
	json_data = open(JSON_FILE)
	data = json.load(json_data)
	createFiles(FILE_DIR,APP_DIR,data);
	createExtension(CWD,APP_DIR)
	json_data.close()
