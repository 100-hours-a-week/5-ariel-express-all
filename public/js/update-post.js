// 드롭다운 메뉴
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

// 페이지가 로드되면 해당 게시글 정보를 가져와서 렌더링
window.onload = function () {
    fetchPostDetails();
};

function fetchPostDetails() {
    const postId = getPostIdFromUrl(); // 게시글 id를 가져옴
    fetch('/backend/model/posts.json')
        .then(response => response.json())
        .then(data => {
            const post = data.posts.find(post => post.id === parseInt(postId));
            if (post) {
                renderPostDetails(post);
            } else {
                console.error('Post not found');
            }
        })
        .catch(error => console.error('Error fetching post details:', error));
}

function renderPostDetails(post) {
    document.getElementById('postId').value = post.id;
    document.getElementById('titleInput').value = post.title;
    document.getElementById('contentInput').value = post.content;
    document.getElementById('fileName').innerText = post.image.split('/').pop(); // 기존 파일 명 표시
}

// URL에서 게시글 ID를 가져오는 함수
function getPostIdFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('id');
}

// 수정하기 버튼 클릭 시 동작
document.getElementById('updateForm').addEventListener('submit', function (event) {
    event.preventDefault(); // 폼 기본 동작 방지

    const postId = document.getElementById('postId').value;
    const title = document.getElementById('titleInput').value;
    const content = document.getElementById('contentInput').value;
    const imageFile = document.getElementById('fileInput').files[0]; // 이미지 파일

    const formData = new FormData(); // FormData 객체 생성
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image', imageFile); // 이미지 파일 추가

    // 수정할 내용을 서버에 전송하고, 성공적으로 처리되면 페이지를 다시 불러옴
    fetch(`update-post?id=${postId}`, { // PUT에서 POST로 수정
        method: 'POST', // PUT에서 POST로 수정
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 성공적으로 수정되었을 때 해당 게시글 상세 조회 페이지로 이동
                window.location.href = `post-details?id=${postId}`;
            } else {
                console.error('Failed to update post:', data.error);
            }
        })
        .catch(error => console.error('Error updating post:', error));
});



// 이미지 파일 선택 시 파일명 표시
function displayFileName() {
    console.log('함수 실행됨');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    if (fileInput.files.length > 0) {
        fileName.innerText = fileInput.files[0].name;
    } else {
        // 파일 선택이 취소된 경우 기존 파일명 표시
        const postId = document.getElementById('postId').value;
        fetch('/backend/model/posts.json')
            .then(response => response.json())
            .then(data => {
                const post = data.posts.find(post => post.id === parseInt(postId));
                if (post) {
                    fileName.innerText = post.image.split('/').pop(); // 기존 파일명
                } else {
                    console.error('Post not found');
                }
            })
            .catch(error => console.error('Error fetching post details:', error));
    }
}