const { CronJob } = require('cron');
const connectionRequest = require('../models/connectionRequest');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const sendEmail = require('./sendEmail');

const job = new CronJob('50 12 * * *', async () => {
    try {
        // Get yesterday's date range
        const yesterday = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);

        // Fetch pending connection requests from yesterday
        const pendingRequests = await connectionRequest.find({
            status: "interested",
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd
            }
        }).populate('fromUserId toUserId');

        // Extract unique email IDs
        const listOfMails = [...new Set(pendingRequests.map(req => req.toUserId.emailId))];

        // Send emails
        for (const email of listOfMails) {
            try {
                const res = await sendEmail.run(
                    `New Friend Requests Pending for ${email}`,
                    "There are many connection requests. Visit WeConnect 45 and accept them to build new connections."
                );
                console.log(`Email sent to ${email}:`, res);
            } catch (error) {
                console.error(`Error sending email to ${email}:`, error);
            }
        }
    } catch (error) {
        console.error("Error running cron job:", error);
    }
});

job.start(); // Start the cron job
