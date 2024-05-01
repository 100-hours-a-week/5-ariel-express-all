const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const createPostHelperText = document.getElementById("createPostHelperText");

// 제목 input 값이 변경될 때마다 유효성 검사
titleInput.addEventListener('input', function () {
    validate();
});
// 내용 input 값이 변경될 때마다 유효성 검사
contentInput.addEventListener('input', function () {
    validate();
});

function validate() {
    const titleValue = titleInput.value.trim();
    const contentValue = contentInput.value.trim();

    // 제목이나 내용이 비어있는 경우, helper text 표시 + 버튼 비활성화
    if (titleValue == '' || contentValue == '') {
        createPostHelperText.style.color = "red";
        createPostHelperText.textContent = '* 제목, 내용을 모두 작성해주세요.';
        createPostHelperText.style.visibility = 'visible';
        document.getElementById('completeButton').disabled = true;
        document.getElementById('completeButton').style.backgroundColor = "#ACA0EB";
    }
    // 제목과 내용이 모두 입력된 경우, helper text 숨기기 + 버튼 활성화
    else {
        createPostHelperText.style.visibility = 'hidden';
        document.getElementById('completeButton').disabled = false;
        document.getElementById('completeButton').style.backgroundColor = "#7F6AEE";
    }
}

// 드롭다운
function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
    } else {
        dropdownContent.classList.add("show");
    }
}

// 다른 곳을 클릭했을 때, 열러있는 드롭다운 닫기
window.onclick = function (event) {
    if (!event.target.matches('.profile-image')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// 이미지 파일 선택 시 파일명 표시
function displayFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    if (fileInput.files.length > 0) {
        fileName.innerText = fileInput.files[0].name;
    } else {
        fileName.innerText = "파일을 선택해주세요.";
    }
}

// 게시글 목록 페이지로 이동
// function redirectToPostList() {
//     window.location.href = "list-of-posts";
// }

// 게시글 작성 완료 시 호출되는 함수
function createPost() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const imageFile = document.getElementById('fileInput').files[0]; // 이미지 파일

    // FormData 객체 생성
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', imageFile);

    console.log(formData.get('title'));
    console.log(formData.get('content'));
    console.log(formData.get('image'));

    // 서버에 새 게시글 정보 전송
    fetch('http://localhost:3001/create-post', {
        credentials: 'include',
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // 게시글 작성 성공 후 페이지 이동
        window.location.href = "./list-of-posts";
    })
    .catch(error => {
        console.error('Error creating post:', error);
    });
}

// 페이지 로드 시 실행되는 함수
window.addEventListener("load", function() {
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
        userProfileImage.src = data.profileImagePath;
    })
    .catch(error => {
        console.error("Error:", error);
    });
});