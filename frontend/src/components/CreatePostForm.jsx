import { useState } from "react";
import { X } from "lucide-react";
import axiosInstance from "../api/axios";

const CreatePostForm = ({ showCreateModal, setShowCreateModal, isAdmin, onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "menstruation",
    tags: [],
    featured: false,
  });
  const [currentTag, setCurrentTag] = useState("");
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("excerpt", formData.excerpt);
    data.append("category", formData.category);
    data.append("featured", formData.featured);
    data.append("tags", JSON.stringify(formData.tags));
    if (image) {
      data.append("image", image);
    }

    try {
      const res = await axiosInstance.post("/blog/posts", data);
      console.log("Created post:", res.data);
      onPostCreated();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating post:", err.response?.data);
    }
  };

  if (!showCreateModal || !isAdmin) return null;

  const categories = [
    "menstruation",
    "nutrition",
    "pregnancy",
    "health",
    "fitness",
  ]; // Add your actual categories

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="relative max-w-2xl w-full my-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-3xl blur opacity-30"></div>
        <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/10 backdrop-blur-xl p-6 border-b border-white/20 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Create New Post</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
                placeholder="Enter post title..."
                required
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-gray-800"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:ring-2 focus:ring-[#f50561] focus:border-transparent resize-none"
                rows="3"
                placeholder="Brief description of the post..."
                required
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Featured Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:ring-2 focus:ring-[#f50561] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30"
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
                  placeholder="Add tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gradient-to-r from-[#f50561] to-pink-500 text-white rounded-xl hover:from-[#d4044f] hover:to-pink-600 transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 rounded-lg text-sm text-white flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:ring-2 focus:ring-[#f50561] focus:border-transparent resize-none"
                rows="10"
                placeholder="Write your post content here..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featured: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-[#f50561] bg-white/10 border-white/20 rounded focus:ring-[#f50561] focus:ring-2"
                id="featured-checkbox"
              />
              <label
                htmlFor="featured-checkbox"
                className="ml-2 text-sm font-medium text-white/90"
              >
                Featured Post
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#f50561] to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-[#d4044f] hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Create Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
