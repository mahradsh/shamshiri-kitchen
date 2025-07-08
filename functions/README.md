# 🔥 Firebase Functions for Shamshiri Kitchen

## 📧 Email Notifications via Firebase Extension

This project uses the **Firebase Trigger Email Extension** for automatic email notifications instead of custom Firebase Functions.

### How It Works:
1. **Order Placed**: Staff places an order through the app
2. **Document Created**: Order data is saved to Firestore `orders` collection
3. **Email Triggered**: App adds email document to `mail` collection
4. **Extension Sends**: Firebase extension automatically sends emails
5. **Admins Notified**: All configured admin emails receive notifications

### Email Configuration:
- **Extension**: `firebase/firestore-send-email`
- **SMTP**: Gmail via `shamshiritech@gmail.com`
- **Collection**: `mail` (where email documents are added)
- **Recipients**: Up to 20 admin email addresses from admin panel

### Benefits:
- ✅ **No Custom Code**: Extension handles all email logic
- ✅ **Reliable**: Managed by Firebase team
- ✅ **Scalable**: Automatically handles multiple recipients
- ✅ **Secure**: SMTP credentials managed by Firebase
- ✅ **Monitored**: Built-in logging and error tracking

### Email Template Features:
- **Professional Design**: Shamshiri branding (#b32127)
- **Order Details**: Number, date, location, staff member
- **Item List**: All ordered items with quantities  
- **Staff Notes**: Optional notes from staff
- **HTML Format**: Rich formatting and styling

## 🔧 Setup Complete

The extension is configured with:
- **SMTP Connection**: `smtps://shamshiritech@gmail.com@smtp.gmail.com:465`
- **Authentication**: App password from Gmail
- **Mail Collection**: `mail`
- **Events Enabled**: For monitoring and debugging

## 📊 Monitoring

### View Extension Logs:
1. Go to **Firebase Console** → **Extensions**
2. Click **Trigger Email from Firestore**
3. View **Logs** tab for email delivery status

### Test Email Sending:
1. **Place a test order** through staff interface
2. **Check admin panel** email settings are configured
3. **Verify emails** are received by admin addresses
4. **Check extension logs** for any errors

## 🎯 Integration with App

The app automatically:
- **Reads notification settings** from Firestore `settings` collection
- **Creates email documents** in `mail` collection when orders are placed
- **Includes all order details** in professional HTML template
- **Sends to all configured admin emails** (up to 20 recipients)

---

**🎉 Email notifications are now handled by Firebase Trigger Email Extension!** 

How this extension works
Use this extension to render and send emails that contain the information from documents added to a specified Cloud Firestore collection.

Adding a document triggers this extension to send an email built from the document’s fields. The document’s top-level fields specify the email sender and recipients, including to, cc, and bcc options (each supporting UIDs). The document’s message field specifies the other email elements, like subject line and email body (either plaintext or HTML)

Here’s a basic example document write that would trigger this extension:

admin.firestore().collection('mail').add({
  to: 'someone@example.com',
  message: {
    subject: 'Hello from Firebase!',
    html: 'This is an <code>HTML</code> email body.',
  },
})
You can also optionally configure this extension to render emails using Handlebar templates. Each template is a document stored in a Cloud Firestore collection.

When you configure this extension, you’ll need to supply your SMTP credentials for mail delivery. Note that this extension is for use with bulk email service providers, like SendGrid, Mailgun, etc.

Firestore-Send-Email: SendGrid Categories
When using SendGrid (SMTP_CONNECTION_URI includes sendgrid.net), you can assign categories to your emails.

Example JSON with Categories:
{
  "to": ["example@example.com"],
  "categories": ["Example_Category"],
  "message": {
    "subject": "Test Email with Categories",
    "text": "This is a test email to see if categories work.",
    "html": "<strong>This is a test email to see if categories work.</strong>"
  }
}
Add this document to the Firestore mail collection to send categorized emails.

For more details, see the SendGrid Categories documentation.

Firestore-Send-Email: SendGrid Dynamic Templates
When using SendGrid, you can use SendGrid Dynamic Templates to create and send templated emails.

Example JSON representation of Firestore document for a Dynamic Template:
{
  "to": ["example@example.com"],
  "sendGrid": {
    "templateId": "d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",  // SendGrid Dynamic Template ID always starts with 'd-'
    "dynamicTemplateData": {
      "name": "John Doe",
      "company": "Example Corp",
      "position": "Developer"
    }
  }
}
Add this document to the Firestore mail collection to send an email using a SendGrid Dynamic Template. The templateId is required and should be your SendGrid Dynamic Template ID (always starts with ‘d-‘). The dynamicTemplateData object contains the variables that will be used in your template.

For more details, see the SendGrid Dynamic Templates documentation.

Setting Up OAuth2 Authentication
This section will help you set up OAuth2 authentication for the extension, using GCP (Gmail) as an example.

The extension is agnostic with respect to OAuth2 provider. You just need to provide it with valid Client ID, Client Secret, and Refresh Token parameters.

Step 1: Create OAuth Credentials in Google Cloud Platform
Go to the Google Cloud Console

Select your project

In the left sidebar, navigate to APIs & Services > Credentials

Click Create Credentials and select OAuth client ID

Set the application type to Web application

Give your OAuth client a name (e.g., “Firestore Send Email Extension”)

Under Authorized redirect URIs, add the URI where you’ll receive the OAuth callback, for example, http://localhost:8080/oauth/callback.

Note: The redirect URI in your OAuth client settings MUST match exactly the callback URL in your code.

Click Create.

Step 2: Configure OAuth Consent Screen
In Google Cloud Console, go to APIs & Services > OAuth consent screen
Choose the appropriate user type:
External: For applications used by any Google user
Internal: For applications used only by users in your organization
Important Note: If your OAuth consent screen is in “Testing” status, refresh tokens will expire after 7 days unless the User Type is set to “Internal.”

Step 3: Generate a Refresh Token
You can use a standalone helper script (oauth2-refresh-token-helper.js) that generates a refresh token without requiring any npm installations.

Prerequisites:

You must have Node.js installed on your machine
Download the script:

Download the script using curl, wget, or directly from your browser:

# Using curl
curl -o oauth2-refresh-token-helper.js https://raw.githubusercontent.com/firebase/extensions/refs/heads/master/firestore-send-email/scripts/oauth2-refresh-token-helper.js

# Using wget
wget https://raw.githubusercontent.com/firebase/extensions/refs/heads/master/firestore-send-email/scripts/oauth2-refresh-token-helper.js
You can also view the script on GitHub and download it manually.

Note: If you are creating your own application to obtain a refresh token, in a Node.js environment where you can use npm packages, consider using the official google-auth-library instead:

Install the library: npm install google-auth-library
Then use it like this:
import { OAuth2Client } from "google-auth-library";

// Initialize OAuth client
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate authorization URL
const authorizeUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://mail.google.com/"],  // Full Gmail access
});

