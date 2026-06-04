"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { UserDetail } from "@/components/users/UserDetail";
import { useUserDetail } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/useToast";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id ?? "") as string;
  const { user, isLoading, banUser, unbanUser, resetProgress, sendGift } = useUserDetail(userId);

  const [banDialogOpen, setBanDialogOpen] = React.useState(false);
  const [banReason, setBanReason] = React.useState("");
  const [banLoading, setBanLoading] = React.useState(false);
  const [giftDialogOpen, setGiftDialogOpen] = React.useState(false);
  const [giftItemId, setGiftItemId] = React.useState("");
  const [giftQuantity, setGiftQuantity] = React.useState(1);
  const [giftLoading, setGiftLoading] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);

  const handleBan = async (reason: string) => {
    setBanLoading(true);
    try {
      await banUser(reason);
      setBanDialogOpen(false);
      setBanReason("");
      toast({ title: "用户已封禁", description: `已封禁用户 ${user?.nickname}` });
    } catch {
      toast({ title: "操作失败", description: "封禁用户失败", variant: "destructive" });
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnban = async () => {
    try {
      await unbanUser();
      toast({ title: "用户已解封", description: `已解封用户 ${user?.nickname}` });
    } catch {
      toast({ title: "操作失败", description: "解封用户失败", variant: "destructive" });
    }
  };

  const handleReset = async () => {
    if (!confirm("确定要重置该用户的进度吗？此操作不可撤销！")) return;
    setResetLoading(true);
    try {
      await resetProgress();
      toast({ title: "进度已重置", description: `已重置用户 ${user?.nickname} 的进度` });
    } catch {
      toast({ title: "操作失败", description: "重置进度失败", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleSendGift = async () => {
    if (!giftItemId) return;
    setGiftLoading(true);
    try {
      await sendGift(giftItemId, giftQuantity);
      setGiftDialogOpen(false);
      setGiftItemId("");
      setGiftQuantity(1);
      toast({ title: "礼物已发送", description: `已向 ${user?.nickname} 赠送礼物` });
    } catch {
      toast({ title: "操作失败", description: "赠送礼物失败", variant: "destructive" });
    } finally {
      setGiftLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">用户详情</h1>
          <p className="text-muted-foreground">查看和管理用户信息</p>
        </div>
      </div>

      <UserDetail
        user={user}
        isLoading={isLoading}
        onBan={(reason) => { setBanReason(reason); setBanDialogOpen(true); }}
        onUnban={handleUnban}
        onReset={handleReset}
        onSendGift={() => setGiftDialogOpen(true)}
      />

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>封禁用户</DialogTitle>
            <DialogDescription>封禁后该用户将无法登录游戏，请填写封禁原因。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">封禁原因</Label>
              <Input
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="请输入封禁原因..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={() => handleBan(banReason)} loading={banLoading} disabled={!banReason}>
              确认封禁
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Dialog */}
      <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>赠送礼物</DialogTitle>
            <DialogDescription>向该用户赠送指定物品。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="gift-item">物品ID</Label>
              <Input
                id="gift-item"
                value={giftItemId}
                onChange={(e) => setGiftItemId(e.target.value)}
                placeholder="输入物品ID..."
              />
            </div>
            <div>
              <Label htmlFor="gift-quantity">数量</Label>
              <Input
                id="gift-quantity"
                type="number"
                value={giftQuantity}
                onChange={(e) => setGiftQuantity(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiftDialogOpen(false)}>取消</Button>
            <Button onClick={handleSendGift} loading={giftLoading} disabled={!giftItemId}>
              确认赠送
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
