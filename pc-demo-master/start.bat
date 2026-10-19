@echo off
set NODE_PATH=C:\Program Files\nodejs\
set PATH=%NODE_PATH%;%PATH%

node node_modules\vite\bin\vite.js --mode devlopment --host 0.0.0.0 --port 5176