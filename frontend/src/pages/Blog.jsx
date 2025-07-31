import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  User,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  Eye,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import CreatePostForm from "../components/CreatePostForm";
import axiosInstance from "../api/axios";
// Mock API calls for demo - replace with your actual API
const mockApi = {
  get: async (url) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (url === "/blog/posts") {
      return {
        data: [
          {
            _id: "1",
            title: "Understanding Your Menstrual Cycle: A Complete Guide",
            excerpt:
              "Learn about the four phases of your menstrual cycle and how to track them effectively for better health management.",
            content:
              "Your menstrual cycle is a complex process that involves hormonal changes throughout the month. Understanding these changes can help you better manage your health and wellbeing.\n\nThe menstrual cycle consists of four main phases:\n\n1. Menstrual Phase (Days 1-5): This is when menstruation occurs. The lining of the uterus sheds, resulting in menstrual bleeding.\n\n2. Follicular Phase (Days 1-13): During this phase, follicles in your ovaries mature and prepare to release an egg.\n\n3. Ovulation Phase (Around Day 14): This is when a mature egg is released from the ovary, making conception possible.\n\n4. Luteal Phase (Days 15-28): After ovulation, the uterine lining thickens to prepare for a potential pregnancy.\n\nTracking your cycle can help you understand your body better and identify any irregularities that might need medical attention.",
            category: "menstruation",
            tags: ["cycle", "health", "tracking", "hormones"],
            author: { name: "Dr. Sarah Johnson" },
            createdAt: "2024-01-15T10:00:00Z",
            likes: 24,
            views: 156,
            isLiked: false,
            image:
              "https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&h=400&fit=crop",
          },
          {
            _id: "2",
            title: "Nutrition for Menstrual Health: Foods That Help",
            excerpt:
              "Discover which foods can help reduce period symptoms and support your overall menstrual health.",
            content:
              "What you eat can significantly impact your menstrual health and the severity of your symptoms. Here are some key nutrients and foods that can help:\n\nIron-Rich Foods:\n- Lean meats, fish, and poultry\n- Leafy green vegetables like spinach\n- Legumes and beans\n- Fortified cereals\n\nMagnesium Sources:\n- Dark chocolate (in moderation)\n- Nuts and seeds\n- Whole grains\n- Avocados\n\nOmega-3 Fatty Acids:\n- Fatty fish like salmon and sardines\n- Walnuts and flaxseeds\n- Chia seeds\n\nCalcium-Rich Foods:\n- Dairy products\n- Leafy greens\n- Fortified plant-based milks\n- Tofu\n\nThese nutrients can help reduce inflammation, support hormone balance, and minimize period-related discomfort.",
            category: "nutrition",
            tags: ["nutrition", "diet", "period", "wellness"],
            author: { name: "Nutritionist Emma Wilson" },
            createdAt: "2024-01-12T14:30:00Z",
            likes: 31,
            views: 203,
            isLiked: true,
            image:
              "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
          },
          {
            _id: "3",
            title: "Managing Period Pain: Natural Remedies That Work",
            excerpt:
              "Explore effective natural methods to reduce menstrual cramps and discomfort without relying solely on medication.",
            content:
              "Period pain affects many women, but there are several natural remedies that can provide relief:\n\nHeat Therapy:\n- Use a heating pad on your lower abdomen\n- Take warm baths\n- Try heat patches for on-the-go relief\n\nGentle Exercise:\n- Light yoga poses\n- Walking or swimming\n- Stretching exercises\n\nHerbal Remedies:\n- Ginger tea for anti-inflammatory effects\n- Chamomile tea for relaxation\n- Turmeric for pain relief\n\nMindfulness and Relaxation:\n- Deep breathing exercises\n- Meditation\n- Progressive muscle relaxation\n\nDietary Changes:\n- Reduce caffeine and sugar\n- Increase water intake\n- Eat anti-inflammatory foods\n\nRemember, severe pain that interferes with daily activities should be discussed with a healthcare provider.",
            category: "health",
            tags: ["pain relief", "natural remedies", "cramps", "wellness"],
            author: { name: "Dr. Lisa Chen" },
            createdAt: "2024-01-10T09:15:00Z",
            likes: 18,
            views: 127,
            isLiked: false,
            image:
              "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
          },
          {
            _id: "4",
            title: "Exercise During Your Period: What You Need to Know",
            excerpt:
              "Learn how to maintain your fitness routine throughout your menstrual cycle with the right approach.",
            content:
              "Exercise during menstruation can actually help reduce symptoms and improve your overall wellbeing. Here's what you need to know:\n\nBenefits of Exercise During Your Period:\n- Releases endorphins that act as natural pain relievers\n- Reduces bloating and water retention\n- Improves mood and energy levels\n- Helps with better sleep\n\nBest Types of Exercise:\n- Low-impact cardio like walking or swimming\n- Gentle yoga and stretching\n- Light strength training\n- Dancing or recreational activities\n\nWhat to Avoid:\n- High-intensity workouts if you're feeling very fatigued\n- Exercises that cause discomfort\n- Overly strenuous activities on heavy flow days\n\nTips for Success:\n- Listen to your body\n- Stay hydrated\n- Use appropriate menstrual products\n- Wear comfortable, supportive clothing\n- Start slowly and build up intensity\n\nRemember, every woman's experience is different, so find what works best for you.",
            category: "lifestyle",
            tags: ["exercise", "fitness", "period", "wellness"],
            author: { name: "Fitness Coach Maria Rodriguez" },
            createdAt: "2024-01-08T16:45:00Z",
            likes: 22,
            views: 189,
            isLiked: false,
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
          },
          {
            _id: "5",
            title: "Fertility Awareness: Understanding Your Body's Signals",
            excerpt:
              "Learn to recognize the signs your body gives you about fertility and ovulation throughout your cycle.",
            content:
              "Fertility awareness involves understanding and recognizing the signs that indicate your fertile window. Here's what to look for:\n\nCervical Mucus Changes:\n- Dry or minimal mucus after menstruation\n- Creamy, white mucus as estrogen rises\n- Clear, stretchy 'egg white' mucus during ovulation\n- Thick, sticky mucus after ovulation\n\nBasal Body Temperature:\n- Slightly lower temperature before ovulation\n- Temperature rise of 0.2-0.5°F after ovulation\n- Temperature remains elevated until next period\n\nCervical Position Changes:\n- Lower, firm, and closed after menstruation\n- Higher, softer, and more open during fertility\n- Returns to lower position after ovulation\n\nOther Signs:\n- Mild pelvic pain during ovulation (mittelschmerz)\n- Increased libido\n- Breast tenderness\n- Light spotting\n\nTracking these signs can help with family planning, whether you're trying to conceive or avoid pregnancy naturally. Always consult with a healthcare provider for personalized advice.",
            category: "fertility",
            tags: [
              "fertility",
              "ovulation",
              "tracking",
              "natural family planning",
            ],
            author: { name: "Dr. Rachel Thompson" },
            createdAt: "2024-01-05T11:20:00Z",
            likes: 27,
            views: 168,
            isLiked: true,
            image:
              "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
          },
        ],
      };
    }

    if (url === "/blog/categories") {
      return {
        data: [
          "menstruation",
          "nutrition",
          "health",
          "lifestyle",
          "fertility",
          "wellness",
        ],
      };
    }

    if (url === "/blog/saved") {
      return {
        data: [{ postId: "2" }, { postId: "5" }],
      };
    }

    return { data: [] };
  },

  post: async (url, data) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (url.includes("/like")) {
      return {
        data: {
          likes: Math.floor(Math.random() * 50) + 10,
          isLiked: !data?.isLiked,
        },
      };
    }

    if (url.includes("/saved/")) {
      return { data: { success: true } };
    }

    if (url === "/blog/posts") {
      return {
        data: {
          _id: Date.now().toString(),
          ...data,
          author: { name: "Admin User" },
          createdAt: new Date().toISOString(),
          likes: 0,
          views: 0,
          isLiked: false,
        },
      };
    }

    return { data: { success: true } };
  },

  delete: async (url) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { data: { success: true } };
  },
};

