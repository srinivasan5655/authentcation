
const mongoose = require('mongoose');
const Comment = require('./comment');
const Like = require('./like');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String }, 
    content: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Like' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

postSchema.pre('remove', async function (next) {
  try {
    const post = this;

    await Comment.deleteMany({ postId: post._id });
    await Like.deleteMany({ postId: post._id });

    next();
  } catch (error) {
    console.error('Failed to delete associated comments and likes:', error);
    throw error;
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
