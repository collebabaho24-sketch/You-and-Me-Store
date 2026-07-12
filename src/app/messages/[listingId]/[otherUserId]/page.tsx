"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
};

type ThreadData = {
  listing: { id: string; title: string };
  otherUser: { id: string; name: string };
  messages: Message[];
};

export default function ConversationPage() {
  const params = useParams<{ listingId: string; otherUserId: string }>();
  const { data: session, status } = useSession();

  const [thread, setThread] = useState<ThreadData | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadThread() {
    const search = new URLSearchParams({
      listingId: params.listingId,
      otherUserId: params.otherUserId,
    });
    const res = await fetch(`/api/messages/thread?${search.toString()}`);
    if (res.ok) {
      setThread(await res.json());
    }
  }

  useEffect(() => {
    if (status !== "authenticated") return;
    loadThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.listingId, params.otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: params.listingId,
        receiverId: params.otherUserId,
        content: reply,
      }),
    });

    setReply("");
    setSending(false);
    loadThread();
  }

  if (status === "unauthenticated") {
    return <p className="text-brand-600">Please log in to view this conversation.</p>;
  }

  if (!thread) {
    return <p className="text-brand-500">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <Link href="/messages" className="text-sm text-brand-500 hover:underline">
          ← Back to messages
        </Link>
      </div>

      <div className="card p-5 mb-4">
        <p className="font-semibold text-brand-800">{thread.otherUser.name}</p>
        <Link href={`/listings/${thread.listing.id}`} className="text-sm text-brand-500 hover:underline">
          re: {thread.listing.title}
        </Link>
      </div>

      <div className="card p-5 flex flex-col gap-3 max-h-[50vh] overflow-y-auto mb-4">
        {thread.messages.map((m) => {
          const isMe = m.senderId === session?.user.id;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                  isMe ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-800"
                }`}
              >
                <p>{m.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-brand-100" : "text-brand-400"}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="input"
          placeholder="Type a message..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button type="submit" disabled={sending} className="btn-primary">
          Send
        </button>
      </form>
    </div>
  );
}
