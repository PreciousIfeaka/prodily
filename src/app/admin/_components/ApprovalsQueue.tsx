"use client";

import { useState, startTransition } from "react";
import { approveRewardRequestAction, rejectRewardRequestAction } from "@/app/actions/wallet";
import { useToast } from "@/components/Toast";
import {
  Card,
  Button,
  Badge,
  Table,
  Tr,
  Td,
  EmptyState,
  Modal,
  Field,
  Textarea,
} from "@/components/ui";
import { CheckSquare } from "lucide-react";

export default function ApprovalsQueue({
  requests,
  onRefresh,
}: {
  requests: any[];
  onRefresh: () => void;
}) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const { toast } = useToast();

  const approve = (id: string) => {
    startTransition(async () => {
      try {
        const res = await approveRewardRequestAction(id);
        if (res.success) {
          toast("Request approved.");
          onRefresh();
        } else {
          toast(res.error || "Failed to approve request.");
        }
      } catch {
        toast("Connection error.");
      }
    });
  };

  const reject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId) return;
    if (!reason.trim()) {
      setReasonError("A reason is required.");
      return;
    }
    setRejectLoading(true);
    startTransition(async () => {
      try {
        const res = await rejectRewardRequestAction(rejectId, reason);
        if (res.success) {
          toast("Request rejected.");
          setRejectId(null);
          setReason("");
          setReasonError("");
          onRefresh();
        } else {
          toast(res.error || "Failed to reject request.");
        }
      } catch {
        toast("Connection error.");
      } finally {
        setRejectLoading(false);
      }
    });
  };

  return (
    <Card className="p-6">
      <h3 className="t-h3 text-[var(--text)] mb-4 flex items-center gap-2">
        <CheckSquare className="w-5 h-5 text-[var(--brand-bright)]" /> Approvals queue
      </h3>

      {requests.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6" />}
          title="You're all caught up"
          description="No pending requests await your sign-off."
        />
      ) : (
        <Table
          columns={["Requester", "Recipient", "Category", "Amount", "Stages", ""]}
          caption="Pending reward and support approval requests"
        >
          {requests.map((req) => (
            <Tr key={req.id}>
              <Td className="font-medium">
                {req.requestor ? `${req.requestor.firstName} ${req.requestor.lastName}` : "Admin"}
              </Td>
              <Td className="font-medium">
                {req.recipient ? `${req.recipient.firstName} ${req.recipient.lastName}` : "User"}
              </Td>
              <Td>
                <Badge tone="brand">{req.category?.replace(/_/g, " ")}</Badge>
              </Td>
              <Td className="font-medium">
                ₦{Number(req.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Td>
              <Td className="text-[var(--muted)]">
                {req.approvalStages?.join(" → ") || "Auto-approve"} (stage {req.currentStageIndex})
              </Td>
              <Td>
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="subtle" onClick={() => approve(req.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectId(req.id)}>
                    Reject
                  </Button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}

      <Modal
        open={!!rejectId}
        onClose={() => {
          setRejectId(null);
          setReasonError("");
        }}
        title="Reject request"
        description="Provide a clear reason for rejecting this disbursement."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="danger" onClick={reject} loading={rejectLoading}>Confirm rejection</Button>
          </>
        }
      >
        <form onSubmit={reject}>
          <Field label="Reason for rejection" required error={reasonError}>
            {({ id, invalid }) => (
              <Textarea
                id={id}
                invalid={invalid}
                rows={3}
                placeholder="e.g. Budget constraints, incorrect categorization…"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError("");
                }}
              />
            )}
          </Field>
        </form>
      </Modal>
    </Card>
  );
}
