python -m venv venv
venv\Scripts\activate

uvicorn main:app --reload
Server will start at:
http://127.0.0.1:8000 

Swagger UI:
http://127.0.0.1:8000/docs
