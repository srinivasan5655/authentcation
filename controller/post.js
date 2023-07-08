require("dotenv").config()
const path = require('path');
const fs = require('fs');

const Like = require("../models/like");
const Post = require("../models/post");
const Comment = require("../models/comment");

exports.createPost = async (req, res) => {
    try {
      const { title, content, userId } = req.body;
      const image = req.file.filename;
  
      const newPost = await Post.create({ title, content,image, user: userId });
  
      res.status(201).json(newPost);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: 'Failed to create a new post' });
    }
  };

exports.getPost = async (req, res) => {
    try {
      const { postId } = req.params;
  
      const post = await Post.findById(postId).populate('user likes comments');
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve the post' });
    }
  };

exports.getAllPost =  async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find all posts associated with the given user ID
      const posts = await Post.find({ user: userId });
  
      res.json(posts);
    } catch (error) {
      console.error('Failed to retrieve posts:', error);
      res.status(500).json({ error: 'Failed to retrieve posts' });
    }
  };

exports.updatePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { title, content } = req.body;
      let image = null;
  
      // Check if a new image is uploaded
      if (req.file) {
        image = req.file.filename;
      }
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Remove the old image if a new image is uploaded
      if (image && post.image) {
        const imagePath = path.join('uploads/', post.image);
  
        // Check if the file exists and delete it
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
  
      // Update the post
      post.title = title;
      post.content = content;
      post.image = image;
      await post.save();
  
      res.json(post);
    } catch (error) {
      console.error('Failed to update the post:', error);
      res.status(500).json({ error: 'Failed to update the post' });
    }
  };

exports.deletePost = async (req, res) => {
    try {
      const { postId } = req.params;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      if (post.image) {
        const imagePath = path.join('uploads/', post.image);
  
        // Check if the file exists and delete it
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
  
      await post.remove();
  
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Failed to delete the post:', error);
      res.status(500).json({ error: 'Failed to delete the post' });
    }
  };

exports.addLike = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;
      const post = await Post.findById(postId);
      if(!post){
        return res.status(404).json({ error: 'post not found' });
      }
  
      const existingLike = await Like.findOne({ postId, user: userId });
  
      if (existingLike) {
        return res.status(409).json({ error: 'User already liked this post' });
      }
  
      const newLike = await Like.create({ postId, user: userId });
      post.likes.push(newLike._id)
      await post.save()
      res.json(post);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'User already liked this post' });
      }
      res.status(500).json({ error: 'Failed to add a like to the post' });
    }
  };

exports.addComment = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId, text } = req.body;
  
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      const newComment = await Comment.create({ postId, user: userId, text });
  
      post.comments.push(newComment);
      await post.save();
  
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add a comment to the post' });
    }
  };