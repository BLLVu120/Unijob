import requests

url_tax_code = "https://tears-marathon-gilbert-steady.trycloudflare.com/api/verify-tax-code"
url_send_email_otp = "https://tears-marathon-gilbert-steady.trycloudflare.com/api/send-email-otp"

tax_code = "0317553589"
email = "manhhdse181501@fpt.edu.vn"

response = requests.post(url_tax_code, json={"tax_code": tax_code})
print(response.json())

response = requests.post(url_send_email_otp, json={"email": email})
print(response.json())