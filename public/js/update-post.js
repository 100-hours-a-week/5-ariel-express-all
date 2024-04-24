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
    // ex) https://example.com/images/photo.jpg -> ['https:', '', 'example.com', 'images', 'photo.jpg'] -> photo.jpg
}

// URL에서 게시글 ID를 가져오는 함수
function getPostIdFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('id');
}

// 수정 폼 제출 시 동작
// 여기 아직 구현 안 함
document.getElementById('updateForm').addEventListener('submit', function (event) {
    event.preventDefault(); // 폼 기본 동작 방지

    const postId = document.getElementById('postId').value;
    const title = document.getElementById('titleInput').value;
    const content = document.getElementById('contentInput').value;

    // 수정할 내용을 서버에 전송하고, 성공적으로 처리되면 페이지를 다시 불러옴
    fetch(`update-post?id=${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content }) // 수정된 제목과 내용을 전송
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 성공적으로 수정되었을 때 메시지 표시
                console.log('게시글이 수정되었습니다.');
            } else {
                console.error('Failed to update post:', data.error);
            }
        })
        .catch(error => console.error('Error updating post:', error));
});

// 이미지 파일 선택 시 파일명 표시
function displayFileName() {
    //console.log('함수 실행됨');
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