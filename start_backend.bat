@echo off
cd /d "C:\Users\tybfist\Documents\GitHub\graduate"
call venv\Scripts\activate
uvicorn python.main:app --host 127.0.0.1 --port 8000