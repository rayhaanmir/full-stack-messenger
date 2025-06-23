# Full Stack Messenger

A full-stack, real-time messaging application that uses React with TypeScript for the frontend; Node.js, Express.js, and Socket.IO for the backend; and Mongoose for the database.

## Note about my server

If you wish to log in to the website but the website seems to be stuck trying to sign you in, it it likely that the server I am hosting on render.com **has been suspended due to inactivity** as I am using the free version. To start the server back up, either wait up to a minute after attempting to log in before trying again, visit [my server](https://full-stack-messenger.onrender.com/) directly (the normal response if not suspended will be an error with the message "Cannot GET /"), or run `curl https://full-stack-messenger.onrender.com/` in a terminal and wait for an HTML response.
