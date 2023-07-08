
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
},
{ timestamps: true }
);

// Create a unique index on 'postId' and 'user' fields
likeSchema.index({ postId: 1, user: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
