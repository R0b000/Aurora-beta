import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineUser, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const API_BASE = import.meta.env.VITE_BASE_URL || "http://localhost:8001/api";

interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  body: string;
  createdAt: string;
}

const ProductReviewSection = () => {
  const { id: productId } = useParams<{ id: string }>();
  const { loggedInUser } = useAppContext();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const token = localStorage.getItem("actualToken");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}products/${productId}/review`);
      const data = await res.json();
      const list = data.reviews || data.data || data || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return toast.error("Write something!");

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}products/${productId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: reviewText.trim(), rating: 5 }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Review added!");
        setReviewText("");
        fetchReviews(); // refresh list
      } else {
        toast.error(result.message || "Failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }

    navigate('?review=success')
  };

  const startEdit = (review: Review) => {
    setEditingId(review._id);
    setEditText(review.body);
  };

  const saveEdit = async (reviewId: string) => {
    if (!editText.trim()) return toast.error("Review cannot be empty");

    try {
      const res = await fetch(
        `${API_BASE}products/${productId}/review/${reviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: editText.trim() }),
        }
      );

      if (res.ok) {
        toast.success("Review updated!");
        setEditingId(null);
        fetchReviews();
      } else {
        const err = await res.json();
        toast.error(err.message || "Update failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;

    try {
      const res = await fetch(
        `${API_BASE}products/${productId}/review/${reviewId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Review deleted");
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-base ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );

  const isOwnReview = (reviewUserId: string) =>
    loggedInUser?._id === reviewUserId;

  if (loading)
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Loading reviews...
      </div>
    );

  return (
    <div className="w-full">
      <Toaster position="top-center" />

      <h2 className="text-sm font-bold mb-8 text-gray-900">
        Customer Reviews ({reviews.length})
      </h2>

      {loggedInUser ? (
        <div className="mb-5 bg-gray-50 rounded-md">
          <h3 className="text-sm font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm resize-none"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-70"
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mb-12 text-center py-10 bg-blue-50 rounded-xl">
          <p className="text-blue-800">
            Please{" "}
            <a href="/auth/login" className="underline font-bold">
              log in
            </a>{" "}
            to write a review
          </p>
        </div>
      )}

      <span className="flex w-full border-t grow border-gray-400"></span>

      <div className="space-y-5 p-5">
        {reviews.length === 0 ? (
          <p className="text-center p-2 py-5 text-gray-500">
            No reviews yet. Be the first!
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="flex gap-5 border-b last:border-b-0 p-3"
            >
              <div className="shrink-0">
                {review.user?.avatar ? (
                  <img
                    src={review.user.avatar}
                    alt={review.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <AiOutlineUser className="text-base text-gray-500" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-base">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {isOwnReview(review.user._id) && (
                    <div className="flex gap-3 text-gray-600">
                      <button
                        onClick={() => startEdit(review)}
                        className="hover:text-blue-600 transition cursor-pointer"
                        title="Edit"
                      >
                        <AiOutlineEdit className="text-base" />
                      </button>
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="hover:text-red-600 transition cursor-pointer"
                        title="Delete"
                      >
                        <AiOutlineDelete className="text-base" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 my-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-600">
                    {review.rating}.0
                  </span>
                </div>

                {editingId === review._id ? (
                  <div className="mt-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                      rows={3}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(review._id)}
                        className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                    {review.body}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviewSection;