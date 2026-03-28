import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const collectionsToClean = ["students", "teachers", "donors"];
const obsoleteIndexes = ["email_1"];

const cleanupLegacyIndexes = async () => {
  try {
    await connectDB();

    for (const collectionName of collectionsToClean) {
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.indexes();
      const indexNames = indexes.map((idx) => idx.name);

      for (const indexName of obsoleteIndexes) {
        if (indexNames.includes(indexName)) {
          await collection.dropIndex(indexName);
          console.log(`Dropped ${indexName} on ${collectionName}`);
        } else {
          console.log(`Index ${indexName} not found on ${collectionName}, skipped`);
        }
      }
    }

    console.log("Legacy index cleanup complete");
    process.exit(0);
  } catch (error) {
    console.error("Legacy index cleanup failed:", error.message);
    process.exit(1);
  }
};

cleanupLegacyIndexes();
