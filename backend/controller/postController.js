import fs from 'fs';
import path from 'path';
import { getCurrentDateTime } from '../tools/currentDateTime.js';
import { fileURLToPath } from 'url';

// 현재 모듈의 경로를 가져오기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsJsonPath = path.join(__dirname, '..', 'model', 'posts.json');
const usersJsonPath = path.join(__dirname, '..', 'model', 'users.json');

// 게시글 정보를 파일에서 읽어와서 클라이언트에게 전송
const posts = (req, res) => {
    const postsFilePath = postsJsonPath;
    res.sendFile(postsFilePath);
}

// 게시글 목록 조회 페이지 전송
const listOfPosts = (req, res) => {
    const loggedInUser = req.session.loggedInUser;

    console.log(`현재 로그인한 이메일: ${loggedInUser}`);
    res.sendFile(path.join(publicPath, 'html', 'list-of-posts.html'));
}

// 게시글 삭제
const deletePost = (req, res) => {
    const { postId } = req.body;

    // posts.json 파일 읽어오기
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
            // 게시글 삭제
            posts.posts.splice(postIndex, 1);

            // 삭제된 게시글 이후의 게시글들의 ID 변경
            for (let i = postIndex; i < posts.posts.length; i++) {
                posts.posts[i].id = i + 1; // 순서대로 1, 2, 3, ... 으로 변경
            }

            // 수정된 내용을 다시 JSON 파일에 씀
            fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }
                // 게시글 삭제 성공했음을 클라이언트에게 응답
                res.json({ success: true });
            });
        } else {
            // 해당 postId를 가진 게시글을 찾지 못한 경우
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    });
}

// 게시글 작성
const createPost = (req, res) => {
    const { title, content } = req.body;
    const imageFile = req.file; // 이미지 파일

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

        // posts.json 파일을 읽어오기
        fs.readFile(postsJsonPath, 'utf8', (err, postData) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).json({ success: false, error: 'Failed to read file' });
                return;
            }

            let posts = JSON.parse(postData);

            // 새로운 게시글 객체 생성
            const newPost = {
                id: posts.posts.length + 1, // 현재 게시글 개수 + 1
                title: title,
                author: {
                    email: loggedInUserEmail,
                    profile_picture: 'http://localhost:3001/' + loggedInUser.profile_picture,
                    nickname: loggedInUser.nickname
                },
                date: currentDate,
                time: currentTime,
                image: imageFile ? 'http://localhost:3001/' + imageFile.path : null, // 파일 첨부 여부에 따라 이미지 경로 설정
                content: content,
                likes: 0,
                views: 0,
                comments: []
            };

            // 새로운 게시글을 posts.json 파일에 추가
            posts.posts.push(newPost);

            // 수정된 데이터를 파일에 저장
            fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }
                // 클라이언트에게 게시글 작성 성공을 응답
                res.json({ success: true, message: '게시글이 성공적으로 작성되었습니다.' });
            });
        });
    });
}

// 게시글 수정
const updatePost = (req, res) => {
    const postId = req.query.id;
    const { title, content } = req.body;

    // 클라이언트로부터 전송된 파일 처리
    const imageFile = req.file; // 이미지 파일

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 업데이트
    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        // 해당 postId를 가진 게시글을 찾아서 내용 업데이트
        const index = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (index !== -1) {
            posts.posts[index].title = title;
            posts.posts[index].content = content;
            
            // 파일이 첨부되었을 경우에만 이미지 경로 업데이트
            if (imageFile) {
                // 서버의 호스트 및 포트 정보를 가져옴
                const host = req.headers.host;
                // 이미지 파일의 전체 URL 생성
                const imageUrl = `http://${host}/uploads/${imageFile.filename}`;
                posts.posts[index].image = imageUrl; // 이미지 경로 업데이트
            }

            // 수정된 내용을 다시 JSON 파일에 씀
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
            // 해당 postId를 가진 게시글을 찾지 못한 경우
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    });
}

export default {
    posts,
    listOfPosts,
    deletePost,
    createPost,
    updatePost
};