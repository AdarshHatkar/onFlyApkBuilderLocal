@echo off
 
rem Get current directory path
set current_dir=%cd%

rem Construct paths relative to the current directory

set JAVA_HOME=%current_dir%\..\gradleJDK17

@REM set ANDROID_HOME=%current_dir%\..\androidSdk
@REM set sdkManagerDir=%ANDROID_HOME%/cmdline-tools/latest/bin

@REM set sourceCodeDir=%current_dir%\..\appSourceCode

@REM rem Set environment variables
@REM set PATH=%PATH%;%node_path%;%java_home%\bin

rem Verify paths are set correctly

@REM echo Java home: %java_home%



@REM pause