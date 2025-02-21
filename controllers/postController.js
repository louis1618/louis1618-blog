const { getPostsCollection, getUsersCollection } = require('../models/db');
const { ObjectId } = require('mongodb');

async function getPost(req, res) {
  try {
    const postId = req.params.id;
    const post = await getPostsCollection().findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
  }
}

async function getAllPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const rankFilter = req.query.rank; // 필터 값

    let filter = {};
    if (rankFilter && rankFilter !== "") {
      filter.rank = rankFilter; // rankFilter가 있을 때만 필터 적용
    }

    const posts = await getPostsCollection()
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    for (let post of posts) {
      const user = await getUsersCollection().findOne({ _id: new ObjectId(post.a_id) });
      if (user) {
        post.author = user.userHandle;
        post.d_author = user.DisplayName;
      }
    }

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

async function createPost(req, res) {
  try {
    const { user } = req.session;
    if (!user || user.rank === undefined) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newPost = req.body;
    const userId = new ObjectId(user.id);
    const userData = await getUsersCollection().findOne({ _id: userId });

    if (!userData) {
      return res.status(403).json({ message: 'User not found' });
    }

    if (user.rank != 0) {
      if (newPost.title && newPost.description && (newPost.tags === undefined || (Array.isArray(newPost.tags) && (newPost.tags.length === 0 || newPost.tags.length > 0)))) {
        newPost.rank =
        user.rank === 5 ? "포트폴리오" :
        user.rank === 4 ? "개발" :
        user.rank === 3 ? "고정됨" :
        "알 수 없음";
        newPost.date = formatDate(new Date());
        newPost.createdAt = new Date();
        newPost.author = userData.userHandle;
        newPost.a_id = userData._id;
        newPost.comment_up = 1;

        await getPostsCollection().insertOne(newPost);
        const posts = await getPostsCollection().find().toArray();
        res.status(200).json(posts);
      } else {
        res.status(400).json({ message: '비정상적인 행동이 감지되었습니다.' });
      }
    } else {
      res.status(400).json({ message: '관리자 외 게시물을 게시할 수 없도록 설정되어 있습니다.' });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
}

module.exports = { getPost, getAllPosts, createPost };