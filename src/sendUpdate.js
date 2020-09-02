const aws = require('aws-sdk');
const { phoneNumber, covidMessageUrl } = require('./config');
const sns = new aws.SNS();

const sendUpdate = message => sns
  .setSMSAttributes({ attributes: { DefaultSenderID: 'update' } })
  .promise()
  .then(() => sns.publish({
    Message: message + `\n\n${covidMessageUrl}`,
    PhoneNumber: phoneNumber,
  }).promise());

module.exports = sendUpdate;