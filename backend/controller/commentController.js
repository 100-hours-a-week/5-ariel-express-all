import fs from 'fs';
import path from 'path';
import { getCurrentDateTime } from '../tools/currentDateTime.js';
import { fileURLToPath } from 'url';

// 현재 모듈의 경로를 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsJsonPath = path.join(__dirname, '..', 'model', 'posts.json');
const usersJsonPath = path.join(__dirname, '..', 'model', 'users.json');


// 댓글 삭제
const deleteComment = (req, res) => {
    const { postId, commentId } = req.body;

    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        // postId를 가진 게시글 찾기
        const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (postIndex !== -1) {
            // postId를 가진 게시글 안에서 commentId를 가진 댓글 찾기
            const commentIndex = posts.posts[postIndex].comments.findIndex(comment => comment.id === parseInt(commentId));
            if (commentIndex !== -1) {
                // 댓글 삭제
                posts.posts[postIndex].comments.splice(commentIndex, 1);

                // 모든 댓글의 id 재설정
                posts.posts[postIndex].comments.forEach((comment, index) => {
                    comment.id = index + 1;
                });

                // 수정된 내용을 다시 JSON 파일에 쓰기
                fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        res.status(500).json({ success: false, error: 'Failed to write file' });
                        return;
                    }
                    // 댓글 삭제가 성공했음을 클라이언트에게 응답
                    res.json({ success: true });
                });
            } else {
                // 해당 postId를 가진 게시글 안에서 commentId를 가진 댓글을 찾지 못한 경우
                res.status(404).json({ success: false, error: 'Comment not found' });
            }
        } else {
            // 해당 postId를 가진 게시글을 찾지 못한 경우
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    });
}

// 댓글 수정
const updateComment = (req, res) => {
    const { postId, commentId, content } = req.body;

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 댓글을 업데이트
    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        console.log(`게시글 찾기 전에 넘어온 댓글: ${content}`);

        // postId를 가진 게시글 찾기
        const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (postIndex !== -1) {
            // postId를 가진 게시글 안에서 commentId를 가진 댓글 찾기
            const commentIndex = posts.posts[postIndex].comments.findIndex(comment => comment.id === parseInt(commentId));
            if (commentIndex !== -1) {
                // 찾은 댓글의 내용 업데이트
                posts.posts[postIndex].comments[commentIndex].content = content;

                // 수정된 내용을 다시 JSON 파일에 쓰기
                fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        res.status(500).json({ success: false, error: 'Failed to write file' });
                        return;
                    }
                    // 업데이트가 성공했음을 클라이언트에게 응답
                    res.json({ success: true });
                });
            } else {
                // 해당 postId를 가진 게시글 안에서 commentId를 가진 댓글을 찾지 못한 경우
                res.status(404).json({ success: false, error: 'Comment not found' });
            }
        } else {
            // 해당 postId를 가진 게시글을 찾지 못한 경우
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    });
}

// 댓글 등록
const addComment = (req, res) => {
    const { postId, content } = req.body;
    
    // 현재 날짜와 시간 가져오기
    const { currentDate, currentTime } = getCurrentDateTime();

    // 현재 로그인된 사용자의 이메일 정보 가져오기
    const loggedInUserEmail = req.session.loggedInUser;

    // 사용자 이메일 정보를 이용하여 해당 사용자의 닉네임과 프로필 정보를 users.json 파일에서 찾아옴
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let users = JSON.parse(data);

        // 이메일을 이용하여 해당 사용자 정보 찾기
        const loggedInUser = users.find(user => user.email === loggedInUserEmail);

        // 사용자 정보를 찾지 못한 경우
        if (!loggedInUser) {
            console.error('User not found');
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // 새로운 댓글의 속성 설정
        let newCommentId;

        // posts.json 파일을 읽어와서 해당 게시글을 찾고 댓글 추가
        fs.readFile(postsJsonPath, 'utf8', (err, postData) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).json({ success: false, error: 'Failed to read file' });
                return;
            }

            let posts = JSON.parse(postData);

            // postId를 가진 게시글 찾기
            const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
            if (postIndex !== -1) {
                // 새로운 댓글의 ID 설정
                newCommentId = posts.posts[postIndex].comments.length + 1;

                // 댓글을 해당 게시글의 댓글 목록에 추가
                const newComment = {
                    id: newCommentId,
                    author: {
                        email: loggedInUserEmail,
                        profile_picture: 'http://localhost:3001/' + loggedInUser.profile_picture,
                        nickname: loggedInUser.nickname
                    },
                    date: currentDate,
                    time: currentTime,
                    content: content
                };

                posts.posts[postIndex].comments.push(newComment);

                // 수정된 내용을 다시 JSON 파일에 씀
                fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        res.status(500).json({ success: false, error: 'Failed to write file' });
                        return;
                    }
                    // 댓글 등록이 성공했음을 클라이언트에게 응답
                    res.json({ success: true, updatedComments: posts.posts[postIndex].comments });
                });
            } else {
                // 해당 postId를 가진 게시글을 찾지 못한 경우
                res.status(404).json({ success: false, error: 'Post not found' });
            }
        });
    });
}

export default {
    deleteComment,
    updateComment,
    addComment,
};