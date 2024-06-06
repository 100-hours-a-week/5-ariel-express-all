import db from '../model/db.js'; // 데이터베이스 연결 가져오기
import { getCurrentDateTime } from '../tools/currentDateTime.js';

// 게시글 목록 조회
const posts = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.post_id, 
                p.title, 
                p.created_at, 
                p.post_image, 
                p.post_content, 
                p.likes_count, 
                p.views_count,
                (SELECT COUNT(*) FROM comment c WHERE c.post_id = p.post_id) AS comments_count,
                u.profile_picture AS author_profile_picture,
                u.nickname AS author_nickname
            FROM post p
            JOIN user u ON p.user_id = u.user_id
            ORDER BY p.created_at ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Server error');
    }
};

// 게시글 상세 조회
const getPostById = async (req, res) => {
    const postId = req.params.id;

    try {
        const [rows] = await db.query(`
            SELECT 
                p.post_id, 
                p.title, 
                p.created_at, 
                p.post_image, 
                p.post_content, 
                p.likes_count, 
                p.views_count,
                (SELECT COUNT(*) FROM comment c WHERE c.post_id = p.post_id) AS comments_count,
                u.email AS author_email,
                u.profile_picture AS author_profile_picture,
                u.nickname AS author_nickname
            FROM post p
            JOIN user u ON p.user_id = u.user_id
            WHERE p.post_id = ?
        `, [postId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // 댓글도 함께 가져오기
        const [comments] = await db.query(`
            SELECT 
                c.comment_id, 
                c.comment_content, 
                c.created_at, 
                u.email AS author_email,
                u.profile_picture AS author_profile_picture, 
                u.nickname AS author_nickname
            FROM comment c
            JOIN user u ON c.user_id = u.user_id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        `, [postId]);

        const post = rows[0];
        post.comments = comments;
        
        res.json(post);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).send('Server error');
    }
};

// 게시글 목록 조회 페이지 전송
const listOfPosts = (req, res) => {
    const loggedInUser = req.session.loggedInUser;

    console.log(`현재 로그인한 이메일: ${loggedInUser}`);
    res.sendFile(path.join(publicPath, 'html', 'list-of-posts.html'));
};

// 게시글 삭제
const deletePost = async (req, res) => {
    const { postId } = req.body;

    try {
        const [result] = await db.query('DELETE FROM post WHERE post_id = ?', [postId]);
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
};

// 게시글 작성
const createPost = async (req, res) => {
    const { title, content } = req.body;
    const imageFile = req.file; // 이미지 파일
    const loggedInUserEmail = req.session.loggedInUser;

    // 현재 날짜와 시간 가져오기
    const { currentDate, currentTime } = getCurrentDateTime();

    try {
        const [userRows] = await db.query('SELECT user_id, profile_picture, nickname FROM user WHERE email = ?', [loggedInUserEmail]);
        const loggedInUser = userRows[0];

        if (!loggedInUser) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        const imagePath = imageFile ? `http://localhost:3001/${imageFile.path}` : null;

        const [result] = await db.query(
            'INSERT INTO post (user_id, title, created_at, post_image, post_content, likes_count, views_count) VALUES (?, ?, ?, ?, ?, 0, 0)',
            [loggedInUser.user_id, title, `${currentDate} ${currentTime}`, imagePath, content]
        );

        res.json({ success: true, message: '게시글이 성공적으로 작성되었습니다.' });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ success: false, error: 'Failed to create post' });
    }
};

// 게시글 수정
const updatePost = async (req, res) => {
    const postId = req.query.id;
    const { title, content } = req.body;
    const imageFile = req.file; // 이미지 파일

    try {
        const [rows] = await db.query('SELECT * FROM post WHERE post_id = ?', [postId]);
        const post = rows[0];

        if (!post) {
            res.status(404).json({ success: false, error: 'Post not found' });
            return;
        }

        const imagePath = imageFile ? `http://localhost:3001/${imageFile.path}` : post.post_image;

        const [result] = await db.query(
            'UPDATE post SET title = ?, post_content = ?, post_image = ? WHERE post_id = ?',
            [title, content, imagePath, postId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ success: false, error: 'Failed to update post' });
    }
};

export default {
    posts,
    listOfPosts,
    deletePost,
    createPost,
    updatePost,
    getPostById
};