// After receiving the code from the callback:
const { tokens } = await oAuth2Client.getToken(code);
const refreshToken = tokens.refresh_token;
Run the script with Node.js:

node oauth2-refresh-token-helper.js
The script supports the following command-line options:

--port, -p     Port to run the server on (default: 8080 or PORT env var)
--id, -i       Google OAuth Client ID
--secret, -s   Google OAuth Client Secret
--output, -o   Output file to save the refresh token (default: refresh_token.txt)
--help, -h     Show help information
You can either provide your credentials as command-line arguments or set them as environment variables:

# Using environment variables
export CLIENT_ID=your_client_id
export CLIENT_SECRET=your_client_secret
node oauth2-refresh-token-helper.js

# Using command-line arguments
node oauth2-refresh-token-helper.js --id=your_client_id --secret=your_client_secret
The script will:

Start a local web server
Open your browser to the OAuth consent page
Receive the authorization code
Exchange the code for tokens
Save the refresh token to a file (default: refresh_token.txt)
Display the refresh token in your browser
Important: The redirect URI in the script (http://localhost:8080/oauth/callback by default) MUST match exactly what you configured in the Google Cloud Console OAuth client settings.

The script automatically requests the appropriate scope for Gmail access (https://mail.google.com/) and sets the authorization parameters to always receive a refresh token (access_type: "offline" and prompt: "consent").

Step 4: Configure the Firestore Send Email Extension
When installing the extension, select “OAuth2” as the Authentication Type and provide the following parameters:

OAuth2 SMTP Host: smtp.gmail.com (for Gmail)
OAuth2 SMTP Port: 465 (for SMTPS) or 587 (for STARTTLS)
Use Secure OAuth2 Connection: true (for port 465) or false (for port 587)
OAuth2 Client ID: Your Client ID from GCP
OAuth2 Client Secret: Your Client Secret from GCP
OAuth2 Refresh Token: The refresh token generated in Step 3
SMTP User: Your full Gmail email address
Leave Use secure OAuth2 connection? as the default value true.

Troubleshooting
Refresh Token Expiration
Testing Status: If your OAuth consent screen is in “Testing” status, refresh tokens expire after 7 days unless User Type is set to “Internal”
Solution: Either publish your app or ensure User Type is set to “Internal” in the OAuth consent screen settings
No Refresh Token Received
Problem: If you don’t receive a refresh token during the OAuth flow
Solution: Make sure you’ve revoked previous access or forced consent by going to Google Account Security > Third-party apps with account access
Scope Issues
Problem: If you see authentication errors, you might not have the correct scopes
Solution: Ensure you’ve added https://mail.google.com/ as a scope in the OAuth consent screen
Additional Resources
Google OAuth2 Documentation
Nodemailer OAuth2 Guide
Firebase Extensions Documentation
Automatic Deletion of Email Documents
To use Firestore’s TTL feature for automatic deletion of expired email documents, the extension provides several configuration parameters.

The extension will set a TTL field in the email documents, but you will need to manually configure a TTL policy for the collection/collection group the extension targets, on the delivery.expireAt field.

Detailed instructions for creating a TTL field can be found in the Firestore TTL Policy documentation.

Billing
To install an extension, your project must be on the Blaze (pay as you go) plan

This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s no-cost tier:
Cloud Firestore
Cloud Functions (Node.js 10+ runtime. See FAQs)
Usage of this extension also requires you to have SMTP credentials for mail delivery. You are responsible for any associated costs with your usage of your SMTP provider.

Further reading & resources
You can find more information about this extension in the following articles:

Sending Emails Using Firestore And Firebase Extensions