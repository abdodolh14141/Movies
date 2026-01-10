import axios from "axios";
import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL;
const API_KEY = process.env.API_KEY; // Consider moving this to .env.local

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get("id");
  const searchTerm = searchParams.get("s");
  const page = searchParams.get("page") || "1";

  // Prepare parameters for OMDb
  const params: Record<string, string> = { apikey: API_KEY };

  if (movieId) {
    params.i = movieId; // Get specific movie details by ID
    params.plot = "full"; // Optional: Returns the full plot instead of short
  } else if (searchTerm) {
    params.s = searchTerm; // Search for a list of movies
    params.page = page;
  } else {
    return NextResponse.json(
      { error: "Search term (s) or Movie ID (id) is required" },
      { status: 400 }
    );
  }

  try {
    const res = await axios.get(BASE_API_URL, { params });
    const data = res.data;

    // Handle OMDb internal errors (e.g., "Movie not found")
    if (data.Response === "False") {
      return NextResponse.json(
        { error: data.Error || "No results found" },
        { status: 404 }
      );
    }

    // Return the data directly.
    // If it was an ID search, 'data' is the movie object.
    // If it was a title search, 'data' contains the Search array.
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("OMDb API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data from OMDb" },
      { status: 500 }
    );
  }
};
