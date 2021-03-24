import { FilterQuery, MongoClient, Cursor } from "mongodb";

export interface Qualifier {
  displayOrder: number;
  id: string;
  shortText: string;
  text: string;
  value: boolean;
}

export interface NewWidgetVote {
  _id: string;
  schemaVersion: number;
  user: {
    email: string;
    segment_id: string;
    stitch_id: string;
    isAnonymous: string;
  };
  page: {
    docs_property: string;
    docs_version: string;
    slug: string;
    title: string;
    url: string;
  };
  rating: number;
  comment: string;
  qualifiers: Qualifier[];
  isAbandoned: boolean;
  isSubmitted: boolean;
  isStale?: boolean;
  createdAt: Date;
  abandonedAt?: Date;
  submittedAt?: Date;
  lastModified?: string;
}

function getClient() {  
  const username = process.env.DOCS_FEEDBACK_CLUSTER_USERNAME ?? "";
  const password = process.env.DOCS_FEEDBACK_CLUSTER_PASSWORD ?? "";
  const uri = `mongodb+srv://${username}:${password}@docsfeedback.um4a7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client
}

export type ProcessFeedbackCallback = (vote: NewWidgetVote) => void | Promise<void>
export type BulkProcessFeedbackCallback = (votes: NewWidgetVote[]) => void | Promise<void>
export type BulkProcessOptions = {
  batchSize: number;
}
export const bulkProcessFeedback = async (options: BulkProcessOptions = { batchSize: 500 }, callback: BulkProcessFeedbackCallback) => {
  const client = getClient();
  try {
    await client.connect()
    // perform actions on the collection object
    const collection = client.db("deluge").collection("newWidgetVotes");
    const query: FilterQuery<NewWidgetVote> = {}
    const feedbackQuery: Cursor<NewWidgetVote> = collection.find(query);
    feedbackQuery.batchSize(options.batchSize)

    async function * batched(size: number) {
      let batch = []
      for await (let vote of feedbackQuery) {
        batch.push(vote)
        if(batch.length === size || await feedbackQuery.hasNext() === false) {
          yield batch
          batch = []
        }
      }
    }

    let count = 0;
    for await (let batch of batched(500)) {
      count += batch.length
      await callback(batch);
    }
    console.log(`processed ${count} votes`)
  } finally {
    await client.close();
  }
}


export async function processFeedback(callback: ProcessFeedbackCallback, options?: {
  limit: number;
}) {
  const client = getClient();
  try {
    await client.connect()
    // perform actions on the collection object
    const collection = client.db("deluge").collection("newWidgetVotes");
    const query: FilterQuery<NewWidgetVote> = {}
    const feedbackQuery: Cursor<NewWidgetVote> = collection.find(query);
    if(options?.limit) {
      feedbackQuery.limit(options.limit)
    }
    feedbackQuery.batchSize(500)
    let count = 0;
    for await (let vote of feedbackQuery) {
      count++
      callback(vote);
    }
    console.log(`processed ${count} votes`)
  } finally {
    await client.close();
  }
}
