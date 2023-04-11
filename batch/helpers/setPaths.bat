@echo off

rem Get current directory path
set current_dir=%cd%

rem Construct paths relative to the current directory

set JAVA_HOME=%current_dir%\..\gradleJDK11
set ANDROID_HOME=%current_dir%\..\androidSdk
set sdkManagerDir=%ANDROID_HOME%/cmdline-tools/latest/bin

set sourceCodeDir=%current_dir%\..\appSourceCode

@REM rem Set environment variables
@REM set PATH=%PATH%;%node_path%;%java_home%\bin

rem Verify paths are set correctly

echo Java home: %java_home%



@REM pause