import React, { useEffect, useState, useRef } from "react";
import { getDatabase, ref, onValue, set, remove, push, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { FaThumbsUp, FaTrash, FaPlus, FaTimes, FaFilter } from "react-icons/fa";
import "./forum.css";

Modal.setAppElement("#root");

const CATEGORY_LIST = [
  "General",
  "Announcement",
  "Accident",
  "Event",
];

export default function Forum() {
  const db = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("None");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [sortLatest, setSortLatest] = useState(false); // false = Top, true = Latest
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrls, setModalImageUrls] = useState([]);
  const [isAll, setIsAll] = useState(true); // All vs Your Post

  // Fetch posts and comments in real-time
  useEffect(() => {
    const postsRef = ref(db, "posts");
    const commentsRef = ref(db, "comment");

    const unsubPosts = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setPosts(loaded);
      } else {
        setPosts([]);
      }
    });

    const unsubComments = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        setComments(loaded);
      } else {
        setComments([]);
      }
    });

    return () => {
      unsubPosts();
      unsubComments();
    };
  }, [db]);

  // Filtering and sorting
  const filteredPosts = posts
    .filter((post) => {
      // All vs Your Post
      if (!isAll && post.email !== user?.email) return false;
      // Search
      const matchesSearch =
        post.title?.toLowerCase().includes(search.toLowerCase()) ||
        post.content?.toLowerCase().includes(search.toLowerCase());
      // Category
      const matchesCategory = category === "None" || post.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortLatest) {
        return (b.date || 0) - (a.date || 0);
      } else {
        return (b.upvoter?.length || 0) - (a.upvoter?.length || 0);
      }
    });

  // Upvote/un-upvote
  const handleUpvote = async (post) => {
    if (!user) return;
    const postRef = ref(db, `posts/${post.id}`);
    const snap = await get(postRef);
    if (!snap.exists()) return;
    const postData = snap.val();
    const upvoters = postData.upvoter || [];
    let updatedUpvoters;
    if (upvoters.includes(user.uid)) {
      updatedUpvoters = upvoters.filter((id) => id !== user.uid);
    } else {
      updatedUpvoters = [...upvoters, user.uid];
    }
    set(postRef, { ...postData, upvoter: updatedUpvoters });
  };

  // Delete post
  const handleDelete = async (post) => {
    if (!user || post.email !== user.email) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
      await remove(ref(db, `posts/${post.id}`));
    }
  };

  // Open comment modal
  const openCommentModal = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  // Add comment
  const handleAddComment = async () => {
    if (!user || !commentInput.trim()) return;
    // Get username from users node
    const usersSnap = await get(ref(db, "users"));
    let username = user.email;
    if (usersSnap.exists()) {
      const users = Object.values(usersSnap.val());
      const found = users.find((u) => u.email === user.email);
      if (found) username = found.username || user.email;
    }
    const newCommentRef = push(ref(db, "comment"));
    await set(newCommentRef, {
      user: username,
      email: user.email,
      comment: commentInput,
      post: selectedPost.id,
    });
    // Update post's commentId array
    const postRef = ref(db, `posts/${selectedPost.id}`);
    const snap = await get(postRef);
    if (snap.exists()) {
      const postData = snap.val();
      const commentIds = postData.commentId || [];
      set(postRef, { ...postData, commentId: [...commentIds, newCommentRef.key] });
    }
    setCommentInput("");
  };

  // Category filter modal
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setShowCategoryModal(false);
  };

  // Image modal
  const openImageModal = (urls) => {
    setModalImageUrls(urls);
    setShowImageModal(true);
  };

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h2>Community Forum</h2>
        <Link to="/forum/create" className="forum-btn">
          <FaPlus style={{ marginRight: 8 }} /> New Post
        </Link>
      </div>

      <div className="forum-search">
        <input
          type="text"
          placeholder="Search any content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <div className="forum-filters" style={{ alignItems: "center" }}>
        <button
          className="forum-btn-outline forum-filter-btn"
          onClick={() => setShowCategoryModal(true)}
          style={{ marginLeft: 8 }}
        >
          <FaFilter style={{ marginRight: 5 }} />
          {category === "None" ? "All Categories" : category}
        </button>
        <button
          className="forum-btn-outline forum-filter-btn"
          onClick={() => setSortLatest((v) => !v)}
          style={{ marginLeft: 8 }}
        >
          {sortLatest ? "Sort: Latest" : "Sort: Top"}
        </button>
        <button
          className={isAll ? "forum-btn active forum-filter-btn" : "forum-btn-outline forum-filter-btn"}
          onClick={() => setIsAll(true)}
          style={{ marginLeft: 8 }}
        >
          All Posts
        </button>
        <button
          className={!isAll ? "forum-btn active forum-filter-btn" : "forum-btn-outline forum-filter-btn"}
          onClick={() => setIsAll(false)}
          style={{ marginLeft: 4 }}
        >
          Your Posts
        </button>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>Select Category</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button className="forum-btn-outline" onClick={() => handleCategoryChange("None")}>
            All
          </button>
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat}
              className="forum-btn-outline"
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          className="forum-btn"
          style={{ marginTop: 20 }}
          onClick={() => setShowCategoryModal(false)}
        >
          Close
        </button>
      </Modal>

      <div className="forum-list">
        {filteredPosts.length === 0 ? (
          <p className="no-posts">No content available</p>
        ) : (
          filteredPosts.map((post) => (
            <div className="forum-card" key={post.id}>
              <div className="forum-card-header">
                <div className="forum-avatar">
                  <img
                    src={
                      post.profilePhoto ||
                      "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png"
                    }
                    alt={post.user || post.email}
                  />
                </div>
                <div>
                  <div className="forum-author">{post.user || post.email}</div>
                  <div className="forum-category">{post.category}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "#888", fontSize: 14 }}>
                  {(() => {
                    const d = new Date(post.date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    let hours = d.getHours();
                    const minutes = String(d.getMinutes()).padStart(2, "0");
                    const ampm = hours >= 12 ? "PM" : "AM";
                    hours = hours % 12 || 12;
                    return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
                  })()}
                </div>
              </div>
              <div className="forum-card-body">
                <div className="forum-title">{post.title}</div>
                <div className="forum-content">{post.content}</div>
                {post.imageURL && Array.isArray(post.imageURL) && post.imageURL.length > 0 && (
                  <div className="forum-images" style={{ overflowX: "auto", display: "flex" }}>
                    {post.imageURL.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="attachment"
                        className="forum-thumb"
                        onClick={() => openImageModal(post.imageURL)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="forum-card-footer">
                <button
                  className="forum-btn-outline"
                  onClick={() => handleUpvote(post)}
                  title="Upvote"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: post.upvoter?.includes(user?.uid) ? "bold" : "normal",
                    color: post.upvoter?.includes(user?.uid) ? "#00b16a" : "#1976d2",
                  }}
                >
                  <FaThumbsUp />
                  {post.upvoter?.length || 0}
                </button>
                <button
                  className="forum-btn-outline"
                  onClick={() => openCommentModal(post)}
                  style={{ marginLeft: 12 }}
                >
                  Comments
                </button>
                {user && post.email === user.email && (
                  <button
                    className="forum-btn-outline"
                    onClick={() => handleDelete(post)}
                    style={{ marginLeft: "auto", color: "#d32f2f", borderColor: "#d32f2f" }}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onRequestClose={() => setShowCommentModal(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ flex: 1 }}>Comments</h3>
          <button
            className="forum-btn-outline"
            onClick={() => setShowCommentModal(false)}
            style={{ border: "none", background: "none", fontSize: 22 }}
          >
            <FaTimes />
          </button>
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 16 }}>
          {comments.filter((c) => c.post === selectedPost?.id).length === 0 ? (
            <div style={{ color: "#888" }}>No comments yet.</div>
          ) : (
            comments
              .filter((c) => c.post === selectedPost?.id)
              .map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div className="forum-avatar" style={{ width: 36, height: 36 }}>
                    <img
                      src={
                        "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png"
                      }
                      alt={c.user}
                      style={{ width: 36, height: 36, borderRadius: "50%" }}
                    />
                  </div>
                  <div
                    style={{
                      background: "#f1f1f1",
                      borderRadius: 15,
                      padding: 10,
                      flex: 1,
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: 2 }}>{c.user}</div>
                    <div style={{ color: "#333" }}>{c.comment}</div>
                  </div>
                </div>
              ))
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            style={{
              flex: 1,
              borderRadius: 20,
              background: "#f1f1f1",
              padding: "10px 15px",
              fontSize: 16,
              border: "1px solid #eee",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
          />
          <button
            className="forum-btn"
            style={{ borderRadius: 20, padding: "10px 20px" }}
            onClick={handleAddComment}
          >
            Send
          </button>
        </div>
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onRequestClose={() => setShowImageModal(false)}
        className="modal-content image-modal"
        overlayClassName="modal-overlay"
      >
        <button
          className="forum-btn-outline"
          onClick={() => setShowImageModal(false)}
          style={{
            border: "none",
            background: "none",
            fontSize: 22,
            position: "absolute",
            top: 10,
            right: 10,
          }}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        <div style={{ display: "flex", overflowX: "auto", maxWidth: "90vw", maxHeight: "80vh" }}>
          {modalImageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt="Full view"
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: 12,
                margin: "0 8px",
                display: "block",
              }}
            />
          ))}
        </div>
      </Modal>

      {/* Floating Create Button */}
      <Link to="/forum/create" className="forum-fab">
        <FaPlus />
      </Link>
    </div>
  );
}