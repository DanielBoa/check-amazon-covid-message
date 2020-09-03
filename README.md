# Check Amazon COVID Message

Lambda which watches Amazon's [statement regarding COVID tests](https://www.amazon.co.uk/b?node=21103026031) and sends me a text if it changes.

* hackily uses SSM Param store to persist message
* uses AWS SAM for deployment
* see `scripts` in `package.json` to test, run, deploy etc.