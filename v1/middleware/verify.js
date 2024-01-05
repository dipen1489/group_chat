import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from '../config/index.js';
import { respDto } from '../utils/commonDto.js'
import Blacklist from '../models/Blacklist.js';

export async function Verify(req, res, next) {
    try {
        const authHeader = req.headers["cookie"];
        if (!authHeader)
            return res.sendStatus(401); 
        
        const cookie = authHeader.split("=")[1]; 
        const accessToken = cookie.split(";")[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted)
            return res.status(401).json(respDto([], { message: "This session has expired. Please login" }, {}));

        jwt.verify(cookie, SECRET_ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                return res.status(401).json(respDto([], { message: "This session has expired. Please login" }, {}));
            }
            const { id } = decoded; 
            const user = await User.findById(id); 
            const { password, ...data } = user._doc; 
            req.user = data; 
            next();
        });
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
}

export function VerifyAdminRole(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        if (role !== "admin") {
            return res.status(401).json(respDto([], {message: "You are not authorized to access this API"}, {}))
        }
        next();
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
}

export function VerifyUserRole(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        if (role !== "user") {
            return res.status(401).json(respDto([], {message: "Only User can access this API, please login with normal user credentials"}, {}))
        }
        next();
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
}