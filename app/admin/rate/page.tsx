"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import type { RateHistoryEntry } from "@/lib/types";

export default function AdminRatePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [rate, setRate] = useState<number>(100);
  const [history, setHistory] = useState<RateHistoryEntry[]>([]);
  const [newRate, setNewRate] = useState<number>(100);

  useEffect(() => {
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchRate();
  }, [token]);

  const fetchRate = async () => {
    const res = await fetch("/api/admin/rate", {
      headers: { "x-admin-token": token! },
    });
    const data = await res.json();
    setRate(data.rate);
    setHistory(data.history);
    setNewRate(data.rate);
  };

  const updateRate = async () => {
    if (!newRate || newRate <= 0) return;
    await fetch("/api/admin/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token!,
      },
      body: JSON.stringify({ rate: newRate }),
    });
    fetchRate();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Exchange Rate</h1>
      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="mb-1">
          Current Rate: <strong>{rate} Naira</strong> = 1 vote
        </p>
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            value={newRate}
            onChange={(e) => setNewRate(Number(e.target.value))}
            className="border rounded px-3 py-2 w-32"
            min="1"
          />
          <button
            onClick={updateRate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update Rate
          </button>
        </div>
      </div>

      <h2 className="font-semibold mb-2">Rate History</h2>
      <div className="space-y-2">
        {history.map((h, idx) => (
          <div key={idx} className="bg-white p-3 rounded shadow text-sm">
            <span className="font-medium">{h.rate} Naira/vote</span> –{" "}
            {new Date(h.timestamp).toLocaleString()}
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-gray-400 text-sm">No history yet.</p>
        )}
      </div>
    </div>
  );
}
