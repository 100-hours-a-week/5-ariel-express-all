// 드롭다운 메뉴
const toggleDropdown = () => {
    const dropdownContent = document.getElementById("dropdownContent");
    if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
    } else {
        dropdownContent.classList.add("show");
    }
}

// 다른 곳을 클릭했을 때, 열러있는 드롭다운 닫기
window.onclick = (event) => {
    if (!event.target.matches('.profile-image')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

const logout = () => {
    fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include' // 쿠키를 포함하여 요청하기 위해 설정
    })
    .then(response => {
        if (response.ok) {
            // 세션 및 쿠키 삭제 후 로그인 페이지로 이동
            sessionStorage.removeItem('loggedInUser');
            window.location.href = "/sign-in";
        } else {
            console.error('Failed to logout');
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
}

const profileImageInput = document.getElementById("profileImageInput");
const profileImage = document.getElementById("profileImage");
const nickname = document.getElementById("nickname");

// 프로필 사진 설정
profileImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            profileImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // 파일이 없는 경우에만 기본 이미지로 복원
        fetch('http://localhost:3001/get-profile-image') // 서버에 요청을 보냄
        .then(response => response.json()) // 응답을 JSON으로 변환
        .then(data => {
            // 기본 이미지로 복원
            profileImage.src = data.profileImagePath;
            location.reload();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    }
});


// 닉네임 유효성 검사
const validate = async () => {
    const nicknameInput = document.querySelector(".input-name");
    const updateProfileHelperText = document.getElementById("updateProfileHelperText");
    const nicknameValue = nicknameInput.value.trim();

    if (nicknameValue == '') {
        updateProfileHelperText.textContent = '* 닉네임을 입력해주세요.';
        updateProfileHelperText.style.visibility = 'visible';
        return false;
    }
    else if (nicknameValue.length > 10) {
        updateProfileHelperText.textContent = '* 닉네임은 최대 10자까지 작성 가능합니다.';
        updateProfileHelperText.style.visibility = 'visible';
        return false;
    }
    else {
        try {
            const response = await fetch('http://localhost:3001/users');
            const data = await response.json();
            const existingNickname = data.find(user => user.nickname === nicknameValue);
            if (existingNickname) {
                updateProfileHelperText.textContent = '* 중복된 닉네임입니다.';
                updateProfileHelperText.style.visibility = 'visible';
                return false;
            } else {
                updateProfileHelperText.textContent = '* 통과';
                updateProfileHelperText.style.visibility = 'hidden';
                return true;
            }
        } catch (error) {
            console.error("Error:", error);
            alert("회원가입 중 오류가 발생했습니다.");
        }

    }
}

// 사용자가 수정하기 버튼을 클릭할 때 프로필을 업데이트하는 함수
const updateProfile = async () => {
    // 유효성 검사를 통과한 경우에만 업데이트 수행
    if (updateProfileHelperText.textContent === "* 통과") {

        // 변경된 닉네임 가져오기
        const newNickname = document.getElementById("nickname").value.trim();

        // 변경된 프로필 이미지 가져오기
        const profileImageFile = document.getElementById("profileImageInput").files[0];

        // FormData 객체 생성
        const formData = new FormData();

        // FormData에 변경된 닉네임 추가
        formData.append('newNickname', newNickname);

        // FormData에 변경된 프로필 이미지 추가
        if (profileImageFile) {
            formData.append('profileImage', profileImageFile);
        }
        // 서버로 업데이트 요청 전송
        try {
            const response = await fetch('http://localhost:3001/update-profile', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                console.log("프로필이 성공적으로 업데이트되었습니다.");
                location.reload();
            } else {
                console.error("프로필 업데이트 실패:", data.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
        alert('회원 정보 수정 완료');
        window.location.href = "list-of-posts";
    }
}

const showToast = (message) => {
    const toast = document.getElementById('toastMessage');
    if (toast) {
        toast.innerText = message;
        toast.style.display = 'block'; // 토스트 메시지 보이기

        // 3초 후에 토스트 메시지 숨기기
        setTimeout( () => {
            toast.style.display = 'none';
        }, 3000);
    } else {
        console.error('Toast message element not found.');
    }
}

// 회원 탈퇴 모달 보이기
const showWithdrawModal = () => {
    const modalBackground = document.getElementById('withdrawModalBackground');
    const deleteModal = document.getElementById('withdrawModal');

    modalBackground.style.display = 'block';
    deleteModal.style.display = 'block';

    // 백그라운드 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 회원 탈퇴 모달 숨기기
const hideWithdrawModal = () => {
    const modalBackground = document.getElementById('withdrawModalBackground');
    const deleteModal = document.getElementById('withdrawModal');

    modalBackground.style.display = 'none';
    deleteModal.style.display = 'none';

    // 백그라운드 스크롤 재개
    document.body.style.overflow = '';
}

// 로그인 화면으로 이동
const redirectToSignIn = () => {
    window.location.href = "sign-in";
}

// 사용자가 회원 탈퇴 확인 버튼을 클릭할 때 호출되는 함수
const confirmWithdraw = async () => {
    try {
        const response = await fetch('http://localhost:3001/withdraw', {
            credentials: 'include', // 쿠키를 서버에 포함시키도록 설정
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            alert('회원 탈퇴 완료');
            window.history.back();
            // 회원 탈퇴 후 로그인 화면으로 이동
            redirectToSignIn();
        } else {
            console.error("회원 탈퇴 실패:", data.error);
        }
    } catch (error) {
        console.error("Error:", error);
    }
    logout();
}

window.addEventListener("load", async () => {
    // 로그인 되지 않은 상태라면 접근 불가! 로그인 페이지로 이동
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = 'sign-in';
    }
    
    // 서버에 요청을 보낼 때 쿠키를 포함시켜서 전송
    fetch('http://localhost:3001/get-profile-image', {
        credentials: 'include' // 쿠키를 서버에 포함시키도록 설정
    })
    .then(response => response.json()) // 응답을 JSON으로 변환
    .then(data => {
        // 서버에서 전달받은 프로필 이미지 경로를 콘솔에 출력
        console.log("서버에서 전달받은 profileImagePath:", data.profileImagePath);

        // 프로필 이미지를 업데이트
        const userProfileImage = document.getElementById("userProfileImage");
        const profileImage = document.getElementById("profileImage");
        userProfileImage.src = data.profileImagePath;
        profileImage.src = data.profileImagePath;
    })
    .catch(error => {
        console.error("Error:", error);
    });

    try {
        // 현재 로그인된 사용자의 이메일을 요청
        const response = await fetch('http://localhost:3001/current-user-email-and-nickname', {
            credentials: 'include' // 쿠키를 서버에 포함시키도록 설정
        });
        const data = await response.json();
        console.log(data);
        if (data.success) {
            // 현재 로그인된 사용자의 이메일을 페이지에 표시
            const currentEmailElement = document.getElementById('currentEmail');
            currentEmailElement.innerText = data.user.email;
            const nicknameInput = document.getElementById('nickname');
            nicknameInput.placeholder = data.user.nickname;
        } else {
            console.error("Failed to get current user email:", data.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});