import User from "@/app/models/userModel";
import { Connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

export async function POST(req: NextRequest) {
  try {
    await Connect();

    const { name, email, age, password } = await req.json();

    // Validate required fields
    if (!name || !email || !age || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ Email: email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      Name: name,
      Email: email,
      Age: age,
      Password: hashedPassword, // Save the hashed password
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", success: true },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error during user registration:", error); // Log the error for debugging
    return NextResponse.json(
      { message: "An error occurred", error: error.message, success: false },
      { status: 500 }
    );
  }
}
