Fortune Loan Services consolidated website package.

Includes the accumulated updates from the fraud-alert changes through the latest requests: favicon links across pages, homepage inquiry CTA, fraud alert ticker, loan card/list updates (Gold Loan and Agriculture Loan removed), Udyam and Trade Licence conditional fields, referral reward copy, smooth green process animation, mandatory two reference details, salary fields, WhatsApp/FormSubmit integration, and corporate address styling.

Deploy the contents of this folder together. After deployment, test form submissions and hard-refresh the browser (Ctrl+Shift+R). Google Search favicon updates only after Google recrawls the site.

EMAIL + WHATSAPP SUBMISSION UPDATE
----------------------------------
The forms now send their email copy through the same-origin /api/formsubmit endpoint.
This endpoint is a Vercel serverless function that forwards the request to FormSubmit
at loanservicesfortune@gmail.com. This avoids the browser-side CORS failure shown in
Chrome DevTools. WhatsApp still opens with a prefilled message; the user must tap Send.

DEPLOYMENT REQUIREMENT
----------------------
Deploy this website on Vercel with the website files at the project root. Keep the
/api/formsubmit.js file in the /api folder at the same level as index.html. Vercel
must deploy the API function along with the static website. The email API will not
run if you open index.html directly from your computer (file://) or use a static-only
host that does not support serverless functions.

EMAIL STATUS
------------
The website displays whether FormSubmit accepted or rejected the email request.
An accepted request is not a guarantee of inbox delivery; check Inbox, Spam and All Mail.
The FormSubmit recipient remains loanservicesfortune@gmail.com. No new verification
step is intentionally added by this code change.

ASSETS
------
This ZIP intentionally excludes the assets folder. Keep your existing assets folder
beside index.html after extracting. All original assets/ references are preserved.
