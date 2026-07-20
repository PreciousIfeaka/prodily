"use client";

import { useState } from "react";
import { Heart, MessageCircle, Award } from "lucide-react";
import { feedPosts } from "@/lib/data";
import { PageHeader, Card, Avatar, Badge } from "@/components/ui";

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
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Team Feed"
        subtitle="Kudos and recognition from across your organization."
        action={<Badge tone="warning">Sample data</Badge>}
      />

      <div className="space-y-4">
        {feedPosts.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <Avatar name={p.name} size={36} />
              <div>
                <div className="t-small font-medium text-[var(--text)]">{p.name}</div>
                <div className="t-caption text-[var(--muted)]">{p.time}</div>
              </div>
            </div>
            <div className="t-body text-[var(--text)] mb-2.5">
              {p.mention ? (
                <>
                  {p.body.split(p.mention)[0]}
                  <span className="text-[var(--brand-bright)] font-medium">{p.mention}</span>
                  {p.body.split(p.mention)[1]}
                </>
              ) : (
                p.body
              )}
            </div>
            {p.award && (
              <div className="inline-flex items-center gap-2 rounded-[var(--r)] px-3.5 py-2.5 mb-2.5 bg-[var(--brand-tint)] border border-[var(--brand)]/20">
                <div
                  className="w-[34px] h-[34px] rounded-[var(--r-sm)] grid place-items-center"
                  style={{ background: "linear-gradient(140deg, var(--brand-bright), var(--brand))" }}
                >
                  <Award size={19} color="#040605" />
                </div>
                <div>
                  <b className="t-small text-[var(--text)] block">{p.award.title}</b>
                  <span className="t-caption text-[var(--muted)]">{p.award.subtitle}</span>
                </div>
              </div>
            )}
            <div className="flex gap-4 pt-2.5 border-t border-[var(--line)]">
              <button
                onClick={() => toggleLike(p.id)}
                className={`flex items-center gap-1.5 font-medium t-small transition-colors ${
                  liked[p.id] ? "text-[var(--rose)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Heart size={16} fill={liked[p.id] ? "currentColor" : "none"} />
                {likes[p.id]}
              </button>
              <button className="flex items-center gap-1.5 font-medium t-small text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                <MessageCircle size={16} />
                {p.comments}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
