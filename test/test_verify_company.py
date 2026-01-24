from verification.company_verifier import CompanyVerifier
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == '__main__':
	verifier = CompanyVerifier()
	company_email = "manhhdse181501@fpt.edu.vn"
	tax_code = "0317553589"

	result = verifier.verify_tax_code(tax_code)
	print(result)

	result = verifier.send_email_otp(email=company_email)
	print(result)

