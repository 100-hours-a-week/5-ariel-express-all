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
    const queryString = window.location.search; // id 반환 (ex. ?id=1)
    const urlParams = new URLSearchParams(queryString); // 쿼리문자열 해석
    return urlParams.get('id'); // 'id' 매개변수의 값을 가져옴
}

// 게시글 정보를 화면에 렌더링하는 함수
const renderPostDetails = (post) => {
    const postDetails = document.getElementById('postDetails');

    const formattedViews = formatNumber(post.views_count);
    const formattedComments = formatNumber(post.comments.length);

    let postImageHTML = ''; // 이미지 HTML 초기화

    // post.image가 null이 아닌 경우에만 이미지 HTML을 생성
    if (post.post_image !== null) {
        postImageHTML = `<img src="${post.post_image}" class="post-image" alt="post-image">`;
    }

    // 현재 로그인된 사용자의 이메일 가져오기
    const loggedInUserEmail = getLoggedInUserEmail();

    // 작성자 이메일과 현재 로그인된 사용자의 이메일 비교하여 수정 및 삭제 버튼 처리
    const editButtonsHTML = (post.author_email === loggedInUserEmail) ? `
        <div class="edit-buttons">
            <a href="update-post?id=${post.post_id}"><button class="modify-button">수정</button></a>
            <button class="delete-button" onclick="showPostDeleteModal()">삭제</button>
        </div>
    ` : '';

    const postHTML = `
        <h1 class="post-title">${post.title}</h1>
        <div class="info1">
            <div class="post-author-profile"><img src='http://localhost:3001/${post.author_profile_picture}' width="30px" height="30px"></div>
            <div class="author-name"><small><b>${post.author_nickname}</b></small></div>
            <div class="post-date"><small>${formatDateTime(post.created_at)}</small></div>
            ${editButtonsHTML} <!-- 수정, 삭제 버튼 HTML -->
        </div>
        <hr>
        <section class="body">
            ${postImageHTML} <!-- 이미지 HTML 삽입 -->
            <div class="post-text">${post.post_content}</div>
        </section>
        <section class="info2">
            <div class="info-hits">
                <div><b>${formattedViews}</b></div>
                <div><b><small>조회수</small></b></div>
            </div>
            <div class="info-comments">
                <div><b>${formattedComments}</b></div>
                <div><b><small>댓글</small></b></div>
            </div>
        </section>
        <hr>
        </section>
        <section class="comment-register-space">
            <textarea class="input-comment" placeholder="댓글을 남겨주세요!"></textarea>
            <hr>
            <button class="comment-register-button" onclick="registerComment()">댓글 등록</button>
        </section>
        <section class="comment-list-space">
            <!-- 댓글 목록이 여기에 동적으로 삽입됩니다 -->
        </section>
    `;
    postDetails.innerHTML = postHTML;

    // 댓글 목록을 가져오는 함수 호출
    fetchComments(post.comments);
}

// 게시글 ID를 가져와서 해당 게시글 정보를 요청하는 함수
const fetchPostDetails = () => {
    const postId = getPostIdFromUrl(); // 게시글 id를 가져옴
    fetch(`http://localhost:3001/posts/${postId}`) // 게시글 정보 fetch
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

// 댓글을 가져와서 화면에 렌더링하는 함수
const fetchComments = (comments) => {
    const commentListSpace = document.querySelector('.comment-list-space');

    comments.forEach(comment => {
        const loggedInUserEmail = getLoggedInUserEmail();

        const editButtonsHTML = (comment.email === loggedInUserEmail) ? `
            <div class="edit-buttons">
                <button class="modify-button" onclick="editComment('${comment.comment_id}', '${comment.comment_content}')">수정</button>
                <button class="delete-button" onclick="showCommentDeleteModal('${comment.comment_id}')">삭제</button>
            </div>
        ` : '';

        const commentHTML = `
            <section class="current-comment-info">
                <div class="comment-author-profile"><img src="${comment.profile_picture}" style="border-radius: 50%; width: 30px; height: 30px;"></div>
                <div class="author-name"><small><b>${comment.nickname}</b></small></div>
                <div class="post-date"><small>${formatDateTime(comment.created_at)}</small></div>
                ${editButtonsHTML} <!-- 수정, 삭제 버튼 HTML -->
            </section>
            <section class="current-comment-text">
                <div><small>${comment.comment_content}</small></div>
            </section>
        `;
        commentListSpace.insertAdjacentHTML('beforeend', commentHTML);
    });
}

// 페이지가 로드되면 해당 게시글 정보를 가져와서 렌더링
window.onload = () => {
    fetchPostDetails();
};

// 현재 로그인된 사용자의 이메일을 세션에서 가져옴
const getLoggedInUserEmail = () => {
    return sessionStorage.getItem('loggedInUser');
}

// 숫자를 형식에 맞게 변환하는 함수
const formatNumber = (number) => {
    if (number >= 100000) {
        return (number / 1000).toFixed(0) + 'k';
    } else if (number >= 10000) {
        return (number / 1000).toFixed(1) + 'k';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k';
    } else {
        return number;
    }
}

// 게시글 삭제 모달 보이기
const showPostDeleteModal = () => {
    const modalBackground = document.getElementById('postDeleteModalBackground');
    const deleteModal = document.getElementById('postDeleteModal');

    modalBackground.style.display = 'block';
    deleteModal.style.display = 'block';

    document.body.style.overflow = 'hidden';

    document.getElementById('deletePostButton').addEventListener('click', () => {
        confirmDeletePost();
    });
}

// 게시글 삭제 모달 숨기기
const hidePostDeleteModal = () => {
    const modalBackground = document.getElementById('postDeleteModalBackground');
    const deleteModal = document.getElementById('postDeleteModal');

    modalBackground.style.display = 'none';
    deleteModal.style.display = 'none';

    document.body.style.overflow = '';
}

// 댓글 삭제 모달 보이기
const showCommentDeleteModal = (commentId) => {
    const modalBackground = document.getElementById('commentDeleteModalBackground');
    const deleteModal = document.getElementById('commentDeleteModal');

    modalBackground.style.display = 'block';
    deleteModal.style.display = 'block';

    deleteModal.dataset.commentId = commentId;

    const postId = getPostIdFromUrl();

    document.body.style.overflow = 'hidden';

    confirmDeleteComment(postId);
}

// 댓글 삭제 모달 숨기기
const hideCommentDeleteModal = () => {
    const modalBackground = document.getElementById('commentDeleteModalBackground');
    const deleteModal = document.getElementById('commentDeleteModal');

    modalBackground.style.display = 'none';
    deleteModal.style.display = 'none';

    document.body.style.overflow = '';
}

const confirmDeletePost = () => {
    const postId = getPostIdFromUrl();

    fetch('http://localhost:3001/delete-post', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hidePostDeleteModal();
            window.location.href = "list-of-posts";
            showToast('게시글이 삭제되었습니다.');
        } else {
            console.error('Failed to delete post:', data.error);
        }
    })
    .catch(error => console.error('Error deleting post:', error));
}

