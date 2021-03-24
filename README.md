# MongoDB Docs Feedback - Export to Google Sheets

## Quickstart

### 1. Clone & Install

```sh
gh repo clone nlarew/docs-feedback-sheets
cd docs-feedbacksheets
npm install
```

### 2. Define a `.env` File

This repo includes a template that you can use. It includes all the fields you need - you just
provide the values. To use it, rename the template to `.env`:

```sh
mv .env.template .env
```

The following steps describe how to set the values in `.env`:

a. Create a [Google Service Account](https://cloud.google.com/iam/docs/service-accounts) and list
   its credentials for `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`

b. Create or open the Google spreadsheet you want to export to. Copy its id from the URL and
   paste it for `DOCS_FEEDBACK_SPREADSHEET_ID`

c. Get the credentials for a database user on the Atlas `docsfeedback` cluster. The user should
   have at least `readWriteAnyDatabase`. Supply the user's credential for
   `DOCS_FEEDBACK_CLUSTER_USERNAME` and `DOCS_FEEDBACK_CLUSTER_PASSWORD`.

### 3. Run the Script

```sh
npm run start
```
