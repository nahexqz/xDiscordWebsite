"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/api/tickets");
      setTickets(res.data.tickets || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (formData: FormData) => {
    const res = await axios.post("/api/tickets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchTickets();
    return res.data;
  };

  return { tickets, loading, error, refetch: fetchTickets, createTicket };
}
