FROM python:3.12
WORKDIR /app
RUN apt-get update && apt-get install -y netcat-openbsd
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . /app
# EXPOSE 8000