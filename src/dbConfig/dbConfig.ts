import mongoose from "mongoose";
import env from "dotenv/config";

// Load environment variables
const mongoUrl = process.env.URL_MONGO || "";

if (!mongoUrl) {
  throw new Error("MongoDB URL is not defined in the environment variables.");
}

// Track the connection status
let isConnected = false;

// Function to connect to MongoDB
export async function connectToDatabase(): Promise<void> {
  if (isConnected) {
    console.log("Database is already connected.");
    return;
  }

  try {
    // Set max listeners to avoid potential memory leaks
    mongoose.connection.setMaxListeners(20);

    // Connect to MongoDB
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if the server is not reachable
    });

    isConnected = true;
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error(
      "Failed to connect to the database:",
      error instanceof Error ? error.message : error
    );
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// MongoDB connection event handlers
mongoose.connection.on("connected", () => {
  isConnected = true;
  console.log("MongoDB connection established.");
});

mongoose.connection.on("warning", (warning) => {
  console.warn("MongoDB warning:", warning);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  isConnected = false;
});

mongoose.connection.on("disconnected", async () => {
  isConnected = false;
  console.log("MongoDB connection lost. Attempting to reconnect...");

  try {
    await mongoose.connect(mongoUrl);
    console.log("Reconnected to MongoDB.");
  } catch (error) {
    console.error(
      "Failed to reconnect to MongoDB:",
      error instanceof Error ? error.message : error
    );
  }
});

// Export the connection function
export { connectToDatabase as Connect };
