import type { Response } from 'express';
import mongoose from 'mongoose';
import { Post } from '../models/Post.ts';
import { Comment } from '../models/Comment.ts';
import { Notification } from '../models/Notification.ts';
import { isDbConnected } from '../config/db.ts';
import { memoryStore, type StorePost } from '../config/store.ts';
import { type AuthRequest } from '../middleware/auth.ts';

// @desc    Get community feed posts with pagination and filters
// @route   GET /api/posts
// @access  Public / Optional Auth
export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = req.query.filter as string; // 'all' | 'following' | 'challenge' | 'saved'
    const category = req.query.category as string;
    const authorId = req.query.authorId as string;
    const search = req.query.search as string;

    if (isDbConnected()) {
      const query: Record<string, unknown> = {};

      if (req.user && req.user.blocked && req.user.blocked.length > 0) {
        query.author = { $nin: req.user.blocked };
      }

      if (authorId) {
        if (mongoose.Types.ObjectId.isValid(authorId)) {
          query.author = authorId;
        } else {
          query.authorEmail = authorId.toLowerCase();
        }
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      if (filter === 'challenge') {
        query.challengePost = true;
      }

      if (filter === 'saved' && req.user) {
        query.savedBy = req.user._id;
      }

      if (filter === 'following' && req.user) {
        const followingList = req.user.following || [];
        query.author = { $in: [...followingList, req.user._id] };
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ text: regex }, { authorName: regex }];
      }

      const total = await Post.countDocuments(query);
      const posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const formattedPosts = posts.map(post => {
        const isLiked = req.user
          ? post.likedBy.some(id => id.toString() === req.user?._id.toString())
          : false;
        const isSaved = req.user
          ? post.savedBy.some(id => id.toString() === req.user?._id.toString())
          : false;

        return {
          _id: post._id,
          id: post._id.toString(),
          author: post.author.toString(),
          authorEmail: post.authorEmail,
          authorName: post.isAnonymous ? 'Anonymous Warrior' : post.authorName,
          authorAvatar: post.isAnonymous ? '' : post.authorAvatar,
          text: post.text,
          images: post.images,
          category: post.category,
          milestoneDay: post.milestoneDay,
          likedBy: post.likedBy.map(id => id.toString()),
          likesCount: post.likedBy.length,
          savedBy: post.savedBy.map(id => id.toString()),
          shareCount: post.shareCount || 0,
          isLiked,
          isSaved,
          isAnonymous: post.isAnonymous,
          challengePost: post.challengePost,
          commentsCount: post.commentsCount || 0,
          createdAt: post.createdAt,
          timestamp: new Date(post.createdAt).getTime(),
        };
      });

      res.status(200).json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        posts: formattedPosts,
      });
      return;
    }

    // In-Memory store
    let filtered = [...memoryStore.posts];

    // Exclude blocked
    if (req.user && req.user.blocked && req.user.blocked.length > 0) {
      filtered = filtered.filter(p => !req.user.blocked.includes(p.author));
    }

    if (authorId) {
      filtered = filtered.filter(p => p.author === authorId || p.authorEmail.toLowerCase() === authorId.toLowerCase());
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (filter === 'challenge') {
      filtered = filtered.filter(p => p.challengePost);
    }

    if (filter === 'saved' && req.user) {
      filtered = filtered.filter(p => p.savedBy.includes(req.user._id.toString()));
    }

    if (filter === 'following' && req.user) {
      const followSet = new Set(req.user.following || []);
      followSet.add(req.user._id.toString());
      filtered = filtered.filter(p => followSet.has(p.author));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(p => p.text.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit);

    const formattedPosts = paged.map(post => {
      const isLiked = req.user
        ? post.likedBy.includes(req.user._id.toString())
        : false;
      const isSaved = req.user
        ? post.savedBy.includes(req.user._id.toString())
        : false;

      return {
        _id: post._id,
        id: post._id,
        author: post.author,
        authorEmail: post.authorEmail,
        authorName: post.isAnonymous ? 'Anonymous Warrior' : post.authorName,
        authorAvatar: post.isAnonymous ? '' : post.authorAvatar,
        text: post.text,
        images: post.images,
        category: post.category,
        milestoneDay: post.milestoneDay,
        likedBy: post.likedBy,
        likesCount: post.likedBy.length,
        savedBy: post.savedBy,
        shareCount: post.shareCount || 0,
        isLiked,
        isSaved,
        isAnonymous: post.isAnonymous,
        challengePost: post.challengePost,
        commentsCount: post.commentsCount || 0,
        createdAt: post.createdAt,
        timestamp: new Date(post.createdAt).getTime(),
      };
    });

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      posts: formattedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { text, images, category, milestoneDay, isAnonymous, challengePost } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ message: 'Post content cannot be empty' });
      return;
    }

    if (isDbConnected()) {
      const post = await Post.create({
        author: req.user._id,
        authorName: req.user.name,
        authorEmail: req.user.email,
        authorAvatar: req.user.avatar,
        text: text.trim(),
        images: Array.isArray(images) ? images : [],
        category: category || 'general',
        milestoneDay: milestoneDay || null,
        isAnonymous: Boolean(isAnonymous),
        challengePost: Boolean(challengePost),
      });

      res.status(201).json({
        success: true,
        post: {
          _id: post._id,
          id: post._id.toString(),
          author: post.author.toString(),
          authorEmail: post.authorEmail,
          authorName: post.isAnonymous ? 'Anonymous Warrior' : post.authorName,
          authorAvatar: post.isAnonymous ? '' : post.authorAvatar,
          text: post.text,
          images: post.images,
          category: post.category,
          milestoneDay: post.milestoneDay,
          likedBy: [],
          likesCount: 0,
          savedBy: [],
          shareCount: 0,
          isLiked: false,
          isSaved: false,
          isAnonymous: post.isAnonymous,
          challengePost: post.challengePost,
          commentsCount: 0,
          createdAt: post.createdAt,
          timestamp: new Date(post.createdAt).getTime(),
        },
      });
      return;
    }

    // In-Memory store
    const newId = '651000000000' + Math.random().toString(16).slice(2, 14).padEnd(12, '0');
    const newPost: StorePost = {
      _id: newId,
      author: req.user._id.toString(),
      authorName: req.user.name,
      authorEmail: req.user.email,
      authorAvatar: req.user.avatar || '',
      text: text.trim(),
      images: Array.isArray(images) ? images : [],
      category: category || 'general',
      milestoneDay: milestoneDay || undefined,
      likedBy: [],
      savedBy: [],
      shareCount: 0,
      isAnonymous: Boolean(isAnonymous),
      challengePost: Boolean(challengePost),
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.posts.unshift(newPost);

    res.status(201).json({
      success: true,
      post: {
        _id: newPost._id,
        id: newPost._id,
        author: newPost.author,
        authorEmail: newPost.authorEmail,
        authorName: newPost.isAnonymous ? 'Anonymous Warrior' : newPost.authorName,
        authorAvatar: newPost.isAnonymous ? '' : newPost.authorAvatar,
        text: newPost.text,
        images: newPost.images,
        category: newPost.category,
        milestoneDay: newPost.milestoneDay,
        likedBy: [],
        likesCount: 0,
        savedBy: [],
        shareCount: 0,
        isLiked: false,
        isSaved: false,
        isAnonymous: newPost.isAnonymous,
        challengePost: newPost.challengePost,
        commentsCount: 0,
        createdAt: newPost.createdAt,
        timestamp: new Date(newPost.createdAt).getTime(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { text, images, category, milestoneDay, isAnonymous } = req.body;

    if (isDbConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403).json({ message: 'You can only edit your own posts' });
        return;
      }

      if (text) post.text = text.trim();
      if (Array.isArray(images)) post.images = images;
      if (category) post.category = category;
      if (milestoneDay !== undefined) post.milestoneDay = milestoneDay;
      if (isAnonymous !== undefined) post.isAnonymous = isAnonymous;

      await post.save();
      res.status(200).json({ success: true, post });
      return;
    }

    const post = memoryStore.posts.find(p => p._id === req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.author !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ message: 'You can only edit your own posts' });
      return;
    }

    if (text) post.text = text.trim();
    if (Array.isArray(images)) post.images = images;
    if (category) post.category = category;
    if (milestoneDay !== undefined) post.milestoneDay = milestoneDay;
    if (isAnonymous !== undefined) post.isAnonymous = isAnonymous;
    post.updatedAt = new Date();

    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403).json({ message: 'You can only delete your own posts' });
        return;
      }

      await Post.findByIdAndDelete(req.params.id);
      await Comment.deleteMany({ post: req.params.id });

      res.status(200).json({ success: true, message: 'Post deleted successfully' });
      return;
    }

    const postIndex = memoryStore.posts.findIndex(p => p._id === req.params.id);
    if (postIndex === -1) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const post = memoryStore.posts[postIndex];
    if (post.author !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ message: 'You can only delete your own posts' });
      return;
    }

    memoryStore.posts.splice(postIndex, 1);
    memoryStore.comments = memoryStore.comments.filter(c => c.post !== req.params.id);

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Like or Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      const userObjId = req.user._id;
      const isLiked = post.likedBy.some(id => id.toString() === userObjId.toString());

      if (isLiked) {
        post.likedBy = post.likedBy.filter(id => id.toString() !== userObjId.toString());
      } else {
        post.likedBy.push(userObjId);

        if (post.author.toString() !== userObjId.toString()) {
          await Notification.create({
            recipient: post.author,
            recipientEmail: post.authorEmail,
            sender: userObjId,
            senderName: req.user.name,
            type: 'like',
            title: 'Post Liked',
            message: `${req.user.name} sent strength to your recovery share.`,
            link: `/posts/${post._id}`,
          });
        }
      }

      await post.save();
      res.status(200).json({ success: true, liked: !isLiked, likesCount: post.likedBy.length });
      return;
    }

    // In-Memory store
    const post = memoryStore.posts.find(p => p._id === req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.user._id.toString();
    const isLiked = post.likedBy.includes(userId);

    if (isLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
    } else {
      post.likedBy.push(userId);

      if (post.author !== userId) {
        memoryStore.notifications.push({
          _id: 'notif_' + Date.now(),
          recipient: post.author,
          recipientEmail: post.authorEmail,
          sender: userId,
          senderName: req.user.name,
          type: 'like',
          title: 'Post Liked',
          message: `${req.user.name} sent strength to your recovery share.`,
          link: `/posts/${post._id}`,
          read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    res.status(200).json({ success: true, liked: !isLiked, likesCount: post.likedBy.length });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Save or Unsave post
// @route   POST /api/posts/:id/save
// @access  Private
export const savePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (isDbConnected()) {
      const post = await Post.findById(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      const userObjId = req.user._id;
      const isSaved = post.savedBy.some(id => id.toString() === userObjId.toString());

      if (isSaved) {
        post.savedBy = post.savedBy.filter(id => id.toString() !== userObjId.toString());
      } else {
        post.savedBy.push(userObjId);
      }

      await post.save();
      res.status(200).json({ success: true, saved: !isSaved, savedCount: post.savedBy.length });
      return;
    }

    // In-Memory store
    const post = memoryStore.posts.find(p => p._id === req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const userId = req.user._id.toString();
    const isSaved = post.savedBy.includes(userId);

    if (isSaved) {
      post.savedBy = post.savedBy.filter(id => id !== userId);
    } else {
      post.savedBy.push(userId);
    }

    res.status(200).json({ success: true, saved: !isSaved, savedCount: post.savedBy.length });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Increment share count
// @route   POST /api/posts/:id/share
// @access  Public
export const sharePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { $inc: { shareCount: 1 } },
        { new: true }
      );

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }

      res.status(200).json({ success: true, shareCount: post.shareCount });
      return;
    }

    const post = memoryStore.posts.find(p => p._id === req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    post.shareCount = (post.shareCount || 0) + 1;
    res.status(200).json({ success: true, shareCount: post.shareCount });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
