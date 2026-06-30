/**
 * One-time migration: clear the image field for "Hoa thanh quế".
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node apps/web/scripts/clear-hoa-thanh-que-image.mjs
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Error: MONGODB_URI environment variable is required.");
  process.exit(1);
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db();
  const products = db.collection("products");

  const result = await products.updateOne(
    { name: "Hoa thanh quế" },
    { $set: { image: "" } }
  );

  if (result.matchedCount === 0) {
    console.log('No product named "Hoa thanh quế" found.');
  } else {
    console.log(`Updated ${result.modifiedCount} document(s). Image cleared.`);
  }
} finally {
  await client.close();
}
