import { isDbConnected } from './db.ts';
import { User } from '../models/User.ts';
import { Post } from '../models/Post.ts';
import { Comment } from '../models/Comment.ts';
import { Message } from '../models/Message.ts';
import { Challenge } from '../models/Challenge.ts';

export async function seedInitialDatabase(): Promise<void> {
  if (!isDbConnected()) {
    return;
  }
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('[Seed] Seeding initial RecoveryTribe community database...');
    const now = Date.now();
    const oneDay = 86400000;
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(now - 30 * oneDay).toISOString().slice(0, 10);
    const ninetyDaysAgo = new Date(now - 90 * oneDay).toISOString().slice(0, 10);
    const hundredTwentyDaysAgo = new Date(now - 120 * oneDay).toISOString().slice(0, 10);

    const admin = await User.create({
      name: 'Raghul Dass (Organizer)',
      username: 'raghuldass',
      email: 'raghuldass43@gmail.com',
      password: 'password123',
      bio: 'Founder of RecoveryTribe 🌸 Host of the 100-Day Clean Journey. One day at a time, we walk this together.',
      sobrietyDate: hundredTwentyDaysAgo,
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      pledgedToday: today,
      role: 'admin',
    });

    const priya = await User.create({
      name: 'Dr. Priya Kalyani',
      username: 'priyakalyani',
      email: 'priya.k@tribe.org',
      password: 'password123',
      bio: '90 Days sober & serene. Chennai. Mental health advocate. Grateful for this safe space. 🙏✨',
      sobrietyDate: ninetyDaysAgo,
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      pledgedToday: today,
      role: 'user',
    });

    const aarav = await User.create({
      name: 'Aarav Mehta',
      username: 'aaravm',
      email: 'aarav.m@tribe.org',
      password: 'password123',
      bio: 'Day 30 warrior. Rebuilding my life, guitar player, morning walks are my therapy. 🎸🌅',
      sobrietyDate: thirtyDaysAgo,
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      pledgedToday: today,
      role: 'user',
    });

    const harpreet = await User.create({
      name: 'Harpreet Singh',
      username: 'harpreet_singh',
      email: 'harpreet.singh@tribe.org',
      password: 'password123',
      bio: "Punjab. Chasing peace, not escapes. 15 days clean and counting with Waheguru's grace. 🕊️",
      sobrietyDate: new Date(now - 15 * oneDay).toISOString().slice(0, 10),
      challengeStartDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      pledgedToday: today,
      role: 'user',
    });

    // Cross-follow
    admin.following = [priya._id, aarav._id, harpreet._id];
    priya.followers = [admin._id];
    priya.following = [admin._id, aarav._id];
    aarav.followers = [admin._id, priya._id];
    aarav.following = [admin._id, priya._id];
    harpreet.followers = [admin._id];
    harpreet.following = [admin._id];

    await Promise.all([admin.save(), priya.save(), aarav.save(), harpreet.save()]);

    // Initial Posts
    const post1 = await Post.create({
      author: admin._id,
      authorName: admin.name,
      authorEmail: admin.email,
      authorAvatar: admin.avatar,
      text: "🌅 Day 24 of our 100-Day Recovery Challenge! Today's reflection: When an urge whispers that 'just once won't hurt', pause, drink a tall glass of cold water, and take 5 deep belly breaths. We do not negotiate with cravings — we outbreathe them. How is everyone feeling today?",
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1000&q=80',
      ],
      category: 'challenge',
      challengePost: true,
      milestoneDay: 24,
      likedBy: [priya._id, aarav._id, harpreet._id],
      commentsCount: 2,
    });

    await Comment.create({
      post: post1._id,
      author: priya._id,
      authorName: priya.name,
      authorEmail: priya.email,
      text: 'Woke up feeling anxious, but this reminded me to stay grounded. 5 deep breaths done. Thank you Raghul bhai! 🙏',
    });

    await Comment.create({
      post: post1._id,
      author: aarav._id,
      authorName: aarav.name,
      authorEmail: aarav.email,
      text: 'Day 24 check-in strong! Heading for my evening jog now instead of old habits.',
    });

    const post2 = await Post.create({
      author: priya._id,
      authorName: priya.name,
      authorEmail: priya.email,
      authorAvatar: priya.avatar,
      text: "🎉 Milestone unlocked: 90 DAYS CLEAN & SOBER! 🕊️ Three months ago I couldn't imagine getting through 24 hours without feeling lost. Today my mind is clear, my relationships are healing, and I woke up with genuine gratitude in my heart. If you're on Day 1 or Day 3, please keep going. The light at the end of the tunnel is real!",
      images: [
        'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1000&q=80',
      ],
      category: 'milestone',
      milestoneDay: 90,
      likedBy: [admin._id, aarav._id, harpreet._id],
      commentsCount: 1,
    });

    await Comment.create({
      post: post2._id,
      author: admin._id,
      authorName: admin.name,
      authorEmail: admin.email,
      text: 'Priya, this is monumental!! So immensely proud of your strength and resilience. Keep shining! 🌟💐',
    });

    await Post.create({
      author: aarav._id,
      authorName: aarav.name,
      authorEmail: aarav.email,
      authorAvatar: aarav.avatar,
      text: '30 days chip reached today! My hands don’t shake anymore when I play my acoustic guitar. Replacing chaos with melody. Gratitude to everyone in this tribe for holding space during my darkest evenings. 🙏',
      images: [
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80',
      ],
      category: 'gratitude',
      milestoneDay: 30,
      likedBy: [admin._id, priya._id],
    });

    // Seed Initial Community Messages
    await Message.create({
      sender: admin._id,
      senderName: admin.name,
      senderEmail: admin.email,
      recipient: 'community_circle',
      text: "Welcome to today's Community Circle check-in! Share how you are feeling in one word or emoji. We hold space for everyone.",
    });

    await Message.create({
      sender: priya._id,
      senderName: priya.name,
      senderEmail: priya.email,
      recipient: 'community_circle',
      text: 'Peaceful 🧘 Woke up with a calm nervous system. Grateful for this safe space.',
    });

    await Message.create({
      sender: aarav._id,
      senderName: aarav.name,
      senderEmail: aarav.email,
      recipient: 'community_circle',
      text: 'Determined 💪 Going for Day 31 clean. If anyone feels an evening urge, remember we are all here together.',
    });

    // Direct message sample
    await Message.create({
      sender: aarav._id,
      senderName: aarav.name,
      senderEmail: aarav.email,
      recipient: admin._id.toString(),
      text: 'Hey Raghul, thank you for organizing the 100-day challenge. Checking in every morning has really kept me accountable.',
    });

    await Message.create({
      sender: admin._id,
      senderName: admin.name,
      senderEmail: admin.email,
      recipient: aarav._id.toString(),
      text: "You're doing fantastic Aarav! Reaching 30 days is a huge milestone. Keep taking it one sunrise at a time brother.",
    });

    // Initial Challenge records
    const completed24 = Array.from({ length: 24 }, (_, i) => i + 1);
    await Challenge.create({
      user: admin._id,
      userEmail: admin.email,
      startDate: new Date(now - 24 * oneDay).toISOString().slice(0, 10),
      completedDays: completed24,
      dailyLogs: [{ day: 24, checkInTime: new Date(), reflection: 'Feeling grounded and grateful.', urgeLevel: 0, mood: 'Peaceful' }],
      progressPercent: 24,
    });

    console.log('[Seed] Database successfully seeded with 4 users, posts, comments, messages, and challenge records.');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
}
