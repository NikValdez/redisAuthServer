# redisAuthServer

### Getting Started
- Git clone the repo
- run `npm install`
- run `npm run start` to boot server
- server should be live at `localhost:5000`


### Approach
- For this project I kept it simple, using redis as my database store, express as my server framework and bcrypt to hash the user passwords.
- If a user hits the register endpoint `/register` and posts a username and password they are redirected to the home page. 
- Note that there are various checks to make sure the username does not exist already and also that a username and password are being posted.
- The password is encrypted prior to it being stored in the redis database.
- If a user hits the login endpoint `/login` much of the same behavior as register occurs.
- The username and password and compared to the redis store and if found to be the same the user is redirected to the homepage.
- Error handling for both routes is implemented.

