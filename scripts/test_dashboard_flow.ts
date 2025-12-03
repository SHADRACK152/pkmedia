
import { apiRequest } from "./test_api_utils";

async function testDashboardFlow() {
  console.log("Testing Dashboard Comment Flow...");

  // 1. Create a comment
  const articleId = "f6a43c2b-af5b-41ba-86c0-c5ff915c58b0"; // Use an existing article ID
  const newComment = {
    articleId,
    userName: "Dashboard Tester",
    content: "Testing dashboard visibility",
    status: "Pending"
  };

  console.log("Creating comment...");
  try {
    const created = await apiRequest("POST", "/api/comments", newComment);
    console.log("Comment created:", created.id, created.status);

    // 2. Fetch all comments
    console.log("Fetching all comments...");
    const comments = await apiRequest("GET", "/api/comments");
    
    // 3. Verify
    const found = comments.find((c: any) => c.id === created.id);
    if (found) {
      console.log("Comment found in list!");
      console.log("Status:", found.status);
      if (found.status === "Pending") {
        console.log("SUCCESS: Comment is Pending and visible.");
      } else {
        console.log("WARNING: Comment status mismatch:", found.status);
      }
    } else {
      console.error("ERROR: Comment NOT found in list.");
    }

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testDashboardFlow();
