import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  Filter,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { fetchProducts } from "../api/requests";

const PeriodProductsShop = () => {
  const [cartItems, setCartItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState(new Set());
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await fetchProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    getProducts();
  }, []);

  // const products = [
  //   // Sanitary Pads
  //   {
  //     id: 1,
  //     name: "Always Ultra Thin Pads",
  //     price: "11,650 RWF",
  //     category: "pads",
  //     rating: 4.5,
  //     image:
  //       "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=100&h=100&fit=crop&crop=center",
  //     description: "Super absorbent with wings",
  //   },
  //   {
  //     id: 2,
  //     name: "Kotex Overnight Pads",
  //     price: "16,180 RWF",
  //     category: "pads",
  //     rating: 4.7,
  //     image:
  //       "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop&crop=center",
  //     description: "Extra protection for heavy flow",
  //   },
  //   {
  //     id: 3,
  //     name: "Organic Cotton Pads",
  //     price: "20,710 RWF",
  //     category: "pads",
  //     rating: 4.8,
  //     image:
  //       "https://images.unsplash.com/photo-1594824694286-c1d5e7b8a2f5?w=100&h=100&fit=crop&crop=center",
  //     description: "Chemical-free & breathable",
  //   },

  //   // Tampons
  //   {
  //     id: 4,
  //     name: "Tampax Pearl Tampons",
  //     price: "12,940 RWF",
  //     category: "tampons",
  //     rating: 4.6,
  //     image:
  //       "https://images.unsplash.com/photo-1605221907161-1b8c4b03f7b2?w=100&h=100&fit=crop&crop=center",
  //     description: "Smooth insertion & removal",
  //   },
  //   {
  //     id: 5,
  //     name: "Playtex Sport Tampons",
  //     price: "15,530 RWF",
  //     category: "tampons",
  //     rating: 4.4,
  //     image:
  //       "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=100&h=100&fit=crop&crop=center",
  //     description: "Perfect for active lifestyles",
  //   },
  //   {
  //     id: 6,
  //     name: "Organic Tampons",
  //     price: "18,110 RWF",
  //     category: "tampons",
  //     rating: 4.7,
  //     image:
  //       "https://images.unsplash.com/photo-1605221907161-1b8c4b03f7b2?w=100&h=100&fit=crop&crop=center",
  //     description: "100% organic cotton",
  //   },

  //   // Menstrual Cups
  //   {
  //     id: 7,
  //     name: "DivaCup Model 1",
  //     price: "51,800 RWF",
  //     category: "cups",
  //     rating: 4.9,
  //     image:
  //       "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=100&h=100&fit=crop&crop=center",
  //     description: "Eco-friendly & reusable",
  //   },
  //   {
  //     id: 8,
  //     name: "Saalt Menstrual Cup",
  //     price: "38,860 RWF",
  //     category: "cups",
  //     rating: 4.8,
  //     image:
  //       "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=100&h=100&fit=crop&crop=center",
  //     description: "Soft & comfortable fit",
  //   },
  //   {
  //     id: 9,
  //     name: "Lunette Cup",
  //     price: "45,330 RWF",
  //     category: "cups",
  //     rating: 4.7,
  //     image:
  //       "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop&crop=center",
  //     description: "Finnish design & quality",
  //   },

  //   // Condoms
  //   {
  //     id: 10,
  //     name: "Trojan Ultra Thin",
  //     price: "16,820 RWF",
  //     category: "condoms",
  //     rating: 4.3,
  //     image:
  //       "https://images.unsplash.com/photo-1594824694286-c1d5e7b8a2f5?w=100&h=100&fit=crop&crop=center",
  //     description: "Enhanced sensitivity",
  //   },
  //   {
  //     id: 11,
  //     name: "Durex Extra Safe",
  //     price: "19,410 RWF",
  //     category: "condoms",
  //     rating: 4.5,
  //     image:
  //       "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=100&h=100&fit=crop&crop=center",
  //     description: "Extra strength & lubrication",
  //   },
  //   {
  //     id: 12,
  //     name: "Lifestyles Skyn",
  //     price: "18,110 RWF",
  //     category: "condoms",
  //     rating: 4.6,
  //     image:
  //       "https://images.unsplash.com/photo-1605221907161-1b8c4b03f7b2?w=100&h=100&fit=crop&crop=center",
  //     description: "Non-latex premium",
  //   },
  // ];

  const categories = [
    {
      id: "all",
      name: "All Products",
      icon: "🛍️",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "SANITARY PADS",
      name: "Sanitary Pads",
      icon: "🩸",
      color: "from-pink-500 to-red-500",
    },
    {
      id: "PAIN KILLERS",
      name: "Pain Killers",
      icon: "💊",
      color: "from-red-400 to-purple-600",
    },
    {
      id: "CONDOMS",
      name: "Condoms",
      icon: "🛡️",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "OTHER CONTRACEPTIVES",
      name: "Other Contraceptives",
      icon: "🧬",
      color: "from-blue-500 to-indigo-500",
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const productCategory = product.notes.split(" | ")[0];
    const matchesCategory =
      selectedCategory === "all" || productCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (productId) => {
    setCartItems((prev) => prev + 1);
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50"
        />
      );
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  const goToShop = (product) => {
    window.open(product.notes.split("|")[1].trim(), "_blank");
  };

  return (
    <div className="min-h-screen  relative overflow-hidden pt-10 px-10 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-pink-800/30"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#f50561]/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Sparkle Animation */}
        <div className="absolute top-1/4 left-1/4 text-white/20 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute top-3/4 right-1/4 text-white/20 animate-pulse delay-700">
          <Moon className="w-8 h-8" />
        </div>
        <div className="absolute top-1/3 right-1/3 text-white/20 animate-pulse delay-300">
          <Sun className="w-5 h-5" />
        </div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 md:mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              Period Care Shop
            </h1>
            <p className="text-gray-200/80 text-sm md:text-base">
              Everything you need for your cycle care
            </p>
          </div>

          {/* Cart Icon */}
          {/* <div className="relative">
            <button className="bg-white shadow-md rounded-full p-3 text-purple-700 hover:bg-purple-50 transition-all duration-300 hover:scale-105">
              <ShoppingCart className="w-6 h-6" />
              {cartItems > 0 && (
                <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {cartItems}
                </div>
              )}
            </button>
          </div> */}
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white shadow-sm border border-purple-100 rounded-full py-3 pl-12 pr-6 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-purple-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-10 px-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm md:text-base ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-md`
                  : "bg-white text-purple-700 border border-purple-100 hover:bg-purple-50"
              }`}
            >
              {/* <span className="mr-2">{category.icon}</span> */}
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="
                group 
                bg-white/20 
                backdrop-blur-3xl
                shadow-md shadow-black/10 
                rounded-2xl 
                p-3 md:p-4 
                border border-white/30 
                hover:border-white/50 
                hover:shadow-lg hover:shadow-black/20 
                transition-all duration-500 
                flex flex-col 
                hover:-translate-y-2
                hover:bg-gradient-to-br hover:from-white/40 hover:via-white/30 hover:to-purple-50/20
              "
              >
                {/* Product Image Container */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50/50 via-white/30 to-gray-100/20 rounded-xl md:rounded-2xl mb-3 overflow-hidden border border-white/30">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain p-2 md:p-3 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />

                  {/* Fallback Icon */}
                  <div className="w-full h-full bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-indigo-50/40 rounded-xl hidden items-center justify-center text-3xl md:text-4xl absolute inset-0 backdrop-blur-md">
                    <div className="bg-white/90 rounded-full p-3 md:p-4 shadow-lg shadow-black/5">
                      {product.category === "pads"
                        ? "🩸"
                        : product.category === "tampons"
                        ? "🌸"
                        : product.category === "cups"
                        ? "🌙"
                        : "🛡️"}
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                      favorites.has(product.id)
                        ? "bg-pink-500/90 text-white shadow-lg shadow-pink-500/25"
                        : "bg-white/90 text-gray-400 hover:text-pink-500 hover:bg-white shadow-lg shadow-black/5"
                    }`}
                  >
                    <Heart
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      fill={favorites.has(product.id) ? "currentColor" : "none"}
                    />
                  </button>

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                    <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-semibold text-gray-700 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                      Quick View
                    </div>
                  </div>
                </div>

                {/* Product Content */}
                <div className="flex-1 flex flex-col space-y-2">
                  {/* Product Name */}
                  <h3 className="font-semibold text-white text-sm md:text-base leading-tight line-clamp-2 group-hover:text-purple-700 transition-colors duration-300">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-gray-300 line-clamp-2 flex-1 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating)}
                    <span className="text-xs text-gray-200 ml-1 font-medium">
                      ({product.rating.toFixed(1)})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-base md:text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {product.price} RWF
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => goToShop(product)}
                  className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2.5 md:py-3 px-4 rounded-xl font-medium transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-semibold">Go to Shop</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4 text-purple-200">🔍</div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">
              No products found
            </h3>
            <p className="text-purple-600/70 max-w-md mx-auto">
              Try adjusting your search or filter criteria. We might have what
              you're looking for!
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="mt-4 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 pt-6 border-t border-purple-100 text-center">
        <p className="text-purple-700/70 text-sm">
          💜 Taking care of your cycle, one product at a time
        </p>
        <div className="flex justify-center gap-4 mt-4 text-purple-700/50 text-xs">
          <a href="#" className="hover:text-purple-700">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-purple-700">
            Terms of Service
          </a>
          <a href="#" className="hover:text-purple-700">
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
};

export default PeriodProductsShop;
