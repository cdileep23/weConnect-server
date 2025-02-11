const express = require("express");
const { Chat } = require("../models/chat");
const chatRouter = express.Router();
const { userAuth } = require("../middleware/auth");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({ participants: [userId, targetUserId], messages: [] });
      await chat.save();
    }

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error fetching chat" });
  }
});

module.exports = chatRouter;
