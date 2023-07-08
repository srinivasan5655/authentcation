const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');

const isAuth = require("../middleware/is-auth");
const postController =  require("../controller/post");

// Create a storage engine for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Set the destination folder for uploaded images
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // Generate a unique filename
      const fileExtension = path.extname(file.originalname);
      cb(null, uniqueSuffix + fileExtension); // Set the filename
    },
  });
  
  // Create the Multer middleware with the configured storage engine
  const upload = multer({ storage: storage });

// Create a new post
router.post('/posts',isAuth,upload.single('image'), postController.createPost)

// Get all posts
router.get('/posts/:userId', isAuth,postController.getAllPost)

// Get a specific post by ID
router.get('/posts/:postId', isAuth, postController.getPost)

// Update a specific post by ID
router.put('/posts/:postId',isAuth, upload.single('image'), postController.updatePost)

// Delete a specific post by ID
router.delete('/posts/:postId',isAuth, postController.deletePost)

// Like a post
router.post('/posts/:postId/like',isAuth, postController.addLike)

// Add a comment to a post
router.post('/posts/:postId/comment',isAuth, postController.addComment)

// ... (previous code)
module.exports = router;
