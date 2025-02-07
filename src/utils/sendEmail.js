const {sesClient}=require('./sesClient.js')
const { SendEmailCommand } =require("@aws-sdk/client-ses");
const createSendEmailCommand = (toAddress, fromAddress,subject,response) => {
    return new SendEmailCommand({
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          toAddress,
          /* more To-email addresses */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: "UTF-8",
            Data: `<h1>${response}</h1>`,
          },
          Text: {
            Charset: "UTF-8",
            Data: response,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromAddress,
      ReplyToAddresses: [
        /* more items */
      ],
    });
  };

// Send Email
const run = async ( subject, response) => {
  const sendEmailCommand = createSendEmailCommand("weconnect4522@gmail.com", "cdileepkumar22@gmail.com", subject, response);

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = { run };

// Request Router

