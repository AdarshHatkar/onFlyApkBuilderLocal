@echo off
 
rem Get current directory path
set current_dir=%cd%
echo %current_dir%

set C_DIR=%SystemDrive%\
echo %C_DIR%

rem Construct paths relative to the current directory

set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

@REM set ANDROID_HOME=%current_dir%\..\androidSdk
@REM set sdkManagerDir=%ANDROID_HOME%/cmdline-tools/latest/bin

@REM set sourceCodeDir=%current_dir%\..\appSourceCode

@REM rem Set environment variables
@REM set PATH=%PATH%;%node_path%;%java_home%\bin

rem Verify paths are set correctly

echo Java home: %JAVA_HOME%



@REM pause