// Toast notification replacement
const showToast = (message, type = "success") => {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transform transition-all duration-300 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500"
  }`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    image: "",
  });
  const [currentTag, setCurrentTag] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchSavedPosts();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
    setIsAdmin(userDetails.email === "icyeza12@gmail.com");
  };

  const fetchPosts = async () => {
    try {
      const response = await axiosInstance.get("/blog/posts");
      setUser(JSON.parse(localStorage.getItem("userDetails") || "{}"));
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      showToast("Failed to load blog posts", "error");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/blog/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await axiosInstance.get("/blog/saved");
      setSavedPosts(response.data.map((item) => item.postId));
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      const isSaved = savedPosts.includes(postId);

      if (isSaved) {
        await axiosInstance.delete(`/blog/saved/${postId}`);
        setSavedPosts((prev) => prev.filter((id) => id !== postId));
        showToast("Post removed from saved");
      } else {
        await axiosInstance.post(`/blog/saved/${postId}`);
        setSavedPosts((prev) => [...prev, postId]);
        showToast("Post saved successfully");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      showToast("Failed to save post", "error");
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axiosInstance.post(`/blog/posts/${postId}/like`);
      fetchPosts();
      // setPosts((prev) =>
      //   prev.map((post) =>
      //     post._id === postId
      //       ? {
      //           ...post,
      //           likes: response.data.likes.length,
      //           isLiked: response.data.isLiked,
      //         }
      //       : post
      //   )
      // );
    } catch (error) {
      console.error("Error liking post:", error);
      showToast("Failed to like post", "error");
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!newPost.title || !newPost.content || !newPost.category) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      const response = await axiosInstance.post("/blog/posts", newPost);
      setPosts((prev) => [response.data, ...prev]);
      setShowCreateModal(false);
      setNewPost({
        title: "",
        content: "",
        excerpt: "",
        category: "",
        tags: [],
        image: "",
      });
      showToast("Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
      showToast("Failed to create post", "error");
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axiosInstance.delete(`/blog/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      showToast("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("Failed to delete post", "error");
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !newPost.tags.includes(currentTag.trim())) {
      setNewPost((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const filteredPosts =
    posts.posts &&
    posts.posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      health: "from-green-500 to-emerald-500",
      nutrition: "from-orange-500 to-amber-500",
      wellness: "from-purple-500 to-violet-500",
      lifestyle: "from-blue-500 to-cyan-500",
      menstruation: "from-pink-500 to-rose-500",
      fertility: "from-teal-500 to-green-500",
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-pink-800/30"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#f50561]/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            HerCycle <span className="text-pink-300">Blog</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Empowering women with knowledge about menstrual health, wellness,
            and lifestyle tips
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/60 focus:ring-2 focus:ring-[#f50561] focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white focus:ring-2 focus:ring-[#f50561] focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
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
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 pointer-events-none" />
                </div>

                {/* Create Post Button (Admin Only) */}
                {isAdmin && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-[#f50561] to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-[#d4044f] hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Post
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post._id} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
                {/* Post Image */}
                {post.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Category Badge */}
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(
                      post.category
                    )} mb-3`}
                  >
                    {post.category.charAt(0).toUpperCase() +
                      post.category.slice(1)}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-bold text-white mb-2 line-clamp-2 cursor-pointer hover:text-pink-300 transition-colors"
                    onClick={() => {
                      setSelectedPost(post);
                      setShowModal(true);
                    }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-white/80 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80"
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-white/60 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author?.name || "HerCycle Team"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center gap-1 transition-colors ${
                          post.likes.some(
                            (like) =>
                              like.user && like.user.toString() === user.id
                          )
                            ? "text-pink-400"
                            : "text-white/60 hover:text-pink-400"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            post.likes.some(
                              (like) =>
                                like.user && like.user.toString() === user.id
                            )
                              ? "fill-current"
                              : ""
                          }`}
                        />
                        <span className="text-sm">
                          {post.likes.length || 0}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 text-white/60">
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">{post.views || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSavePost(post._id)}
                        className="p-2 text-white/60 hover:text-yellow-400 transition-colors"
                      >
                        {savedPosts.includes(post._id) ? (
                          <BookmarkCheck className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-2 text-white/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg mb-4">No articles found</div>
            <p className="text-white/40">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative max-w-4xl w-full my-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f50561] to-pink-500 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white/10 backdrop-blur-xl p-6 border-b border-white/20 flex items-center justify-between">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getCategoryColor(
                    selectedPost.category
                  )}`}
                >
                  {selectedPost.category.charAt(0).toUpperCase() +
                    selectedPost.category.slice(1)}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Image */}
                {selectedPost.image && (
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />
                )}

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-4">
                  {selectedPost.title}
                </h1>

                {/* Meta */}
                <div className="flex items-center gap-4 text-white/60 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{selectedPost.author?.name || "HerCycle Team"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedPost.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {Math.ceil(selectedPost.content.length / 200)} min read
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(selectedPost._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        selectedPost.likes.some(
                          (like) =>
                            like.user && like.user.toString() === user.id
                        )
                          ? "bg-pink-500/20 text-pink-400"
                          : "bg-white/10 text-white/60 hover:bg-pink-500/20 hover:text-pink-400"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          selectedPost.likes.some(
                            (like) =>
                              like.user && like.user.toString() === user.id
                          )
                            ? "fill-current"
                            : ""
                        }`}
                      />
                      <span>{selectedPost.likes.length || 0}</span>
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/60">
                      <Eye className="w-5 h-5" />
                      <span>{selectedPost.views || 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSavePost(selectedPost._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      savedPosts.includes(selectedPost._id)
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-white/10 text-white/60 hover:bg-yellow-500/20 hover:text-yellow-400"
                    }`}
                  >
                    {savedPosts.includes(selectedPost._id) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                    <span>
                      {savedPosts.includes(selectedPost._id) ? "Saved" : "Save"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal (Admin Only) */}
      {showCreateModal && isAdmin && (
        <CreatePostForm
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          isAdmin={isAdmin}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Blog;
