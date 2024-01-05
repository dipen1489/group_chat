import User from "../models/User.js";
import { respDto, metaDto } from '../utils/commonDto.js'
import mongoose from "mongoose";

export async function Register(req, res) {
    try {
        const { first_name, last_name, email, password } = req.body;
        const userData = {
            first_name,
            last_name,
            password,
            email,
            role: req.role
        }
        const newUser = new User(userData);
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json(respDto([], {message: "It seems you already have an account, please log in instead."}, {}));
        const savedUser = await newUser.save();
        const { password: pwd, role, ...user_data } = savedUser._doc;
        res.status(201).json(respDto(user_data, {}, {}));
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

async function count(){
    return await User.count({ "role": { "$ne": 'admin' } })
}

export async function GetAll(req, res) {
    try {
        const page = parseInt(req?.query?.page || 1);
        const limit = parseInt(req?.query?.limit || 10);
        const users = await User.find({ "role": { "$ne": 'admin' } })
        .sort({ "createdAt": 1 })
                .limit(limit)
                .skip((page - 1) * limit);
        const total = await count()
        let userClone = [];
        for (let user of users) {
            let response = {
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                id: user._id
            }
            userClone.push(response);
        }
        res.status(200).json(respDto(userClone, {}, metaDto(total, page, limit)));
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

export async function Update(req, res) {
    try {
        const userId = req?.params?.user_id;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json(respDto([], {message: "User not found"}, {}));
            }

            Object.assign(user, req.body);
            await user.save();
            res.status(204)
        } else {
            return res.status(404).json(respDto([], {message: "User not found"}, {}));
        }
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}