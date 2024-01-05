import Group from "../models/Group.js";
import Message from "../models/Message.js";
import { respDto, metaDto } from '../utils/commonDto.js'
import mongoose from "mongoose";

export async function SendMessage(req, res) {
    try {
        const { content } = req.body;
        const groupId = req?.params?.group_id;
        if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json(respDto([], {message: "Group not found"}, {}));
            }
            const newMessage = new Message({ content, sender: req.user._id });
            const savedMessage = await newMessage.save();
            const { ...message_data } = savedMessage._doc;
            Object.assign(group, { messages: [...group.messages.map((data) => data.toHexString()), message_data._id] });
            await group.save();
            res.status(201).json(respDto(message_data, {}, {}));
        } else {
            return res.status(404).json(respDto([], {message: "Group not found"}, {}));
        }
        
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}

export async function LikeMessage(req, res) {
    try {
        const messageId = req?.params?.message_id;
        if (messageId && mongoose.Types.ObjectId.isValid(messageId)) {
            const message = await Message.findById(messageId);
            if (!message) {
                return res.status(404).json(respDto([], {message: "Message not found"}, {}));
            }
            const uniqueLikes = [...new Set([...message.likes.map((data) => data.toHexString()),  req.user._id.toHexString()])]
            Object.assign(message, { likes: uniqueLikes });
            await message.save();
            res.status(204)
        } else {
            return res.status(404).json(respDto([], {message: "Message not found"}, {}));
        }
        
    } catch (err) {
        return res.status(500).json(respDto([], {message: err.message}, {}));
    }
    res.end();
}