import os
import json
import shutil

APP = "dist"
CWD = os.getcwd()
APP_DIR = os.path.join(CWD,APP)
JSON_FILE = "required.json"

def createAppDir():
	if os.path.isdir(APP_DIR):
		shutil.rmtree(APP_DIR)
	os.mkdir(APP_DIR)

def createFiles(directory,app_dir,data):
	print "Main"
	print directory
	print app_dir
	for dirs in data:
		print "\n"
		print dirs
		if dirs!="base":
			os.mkdir(os.path.join(app_dir,dirs))
		if isinstance(data[dirs],dict):
			createFiles(os.path.join(directory,dirs),os.path.join(app_dir,dirs),data[dirs])
		elif isinstance(data[dirs],list):
			if dirs == "base":
				for fil in data[dirs]:
					print os.path.join(app_dir,fil)
					shutil.copyfile(os.path.join(directory,fil),os.path.join(app_dir,fil))
			else:
				print "---"
				print os.path.join(app_dir,dirs)
				for fil in data[dirs]:
					print "--"
					print os.path.join(os.path.join(app_dir,dirs),fil)
					shutil.copyfile(os.path.join(os.path.join(directory,dirs),fil),os.path.join(os.path.join(app_dir,dirs),fil))

if __name__ == "__main__":
	createAppDir()
	json_data = open(JSON_FILE)
	data = json.load(json_data)
	createFiles(CWD,APP_DIR,data);
	json_data.close()
