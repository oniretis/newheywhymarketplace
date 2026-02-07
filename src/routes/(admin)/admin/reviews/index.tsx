import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import AdminReviewsTemplate from "@/components/templates/admin/admin-reviews-template";
import { getReviews, updateReviewStatus } from "@/lib/functions/reviews";
import type { Review } from "@/types/review";

export const Route = createFileRoute("/(admin)/admin/reviews/")({
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await getReviews();
        setReviews(reviewsData);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleReviewStatusChange = async (
    reviewId: string,
    newStatus: "published" | "pending" | "rejected"
  ) => {
    const success = await updateReviewStatus(reviewId, newStatus);
    if (success) {
      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, status: newStatus } : review
        )
      );
    } else {
      console.error("Failed to update review status");
    }
  };

  if (loading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  return (
    <AdminReviewsTemplate
      reviews={reviews}
      onReviewStatusChange={handleReviewStatusChange}
    />
  );
}
