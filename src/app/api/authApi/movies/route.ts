import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";

// 1. Validate Environment Variables at the top level
const BASE_API_URL = process.env.BASE_API_URL;
const API_KEY = process.env.API_KEY;

export async function GET(req: NextRequest) {
  // 2. Use NextRequest for better typing of searchParams
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get("id");
  const searchTerm = searchParams.get("s");
  const page = searchParams.get("page") || "1";

  // 3. Early return for configuration errors
  if (!BASE_API_URL || !API_KEY) {
    console.error("Missing Server Environment Variables");
    return NextResponse.json(
      { error: "Internal Server Configuration Error" },
      { status: 500 }
    );
  }

  // 4. Validate user input
  if (!movieId && !searchTerm) {
    return NextResponse.json(
      { error: "Either Search term (s) or Movie ID (id) is required" },
      { status: 400 }
    );
  }

  const params: Record<string, string> = {
    apikey: API_KEY,
    ...(movieId ? { i: movieId, plot: "full" } : { s: searchTerm!, page }),
  };

  try {
    // 5. Axios with a timeout to prevent hanging deployments
    const res = await axios.get(BASE_API_URL, {
      params,
      timeout: 5000, // 5 seconds timeout
    });

    const data = res.data;

    // 6. Handle OMDb-specific response logic
    if (data.Response === "False") {
      return NextResponse.json(
        { error: data.Error || "No results found" },
        { status: 404 }
      );
    }

    // 7. Add Cache-Control headers to save on API calls and speed up the UI
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error: unknown) {
    // 8. Specialized Error Handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("OMDb API Connection Error:", axiosError.message);
      return NextResponse.json(
        { error: "Communication with OMDb failed" },
        { status: axiosError.response?.status || 502 }
      );
    }

    console.error("Unexpected Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
