// 일단 테스트용 app.js
const express = require('express');
const cookieParser = require('cookie-parser'); // 쿠키 파싱을 위한 미들웨어 추가
const app = express();
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // 업로드된 파일을 저장할 디렉토리를 설정합니다.

// body-parser 미들웨어 추가
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cookie-parser 미들웨어 사용 설정
app.use(cookieParser());

// 정적 파일 제공을 위한 경로 설정
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname)));
const publicPath = path.join(__dirname, 'public');

app.use(express.static(__dirname))

// 루트 경로에 대한 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'sign-in.html')); // 로그인 페이지에서 시작
});

// 로그인 페이지
app.get('/sign-in', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'sign-in.html'));
});

// 로그인 성공 시 쿠키 설정
app.post('/login', (req, res) => {
    const { email } = req.body;
    // 쿠키 설정 (이메일 정보)
    res.cookie('loggedInUser', email, { maxAge: 900000, httpOnly: true }); // 쿠키 만료 시간: 15분
    res.json({ success: true });
});



// 회원가입 페이지
app.get('/sign-up', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'sign-up.html'));
});

// app.get('/auth/sign-in.js', (req, res) => {
//     res.set('Content-Type', 'text/javascript');
//     res.sendFile(path.join(__dirname, 'auth', 'sign-in.js'));
// });

// app.get('/auth/sign-in.css', (req, res) => {
//     res.set('Content-Type', 'text/css');
//     res.sendFile(path.join(__dirname, 'auth', 'sign-in.css'));
// });

// 회원가입 요청 처리
app.post('/signup', upload.single('profile_picture'), (req, res) => {
    const { email, password, confirmPassword, nickname } = req.body;
    const profile_picture = req.file; // 업로드된 파일은 req.file에서 참조할 수 있습니다.

    // 기존 사용자 정보를 읽어옵니다.
    fs.readFile('backend/model/users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        let users = JSON.parse(data);

        // 새로운 사용자 정보를 추가합니다.
        const newUser = {
            email,
            password,
            nickname,
            profile_picture // 프로필 사진 추가
        };
        users.push(newUser);

        // 갱신된 사용자 정보를 JSON 형식으로 다시 작성합니다.
        const updatedUsers = JSON.stringify(users, null, 4);

        // 파일에 새로운 정보를 씁니다.
        fs.writeFile('backend/model/users.json', updatedUsers, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Error writing file');
                return;
            }
            //console.log('New user added successfully!');
            res.redirect('sign-in'); // 회원가입 성공 시 로그인 페이지로 이동
            // 회원가입 성공 시 HTML 코드를 생성하여 프로필 사진을 표시합니다.
            // const profileImageHTML = profile_picture ? `<img src="/${profile_picture.path}" alt="profile-picture">` : '';
            // const successHTML = `
            //     <h1>New user added successfully!</h1>
            //     ${profileImageHTML}
            // `;
            // res.status(200).send(successHTML);
        });
    });
});

// 댓글 등록 엔드포인트
app.post('/add-comment', (req, res) => {
    const { postId, content } = req.body;
    
    // 현재 날짜와 시간 가져오기
    const { currentDate, currentTime } = getCurrentDateTime();

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 댓글을 추가합니다.
    fs.readFile('backend/model/posts.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        // postId를 가진 게시글을 찾습니다.
        const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (postIndex !== -1) {
            // 새로운 댓글의 속성 설정
            const newCommentId = posts.posts[postIndex].comments.length + 1;
            const newComment = {
                id: newCommentId,
                author: {
                    profile_picture: "../../public/assets/images/user1.png",
                    nickname: "test"
                },
                date: currentDate,
                time: currentTime,
                content: content
            };

            // 댓글을 해당 게시글의 댓글 목록에 추가합니다.
            posts.posts[postIndex].comments.push(newComment);

            // 수정된 내용을 다시 JSON 파일에 씁니다.
            fs.writeFile('backend/model/posts.json', JSON.stringify(posts, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }
                // 댓글 등록이 성공했음을 클라이언트에게 응답합니다.
                res.json({ success: true, updatedComments: posts.posts[postIndex].comments });
            });
        } else {
            // 해당 postId를 가진 게시글을 찾지 못한 경우
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    });
});

