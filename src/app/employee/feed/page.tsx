"use client";

import { useEffect, useState } from "react";
import { Award, Heart, MessageCircle } from "lucide-react";
import { getMyTransactionsAction } from "@/app/actions/transactions";
import { getMeAction } from "@/app/actions/auth";
import { PageHeader, Card, Avatar, Spinner } from "@/components/ui";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});

  const loadFeed = async () => {
    setLoading(true);
    try {
      const [me, txResult] = await Promise.all([
        getMeAction(),
        getMyTransactionsAction(),
      ]);
      
      setUser(me);

      if (txResult.success && txResult.transactions) {
        const mapped = txResult.transactions.map((tx: any) => {
          const isCredit = tx.type === "CREDIT";
          let message = "";
          
          if (tx.purpose === "REWARD_PAYOUT") {
            message = "completed a challenge and claimed their reward payout!";
          } else if (tx.purpose === "PEER_KUDOS") {
            message = "received peer kudos from a teammate!";
          } else if (tx.purpose === "EMERGENCY_SUPPORT") {
            message = "disbursed emergency support funds.";
          } else {
            message = `completed a transaction: ${tx.purpose.replace(/_/g, " ").toLowerCase()}`;
          }

          return {
            id: tx.id,
            name: me ? `${me.firstName} ${me.lastName}` : "Team Member",
            time: new Date(tx.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            body: message,
            award: {
              title: tx.purpose.replace(/_/g, " "),
              subtitle: isCredit ? `Received ₦${Number(tx.amount).toLocaleString()}` : `Paid ₦${Number(tx.amount).toLocaleString()}`,
            },
            likes: Math.floor(Math.random() * 5),
            comments: 0,
          };
        });
        
        setPosts(mapped);
        
        const initialLikes: Record<string, number> = {};
        mapped.forEach((p) => {
          initialLikes[p.id] = p.likes;
        });
        setLikesCount(initialLikes);
      }
    } catch (err) {
      console.error("Failed to load feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const isLiked = !prev[id];
      setLikesCount((l) => ({ ...l, [id]: l[id] + (isLiked ? 1 : -1) }));
      return { ...prev, [id]: isLiked };
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Team Feed"
        subtitle="Kudos and recognition from across your organization."
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center text-[var(--muted)]">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30 text-[var(--brand-bright)]" />
          <p className="t-small font-medium">Your feed is quiet right now.</p>
          <p className="t-caption mt-1">Complete challenges or earn rewards to see your achievements posted here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar name={p.name} size={36} />
                <div>
                  <div className="t-small font-medium text-[var(--text)]">
                    {p.name} <span className="font-normal text-[var(--muted)]">{p.body}</span>
                  </div>
                  <div className="t-caption text-[var(--muted)]">{p.time}</div>
                </div>
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
                  {likesCount[p.id] || 0}
                </button>
                <button className="flex items-center gap-1.5 font-medium t-small text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                  <MessageCircle size={16} />
                  {p.comments}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
