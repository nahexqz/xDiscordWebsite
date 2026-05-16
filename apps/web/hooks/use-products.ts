"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  image?: string | null;
  roleName: string;
  soldCount: number;
  isFeatured: boolean;
  benefits: string[];
  category?: { name: string; slug: string; emoji?: string | null } | null;
  stock?: number | null;
  duration?: number | null;
}

interface UseProductsOptions {
  search?: string;
  category?: string;
  sort?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/products", {
        params: {
          search: options.search || undefined,
          category: options.category && options.category !== "all" ? options.category : undefined,
          sort: options.sort || "featured",
        },
      });
      setProducts(res.data.products || []);
      setTopSelling(res.data.topSelling || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [options.search, options.category, options.sort]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return { products, topSelling, loading, error, refetch: fetchProducts };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch((err) => setError(err.response?.data?.error || "Failed to fetch product"))
      .finally(() => setLoading(false));
  }, [id]);

  return { product, loading, error };
}
