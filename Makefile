
start:
	npm install
	npm start

package:
	electron-packager . --overwrite
	mv .\ficwriter-tool-win32-x64\resources\app\mystem .\ficwriter-tool-win32-x64\
	mv .\ficwriter-tool-win32-x64\resources\app\freq .\ficwriter-tool-win32-x64\
