import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";

const contactMessageValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "message", "createdAt", "updatedAt"],
    additionalProperties: false,
    properties: {
      _id: { bsonType: "objectId" },
      name: { bsonType: "string", minLength: 2, maxLength: 100 },
      email: {
        bsonType: "string",
        maxLength: 254,
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      },
      message: { bsonType: "string", minLength: 5, maxLength: 5000 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
    },
  },
};

const configureContactMessages = async () => {
  const db = mongoose.connection.db;
  const collectionExists = await db
    .listCollections({ name: "contactmessages" }, { nameOnly: true })
    .hasNext();

  if (!collectionExists) {
    await db.createCollection("contactmessages", {
      validator: contactMessageValidator,
      validationLevel: "strict",
      validationAction: "error",
    });
  } else {
    await db.command({
      collMod: "contactmessages",
      validator: contactMessageValidator,
      validationLevel: "strict",
      validationAction: "error",
    });
  }

  await ContactMessage.init();
};

const connectDB = async () => {
  const connection = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  await configureContactMessages();
  console.log("MongoDB connected successfully.");
  console.log(`Database: ${connection.connection.name}`);
  console.log(`Host: ${connection.connection.host}`);
};

export default connectDB;
