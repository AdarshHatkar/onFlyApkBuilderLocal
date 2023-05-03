@echo off

call git checkout dev
call git pull -r origin dev

call code .