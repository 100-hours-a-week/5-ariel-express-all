// 백엔드 app.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // 쿠키 파싱을 위한 미들웨어 추가
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // 업로드된 파일을 저장할 디렉토리를 설정합니다.

const corsOptions = {
    origin: 'http://localhost:3000', // 클라이언트의 도메인을 여기에 지정
    credentials: true, // 쿠키를 포함하여 요청을 받기 위해 true로 설정
  }
  
app.use(cors(corsOptions));
// body-parser 미들웨어 추가
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// body-parser 미들웨어 추가
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// cookie-parser 미들웨어 사용 설정
app.use(cookieParser());

// 정적 파일 제공을 위한 경로 설정
const publicPath = path.join(__dirname, 'public');
const usersJsonPath = path.join(__dirname, 'model', 'users.json');
const postsJsonPath = path.join(__dirname, 'model', 'posts.json');

app.use('/images', express.static(path.join(__dirname, '..', 'public', 'assets', 'images')));
app.use(express.static(__dirname))

console.log(`백엔드 서버 __dirname ${__dirname}`);

// 사용자 정보를 파일에서 읽어와서 클라이언트에게 전송
app.get('/users', (req, res) => {
    const usersFilePath = usersJsonPath;
    res.sendFile(usersFilePath);
});

// 게시글 정보를 파일에서 읽어와서 클라이언트에게 전송
app.get('/posts', (req, res) => {
    const usersFilePath = postsJsonPath;
    res.sendFile(usersFilePath);
});

// 로그인 성공 시 쿠키 설정
app.post('/login', (req, res) => {
    const { email } = req.body;
    // 디코딩된 이메일 정보를 사용하여 쿠키 설정
    const decodedEmail = decodeURIComponent(email);
    console.log(`현재 로그인 된 사용자 이메일 디코딩 ver: ${decodedEmail}`);
    res.cookie('loggedInUser', decodedEmail, { maxAge: 900000, httpOnly: true }); // 쿠키 만료 시간: 15분
    res.json({ success: true });
});


// 회원가입 요청 처리
app.post('/signup', upload.single('profile_picture'), (req, res) => {
    const { email, password, confirmPassword, nickname } = req.body;
    const profile_picture = req.file.path;

    // 기존 사용자 정보 읽어오기
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading file');
            return;
        }

        let users = JSON.parse(data);

        // 새로운 사용자 추가
        const newUser = {
            email,
            password,
            nickname,
            profile_picture
        };
        users.push(newUser);

        // 갱신된 사용자 정보를 JSON 형식으로 다시 작성
        const updatedUsers = JSON.stringify(users, null, 4);

        // 파일 갱신
        fs.writeFile(usersJsonPath, updatedUsers, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Error writing file');
                return;
            }
            //console.log('New user added successfully!');
            res.redirect('http://localhost:3000/sign-in');
        });
    });
});

// // 게시글 목록 페이지
app.get('/list-of-posts', (req, res) => {
    // 쿠키에서 현재 로그인한 이메일 정보를 읽어옴
    const loggedInUser = req.cookies.loggedInUser;
    console.log(`현재 로그인한 이메일: ${loggedInUser}`);
    res.sendFile(path.join(publicPath, 'html', 'list-of-posts.html'));
});

// 게시글 목록 페이지에서 프사 요청
// 서버 코드
// 게시글 목록 페이지에서 프사 요청
app.get('/get-profile-image', (req, res) => {
    // 쿠키에서 현재 로그인한 이메일 정보를 읽어옴
    const loggedInUser = req.cookies.loggedInUser;

    console.log(`프사 요청 loggedInUser: ${loggedInUser}`);
    if (loggedInUser) {
        // 현재 로그인한 사용자의 정보를 users.json 파일에서 찾음
        fs.readFile(usersJsonPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).json({ error: 'Failed to read file' });
                return;
            }

            const users = JSON.parse(data);
            const currentUser = users.find(user => user.email === loggedInUser);
            if (currentUser) {
                // 현재 로그인한 사용자의 프로필 이미지 경로를 생성
                const profileImagePath = currentUser.profile_picture;
                console.log(`현재 로그인한 사용자 프사 경로: ${profileImagePath}`);

                // JSON 형식으로 프로필 이미지 경로를 클라이언트에게 전달
                res.json({ profileImagePath });
                return;
            } else {
                // 사용자 정보를 찾을 수 없는 경우
                res.status(404).json({ error: 'User not found' });
            }
        });
    } else {
        // 로그인되지 않은 사용자인 경우 (임시)
        res.status(200).json({ profileImagePath: 'http://localhost:3001/images/profile-image.png' }); // 예: 기본 이미지를 제공하거나 다른 처리를 수행할 수 있음
    }
});


