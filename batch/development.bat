@echo off

@REM Running node project in production 

call helpers\setPaths.bat


@REM rem Change directory to the root of the Node.js project
@REM cd /d C:\path\to\your\nodejs\project
@REM set BUILDER_ENVIRONMENT=production 
@REM set JAVA_HOME=./gradleJDK11
@REM rem Install dependencies
@REM call  npm install 

@REM rem Start the Node.js application


call  npm run run_app


@REM rem Wait for user input before exiting
pause