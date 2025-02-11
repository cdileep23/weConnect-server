const socket = require("socket.io");
const { Chat } = require("../models/chat");
const User = require("../models/user");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: { origin: "http://localhost:5173" },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, targetUserId, userId }) => {
      const room = [userId, targetUserId].sort().join("_");
      socket.join(room);
      console.log(`${firstName} joined the room with ID ${room}`);
    });
    

    socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
      try {
        const roomId = [senderId, receiverId].sort().join("_");
        const senderDetails = await User.findById(senderId).select("firstName lastName");

        let chat = await Chat.findOne({ participants: { $all: [senderId, receiverId] } });
        if (!chat) {
          chat = new Chat({ participants: [senderId, receiverId], messages: [] });
        }

        const newMessage = {
          senderId: {
            _id: senderId,
            firstName: senderDetails.firstName,
            lastName: senderDetails.lastName,
          },
          text,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        io.to(roomId).emit("newMessageReceived", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = { initializeSocket };