// DELETE 요청 처리: 게시글 삭제
app.delete('/delete-post', (req, res) => {
    const { postId } = req.body;

    // posts.json 파일을 읽어옵니다.
    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
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
            fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
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
    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
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
                fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
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

// 댓글 등록 엔드포인트
app.post('/add-comment', (req, res) => {
    const { postId, content } = req.body;
    
    // 현재 날짜와 시간 가져오기
    const { currentDate, currentTime } = getCurrentDateTime();

    // 현재 로그인된 사용자의 이메일 정보 가져오기
    const loggedInUserEmail = req.cookies.loggedInUser;

    // 사용자 이메일 정보를 이용하여 해당 사용자의 닉네임과 프로필 정보를 users.json 파일에서 찾아옵니다.
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let users = JSON.parse(data);

        // 이메일을 이용하여 해당 사용자 정보를 찾습니다.
        const loggedInUser = users.find(user => user.email === loggedInUserEmail);

        // 사용자 정보를 찾지 못한 경우
        if (!loggedInUser) {
            console.error('User not found');
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // 새로운 댓글의 속성 설정
        let newCommentId;

        // posts.json 파일을 읽어와서 해당 게시글을 찾고 댓글을 추가합니다.
        fs.readFile(postsJsonPath, 'utf8', (err, postData) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).json({ success: false, error: 'Failed to read file' });
                return;
            }

            let posts = JSON.parse(postData);

            // postId를 가진 게시글을 찾습니다.
            const postIndex = posts.posts.findIndex(post => post.id === parseInt(postId));
            if (postIndex !== -1) {
                // 새로운 댓글의 ID 설정
                newCommentId = posts.posts[postIndex].comments.length + 1;

                // 댓글을 해당 게시글의 댓글 목록에 추가합니다.
                const newComment = {
                    id: newCommentId,
                    author: {
                        profile_picture: loggedInUser.profile_picture,
                        nickname: loggedInUser.nickname
                    },
                    date: currentDate,
                    time: currentTime,
                    content: content
                };

                posts.posts[postIndex].comments.push(newComment);

                // 수정된 내용을 다시 JSON 파일에 씁니다.
                fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
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
});

// 댓글 수정 엔드포인트
app.post('/update-comment', (req, res) => {
    const { postId, commentId, content } = req.body;

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 댓글을 업데이트합니다.
    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
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
                fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
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

// 게시글 작성 요청 처리
app.post('/create-post', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const imageFile = req.file; // 이미지 파일
    // 현재 날짜와 시간 가져오기
    const { currentDate, currentTime } = getCurrentDateTime();

    // 현재 로그인된 사용자의 이메일 정보 가져오기
    const loggedInUserEmail = req.cookies.loggedInUser;

    // 사용자 이메일 정보를 이용하여 해당 사용자의 닉네임과 프로필 정보를 users.json 파일에서 찾아옵니다.
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let users = JSON.parse(data);

        // 이메일을 이용하여 해당 사용자 정보를 찾습니다.
        const loggedInUser = users.find(user => user.email === loggedInUserEmail);

        // 사용자 정보를 찾지 못한 경우
        if (!loggedInUser) {
            console.error('User not found');
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // posts.json 파일을 읽어옵니다.
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
                    profile_picture: loggedInUser.profile_picture,
                    nickname: loggedInUser.nickname
                },
                date: currentDate,
                time: currentTime,
                image: imageFile ? imageFile.path : null, // 파일 첨부 여부에 따라 이미지 경로 설정
                content: content,
                likes: 0,
                views: 0,
                comments: []
            };

            console.log(newPost);

            // 새로운 게시글을 posts.json 파일에 추가합니다.
            posts.posts.push(newPost);

            // 수정된 데이터를 파일에 저장합니다.
            fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }
                // 클라이언트에게 게시글 작성 성공을 응답합니다.
                res.json({ success: true, message: '게시글이 성공적으로 작성되었습니다.' });
            });
        });
    });
});

