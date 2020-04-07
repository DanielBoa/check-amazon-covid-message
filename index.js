const cheerio = require('cheerio');
const fetch = require('node-fetch');
const aws = require('aws-sdk');

const defaultMessage = (`
The Government has asked Amazon to partner with them - alongside other retailers, life science companies and academic institutions - to aid in the fast-track of testing for the Coronavirus (COVID-19). You can find the official press release here.
These tests will not be available over the counter or for purchase online from any retailers.

We are using our logistics network to support the NHS with their plans. Further details will be set out by the Government in due course and we will update this page with more information as soon as it becomes available.

We believe our role serving customers and the community during this time is a critical one, and we are committed to working closely with the Government to identify ways in which we can support efforts to respond to the crisis.

For more information on COVID-19, please visit: https://www.nhs.uk
`).trim();

const sns = new aws.SNS();
const ssm = new aws.SSM();
const messageParameterName = process.env.COVID_MESSAGE_PARAM_NAME;
const covidMessageUrl = process.env.URL_TO_CHECK;
const phoneNumber = process.env.PHONE_NUMBER;

const extractMessageFromDocument = $ => $('.bxc-grid__container')
  .text()
  .trim()
  .replace(/[\n\s]{2,}/gm, '\n\n')
  .replace(/\t/g, '');

const sendUpdate = message => sns
  .setSMSAttributes({ attributes: { DefaultSenderID: 'update' } })
  .promise()
  .then(() => sns.publish({
    Message: (message || 'Empty message retrieved.') + `\n\n${covidMessageUrl}`,
    PhoneNumber: phoneNumber,
  }).promise());

const getMessageFromParamStore = () => ssm
  .getParameter({ Name: messageParameterName })
  .promise()
  .then(res => res.Parameter.Value)
  .catch(() => '');

const updateMessageInParamStore = message => ssm
  .putParameter({
    Name: messageParameterName,
    Type: 'String',
    Overwrite: true,
    Value: message,
  }).promise();

exports.handler = async () => {
  const expectedMessage = (await getMessageFromParamStore()) || defaultMessage;

  await fetch(covidMessageUrl)
    .then(response => response.text())
    .then(cheerio.load)
    .then(extractMessageFromDocument)
    .then(message => {
      if (message !== expectedMessage) sendUpdate(message);
      return message;
    })
    .then(updateMessageInParamStore);
};