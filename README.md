# group_chat

Please go through the below steps

1. Create a new database called 'groupchat' or any relevant name in the MongoDB
2. Create a .env file into the root dir and copy all contents from the .env.example
    - NOTE: add suitable values to all .env variables (e.g. add db url to URL)
3. npm i
4. npm run test (this runs all the integration tests for all the created APIs)
    NOTE: This test creates the in-memory MongoDB server and calls actual APIs with given data(inside each test)
5. import postman collection in the postman app from dir /v1/postman_collection/Group Chat.postman_collection.json (this collection has sample success and error responses saved as an example inside the request)
6. npm run dev (starts the server)
7. call APIs in below order:
    1. Register / Create Admin (call this API to register the Admin with the email and password given in the .env file)
    2. Login User/Admin (login with admin cred)
    3. Register / Create user (create normal user)
    NOTE: After these 3 steps, a normal user can log in with its cred(using login API), create a group, add members to the group, and send/like message