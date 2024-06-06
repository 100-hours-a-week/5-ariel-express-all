import db from '../model/db.js'; // 데이터베이스 연결 가져오기
import { getCurrentDateTime } from '../tools/currentDateTime.js';

// 댓글 삭제
const deleteComment = async (req, res) => {
    const { postId, commentId } = req.body;

    try {
        const [result] = await db.query('DELETE FROM comment WHERE comment_id = ? AND post_id = ?', [commentId, postId]);
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Comment not found' });
        }
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ success: false, error: 'Failed to delete comment' });
    }
}

// 댓글 수정
const updateComment = async (req, res) => {
    const { postId, commentId, content } = req.body;

    try {
        const [result] = await db.query('UPDATE comment SET comment_content = ? WHERE comment_id = ? AND post_id = ?', [content, commentId, postId]);
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Comment not found' });
        }
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ success: false, error: 'Failed to update comment' });
    }
}

// 댓글 등록
const addComment = async (req, res) => {
    const { postId, content } = req.body;
    
    // 현재 날짜와 시간 가져오기
    const { currentDate, currentTime } = getCurrentDateTime();

    // 현재 로그인된 사용자의 이메일 정보 가져오기
    const loggedInUserEmail = req.session.loggedInUser;

    try {
        // 사용자 이메일 정보를 이용하여 해당 사용자의 ID를 가져옴
        const [userRows] = await db.query('SELECT user_id, profile_picture, nickname FROM user WHERE email = ?', [loggedInUserEmail]);
        const loggedInUser = userRows[0];

        // 사용자 정보를 찾지 못한 경우
        if (!loggedInUser) {
            console.error('User not found');
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // 댓글을 데이터베이스에 삽입
        const [result] = await db.query(
            'INSERT INTO comment (user_id, post_id, created_at, comment_content) VALUES (?, ?, ?, ?)',
            [loggedInUser.user_id, postId, `${currentDate} ${currentTime}`, content]
        );

        // 삽입된 댓글의 ID 가져오기
        const commentId = result.insertId;

        // 새로운 댓글 데이터 생성
        const newComment = {
            comment_id: commentId,
            author_email: loggedInUserEmail,
            author_profile_picture: 'http://localhost:3001/' + loggedInUser.profile_picture,
            author_nickname: loggedInUser.nickname,
            created_at: `${currentDate} ${currentTime}`,
            comment_content: content
        };

        // 성공적으로 삽입되었음을 클라이언트에게 응답
        res.json({ success: true, newComment });
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ success: false, error: 'Failed to add comment' });
    }
}

export default {
    deleteComment,
    updateComment,
    addComment,
};
