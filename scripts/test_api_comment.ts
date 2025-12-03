
import { db } from "../server/db";
import { articles } from "../shared/schema";

async function testApiComment() {
  try {
    // 1. Get an article ID
    const [article] = await db.select().from(articles).limit(1);
    if (!article) {
      console.log("No articles found.");
      process.exit(0);
    }
    console.log("Using article ID:", article.id);

    // 2. Send POST request with MISSING articleId
    console.log("Testing missing articleId...");
    const response = await fetch("http://localhost:5000/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // articleId: article.id, // MISSING
        userName: "API Test User",
        content: "Comment from API test script",
        status: "Pending"
      })
    });

    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Response body:", text);

  } catch (error) {
    console.error("Error testing API:", error);
  }
  process.exit(0);
}

testApiComment();
