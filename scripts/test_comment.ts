
import { db } from "../server/db";
import { comments, articles } from "../shared/schema";
import { eq } from "drizzle-orm";

async function testComment() {
  try {
    // 1. Get an article
    const [article] = await db.select().from(articles).limit(1);
    if (!article) {
      console.log("No articles found to comment on.");
      process.exit(0);
    }
    console.log("Found article:", article.id);

    // 2. Try to insert a comment
    console.log("Attempting to insert comment...");
    const newComment = {
      articleId: article.id,
      userName: "Test User",
      content: "This is a test comment from script.",
      status: "Pending"
    };

    const [comment] = await db.insert(comments).values(newComment).returning();
    console.log("Comment inserted successfully:", comment);

  } catch (error) {
    console.error("Error inserting comment:", error);
  }
  process.exit(0);
}

testComment();
