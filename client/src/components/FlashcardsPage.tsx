/**
 * Page to view and manage all flashcards
 */

import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  topic: string;
  createdAt: string;
}

interface FlashcardsPageProps {
  onBack: () => void;
}

export function FlashcardsPage({ onBack }: FlashcardsPageProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/flashcards`);
      if (!response.ok) throw new Error("Failed to fetch flashcards");
      const data = await response.json();
      setFlashcards(data.flashcards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    try {
      setDeleting(id);
      const response = await fetch(`${API_BASE_URL}/flashcards/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete flashcard");
      setFlashcards((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <button
          onClick={onBack}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>Flashcards</h1>
        <span style={{ color: "#888" }}>({flashcards.length} total)</span>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "#f66" }}>Error: {error}</p>}

      {!loading && !error && flashcards.length === 0 && (
        <p style={{ color: "#888" }}>No flashcards yet. Start learning to create some!</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {flashcards.map((card) => (
          <div
            key={card._id}
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ color: "#888", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                {card.topic}
              </div>
              <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{card.question}</div>
              <div style={{ color: "#aaa" }}>{card.answer}</div>
            </div>
            <button
              onClick={() => handleDelete(card._id)}
              disabled={deleting === card._id}
              style={{
                padding: "0.5rem 0.75rem",
                backgroundColor: deleting === card._id ? "#666" : "#c44",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: deleting === card._id ? "not-allowed" : "pointer",
                flexShrink: 0,
              }}
            >
              {deleting === card._id ? "..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
