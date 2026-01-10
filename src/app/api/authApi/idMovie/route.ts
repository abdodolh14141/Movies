import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("id");
    const searchTerm = searchParams.get("s");
    const page = searchParams.get("page") || "1";
    const BASE_URL = process.env.BASE_API_URL;
    const API_KEY = process.env.API_KEY;

    if (!movieId && !searchTerm) {
      return NextResponse.json(
        { error: "Search term (s) or Movie ID (id) is required" },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams({
      apikey: API_KEY || "",
      ...(movieId ? { i: movieId, plot: "full" } : { s: searchTerm!, page }),
    });

    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === "False") {
      return NextResponse.json(
        { error: data.Error || "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from external API" },
      { status: 500 }
    );
  }
}
