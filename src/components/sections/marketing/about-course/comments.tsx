"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Send, ThumbsUp, ThumbsDown } from "lucide-react";
import Avatar from "@/assets/images/avatar.png";
import { AuthRequiredModal } from "@/components/modals/auth-required-modal";

type Comment = {
  id: string;
  author: string;
  avatar: StaticImageData;
  text: string;
  likes: number;
  dislikes: number;
};

type Reaction = "like" | "dislike" | null;

const initialComments: Comment[] = [
  {
    id: "1",
    author: "Xurshid Istamov",
    avatar: Avatar,
    text: "Assalomu aleykum. Jonli efir yaxshi bo'lyapti. Faqat ovoz yaxshi eshitilmayapti!",
    likes: 125,
    dislikes: 3,
  },
];

export function Comments() {
  const [comments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [reactions, setReactions] = useState<Record<string, Reaction>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  // TODO: haqiqiy autentifikatsiya tizimi ulanganda shu bilan almashtiriladi
  const isLoggedIn = false;

  const setReaction = (id: string, type: "like" | "dislike") => {
    setReactions((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setNewComment("");
  };

  const handleInputFocus = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    }
  };

  return (
    <div
      className="w-full rounded-[16px] border-2 bg-white p-8"
      style={{
        borderColor: "#E4E2E2",
        boxShadow: "0px 1px 2px 0px #0000000D",
      }}
    >
      <h2 className="text-xl font-bold text-muted-foreground">
        Muhokamalar soni: {comments.length} ta
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex items-center gap-3 border-b border-[#F1F2F4] pb-4"
      >
        <Image
          src={Avatar}
          alt=""
          className="size-10 shrink-0 rounded-full object-cover"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Fikringizni yozib qoldiring"
          className="w-full text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Yuborish"
          className="shrink-0 text-foreground hover:text-primary"
        >
          <Send className="size-5" />
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-6">
        {comments.map((comment) => {
          const reaction = reactions[comment.id] ?? null;
          const isLiked = reaction === "like";
          const isDisliked = reaction === "dislike";

          return (
            <div key={comment.id} className="flex gap-3">
              <Image
                src={comment.avatar}
                alt=""
                className="size-10 shrink-0 rounded-full object-cover"
              />

              <div className="flex flex-col gap-1">
                <span className="font-bold text-foreground">
                  {comment.author}
                </span>
                <p className="text-base text-muted-foreground">
                  {comment.text}
                </p>

                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setReaction(comment.id, "like")}
                    className={`flex items-center gap-1.5 hover:text-primary ${
                      isLiked ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <ThumbsUp
                      className="size-4"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span className="text-sm">
                      {comment.likes + (isLiked ? 1 : 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReaction(comment.id, "dislike")}
                    className={`flex items-center gap-1.5 hover:text-primary ${
                      isDisliked ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <ThumbsDown
                      className="size-4"
                      fill={isDisliked ? "currentColor" : "none"}
                    />
                    <span className="text-sm">
                      {comment.dislikes + (isDisliked ? 1 : 0)}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="text-sm font-bold text-foreground hover:text-primary"
                  >
                    Javob berish
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AuthRequiredModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}