import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
    },
    Message: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
      immutable: true, // Prevents updates to this field after creation
    },
  },
  { timestamps: true }
);

const ContactMovie =
  mongoose.models.ContactMovie || mongoose.model("ContactMovie", contactSchema);

export default ContactMovie;
