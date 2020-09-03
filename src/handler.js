const cheerio = require('cheerio');
const fetch = require('node-fetch');

const { covidMessageUrl } = require('./config');
const ErrorEmptyMessage = require('./ErrorEmptyMessage');
const savedMessage = require('./savedMessage');
const sendUpdate = require('./sendUpdate');

const extractMessageFromDocument = $ => $('[id^="contentGrid_"]')
  .text()
  .trim()
  .replace(/[\n\s]{2,}/gm, '\n\n')
  .replace(/\t/g, '');

exports.handler = async () => {
  const expectedMessage = await savedMessage.get();

  return fetch(covidMessageUrl)
    .then(response => response.text())
    .then(cheerio.load)
    .then(extractMessageFromDocument)
    .then(message => {
      if (!message || message && !message.length) {
        throw new ErrorEmptyMessage();
      } else if (message !== expectedMessage) {
        return Promise.all([
          savedMessage.update(message),
          sendUpdate(message),
        ]);
      }
    });
};