const user = require("../models/user.js");
const express = require("express");
const { userAuth } = require('../middleware/auth.js');
const connectionRequest = require("../models/connectionRequest");

const requestRouter = express.Router();

// Send Connection Request
requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const { status, toUserId } = req.params;
        const loggedInUser = req.user;
        const fromUserId = loggedInUser._id;

        // Validate status
        if (!["interested", "ignored"].includes(status)) {
            return res.status(400).json({ message: `Invalid status type: ${status}` });
        }

        // Ensure `toUserId` is provided and not the same as the sender
        if (!toUserId || toUserId === fromUserId) {
            return res.status(400).json({ message: "Invalid recipient user ID." });
        }

        // Check if `toUser` exists in the database
        const toUser = await user.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "Recipient user not found!" });
        }

        // Check for an existing connection request
        const existingRequest = await connectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ],
        });
        if (existingRequest) {
            return res.status(400).json({ message: "Connection request already exists!" });
        }

        // Create a new connection request
        const newConnection = new connectionRequest({
            fromUserId,
            toUserId,
            status,
        });
        const data = await newConnection.save();

        res.json({
            message:
              req.user.firstName + " is " + status + " in " + toUser.firstName,
            data,
          });
    } catch (error) {
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
});

// Review Connection Request
requestRouter.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        // Validate status
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type!" });
        }

        // Find the connection request
        const connectionRequest1 = await connectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });
        if (!connectionRequest1) {
            return res.status(404).json({ message: "Connection request not found or not eligible for review!" });
        }

        // Update the connection request status
        connectionRequest1.status = status;
        const data = await connectionRequest1.save();

        res.json({ message: `Connection request ${status}!`, data });
    } catch (error) {
        res.status(400).json({ message: `ERROR: ${error.message}` });
    }
});

module.exports = requestRouter;
