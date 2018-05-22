# PS2 Scrims Script

A node.js application to track players in a fight by outfit tags for planetside 2. Originally created for the Planetside 2 community run Thunderdome tournament, it has been update for other community tournaments. It relies Daybreak Games streaming API for Planetside 2 to run and will not work if this is offline.
A live version of this site is available [here](https://scrim.dylannz.com), you will need to contact DylanNZ for the password though.


_Make sure you have the latest [node.js](https://nodejs.org/en/) installed (This application requires at least Node 7.6.0 to run)_

**N.B: If you don't know computers and are on windows then use _install.bat_ followed by _start.bat_ to install and start the script**

You will need to create 2 javascript files, api_key.js and password.js. 
There are templates of both to show you what they should look like.

To run the script, navigate to the folder where the script is now located using command line.

```sh
$ npm install
```

Once this finishes downloading the dependencies you can run the script using:

```sh
$ node bin/www
```

Then navigate to localhost:3010/admin from there you can control the script as long as you have the password set correctly.

To use this for a streaming overlay then you will need to add the files created by the application inside /overlay. There will be a players file for each team containing each player and their contribution, a team score file for each team and a timer file. You can see an example of these in use [here](https://www.youtube.com/channel/UChjGpOwf8dyJig1_aVRBRoA).

Created by FCLM - DylanNZ, Mononz, Dalordish

