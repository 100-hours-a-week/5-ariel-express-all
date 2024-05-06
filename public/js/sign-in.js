const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const helperText = document.getElementById("helperText");

// 입력 필드 내용이 변경될 때마다 호출되는 함수
const checkInputs = () => {
    // 이메일과 비밀번호가 입력되었는지 확인
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (validation(email, password) === '') {
        loginButton.style.backgroundColor = "#7F6AEE";
        document.getElementById('loginButton').disabled = false;
        helperText.style.visibility = 'hidden';
    }
    else {
        loginButton.style.backgroundColor = "#ACA0EB";
        document.getElementById('loginButton').disabled = true;
        str = "* " + validation(email, password);
        helperText.textContent = str;
        helperText.style.visibility = 'visible';
    }
}

// 이메일과 비밀번호 입력 필드 내용이 변경될 때마다 checkInputs 함수 호출
emailInput.addEventListener("input", checkInputs);
passwordInput.addEventListener("input", checkInputs);


// 이메일 유효성 검사 함수
const isValidEmail = (email) => {
    // 이메일 형식 검사 정규식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const isValidPassword = (password) => {
    // 비밀번호는 8자 이상, 20자 이하여야 하고, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 함
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}

const validation = (email, password) => {
    // 이메일과 비밀번호가 입력되지 않은 경우
    if (!email.trim() && !password.trim()) {
        return '이메일과 비밀번호를 입력해주세요.';
    }
    // 이메일이 입력되지 않은 경우
    else if (!email.trim()) {
        return '이메일을 입력해주세요.';
    }
    // 비밀번호가 입력되지 않은 경우
    else if (!password.trim()) {
        return '비밀번호를 입력해주세요.';
    }
    // 이메일과 비밀번호의 길이가 5자리 미만인 경우
    if (email.trim().length < 5 && password.trim().length < 5) {
        return '이메일과 비밀번호는 최소 5자리 이상이어야 합니다.';
    }
    // 이메일의 길이가 5자리 미만인 경우
    else if (email.trim().length < 5) {
        return '이메일은 최소 5자리 이상이어야 합니다.';
    }
    // 비밀번호의 길이가 5자리 미만인 경우
    else if (password.trim().length < 5) {
        return '비밀번호는 최소 5자리 이상이어야 합니다.';
    }
    // 이메일 형식 유효성 검사
    if (!isValidEmail(email)) {
        return '유효하지 않은 이메일 형식입니다.';
    }
    // 비밀번호 형식 유효성 검사
    if (!isValidPassword(password)) {
        return '유효하지 않은 비밀번호 형식입니다.';
    }
    return '';
}

// 게시글 목록 페이지로 이동하는 함수
const redirectToPostListPage = () => {
    window.location.href = "/list-of-posts";
}

// 사용자 로그인 함수
// const loginUser = (email, password) => {
//     // JSON 파일에서 사용자 정보 가져오기
//     fetch("http://localhost:3001/users", {
//         credentials: 'include' // 쿠키를 포함시키기 위해 설정
//     })
//         .then(response => response.json())
//         .then(data => {
//             // 사용자 정보 확인
//             const user = data.find(user => user.email === email && user.password === password);
//             if (user) {
//                 helperText.style.color = "blue";
//                 helperText.textContent = "* 성공";
//                 helperText.style.visibility = 'visible'; // helper text를 보이도록 변경
//                 // 로그인 성공 후 3초 후 페이지 이동
//                 setTimeout( () => {
//                     // 서버로 POST 요청을 보냄
//                     fetch("http://localhost:3001/login", {
//                         method: "POST",
//                         headers: {
//                             "Content-Type": "application/json"
//                         },
//                         body: JSON.stringify({ email: email, password: password }),
//                         credentials: 'include' // 쿠키를 포함시키기 위해 설정
//                     })
//                         .then(response => response.json())
//                         .then(data => {
//                             if (data.success) {
//                                 // 세션 정보를 클라이언트에서 설정
//                                 sessionStorage.setItem('loggedInUser', email);
//                                 // 로그인 성공 시 게시글 목록 페이지로 이동
//                                 redirectToPostListPage();
//                             } else {
//                                 // 로그인 실패 시 메시지 출력
//                                 console.log("로그인 실패");
//                             }
//                         })
//                         .catch(error => {
//                             console.error("Error:", error);
//                         });
//                 }, 3000);
//             } else {
//                 // 로그인 실패 시 helper-text 변경
//                 helperText.style.color = "red";
//                 helperText.textContent = "* 이메일 또는 비밀번호를 다시 확인해주세요.";
//                 helperText.style.visibility = 'visible'; // helper text를 보이도록 변경
//             }
//         })
//         .catch(error => {
//             console.error("Error:", error);
//         });
// }

const loginUser = (email, password) => {
    // 서버로 POST 요청을 보냄
    fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email, password: password }),
        credentials: 'include' // 쿠키를 포함시키기 위해 설정
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 세션 정보를 클라이언트에서 설정
                sessionStorage.setItem('loggedInUser', email);

                helperText.style.color = "blue";
                helperText.textContent = "* 성공";
                helperText.style.visibility = 'visible'; // helper text를 보이도록 변경

                // 로그인 성공 시 게시글 목록 페이지로 이동
                setTimeout( () => {
                    redirectToPostListPage();
                }, 3000);
            } else {
                // 로그인 실패
                helperText.style.color = "red";
                helperText.textContent = "* 이메일 또는 비밀번호를 다시 확인해주세요.";
                helperText.style.visibility = 'visible'; // helper text를 보이도록 변경
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
}



// 로그인 폼 제출 이벤트 핸들러
document.getElementById("loginForm").addEventListener("submit", (event) => {
    event.preventDefault(); // 폼 제출 방지

    // 사용자가 입력한 이메일과 비밀번호 가져오기 (앞뒤 공백 제거)
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // 유효하지 않은 입력이 들어온 경우, helper-text 변경
    if (validation(email, password).length > 0) {
        str = "* " + validation(email, password);
        helperText.textContent = str;
        helperText.style.visibility = 'visible';
        return;
    }

    // 사용자 로그인 함수 호출
    loginUser(email, password);
});

// 페이지 로드 시 실행되는 함수
// window.addEventListener("load", () => {
//     // 클라이언트 측에 설정된 세션 정보 가져오기
//     const loggedInUser = sessionStorage.getItem('loggedInUser');
    
//     if (loggedInUser) {
//         // 로그인된 사용자 정보를 서버로 전달
//         fetch("http://localhost:3001/login", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ email: loggedInUser }), // 세션 정보를 서버로 전달
//             credentials: 'include' // 쿠키를 포함시키기 위해 설정
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 // 세션 정보를 서버로 전달한 후 로그인 성공 시 게시글 목록 페이지로 이동
//                 redirectToPostListPage();
//             } else {
//                 // 로그인 실패 시 메시지 출력 또는 처리
//                 console.log("로그인 실패");
//             }
//         })
//         .catch(error => {
//             console.error("Error:", error);
//         });
//     } else {
//         // 세션 정보가 없는 경우, 로그인되지 않은 상태로 처리
//         console.log("로그인되지 않음");
//     }
// });