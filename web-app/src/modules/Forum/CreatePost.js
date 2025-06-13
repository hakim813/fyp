import React, { useState, useEffect } from "react";
import { getDatabase, ref, set, push, get, child, serverTimestamp } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import "../../styles/forum.css";

const CATEGORY_LIST = [
  "General",
  "Platform Issue",
  "Safety and Security",
  "Vendor Issue",
  "Incident",
  "Others",
];

export default function CreatePost() {
  const db = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;
  const storage = getStorage();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  // Upload images to Firebase Storage and return URLs
  const uploadImages = async () => {
    const urls = [];
    for (const file of images) {
      const fileRef = storageRef(storage, `forum/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      urls.push(url);
    }
    return urls;
  };

  // Submit post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Content cannot be empty.");
      return;
    }
    setUploading(true);

    // Get username from users node
    const usersSnap = await get(ref(db, "users"));
    let username = user.email;
    let profilePhoto =
      "https://us-tuna-sounds-images.voicemod.net/05e1f76c-d7a6-4bcc-b33d-95d6a66dd02a-1683971589675.png";
    if (usersSnap.exists()) {
      const users = Object.values(usersSnap.val());
      const found = users.find((u) => u.email === user.email);
      if (found) {
        username = found.username || user.email;
        profilePhoto = found.profilePhoto || profilePhoto;
      }
    }

    let imageUrls = [];
    if (images.length > 0) {
      imageUrls = await uploadImages();
    }

    const postsRef = ref(db, "posts/");
    const newPostRef = push(postsRef);

    await set(newPostRef, {
      user: username,
      email: user.email,
      title: title ? title : "No title",
      content,
      category,
      date: Date.now(),
      upvoter: [],
      profilePhoto,
      imageURL: imageUrls,
    });

    setUploading(false);
    navigate("/forum");
  };

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h2>Create Post</h2>
      </div>
      <form className="forum-create-form" onSubmit={handleSubmit}>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORY_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </label>
        <label>
          Content
          <textarea
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            maxLength={2000}
          />
        </label>
        <label>
          Attach Images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </label>
        <div className="forum-image-preview">
          {images.length > 0 &&
            Array.from(images).map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt="preview"
                className="forum-thumb"
                style={{ maxWidth: 120, marginRight: 10, marginBottom: 10 }}
              />
            ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
          <button
            type="submit"
            className="forum-btn"
            disabled={uploading}
            style={{ minWidth: 120 }}
          >
            {uploading ? "Posting..." : "Submit"}
          </button>
          <button
            type="button"
            className="forum-btn-outline"
            onClick={() => navigate("/forum")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}