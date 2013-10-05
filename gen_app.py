import os
import json
import shutil

APP = "tvm"
CWD = os.getcwd()
APP_DIR = os.path.join(CWD,APP)
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
def createExt(directory,app_dir):
	ext_file =  os.path.join(directory,APP+".pem")
	if os.path.exists(ext_file):
		if not os.path.isdir(ext_file):
			#print "chrome --pack-extension="+app_dir+" --pack-extension-key="+ext_file
			os.system("chrome --pack-extension="+app_dir+" --pack-extension-key="+ext_file)
			shutil.rmtree(APP_DIR)
	else:
		os.system("chrome --pack-extension="+app_dir)
		shutil.rmtree(APP_DIR)

if __name__ == "__main__":
	createAppDir()
	json_data = open(JSON_FILE)
	data = json.load(json_data)
	createFiles(CWD,APP_DIR,data);
	createExt(CWD,APP_DIR)
	json_data.close()
