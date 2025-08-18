'use client';

import { useEffect, useMemo, useState } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaEdit, FaTrashAlt, FaUserCircle } from 'react-icons/fa';

type Review = {
    id: string;
    user_id: string;
    rating: number;
    text: string | null;
    is_anonymous: boolean;
    created_at: string;
    updated_at: string | null;
    users?: { display_name?: string | null; avatar_url?: string | null } | null;
    upvotes: number;
    downvotes: number;
    score: number;
    user_vote: boolean | null;
    is_owner: boolean;
};

export default function ReviewsSection({
    courseTextbookId,
    currentUserId,
}: {
    courseTextbookId: string;
    currentUserId: string | null;
}) {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [error, setError] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [draft, setDraft] = useState<{ id?: string; rating: number; text: string; is_anonymous: boolean }>({
        rating: 5,
        text: '',
        is_anonymous: false,
    });
    const [submitting, setSubmitting] = useState(false);

    const myReview = useMemo(
        () => reviews.find((r) => r.user_id === currentUserId) ?? null,
        [reviews, currentUserId]
    );

    async function load() {
        try {
            setLoading(true);
            const res = await fetch(`/api/reviews/by-ctid/${courseTextbookId}`, { cache: 'no-store' });
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || 'Failed to load reviews');
            setReviews(j.reviews);
            setError('');
        } catch (e: any) {
            setError(e.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [courseTextbookId]);
    function openCreateModal() {
        if (!currentUserId) {
            setError('You must be logged in to post a review.');
            return;
        }
        if (myReview) {
            setError('You already posted a review for this textbook.');
            return;
        }
        setModalMode('create');
        setDraft({ rating: 5, text: '', is_anonymous: false });
        setIsModalOpen(true);
    }

    function openEditModal() {
        if (!currentUserId || !myReview) return;
        setModalMode('edit');
        setDraft({
            id: myReview.id,
            rating: myReview.rating,
            text: myReview.text ?? '',
            is_anonymous: myReview.is_anonymous,
        });
        setIsModalOpen(true);
    }

    async function submitModal() {
        if (!currentUserId) {
            setError('You must be logged in.');
            return;
        }
        setSubmitting(true);
        try {
            let res: Response;
            if (modalMode === 'edit' && draft.id) {
                res = await fetch(`/api/reviews/${draft.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rating: draft.rating,
                        text: draft.text,
                        is_anonymous: draft.is_anonymous,
                    }),
                });
            } else {
                res = await fetch(`/api/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        course_textbook_id: courseTextbookId,
                        rating: draft.rating,
                        text: draft.text,
                        is_anonymous: draft.is_anonymous,
                    }),
                });
            }
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || 'Failed to submit review');
            setIsModalOpen(false);
            await load();
        } catch (e: any) {
            setError(e.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    }

    async function deleteMyReview() {
        if (!myReview) return;
        if (!confirm('Delete your review?')) return;
        try {
            const res = await fetch(`/api/reviews/${myReview.id}`, { method: 'DELETE' });
            const j = await res.json();
            if (!res.ok) throw new Error(j.error || 'Failed to delete review');
            await load();
        } catch (e: any) {
            setError(e.message || 'Failed to delete review');
        }
    }

    async function vote(reviewId: string, is_upvote: boolean) {
        if (!currentUserId) {
            setError('You must be logged in to vote.');
            return;
        }
        try {
            const res = await fetch(`/api/reviews/${reviewId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_upvote }),
            });
            let payload: any = null;
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                try {
                    payload = await res.json();
                } catch {
                }
            }
            if (!payload) {
                const txt = await res.text();
                if (txt) {
                    try {
                        payload = JSON.parse(txt);
                    } catch {
                        payload = null;
                    }
                }
            }

            if (!res.ok) {
                throw new Error(payload?.error || `Voting failed (${res.status})`);
            }
            if (!payload) {
                await load();
                return;
            }

            setReviews((prev) =>
                prev.map((r) =>
                    r.id === reviewId
                        ? {
                            ...r,
                            upvotes: payload.upvotes ?? r.upvotes,
                            downvotes: payload.downvotes ?? r.downvotes,
                            score: (payload.upvotes ?? r.upvotes) - (payload.downvotes ?? r.downvotes),
                            user_vote: payload.user_vote ?? r.user_vote,
                        }
                        : r
                )
            );
        } catch (e: any) {
            setError(e.message || 'Voting failed');
        }
    }

    return (
        <section className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Reviews</h2>

            {error && <p className="text-red-600 mb-3">{error}</p>}
            {loading && <p className="text-gray-500">Loading…</p>}
            {currentUserId && myReview && (
                <section className="bg-gray-100 rounded-lg p-5 shadow-sm hover:shadow-md transition mb-8">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            {!myReview.is_anonymous && myReview.users?.avatar_url ? (
                                <img
                                    src={myReview.users.avatar_url}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <FaUserCircle size={30} className="text-gray-500" />
                            )}

                            <div className="text-sm">
                                <p className="font-semibold text-gray-800">
                                    {myReview.is_anonymous ? 'You (anonymous)' : 'You'}
                                </p>
                                <p className="text-gray-500 text-xs">
                                    {new Date(myReview.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm transition"
                                onClick={openEditModal}
                            >
                                <FaEdit size={18} />
                                <span>Edit</span>
                            </button>
                            <button
                                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-white bg-red-500 hover:bg-red-600 text-sm transition"
                                onClick={deleteMyReview}
                            >
                                <FaTrashAlt size={18} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                                key={i}
                                size={22}
                                className={i < myReview.rating ? 'text-yellow-500' : 'text-gray-300'}
                            />
                        ))}
                        <span className="ml-3 text-lg font-semibold text-gray-800">
                            {myReview.rating}/5
                        </span>
                    </div>

                    {myReview.text && <p className="text-gray-700 leading-relaxed">{myReview.text}</p>}
                </section>
            )}
            {currentUserId && !myReview && (
                <div className="mb-8">
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Write a review
                    </button>
                </div>
            )}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">
                        {currentUserId ? 'No reviews yet. Be the first to leave one!' : 'No reviews yet.'}
                    </p>
                ) : (
                    reviews
                        .filter((r) => !(currentUserId && r.user_id === currentUserId))
                        .map((review) => (
                            <div key={review.id} className="bg-gray-100 rounded-lg p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {!review.is_anonymous && review.users?.avatar_url ? (
                                            <img
                                                src={review.users.avatar_url}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <FaUserCircle size={30} className="text-gray-500" />
                                        )}

                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-800">
                                                {review.is_anonymous
                                                    ? 'Anonymous'
                                                    : review.users?.display_name || 'Unknown User'}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {new Date(review.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 mb-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <FaStar
                                            key={i}
                                            size={22}
                                            className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                                        />
                                    ))}
                                    <span className="ml-3 text-lg font-semibold text-gray-800">
                                        {review.rating}/5
                                    </span>
                                </div>

                                {review.text && (
                                    <p className="text-gray-700 leading-relaxed mb-4">{review.text}</p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-gray-700">
                                    <button
                                        className={`flex items-center gap-1 hover:text-green-700 ${review.user_vote === true ? 'font-semibold' : ''
                                            }`}
                                        onClick={() => vote(review.id, true)}
                                    >
                                        <FaThumbsUp size={14} />
                                        <span>{review.upvotes}</span>
                                    </button>
                                    <button
                                        className={`flex items-center gap-1 hover:text-red-700 ${review.user_vote === false ? 'font-semibold' : ''
                                            }`}
                                        onClick={() => vote(review.id, false)}
                                    >
                                        <FaThumbsDown size={14} />
                                        <span>{review.downvotes}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </div>

            {/* Modal for create/edit */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">
                            {modalMode === 'edit' ? 'Edit your review' : 'Write a review'}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm">Rating:</span>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setDraft((d) => ({ ...d, rating: i + 1 }))}
                                    className="p-1"
                                    aria-label={`Rate ${i + 1}`}
                                >
                                    <FaStar className={i < draft.rating ? 'text-yellow-500' : 'text-gray-300'} />
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full border rounded-md p-2 text-sm mb-3"
                            rows={4}
                            placeholder="Share your experience…"
                            value={draft.text}
                            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                        />

                        <label className="inline-flex items-center gap-2 text-sm mb-4">
                            <input
                                type="checkbox"
                                checked={draft.is_anonymous}
                                onChange={(e) => setDraft((d) => ({ ...d, is_anonymous: e.target.checked }))}
                            />
                            Post as anonymous
                        </label>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitModal}
                                disabled={submitting}
                                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {modalMode === 'edit' ? 'Save changes' : 'Post review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