// 댓글 삭제 확인 모달에서 삭제 버튼 클릭 시 실행되는 함수
const confirmDeleteComment = (postId) => {
    const commentId = document.getElementById('commentDeleteModal').dataset.commentId;

    const deleteButton = document.getElementById('deleteCommentButton');
    deleteButton.onclick =  () => {
        fetch('http://localhost:3001/delete-comment', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId, commentId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                hideCommentDeleteModal();
                location.reload();
                fetchComments(postId.comments);
                showToast('댓글이 삭제되었습니다.');
            } else {
                console.error('Failed to delete comment:', data.error);
            }
        })
        .catch(error => console.error('Error deleting comment:', error));
    };
}

document.getElementById('commentDeleteModalBackground').addEventListener('click', confirmDeleteComment);

const editComment = (commentId, commentContent) => {
    const inputComment = document.querySelector('.input-comment');
    const registerButton = document.querySelector('.comment-register-button');
    const postId = getPostIdFromUrl();

    inputComment.value = commentContent;
    registerButton.textContent = '댓글 수정';

    registerButton.onclick = () => {
        const updatedCommentContent = inputComment.value;
        updateComment(postId, commentId, updatedCommentContent);
    };
}

// 댓글 업데이트
const updateComment = (postId, commentId, updatedCommentContent) => {
    fetch('http://localhost:3001/update-comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId, commentId, content: updatedCommentContent })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
            fetchComments(data.updatedComments);
        } else {
            console.error('Failed to update comment:', data.error);
        }
    })
    .catch(error => console.error('Error updating comment:', error));
}

const registerComment = () => {
    const inputComment = document.querySelector('.input-comment');
    const registerButton = document.querySelector('.comment-register-button');
    const postId = getPostIdFromUrl();

    if (registerButton.textContent === '댓글 수정') {
        const updatedCommentContent = inputComment.value;
        updateComment(postId, commentId, updatedCommentContent);
    } else {
        const loggedInUserNickname = getLoggedInUserNickname();
        const loggedInUserProfile = getLoggedInUserProfile();

        const getCurrentDateTime = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        const newComment = {
            id: null,
            author: {
                profile_picture: loggedInUserProfile,
                nickname: loggedInUserNickname
            },
            date: getCurrentDateTime().split(' ')[0],
            time: getCurrentDateTime().split(' ')[1],
            content: inputComment.value
        };

        fetch('http://localhost:3001/add-comment', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId, content: newComment.content })
        })
        .then(response => response.json())
        .then(data => {
            newComment.id = data.commentId;
            inputComment.value = '';
            location.reload();
            fetchComments(postId.comments);
        })
        .catch(error => console.error('Error registering comment:', error));

        inputComment.value = '';
    }
}

const getLoggedInUserNickname = () => {
    return document.cookie.replace(/(?:(?:^|.*;\s*)loggedInUserNickname\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

const getLoggedInUserProfile = () => {
    return document.cookie.replace(/(?:(?:^|.*;\s*)loggedInUserProfile\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

const formatDateTime = (isoDateTimeString) => {
    const dateTime = new Date(isoDateTimeString);
    if (isNaN(dateTime.getTime())) {
        return '';
    }
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, '0');
    const day = String(dateTime.getDate()).padStart(2, '0');
    const hours = String(dateTime.getHours()).padStart(2, '0');
    const minutes = String(dateTime.getMinutes()).padStart(2, '0');
    const seconds = String(dateTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const showToast = (message) => {
    const toast = document.getElementById('toastMessage');
    if (toast) {
        toast.innerText = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    } else {
        console.error('Toast message element not found.');
    }
}

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
