Name: Society Bank
Category: Web
Description: A rival cyber society use this bank to sort their finances. Can you retrieve their secrets?
Port: 80
Flag: Intake24{F1l3_Inclu5sion_1s_l0v3}
Solution: 
- Create a user account with the name `../../../../` and an id file of `flag.txt`
- Wait for the account to be approved
- Create an XSS payload to pull the id file as the admin
- Send the payload back to your host
