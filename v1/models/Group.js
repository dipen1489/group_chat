import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, unique: true, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Reference to group members
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }], // Reference to group messages
},
{ timestamps: true }
);

export default mongoose.model('Group', groupSchema);