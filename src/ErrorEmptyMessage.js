module.exports = class ErrorEmptyMessage extends Error {
  constructor() {
    super('Scraped message was empty.');
  }
}