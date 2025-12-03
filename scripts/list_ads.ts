
import { db } from "../server/db";
import { ads } from "../shared/schema";

async function listAds() {
  try {
    const allAds = await db.select().from(ads);
    console.log("Current Ads in Database:");
    console.log(JSON.stringify(allAds, null, 2));
  } catch (error) {
    console.error("Error fetching ads:", error);
  }
  process.exit(0);
}

listAds();
