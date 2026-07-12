"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Conversation = {
  listingId: string;
  listingTitle: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: string;
};

export default function MessagesInboxPage() {
  const { status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      });
  }, [status]);

  if (status === "unauthenticated") {
    return <p className="text-brand-600">Please log in to view your messages.</p>;
  }

  if (status === "loading" || loading) {
    return <p className="text-brand-500">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800 mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-brand-500">
          No conversations yet. Contact a seller from a listing to start one.
        </p>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <Link
              key={`${c.listingId}:${c.otherUserId}`}
              href={`/messages/${c.listingId}/${c.otherUserId}`}
              className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-semibold text-brand-800">{c.otherUserName}</p>
                <p className="text-sm text-brand-500">re: {c.listingTitle}</p>
                <p className="text-sm text-brand-600 mt-1 truncate max-w-md">{c.lastMessage}</p>
              </div>
              <span className="text-xs text-brand-400">
                {new Date(c.lastMessageAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
