const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginButton = document.getElementById("loginButton");
const helperText = document.getElementById("helperText");

// 입력 필드 내용이 변경될 때마다 호출되는 함수
function checkInputs() {
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
function isValidEmail(email) {
    // 이메일 형식 검사 정규식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    // 비밀번호는 8자 이상, 20자 이하여야 하고, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 함
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}

function validation(email, password) {
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
function redirectToPostListPage() {
    window.location.href = "/list-of-posts";
}

// 사용자 로그인 함수
function loginUser(email, password) {
    // 서버로 POST 요청을 보냄
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 로그인 성공 시 게시글 목록 페이지로 이동
            redirectToPostListPage();
        } else {
            // 로그인 실패 시 메시지 출력
            console.log("로그인 실패");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

// 로그인 폼 제출 이벤트 핸들러
document.getElementById("loginForm").addEventListener("submit", function(event) {
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
window.addEventListener("load", function() {
    // 쿠키에서 현재 로그인한 이메일 정보를 가져옴
    const loggedInUser = document.cookie.split(";").find(cookie => cookie.trim().startsWith("loggedInUser="));
    if (loggedInUser) {
        // 현재 로그인한 사용자에 대한 추가 작업을 수행
        console.log("현재 로그인한 이메일:", loggedInUser.split("=")[1]);
    } else {
        // 로그인되지 않은 사용자에 대한 처리
        console.log("로그인되지 않음");
    }
});
