"use client";

import { useState } from "react";
import { Heart, MessageCircle, Award } from "lucide-react";
import { feedPosts } from "@/lib/data";

export default function FeedPage() {
  const [likes, setLikes] = useState<Record<number, number>>(
    Object.fromEntries(feedPosts.map((p) => [p.id, p.likes]))
  );
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const isLiked = !prev[id];
      setLikes((l) => ({ ...l, [id]: l[id] + (isLiked ? 1 : -1) }));
      return { ...prev, [id]: isLiked };
    });
  };

  return (
    <div>
      <div className="pt-1.5 pb-3.5">
        <div className="font-display font-extrabold text-[23px] text-ink tracking-tight">Feed</div>
        <div className="text-[12.5px] text-muted">Kudos and recognition</div>
      </div>

      {feedPosts.map((p) => (
        <div key={p.id} className="bg-white border border-line rounded-[20px] p-[15px] mb-3">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div
              className="w-9 h-9 rounded-full text-white font-bold text-xs grid place-items-center flex-shrink-0"
              style={{ background: "linear-gradient(140deg, var(--indigo), var(--violet))" }}
            >
              {p.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="text-[13.5px] font-bold text-ink">{p.name}</div>
              <div className="text-[11.5px] text-faint">{p.time}</div>
            </div>
          </div>
          <div className="text-[13.5px] text-text mb-2.5">
            {p.mention ? (
              <>
                {p.body.split(p.mention)[0]}
                <span className="text-indigo font-bold">{p.mention}</span>
                {p.body.split(p.mention)[1]}
              </>
            ) : (
              p.body
            )}
          </div>
          {p.award && (
            <div
              className="inline-flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 mb-2.5"
              style={{ background: "linear-gradient(100deg, var(--violet-tint), #fbf5ff)", border: "1px solid #ecd9ff" }}
            >
              <div
                className="w-[34px] h-[34px] rounded-[10px] grid place-items-center"
                style={{ background: "linear-gradient(140deg, var(--violet), var(--indigo))" }}
              >
                <Award size={19} color="#fff" />
              </div>
              <div>
                <b className="text-[13px] text-ink block">{p.award.title}</b>
                <span className="text-[11px] text-muted">{p.award.subtitle}</span>
              </div>
            </div>
          )}
          <div className="flex gap-4 pt-2.5 border-t border-line">
            <button
              onClick={() => toggleLike(p.id)}
              className={`flex items-center gap-1.5 font-semibold text-[12.5px] ${liked[p.id] ? "text-rose" : "text-muted"}`}
            >
              <Heart size={16} fill={liked[p.id] ? "currentColor" : "none"} />
              {likes[p.id]}
            </button>
            <button className="flex items-center gap-1.5 font-semibold text-[12.5px] text-muted">
              <MessageCircle size={16} />
              {p.comments}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
