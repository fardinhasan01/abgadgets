// File: pages/categories.tsx

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path as needed for your project
import type { NextPage } from "next";

// Types
type Category = string;
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
};

// Price range filter options
const priceRanges = [
  { label: "All", value: "all" },
  { label: "Under $50", value: "under50" },
  { label: "$50 - $200", value: "50-200" },
  { label: "$200 - $1000", value: "200-1000" },
  { label: "Above $1000", value: "above1000" },
];

// Helper to check if a product matches the selected price range
const matchesPriceRange = (price: number, range: string) => {
  switch (range) {
    case "under50":
      return price < 50;
    case "50-200":
      return price >= 50 && price <= 200;
    case "200-1000":
      return price > 200 && price <= 1000;
    case "above1000":
      return price > 1000;
    default:
      return true;
  }
};

const CategoriesPage: NextPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");

  // Fetch categories and products from Firestore
  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const catSnap = await getDocs(collection(db, "categories"));
      const catList: Category[] = catSnap.docs.map((doc) => doc.data().name as string);
      setCategories(catList);

      // Fetch products
      const prodSnap = await getDocs(collection(db, "products"));
      const prodList: Product[] = prodSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Product, "id">),
      }));
      setProducts(prodList);
    };
    fetchData();
  }, []);

  // Filter products based on selected category and price range
  const filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const priceMatch = matchesPriceRange(product.price, selectedPrice);
    return categoryMatch && priceMatch;
  });

  return (
    <main style={{ minHeight: "100vh", background: "#111", color: "#fff", padding: "2rem 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>Product Categories</h1>
        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {/* Category Filter */}
          <label>
            <span style={{ marginRight: 8 }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ color: "#111", padding: "0.5rem", borderRadius: 8 }}
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          {/* Price Range Filter */}
          <label>
            <span style={{ marginRight: 8 }}>Price:</span>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              style={{ color: "#111", padding: "0.5rem", borderRadius: 8 }}
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {/* Products Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                background: "#18181b",
                borderRadius: 16,
                padding: "1.5rem 1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: 8 }}>{product.name}</div>
              <div style={{ color: "#aaa", fontSize: "0.95rem", marginBottom: 8 }}>{product.category}</div>
              <div style={{ color: "#f87171", fontWeight: 700, fontSize: "1.1rem" }}>
                {product.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#aaa" }}>
              No products found for this filter.
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CategoriesPage;