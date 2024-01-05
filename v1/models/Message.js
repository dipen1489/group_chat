import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
},
{ timestamps: true }
);

export default mongoose.model('Message', messageSchema);
