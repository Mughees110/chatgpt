const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI =
  "mongodb+srv://testusername:testuserpassword@cluster0.nfgli.mongodb.net/mydatabase2?retryWrites=true&w=majority"; // Replace with your MongoDB connection string

app.use(bodyParser.json());
app.use(cors());

let db;

MongoClient.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db("chatApp"); // Replace 'chatApp' with your database name

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Endpoint to store a new message (either user message or fake response)
app.post("/api/messages", async (req, res) => {
  try {
    const { text, type, sessionId } = req.body;
    const result = await db
      .collection("messages")
      .insertOne({ text, type, sessionId });
    res.status(201).json({
      message: "Message stored successfully",
      messageId: result.insertedId,
    });
  } catch (error) {
    console.error("Error storing message:", error);
    res.status(500).json({ error: "Failed to store message" });
  }
});

// Endpoint to retrieve messages by session ID
app.get("/api/messages/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await db
      .collection("messages")
      .find({ sessionId: sessionId })
      .toArray();
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});
app.post("/api/first-message/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    // Update session with the retrieved messages
    const session = await db.collection("sessions").findOneAndUpdate(
      { _id: new ObjectId(sessionId) }, // Assuming sessionId is the _id of the session document
      { $set: { message: message } } // Set the messages field with retrieved messages
      // Return the updated document
    );

    // If session is found and updated successfully, return the updated session

    res.status(200).json("ok");
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});
// Endpoint to fetch all sessions
app.get("/api/sessions", async (req, res) => {
  try {
    const { page = 1, limit = 10, email } = req.query;
    const skip = (page - 1) * parseInt(limit, 10);
    const limitInt = parseInt(limit, 10);

    const sessions = await db
      .collection("sessions")
      .find({ email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitInt)
      .toArray();

    const today = [];
    const yesterday = [];
    const last7Days = [];
    const older = {};

    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const last7DaysDate = new Date(todayDate);
    last7DaysDate.setDate(todayDate.getDate() - 7);

    sessions.forEach((session) => {
      const createdAt = new Date(session.createdAt);

      if (createdAt.toDateString() === todayDate.toDateString()) {
        today.push(session);
      } else if (createdAt.toDateString() === yesterdayDate.toDateString()) {
        yesterday.push(session);
      } else if (createdAt >= last7DaysDate) {
        last7Days.push(session);
      } else {
        const monthYear = `${createdAt.getFullYear()}-${
          createdAt.getMonth() + 1
        }`;
        if (!older[monthYear]) {
          older[monthYear] = [];
        }
        older[monthYear].push(session);
      }
    });

    const paginatedResult = {
      today,
      yesterday,
      last7Days,
      older,
    };

    res.status(200).json({ paginatedResult });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// Endpoint to create a new session
app.post("/api/sessions", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db
      .collection("sessions")
      .insertOne({ email, createdAt: new Date() });
    res.status(201).json({ sessionId: result.insertedId });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});
