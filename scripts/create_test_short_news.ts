import { db } from "../server/db";
import { shortNews } from "../shared/schema";

async function createTestShortNews() {
  console.log("Creating test short news posts...\n");

  const testPosts = [
    {
      content: "🔥 Breaking: Mount Kenya News launches new quick updates feature! Stay informed with bite-sized news updates.",
      category: "Technology",
      author: "Mount Kenya News",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400",
      isPinned: true,
      status: "published",
    },
    {
      content: "⚡ Local farmers report bumper harvest this season. Food prices expected to drop significantly.",
      category: "Business",
      author: "John Kamau",
      isPinned: false,
      status: "published",
    },
    {
      content: "🏆 Kenya wins gold at international athletics championship! Congratulations to our athletes.",
      category: "Sports",
      author: "Sarah Wanjiru",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400",
      isPinned: false,
      status: "published",
    },
  ];

  try {
    for (const post of testPosts) {
      const [created] = await db.insert(shortNews).values(post).returning();
      console.log(`✅ Created: "${created.content.substring(0, 50)}..."`);
    }
    console.log("\n✅ Successfully created test short news posts!");
    console.log("Visit http://localhost:5000 to see them on the homepage.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    process.exit(0);
  }
}

createTestShortNews();
