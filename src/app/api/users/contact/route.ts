import ContactMovie from "@/app/models/contactMovie";
import { Connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await Connect();

    const {
      Name: NameRes,
      Email: EmailRes,
      Message: MsgRes,
    } = await req.json();
    if (!NameRes || !EmailRes || !MsgRes) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    const newContact = new ContactMovie({
      Name: NameRes,
      Email: EmailRes,
      Message: MsgRes,
    });
    await newContact.save();
    return NextResponse.json({
      message: "Message sent successfully",
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong, please try again later", success: false },
      { status: 500 }
    );
  }
}
