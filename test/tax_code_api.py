import requests

taxCode = "0317553589"
url = f"https://api.vietqr.io/v2/business/{taxCode}"

response = requests.get(url)

print(response.json())
