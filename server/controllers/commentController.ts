import type { Response } from 'express';
import { Comment } from '../models/Comment.ts';
import { Post } from '../models/Post.ts';
import { Notification } from '../models/Notification.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StoreComment } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Public
export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: 1 });
      const formatted = comments.map(c => ({
        _id: c._id,
        id: c._id.toString(),
        post: c.post.toString(),
        author: c.authorName,
        authorId: c.author.toString(),
        email: c.authorEmail,
        authorAvatar: c.authorAvatar,
        text: c.text,
        createdAt: c.createdAt,
        timestamp: new Date(c.createdAt).getTime(),
      }));

      res.status(200).json({ success: true, count: formatted.length, comments: formatted });
      return;
    }

    // In-Memory store
    const comments = memoryStore.comments.filter(c => c.post === req.params.id);
    const formatted = comments.map(c => ({
      _id: c._id,
      id: c._id,
      post: c.post,
      author: c.authorName,
      authorId: c.author,
      email: c.authorEmail,
      authorAvatar: c.authorAvatar,
      text: c.text,
      createdAt: c.createdAt,
      timestamp: new Date(c.createdAt).getTime(),
    }));

    res.status(200).json({ success: true, count: formatted.length, comments: formatted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ message: 'Comment cannot be empty' });
      return;
    }

    if (isDbConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      const comment = await Comment.create({
        post: post._id,
        author: req.user._id,
        authorName: req.user.name,
        authorEmail: req.user.email,
        authorAvatar: req.user.avatar,
        text: text.trim(),
      });

      post.commentsCount = (post.commentsCount || 0) + 1;
      await post.save();

      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          recipientEmail: post.authorEmail,
          sender: req.user._id,
          senderName: req.user.name,
          type: 'comment',
          title: 'New Reply',
          message: `${req.user.name} replied: "${text.trim().slice(0, 45)}..."`,
          link: `/posts/${post._id}`,
        });
      }

      res.status(201).json({
        success: true,
        comment: {
          _id: comment._id,
          id: comment._id.toString(),
          post: comment.post.toString(),
          author: comment.authorName,
          authorId: comment.author.toString(),
          email: comment.authorEmail,
          authorAvatar: comment.authorAvatar,
          text: comment.text,
          createdAt: comment.createdAt,
          timestamp: new Date(comment.createdAt).getTime(),
        },
      });
      return;
    }

    // In-Memory store
    const post = memoryStore.posts.find(p => p._id === req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const newCommentId = '652000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
    const newComment: StoreComment = {
      _id: newCommentId,
      post: post._id,
      author: req.user._id.toString(),
      authorName: req.user.name,
      authorEmail: req.user.email,
      authorAvatar: req.user.avatar || '',
      text: text.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.comments.push(newComment);
    post.commentsCount = (post.commentsCount || 0) + 1;

    if (post.author !== req.user._id.toString()) {
      memoryStore.notifications.push({
        _id: 'notif_' + Date.now(),
        recipient: post.author,
        recipientEmail: post.authorEmail,
        sender: req.user._id.toString(),
        senderName: req.user.name,
        type: 'comment',
        title: 'New Reply',
        message: `${req.user.name} replied: "${text.trim().slice(0, 45)}..."`,
        link: `/posts/${post._id}`,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      comment: {
        _id: newComment._id,
        id: newComment._id,
        post: newComment.post,
        author: newComment.authorName,
        authorId: newComment.author,
        email: newComment.authorEmail,
        authorAvatar: newComment.authorAvatar,
        text: newComment.text,
        createdAt: newComment.createdAt,
        timestamp: new Date(newComment.createdAt).getTime(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      const post = await Post.findById(comment.post);
      const isCommentAuthor = comment.author.toString() === req.user._id.toString();
      const isPostAuthor = post && post.author.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
        res.status(403).json({ message: 'Not authorized to delete this comment' });
        return;
      }

      await Comment.findByIdAndDelete(req.params.id);

      if (post && post.commentsCount > 0) {
        post.commentsCount -= 1;
        await post.save();
      }

      res.status(200).json({ success: true, message: 'Comment deleted successfully' });
      return;
    }

    const cIndex = memoryStore.comments.findIndex(c => c._id === req.params.id);
    if (cIndex === -1) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const comment = memoryStore.comments[cIndex];
    const post = memoryStore.posts.find(p => p._id === comment.post);
    const isCommentAuthor = comment.author === req.user._id.toString();
    const isPostAuthor = post && post.author === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      res.status(403).json({ message: 'Not authorized to delete this comment' });
      return;
    }

    memoryStore.comments.splice(cIndex, 1);
    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
    }

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
