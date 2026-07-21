"use client";

import { useEffect, useState } from "react";
import { getRewardRequestsAction } from "@/app/actions/wallet";
import { PageHeader, Spinner } from "@/components/ui";
import ApprovalsQueue from "../_components/ApprovalsQueue";

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getRewardRequestsAction("PENDING");
      const normalized = Array.isArray(res) ? res : res?.requests || res?.data || [];
      setRequests(normalized);
    } catch (err) {
      console.error("Failed to load approvals queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reward Approvals"
        subtitle="Review and sign off on pending employee reward disbursements."
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size={28} />
        </div>
      ) : (
        <ApprovalsQueue requests={requests} onRefresh={loadRequests} />
      )}
    </div>
  );
}
