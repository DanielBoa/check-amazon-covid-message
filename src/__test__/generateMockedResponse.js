module.exports = (content, hasCorrectId = true) => ({
  text: async () => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>mock page</title>
    </head>
    <body>
      <div id="${hasCorrectId ? 'contentGrid_1231243' : ''}">${content}</div>
    </body>
    </html>
  `,
});