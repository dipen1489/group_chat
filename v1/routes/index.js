import express from "express";
import Auth from './auth.js';
import User from './user.js';
import Group from './group.js';
import Message from './message.js';

const app = express(); 

app.use('/v1/auth', Auth);

app.use('/v1/users', User);

app.use('/v1/groups', Group);

app.use('/v1/messages', Message);

export default app;