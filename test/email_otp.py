import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()

# Check if API key is set
api_key = os.getenv('SENDGRID_API_KEY')

if not api_key:
    print("=" * 80)
    print("⚠️  ERROR: SENDGRID_API_KEY not found!")
    print("=" * 80)
    print("\nTo use SendGrid, you need to:")
    print("1. Sign up at https://sendgrid.com/")
    print("2. Get your API key from Settings > API Keys")
    print("3. Set environment variable:")
    print("   export SENDGRID_API_KEY='your_api_key_here'")
    print("\n" + "=" * 80)
    exit(1)

with open("./form/email_verification.html", "r", encoding="utf-8") as f:
    html_content = f.read()

message = Mail(
    from_email='member@example.com',
    to_emails='manhhdse181501@fpt.edu.vn',
    subject='Test Email OTP',
    html_content=html_content)

try:
    sg = SendGridAPIClient(api_key)
    response = sg.send(message)
    
    print("=" * 80)
    print("✅ EMAIL SENT SUCCESSFULLY!")
    print("=" * 80)
    print(f"Status Code: {response.status_code}")
    print(f"Body: {response.body}")
    print(f"Headers: {response.headers}")
    print("=" * 80)
    
except Exception as e:
    print("=" * 80)
    print("❌ ERROR SENDING EMAIL")
    print("=" * 80)
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    print("\n💡 Troubleshooting:")
    print("- Check if your SENDGRID_API_KEY is valid")
    print("- Verify your SendGrid account is active")
    print("- Ensure 'from_email' is verified in SendGrid")
    print("=" * 80)