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

// URL에서 게시글 ID를 가져오는 함수
const getPostIdFromUrl = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('id');
}

// 페이지가 로드되면 해당 게시글 정보를 가져와서 렌더링
window.onload = () => {
    fetchPostDetails();
};

const fetchPostDetails = () => {
    const postId = getPostIdFromUrl(); // 게시글 id를 가져옴
    fetch(`http://localhost:3001/posts/${postId}`) // 특정 게시글 ID에 대해 fetch
        .then(response => response.json())
        .then(post => {
            if (post) {
                renderPostDetails(post);
            } else {
                console.error('Post not found');
            }
        })
        .catch(error => console.error('Error fetching post details:', error));
}

const renderPostDetails = (post) => {
    document.getElementById('postId').value = post.post_id;
    document.getElementById('titleInput').value = post.title;
    document.getElementById('contentInput').value = post.post_content;
    document.getElementById('fileName').innerText = post.post_image ? post.post_image.split('/').pop() : ''; // 기존 파일 명 표시
}

// 수정하기 버튼 클릭 시 동작
document.getElementById('updateForm').addEventListener('submit', (event) => {
    event.preventDefault(); // 폼 기본 동작 방지

    const postId = document.getElementById('postId').value;
    const title = document.getElementById('titleInput').value;
    const content = document.getElementById('contentInput').value;
    const imageFile = document.getElementById('fileInput').files[0]; // 이미지 파일

    const formData = new FormData(); // FormData 객체 생성
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) {
        formData.append('image', imageFile); // 이미지 파일 추가
    }

    // 수정할 내용을 서버에 전송하고, 성공적으로 처리되면 페이지를 다시 불러옴
    fetch(`http://localhost:3001/update-post?id=${postId}`, { // PUT에서 POST로 수정
        method: 'POST', // PUT에서 POST로 수정
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('게시글 수정 완료');
            // 성공적으로 수정되었을 때 해당 게시글 상세 조회 페이지로 이동
            window.location.href = `post-details?id=${postId}`;
        } else {
            console.error('Failed to update post:', data.error);
        }
    })
    .catch(error => console.error('Error updating post:', error));
});

// 이미지 파일 선택 시 파일명 표시
const displayFileName = () => {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    if (fileInput.files.length > 0) {
        fileName.innerText = fileInput.files[0].name;
    } else {
        const postId = document.getElementById('postId').value;
        fetch(`http://localhost:3001/posts/${postId}`)
            .then(response => response.json())
            .then(post => {
                if (post) {
                    fileName.innerText = post.post_image ? post.post_image.split('/').pop() : ''; // 기존 파일명
                } else {
                    console.error('Post not found');
                }
            })
            .catch(error => console.error('Error fetching post details:', error));
    }
}

// 파일 선택 버튼 클릭 시 파일 선택 input 열기
document.getElementById('fileButton').addEventListener('click', (event) => {
    event.preventDefault(); // 기본 동작 방지
    document.getElementById('fileInput').click(); // 파일 선택 input 열기
});

window.addEventListener("load", () => {
    if (!sessionStorage.getItem('loggedInUser')) {
        window.location.href = 'sign-in';
    }
    fetch('http://localhost:3001/get-profile-image', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const userProfileImage = document.getElementById("userProfileImage");
        userProfileImage.src = data.profileImagePath;
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
