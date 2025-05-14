const apiUrl = "https://68219a12259dad2655afc1e1.mockapi.io/api";
const imageUrl = document.getElementById("imageUrl");
const postText = document.getElementById("postText");
const button = document.getElementById("submit");

function setupPostForm() {
  button.addEventListener("click", async (e) => {
    e.preventDefault();

    const username = localStorage.getItem("username");
    // unlikely to happen, since the form is hidden from the user if they arn't logged in, but just in case.
    if (!username) {
      alert("You must be logged in to create a post");
      return;
    }

    if (!imageUrl.value && !postText.value) {
      alert("Please enter both an image URL and a post text");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/imageUrl`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: imageUrl.value,
          text: postText.value,
          comment: [],
          author: username,
        }),
      });      if (!response.ok) {
        alert("Failed to create post");
        return;
      }

      imageUrl.value = "";
      postText.value = "";

      loadPosts();

    } catch (error) {
      alert("Failed to create post: ");
    }
  });
}

async function loadPosts() {
  try {
    const res = await fetch(`${apiUrl}/imageUrl`);
    const posts = await res.json();
    renderPosts(posts);
    return posts;
  } catch (error) {
    console.error("error:", error);
    return [];
  }
}

function renderPosts(posts) {
  const container = document.getElementById("posts-container");
  
  container.innerHTML = '';
  container.className = 'd-flex flex-column align-items-center';

  posts.forEach((post) => {
    const card = createPostCard(post);
    container.appendChild(card);
  });
}

function createPostCard(post) {

  const card = document.createElement("div");
  card.className = "card m-3 p-3";

  const row = document.createElement("div");
  row.className = "row";
  card.appendChild(row);

  const postColumn = document.createElement("div");
  postColumn.className = "col-md-6 post-content";
  row.appendChild(postColumn);

  const commentColumn = document.createElement("div");
  commentColumn.className = "col-md-6 comment-content";
  row.appendChild(commentColumn);

  const currentUser = localStorage.getItem("username");

  const cardHeader = document.createElement("div");
  cardHeader.className = "d-flex justify-content-between align-items-center mb-2";

  const author = document.createElement("h6");
  author.className = "text-muted mb-0";
  author.innerText = `Posted by: ${post.author || 'Anonymous'}`;

  cardHeader.appendChild(author);

  // if the current user is the author of the post, the delete button is displayed
  if (currentUser && post.author === currentUser) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger delete-post-btn";
    deleteBtn.textContent = "Delete Post";
    deleteBtn.dataset.postId = post.id;
    cardHeader.appendChild(deleteBtn);
  }

  const img = document.createElement("img");
  img.src = post.imageUrl;
  img.style.width = "100%";
  img.className = "card-img-top";
  
  const title = document.createElement("h4");
  title.innerText = post.text || "Untitled Post";
  title.className = "card-title mt-2";

  const commentsSection = renderComments(post);

  // Add post content to left column
  postColumn.appendChild(cardHeader);
  postColumn.appendChild(img);
  postColumn.appendChild(title);
  
  // Add comments to right column
  commentColumn.appendChild(commentsSection);

  return card;
}

function renderComments(post) {
  const commentsDiv = document.createElement("div");
  commentsDiv.className = "comments-section mt-3";

  const commentsHeading = document.createElement("h5");
  commentsHeading.innerText = "Comments";
  commentsDiv.appendChild(commentsHeading);

  const commentsList = document.createElement("ul");
  commentsList.className = "list-group";
  if (post.comment && post.comment.length > 0) {
    const currentUser = localStorage.getItem("username");

    post.comment.forEach((comment, index) => {
      const commentItem = document.createElement("li");
      commentItem.className = "list-group-item d-flex justify-content-between align-items-center";

      const commentDiv = document.createElement("div");

      const authorStrong = document.createElement("strong");
      authorStrong.textContent = comment.author || 'Anonymous';

      commentDiv.appendChild(authorStrong);
      commentDiv.appendChild(document.createTextNode(": " + comment.text));

      commentItem.appendChild(commentDiv);

      if (currentUser && comment.author === currentUser) {
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-danger delete-comment-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.postId = post.id;
        deleteBtn.dataset.commentIndex = index;
        commentItem.appendChild(deleteBtn);
      }

      commentsList.appendChild(commentItem);
    });
  } else {
    const noComments = document.createElement("li");
    noComments.className = "list-group-item text-muted";
    noComments.innerText = "No comments yet";
    commentsList.appendChild(noComments);
  }
  commentsDiv.appendChild(commentsList);

// add comment form
  const commentForm = createCommentForm(post.id);
  commentsDiv.appendChild(commentForm);

  return commentsDiv;
}

function createCommentForm(postId) {
  const commentForm = document.createElement("div");
  commentForm.className = "input-group mt-2";

  const commentInput = document.createElement("input");
  commentInput.type = "text";
  commentInput.className = "form-control";
  commentInput.placeholder = "Add a comment...";
  commentInput.id = `comment-input-${postId}`;

  const commentButton = document.createElement("button");
  commentButton.className = "btn btn-outline-primary add-comment-btn";
  commentButton.textContent = "Add";
  commentButton.dataset.postId = postId;

  commentForm.appendChild(commentInput);
  commentForm.appendChild(commentButton);

  return commentForm;
}

async function addComment(postId, comment) {
  const username = localStorage.getItem("username");

  if (!username) {
    alert("You must be logged in to add a comment");
    return false;
  }

  try {
    const response = await fetch(`${apiUrl}/imageUrl/${postId}`);
    if (!response.ok) {
      return false;
    }

    const post = await response.json();
    const comments = post.comment || [];
    comments.push({
      text: comment,
      author: username,
      timestamp: new Date().toISOString()
    });
// could not use patch becasue mockapi does not have an endpoint for it. maybe for pro subscription?
    const updateResponse = await fetch(`${apiUrl}/imageUrl/${postId}`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        imageUrl: post.imageUrl,
        text: post.text,
        comment: comments,
        author: post.author
      })    });

    return updateResponse.ok;

  } catch (error) {
    console.error("error", error);
    return false;
  }
}


function setupEvent() {
  const postsContainer = document.getElementById("posts-container");
  
  postsContainer.addEventListener("click", async (e) => {
    if (e.target && e.target.classList.contains("add-comment-btn")) {
      const postId = e.target.dataset.postId;
      const commentInput = document.getElementById(`comment-input-${postId}`);
      if (!commentInput) return;

      const commentText = commentInput.value.trim();

      if (!commentText) {
        alert("Please enter a comment");
        return;
      }

      const success = await addComment(postId, commentText);      if (success) {
        commentInput.value = "";
        loadPosts();
      } else {
        alert("Failed to add comment");
      }
    }

    if (e.target && e.target.classList.contains("delete-comment-btn")) {
      const postId = e.target.dataset.postId;
      const commentIndex = e.target.dataset.commentIndex;

      if (confirm("Are you sure you want to delete this comment?")) {
        const success = await removeComment(postId, parseInt(commentIndex));        if (success) {
          loadPosts();
        } else {
          alert("Failed to delete comment");
        }
      }
    }

    if (e.target && e.target.classList.contains("delete-post-btn")) {
      const postId = e.target.dataset.postId;

      if (confirm("Are you sure you want to delete this post?")) {
        const success = await removePost(postId);        if (success) {
          loadPosts();
        } else {
          alert("Failed to delete post");
        }
      }
    }
  });
}

async function removeComment(postId, commentIndex) {
  try {
    const response = await fetch(`${apiUrl}/imageUrl/${postId}`);
    if (!response.ok) return false;

    const post = await response.json();
    const comments = post.comment || [];
    
    //use splice to remove one comment at the specified index
    comments.splice(commentIndex, 1);
    
    //like addComment() I couldn't use patch becasue mockapi does not have an endpoint for it.
    const updateResponse = await fetch(`${apiUrl}/imageUrl/${postId}`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        imageUrl: post.imageUrl,
        text: post.text,
        comment: comments,
        author: post.author
      })
    });

    return updateResponse.ok;
  } catch (error) {
    console.error("error:", error);
    return false;
  }
}

async function removePost(postId) {
  try {
    const response = await fetch(`${apiUrl}/imageUrl/${postId}`);
    if (!response.ok) return false;

    const deleteResponse = await fetch(`${apiUrl}/imageUrl/${postId}`, {
      method: "DELETE"
    });

    return deleteResponse.ok;
  } catch (error) {
    console.error("error:", error);
    return false;
  }
}

function init() {
  //handle user UI based on login status + init: postform(), load posts(), and setupevent()
  const username = localStorage.getItem("username");
  const postCreationSection = document.getElementById("post-form-section");

  if (username) {
    if (postCreationSection) {
      postCreationSection.classList.remove("d-none");
    }
    document.getElementById("logout-link").className = "d-flex btn btn-outline-danger";
    document.getElementById("login-link").className = "d-none";
  } else {
    if (postCreationSection) {
      postCreationSection.classList.add("d-none");
    }
    document.getElementById("login-link").className = "d-flex btn btn-success";
    document.getElementById("logout-link").className = "d-none";
  }
  setupPostForm();
  loadPosts();
  setupEvent();
}

init();


