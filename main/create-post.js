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
function redirectToPostList() {
    window.location.href = "list-of-posts.html";
}