// 현재 날짜와 시간을 가져오는 함수
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    const currentTime = `${hours}:${minutes}:${seconds}`;
    return { currentDate, currentTime };
}

// DELETE 요청 처리: 게시글 삭제
app.delete('/delete-post', (req, res) => {
    const { postId } = req.body;

    // posts.json 파일을 읽어옵니다.
    fs.readFile('backend/model/posts.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        // postId를 가진 게시글을 찾습니다.
        const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (postIndex !== -1) {
            // 게시글을 삭제합니다.
            posts.posts.splice(postIndex, 1);

            // 삭제된 게시글 이후의 게시글들의 ID를 변경합니다.
            for (let i = postIndex; i < posts.posts.length; i++) {
                posts.posts[i].id = i + 1; // 순서대로 1, 2, 3, ... 으로 변경합니다.
            }

            // 수정된 내용을 다시 JSON 파일에 씁니다.
            fs.writeFile('backend/model/posts.json', JSON.stringify(posts, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }
                // 게시글 삭제가 성공했음을 클라이언트에게 응답합니다.
                res.json({ success: true });
            });
        } else {
            // 해당 postId를 가진 게시글을 찾지 못한 경우
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    });
});



// DELETE 요청 처리: 댓글 삭제
app.delete('/delete-comment', (req, res) => {
    const { postId, commentId } = req.body;

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 댓글을 삭제합니다.
    fs.readFile('backend/model/posts.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        // postId를 가진 게시글을 찾습니다.
        const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (postIndex !== -1) {
            // postId를 가진 게시글 안에서 commentId를 가진 댓글을 찾습니다.
            const commentIndex = posts.posts[postIndex].comments.findIndex(comment => comment.id === parseInt(commentId));
            if (commentIndex !== -1) {
                // 댓글을 삭제합니다.
                posts.posts[postIndex].comments.splice(commentIndex, 1);

                // 모든 댓글의 id를 재설정합니다.
                posts.posts[postIndex].comments.forEach((comment, index) => {
                    comment.id = index + 1;
                });

                // 수정된 내용을 다시 JSON 파일에 씁니다.
                fs.writeFile('backend/model/posts.json', JSON.stringify(posts, null, 4), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        res.status(500).json({ success: false, error: 'Failed to write file' });
                        return;
                    }
                    // 댓글 삭제가 성공했음을 클라이언트에게 응답합니다.
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
});

// // 게시글 목록 페이지
app.get('/list-of-posts', (req, res) => {
    // 쿠키에서 현재 로그인한 이메일 정보를 읽어옴
    const loggedInUser = req.cookies.loggedInUser;
    // if (loggedInUser) {
    //     // 현재 로그인한 사용자에 대한 게시글 목록을 반환하거나, 필요한 처리를 수행
    //     res.send(`현재 로그인한 이메일: ${loggedInUser}`);
    // } else {
    //     // 로그인되지 않은 사용자에 대한 처리
    //     res.redirect('/sign-in'); // 로그인 페이지로 리다이렉트
    // }
    console.log(`현재 로그인한 이메일: ${loggedInUser}`);
    res.sendFile(path.join(publicPath, 'html', 'list-of-posts.html'));
});

// 프사 요청
app.get('/get-profile-image', (req, res) => {
    // 쿠키에서 현재 로그인한 이메일 정보를 읽어옴
    const loggedInUser = req.cookies.loggedInUser;
    if (loggedInUser) {
        // 현재 로그인한 사용자의 정보를 users.json 파일에서 찾음
        const users = require('./backend/model/users.json');
        const currentUser = users.find(user => user.email === loggedInUser);
        if (currentUser) {
            // 현재 로그인한 사용자의 프로필 이미지 경로를 생성
            const profileImagePath = currentUser.profile_picture.path;
            console.log(`현재 로그인한 사용자 프사 경로: ${profileImagePath}`);

            // JSON 형식으로 프로필 이미지 경로를 클라이언트에게 전달
            res.json({ profileImagePath });
            return;
        }
    }
    // 로그인되지 않은 사용자 또는 사용자 정보를 찾을 수 없는 경우, 로그인 페이지로 리다이렉트
    res.redirect('/sign-in');
});


// 게시글 작성 페이지
app.get('/create-post', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'create-post.html'));
});

