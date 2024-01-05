import express from "express";
import Auth from './auth.js';
import User from './user.js';
import Group from './group.js';
import Message from './message.js';
import { respDto } from '../utils/commonDto.js'

const app = express(); 

app.get("/v1", (req, res) => {
    try {
        return res.status(200).json(respDto([],{},{}));
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
});

app.use('/v1/auth', Auth);

app.use('/v1/users', User);

app.use('/v1/groups', Group);

app.use('/v1/messages', Message);

export default app;