import User from "../models/User.js";
import Group from "../models/Group.js";
import { respDto, metaDto } from '../utils/commonDto.js'
import mongoose from "mongoose";
import Message from "../models/Message.js";

export async function Register(req, res) {
    try {
        const { name } = req.body;
        const newGroup = new Group({ name, creator: req.user._id, members: [req.user._id] });
        const existingGroup = await Group.findOne({ name });
        if (existingGroup)
            return res.status(400).json(respDto([], {message: "It seems the group with name = '"+name+"' is already exists"}, {}));
        const savedGroup = await newGroup.save();
        const { messages, members, ...group_data } = savedGroup._doc;
        res.status(201).json(respDto(group_data, {}, {}));
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

export async function Remove(req, res) {
    try {
        const groupId = req?.params?.group_id;
        if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
            const groupDel = await Group.findByIdAndDelete(groupId);
            if (!groupDel) {
                return res.status(404).json(respDto([], {message: "Group not found"}, {}));
            }
            await Message.deleteMany({'_id': { $in: groupDel.messages }})
            res.status(204)
        } else {
            return res.status(404).json(respDto([], {message: "Group not found"}, {}));
        }
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

async function count(query){
    return await Group.count(query)
}

export async function GetAll(req, res) {
    try {
        const page = parseInt(req?.query?.page || 1);
        const limit = parseInt(req?.query?.limit || 10);
        const searchString = req?.query?.search || '';
        const query = { "name": { "$regex": searchString, "$options": "i" }}
        const gropus = await Group.find(query)
        .sort({ "createdAt": 1 })
                .limit(limit)
                .skip((page - 1) * limit);
        const total = await count(query)
        let groupClone = [];
        for (let group of gropus) {
            let response = {
                name: group.name,
                members: group.members,
                id: group._id
            }
            groupClone.push(response);
        }
        res.status(200).json(respDto(groupClone, {}, metaDto(total, page, limit)));
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

export async function GetDetails(req, res) {
    try {
        const groupId = req?.params?.group_id;
        if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json(respDto([], {message: "Group not found"}, {}));
            }

            const creator = await User.findById(group.creator);

            let memberList = group.members.map((user) =>{
                return user._id.toHexString();
            });
            let members = await User.find({'_id': { $in: memberList }});

            let messageList = group.messages.map((message) =>{
                return message._id.toHexString();
            });

            let messages = await Message.find({'_id': { $in: messageList }});

            const groupClone = {}
            groupClone.name = group.name
            groupClone.creator = creator.first_name+"_"+creator.last_name
            groupClone.members = members.map((user) => user.first_name+"_"+user.last_name)
            groupClone.messages = messages.map((message) => {
                const sender = members.find((member) => member._id.toHexString() === message.sender.toHexString())
                const msg = {}
                msg.id = message._id
                msg.content = message.content
                msg.sender = sender.first_name+"_"+sender.last_name
                msg.likes = message.likes.map((like) => {
                    const userLikes = members.find((member) => member._id.toHexString() === like.toHexString())
                    return userLikes.first_name+"_"+userLikes.last_name
                })
                return msg
            })
            res.status(200).json(respDto(groupClone, {}, {}));
        } else {
            return res.status(404).json(respDto([], {message: "Group not found"}, {}));
        }
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

export async function AddMembers(req, res) {
    try {
        const groupId = req?.params?.group_id;
        const { members } = req.body;
        if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json(respDto([], {message: "Group not found"}, {}));
            }
            const uniqueMembers = [...new Set([...group.members.map((data) => data.toHexString()), ...members])]
            Object.assign(group, { members: uniqueMembers });
            await group.save();
            res.status(201)
        } else {
            return res.status(404).json(respDto([], {message: "Group not found"}, {}));
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}