// POST 요청 처리
app.post('/update-post', upload.single('image'), (req, res) => {
    const postId = req.query.id;
    const { title, content } = req.body;

    // 클라이언트로부터 전송된 파일 처리
    const imageFile = req.file; // 이미지 파일

    // posts.json 파일을 읽어와서 해당 게시글을 찾고 업데이트합니다.
    fs.readFile(postsJsonPath, 'utf8', (err, data) => {
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
                // 서버의 호스트 및 포트 정보를 가져옴
                const host = req.headers.host;
                // 이미지 파일의 전체 URL 생성
                const imageUrl = `http://${host}/uploads/${imageFile.filename}`;
                posts.posts[index].image = imageUrl; // 이미지 경로 업데이트
            }

            // 수정된 내용을 다시 JSON 파일에 씁니다.
            fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 4), 'utf8', (err) => {
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

// 비밀번호 업데이트 요청 처리
app.post('/update-password', (req, res) => {
    const { newPassword } = req.body;

    console.log(`비밀번호 변경 페이지: ${newPassword}`);

    // 사용자 정보를 users.json 파일에서 읽어옴
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, error: 'Failed to read file' });
        }

        let users = JSON.parse(data);

        // 현재 로그인한 사용자의 이메일을 통해 사용자 정보를 찾음
        const loggedInUserEmail = req.cookies.loggedInUser;
        const userIndex = users.findIndex(user => user.email === loggedInUserEmail);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // 사용자의 비밀번호를 업데이트하고 users.json 파일에 저장
        users[userIndex].password = newPassword;

        fs.writeFile(usersJsonPath, JSON.stringify(users, null, 4), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, error: 'Failed to write file' });
            }
            res.json({ success: true });
        });
    });
});


app.post('/update-profile', upload.single('profileImage'), (req, res) => {
    const loggedInUser = req.cookies.loggedInUser;
    const newNickname = req.body.newNickname;
    const profileImage = req.file; // 업로드된 프로필 이미지 파일

    console.log(`회원 정보 수정 페이지! 새 닉네임: ${newNickname}, 프로필 이미지: ${profileImage}`);

    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).json({ success: false, error: 'Failed to read file' });
            return;
        }

        let users = JSON.parse(data);

        const userIndex = users.findIndex(user => user.email === loggedInUser);
        if (userIndex !== -1) {
            users[userIndex].nickname = newNickname;

            // 프로필 이미지가 존재하는 경우에만 업데이트
            if (profileImage) {
                // 프로필 이미지의 경로를 사용하여 업로드된 파일을 저장하거나 처리하는 로직을 추가해야 합니다.
                // 여기서는 파일의 경로를 바로 저장합니다.
                users[userIndex].profile_picture = profileImage.path;
            }

            fs.writeFile(usersJsonPath, JSON.stringify(users, null, 4), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    res.status(500).json({ success: false, error: 'Failed to write file' });
                    return;
                }
                res.json({ success: true });
            });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    });
});

// DELETE 요청을 처리하는 엔드포인트
app.delete('/withdraw', (req, res) => {
    // 사용자 정보를 users.json 파일에서 읽어옴
    fs.readFile(usersJsonPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ success: false, error: 'Failed to read file' });
        }

        let users = JSON.parse(data);

        // 현재 로그인한 사용자의 이메일을 통해 사용자 정보를 찾음
        const loggedInUserEmail = req.cookies.loggedInUser;
        const userIndex = users.findIndex(user => user.email === loggedInUserEmail);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // 사용자를 삭제하고 users.json 파일에 저장
        users.splice(userIndex, 1);

        fs.writeFile(usersJsonPath, JSON.stringify(users, null, 4), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ success: false, error: 'Failed to write file' });
            }
            res.json({ success: true });
        });
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

app.listen(3001, () => {
    console.log('백엔드 서버가 실행 중입니다.');
});






// app.post('/update-profile', upload.single('profileImage'), (req, res) => {
//     const loggedInUser = req.cookies.loggedInUser;
//     const newNickname = req.body.newNickname;
//     const profileImage = req.file; // 업로드된 프로필 이미지 파일

//     console.log(`회원 정보 수정 페이지! 새 닉네임: ${newNickname}, 프로필 이미지: ${profileImage.path}`);

//     fs.readFile('backend/model/users.json', 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//             res.status(500).json({ success: false, error: 'Failed to read file' });
//             return;
//         }

//         let users = JSON.parse(data);

//         const userIndex = users.findIndex(user => user.email === loggedInUser);
//         if (userIndex !== -1) {
//             users[userIndex].nickname = newNickname;

//             // 프로필 이미지가 존재하는 경우에만 업데이트
//             if (profileImage) {
//                 // 파일 경로를 포함한 객체로 저장합니다.
//                 users[userIndex].profile_picture.path = profileImage.path;
//             }

//             fs.writeFile('backend/model/users.json', JSON.stringify(users, null, 4), 'utf8', (err) => {
//                 if (err) {
//                     console.error('Error writing file:', err);
//                     res.status(500).json({ success: false, error: 'Failed to write file' });
//                     return;
//                 }
//                 res.json({ success: true });
//             });
//         } else {
//             res.status(404).json({ success: false, error: 'User not found' });
//         }
//     });
// });