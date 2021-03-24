import { getDocsFeedbackSpreadsheet, getSheet, FeedbackRow } from "./sheets";
import {
  bulkProcessFeedback,
  NewWidgetVote,
  processFeedback,
} from "./feedback";

export async function main() {
  // Initialize the sheet - doc ID is the long id in the sheets URL
  const doc = await getDocsFeedbackSpreadsheet();
  const sheet = await getSheet(doc, { title: "All" });
  await bulkProcessFeedback({ batchSize: 500 }, async (votes) => {
    await sheet.addRows(votes.map((vote) => mapVoteToRow(vote)));
  });
}

function mapVoteToRow(vote: NewWidgetVote): FeedbackRow {
  return {
    _id: vote._id,
    "Docs Project": vote.page.docs_property,
    "Docs Version": vote.page.docs_version ?? "",
    "Page Name": vote.page.title,
    "Page Slug": vote.page.slug,
    "Page URL": vote.page.url,
    Rating: vote.rating ?? "",
    Comment: vote.comment,
    Qualifiers: vote.qualifiers.map((q) => q.shortText).join(", "),
    "User Email": vote.user.email,
    "User ID (Realm)": vote.user.stitch_id,
    "User ID (Segment)": vote.user.segment_id,
    Submitted: vote.isSubmitted,
    Abandoned: vote.isAbandoned,
    Stale: vote.isStale ?? false,
    "Created At": vote.createdAt?.toISOString(),
    "Submitted At": vote.submittedAt?.toISOString() ?? "",
    "Abandoned At": vote.abandonedAt?.toISOString() ?? "",
  };
}
