import { GoogleSpreadsheet } from "google-spreadsheet";

export type FeedbackRow = {
  "_id": string;
  "Docs Project": string;
  "Docs Version": string;
  "Page Name": string;
  "Page Slug": string;
  "Page URL": string;
  "Rating": number;
  "Comment": string;
  "Qualifiers": string;
  "User Email": string;
  "User ID (Realm)": string;
  "User ID (Segment)": string;
  "Submitted": boolean;
  "Stale": boolean;
  "Abandoned": boolean;
  "Created At": string;
  "Submitted At": string;
  "Abandoned At": string;
};
export const feedbackRow = <Row extends FeedbackRow>(row: Row) => row

export async function getDocsFeedbackSpreadsheet() {
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    process.env.DOCS_FEEDBACK_SPREADSHEET_ID ?? ""
  );
  await auth(doc);
  await doc.loadInfo(); // loads document properties and worksheets
  return doc
}

export async function getSheet(doc: GoogleSpreadsheet, identifier: { title: string } | { id: string } | { index: number }) {
  let sheet;
  if("title" in identifier) {
    sheet = doc.sheetsByTitle[identifier.title]
  }
  if("id" in identifier) {
    sheet = doc.sheetsById[identifier.id]
  }
  if("index" in identifier) {
    sheet = doc.sheetsByIndex[identifier.index]
  }
  if(!sheet) {
    throw new Error("Unable to find sheet")
  }

  // Load all cells
  await sheet.loadHeaderRow();
  // await sheet.loadCells({
  //   startRowIndex: 0,
  //   endRowIndex: sheet.rowCount - 1,
  //   startColumnIndex: 0,
  //   endColumnIndex: sheet.headerValues.length - 1,
  // });
  return sheet
}

async function auth(doc: GoogleSpreadsheet) {
  // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
      private_key: process.env.GOOGLE_PRIVATE_KEY ?? "",
    });
  } catch (err) {
    if (err?.message) {
      if (err.message === "No key or keyFile set.") {
        console.error(
          "ERROR: Must specify a valid service account private_key"
        );
      }
    }
    if (err?.response?.data) {
      const { error, error_description } = err.response.data;
      if (error === "invalid_grant") {
        switch (error_description) {
          case "Invalid JWT: iss field missing.": {
            console.error("ERROR: Must specify a valid client_email");
          }
          case "Invalid grant: account not found": {
            console.error("ERROR: Must specify a valid client_email");
          }
        }
      }
    }
  }
}
