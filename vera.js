let posts = [];
let currentPostId = null;

const form = document.getElementById('postForm');
const postsSection = document.getElementById('postsSection');
const modal = document.getElementById('readModal');

// Form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const post = {
        id: Date.now(),
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        type: document.getElementById('type').value,
        content: document.getElementById('content').value,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        ratings: [],
        comments: []
    };

    posts.unshift(post);
    renderPosts();
    form.reset();
});

// Render all posts
function renderPosts() {
    if (posts.length === 0) {
        postsSection.innerHTML = '<div class="no-posts">No posts yet. Share your first piece of writing!</div>';
        return;
    }

    postsSection.innerHTML = posts.map(post => {
        const avgRating = getAverageRating(post.ratings);
        const starsHTML = generateStarsHTML(avgRating);
        
        return `
            <div class="post">
                <div class="post-header">
                    <div class="post-header-left">
                        <h3 class="post-title">
                            ${post.title}
                            <span class="post-type">${post.type}</span>
                        </h3>
                        <p class="post-meta">By ${post.author} • ${post.date}</p>
                    </div>
                    <div class="post-rating">
                        <div class="stars">${starsHTML}</div>
                        <div class="rating-count">${post.ratings.length} ${post.ratings.length === 1 ? 'rating' : 'ratings'}</div>
                        <div class="rating-count">${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}</div>
                    </div>
                </div>
                <div class="post-content">${truncateText(post.content, 200)}</div>
                <div class="post-actions">
                    <button class="read-btn" onclick="openModal(${post.id})">Read Full & Comment</button>
                    <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Truncate text for preview
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Generate stars HTML
function generateStarsHTML(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '★';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '★';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

// Calculate average rating
function getAverageRating(ratings) {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
}

// Open modal
function openModal(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    currentPostId = id;

    document.getElementById('modalTitle').textContent = post.title;
    document.getElementById('modalAuthor').textContent = post.author;
    document.getElementById('modalType').textContent = post.type;
    document.getElementById('modalDate').textContent = post.date;
    document.getElementById('modalBody').textContent = post.content;

    // Display rating
    const avgRating = getAverageRating(post.ratings);
    const starsHTML = generateStarsHTML(avgRating);
    document.getElementById('starsDisplay').innerHTML = starsHTML;
    
    if (post.ratings.length > 0) {
        document.getElementById('ratingText').textContent = 
            `${avgRating.toFixed(1)} out of 5 (${post.ratings.length} ${post.ratings.length === 1 ? 'rating' : 'ratings'})`;
    } else {
        document.getElementById('ratingText').textContent = 'No ratings yet';
    }

    // Reset star rating
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });

    // Render comments
    renderComments(post.comments);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentPostId = null;
    
    // Clear comment form
    document.getElementById('commenterName').value = '';
    document.getElementById('commentText').value = '';
}

// Star rating interaction
document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', function() {
        const rating = parseInt(this.dataset.rating);
        addRating(rating);
        
        // Visual feedback
        document.querySelectorAll('.star').forEach((s, index) => {
            if (index < rating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });

    star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.dataset.rating);
        document.querySelectorAll('.star').forEach((s, index) => {
            if (index < rating) {
                s.style.color = '#f39c12';
            } else {
                s.style.color = '#ddd';
            }
        });
    });

    star.addEventListener('mouseleave', function() {
        document.querySelectorAll('.star').forEach(s => {
            if (!s.classList.contains('active')) {
                s.style.color = '#ddd';
            }
        });
    });
});

// Add rating
function addRating(rating) {
    if (!currentPostId) return;
    
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;

    post.ratings.push(rating);
    
    // Update display
    const avgRating = getAverageRating(post.ratings);
    const starsHTML = generateStarsHTML(avgRating);
    document.getElementById('starsDisplay').innerHTML = starsHTML;
    document.getElementById('ratingText').textContent = 
        `${avgRating.toFixed(1)} out of 5 (${post.ratings.length} ${post.ratings.length === 1 ? 'rating' : 'ratings'})`;

    renderPosts();
    
    // Show confirmation
    alert('Thank you for rating!');
}

// Add comment
function addComment() {
    if (!currentPostId) return;

    const commenterName = document.getElementById('commenterName').value.trim();
    const commentText = document.getElementById('commentText').value.trim();

    if (!commenterName || !commentText) {
        alert('Please enter your name and comment');
        return;
    }

    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;

    const comment = {
        id: Date.now(),
        author: commenterName,
        text: commentText,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    post.comments.push(comment);
    renderComments(post.comments);
    renderPosts();

    // Clear form
    document.getElementById('commenterName').value = '';
    document.getElementById('commentText').value = '';
}

// Render comments
function renderComments(comments) {
    const commentsList = document.getElementById('commentsList');

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
        return;
    }

    commentsList.innerHTML = comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <p class="comment-text">${comment.text}</p>
        </div>
    `).join('');
}

// Delete post
function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== id);
        renderPosts();
    }
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});