// 게시글 작성 요청 처리
app.post('/create-post', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const imageFile = req.file; // 이미지 파일
    // 현재 날짜와 시간 가져오기
    const { currentDate, currentTime } = getCurrentDateTime();

    // posts.json 파일을 읽어옵니다.
    fs.readFile('backend/model/posts.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        let posts = JSON.parse(data);

        // 새로운 게시글 객체 생성
        const newPost = {
            id: posts.posts.length + 1, // 현재 게시글 개수 + 1
            title: title,
            author: {
                profile_picture: "../../public/assets/images/user2.png",
                nickname: "test"
            },
            date: currentDate,
            time: currentTime,
            image: imageFile ? imageFile.path : null, // 파일 첨부 여부에 따라 이미지 경로 설정
            content: content,
            likes: 0,
            views: 0,
            comments: []
        };

        // 새로운 게시글을 posts.json 파일에 추가합니다.
        posts.posts.push(newPost);

        // 수정된 데이터를 파일에 저장합니다.
        fs.writeFile('backend/model/posts.json', JSON.stringify(posts, null, 4), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Error writing file');
                return;
            }
            // 클라이언트에게 게시글 작성 성공을 응답합니다.
            res.json({ success: true, message: '게시글이 성공적으로 작성되었습니다.' });
        });
    });
});


// 게시글 상세 조회 페이지
app.get('/post-details', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'post-details.html'));
});

// 게시글 수정 페이지
app.get('/update-post', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'update-post.html'));
});

// POST 요청 처리
app.post('/update-post', upload.single('image'), (req, res) => {
    const postId = req.query.id;
    const { title, content } = req.body;

    // 클라이언트로부터 전송된 파일 처리
    const imageFile = req.file; // 이미지 파일

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 업데이트합니다.
    fs.readFile('backend/model/posts.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        // 해당 postId를 가진 게시글을 찾아서 내용을 업데이트합니다.
        const index = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (index !== -1) {
            posts.posts[index].title = title;
            posts.posts[index].content = content;
            
            // 파일이 첨부되었을 경우에만 이미지 경로 업데이트
            if (imageFile) {
                posts.posts[index].image = imageFile.path; // 이미지 경로 업데이트
            }

            // 수정된 내용을 다시 JSON 파일에 씁니다.
            fs.writeFile('backend/model/posts.json', JSON.stringify(posts, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }
                // 업데이트가 성공했음을 클라이언트에게 응답합니다.

                res.json({ success: true });
            });
        } else {
            // 해당 postId를 가진 게시글을 찾지 못한 경우
            res.status(404).json({ success: false, error: 'Post not found' });
        }
    });
});

// 댓글 수정 엔드포인트
app.post('/update-comment', (req, res) => {
    const { postId, commentId, content } = req.body;

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 댓글을 업데이트합니다.
    fs.readFile('backend/model/posts.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let posts = JSON.parse(data);

        console.log(`게시글 찾기 전에 넘어온 댓글: ${content}`);

        // postId를 가진 게시글을 찾습니다.
        const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
        if (postIndex !== -1) {
            // postId를 가진 게시글 안에서 commentId를 가진 댓글을 찾습니다.
            const commentIndex = posts.posts[postIndex].comments.findIndex(comment => comment.id === parseInt(commentId));
            if (commentIndex !== -1) {
                // 찾은 댓글의 내용을 업데이트합니다.
                posts.posts[postIndex].comments[commentIndex].content = content;

                // 업데이트 된 내용 출력
                console.log(`업데이트 된 댓글 인덱스: ${content}`);
                console.log(`업데이트 된 댓글 인덱스: ${commentIndex}`);

                // 수정된 내용을 다시 JSON 파일에 씁니다.
                fs.writeFile('backend/model/posts.json', JSON.stringify(posts, null, 4), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        res.status(500).json({ success: false, error: 'Failed to write file' });
                        return;
                    }
                    // 업데이트가 성공했음을 클라이언트에게 응답합니다.
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
});



// 회원정보 수정 페이지
app.get('/update-profile', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'update-profile.html'));
});

// 비밀번호 수정 페이지
app.get('/update-password', (req, res) => {
    res.sendFile(path.join(publicPath, 'html', 'update-password.html'));
});

app.listen(3000, () => {
    console.log('서버가 실행 중입니다.');
});
