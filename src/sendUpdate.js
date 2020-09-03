const aws = require('aws-sdk');
const { phoneNumber, covidMessageUrl } = require('./config');
const sns = new aws.SNS();

const sendUpdate = message => sns.publish({
  Message: message + `\n\n${covidMessageUrl}`,
  PhoneNumber: phoneNumber,
  MessageAttributes: {
    'AWS.SNS.SMS.SMSType': {
      DataType: 'String',
      StringValue: 'Transactional',
    },
    'AWS.SNS.SMS.SenderID': { 
      DataType: 'String',
      StringValue: 'update',
    },
  },
}).promise();

module.exports = sendUpdate;