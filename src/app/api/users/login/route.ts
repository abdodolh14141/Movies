import User from "@/app/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    // Check if the email and password are valid
    const checkEmailIsExist = await User.findOne({ Email: email });
    if (!checkEmailIsExist) {
      return NextResponse.json(
        { message: "Email is not exist" },
        { status: 400 }
      );
    }

    // Check if the password is correct
    const checkPassword = await bcrypt.compare(
      password,
      checkEmailIsExist.Password
    );
    if (!checkPassword) {
      return NextResponse.json(
        { message: "Password is not correct" },
        { status: 400 }
      );
    }
    // If email and password are correct, return success response
    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
