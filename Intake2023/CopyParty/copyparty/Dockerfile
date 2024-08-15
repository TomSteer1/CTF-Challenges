FROM alpine
RUN apk add py3-pillow ffmpeg
RUN mkdir /app
COPY copyparty-sfx.py /app 
COPY data /app/data
COPY flag.txt /root/flag.txt
EXPOSE 3923
CMD ["python3", "/app/copyparty-sfx.py", "--http-only", "-v", "/app/data::rw","-nih","-nid" , "-ed", "--theme" , "6"]
