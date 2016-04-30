@echo off
echo Deleting any existing file for api_key...
del api_key.js
echo Deleting any existing file for password...
del password.js
echo What password would you like?
SET /P password=Password:
echo %password%
type nul >password.js
echo exports.KEY = '%password%'; > password.js
echo If you don't have a key, type example. You can obtain a key from https://census.daybreakgames.com/#devSignup
SET /P key=Api Key:
echo %key%
type nul > api_key.js
echo exports.KEY = '%key%'; > api_key.js
echo installing dependencies for the script:
npm install
echo All done! run start.bat to start.
pause