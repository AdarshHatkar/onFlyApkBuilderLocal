@echo off



call helpers\setPaths.bat


cd /d %sdkManagerDir%

 call  sdkmanager --licenses

cd /d %sourceCodeDir%

echo %sourceCodeDir%

gradlew.bat  --daemon  :app:assembleDebug  

pause