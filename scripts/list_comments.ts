
import { db } from "../server/db";
import { comments } from "../shared/schema";

async function listComments() {
  try {
    const allComments = await db.select().from(comments);
    console.log("Current Comments in Database:");
    console.log(JSON.stringify(allComments, null, 2));
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
  process.exit(0);
}

listComments();
