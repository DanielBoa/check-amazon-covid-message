const fetch = require('node-fetch');
const generateMockResponse = require('./generateMockedResponse');
const savedMessage = require('../savedMessage');
const sendUpdate = require('../sendUpdate');
const EmptyMessageError = require('../ErrorEmptyMessage');
const { handler } = require('../handler');
const ErrorEmptyMessage = require('../ErrorEmptyMessage');

jest.mock('node-fetch');
jest.mock('../savedMessage');
jest.mock('../sendUpdate');

// get save message from param store
// fetch page with message to scrape
// if save message matches scraped
//    do nothing
// else
//    send sms
//    update message in param store

beforeEach(() => {
  jest.resetAllMocks();
});

describe('happy path', () => {
  it('should update stored message, and send update when scraped value doesn\'t match the stored one', async () => {
    const messageInStore = 'message from store';
    const messageScraped = 'scraped message';

    savedMessage.get.mockResolvedValueOnce(messageInStore);
    fetch.mockResolvedValueOnce(generateMockResponse(messageScraped));

    await handler();

    expect(savedMessage.get).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalled();
    expect(savedMessage.update).toHaveBeenCalledWith(messageScraped);
    expect(sendUpdate).toHaveBeenCalledWith(messageScraped);
  });

  it('should do nothing when scraped value matches the stored one', async () => {
    const messageInStore = 'stored message';
    const messageScraped = messageInStore;

    savedMessage.get.mockResolvedValueOnce(messageInStore);
    fetch.mockResolvedValueOnce(generateMockResponse(messageScraped));

    await handler();

    expect(savedMessage.get).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalled();
    expect(savedMessage.update).not.toHaveBeenCalledWith(messageScraped);
    expect(sendUpdate).not.toHaveBeenCalledWith(messageScraped);
  });
});

describe('unhappy path', () => {
  it('should throw an error if saved message cannot be retrieved', async () => {
    const getSavedMessageError = new Error('Failed to retrieve stored message.') 

    savedMessage.get.mockRejectedValueOnce(getSavedMessageError);

    await expect(handler()).rejects.toThrow(getSavedMessageError);
  });

  it('should throw an error if webpage cannot be retrieved', async () => {
    const getPageMessageError = new Error('Failed to retrieve stored message.') 

    savedMessage.get.mockResolvedValueOnce('some message');
    fetch.mockRejectedValueOnce(getPageMessageError);

    await expect(handler()).rejects.toThrow(getPageMessageError);
  });

  it('should throw an error if saved message fails to update', async () => {
    const messageInStore = 'message from store';
    const messageScraped = 'scraped message';
    const updateMessageError = new Error('Failed update stored message.') 

    savedMessage.get.mockResolvedValueOnce(messageInStore);
    fetch.mockResolvedValueOnce(generateMockResponse(messageScraped));
    savedMessage.update.mockRejectedValueOnce(updateMessageError);

    await expect(handler()).rejects.toThrow(updateMessageError);
  });

  it('should throw an error if update fails to send', async () => {
    const messageInStore = 'message from store';
    const messageScraped = 'scraped message';
    const sendUpdateError = new Error('Failed to send update.') 

    savedMessage.get.mockResolvedValueOnce(messageInStore);
    fetch.mockResolvedValueOnce(generateMockResponse(messageScraped));
    sendUpdate.mockRejectedValueOnce(sendUpdateError);

    await expect(handler()).rejects.toThrow(sendUpdateError);
  });

  it('should throw ErrorEmptyMessage if scraped message is emtpy', async () => {
    const messageInStore = 'message from store';
    const messageScraped = '';

    savedMessage.get.mockResolvedValueOnce(messageInStore);
    fetch.mockResolvedValueOnce(generateMockResponse(messageScraped));

    await expect(handler()).rejects.toThrow(ErrorEmptyMessage);
  });

  it('should throw ErrorEmptyMessage if the message tag is missing', async () => {
    const messageInStore = 'message from store';
    const messageScraped = 'message to scrape';

    savedMessage.get.mockResolvedValueOnce(messageInStore);
    fetch.mockResolvedValueOnce(generateMockResponse(messageScraped, false));

    await expect(handler()).rejects.toThrow(ErrorEmptyMessage);
  });
});