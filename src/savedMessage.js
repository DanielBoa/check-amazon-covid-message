const aws = require('aws-sdk');
const { messageParameterName } = require('./config');
const ssm = new aws.SSM();

const getMessageFromParamStore = () => ssm
  .getParameter({ Name: messageParameterName })
  .promise()
  .then(res => res.Parameter.Value)
  .catch(err => {
    // on first run no message exists
    if (err.code !== 'ParameterNotFound') {
      throw err;
    }

    return '';
  });

const updateMessageInParamStore = message => ssm
  .putParameter({
    Name: messageParameterName,
    Type: 'String',
    Overwrite: true,
    Value: message,
  }).promise();

module.exports = {
  get: getMessageFromParamStore,
  update: updateMessageInParamStore,
};