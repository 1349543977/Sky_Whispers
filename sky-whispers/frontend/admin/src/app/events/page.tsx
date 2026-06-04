"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { eventsService, type CreateEventPayload } from "@/services/events";
import { toast } from "@/hooks/useToast";
import type { GameEvent, EventType, EventStatus } from "@/types";
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Plus, CalendarDays, X } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<EventType>("double_coins");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formMultiplier, setFormMultiplier] = useState("2");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await eventsService.getEvents({
        status: statusFilter === "all" ? undefined : statusFilter,
        page: 1,
        pageSize: 50,
      });
      setEvents(response.data);
    } catch {
      toast({ title: "加载失败", description: "无法加载活动列表", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreateEvent = async () => {
    if (!formName || !formStartDate || !formEndDate) {
      toast({ title: "表单不完整", description: "请填写所有必填字段", variant: "destructive" });
      return;
    }

    setCreateLoading(true);
    try {
      const payload: CreateEventPayload = {
        name: formName,
        description: formDescription,
        type: formType,
        startDate: formStartDate,
        endDate: formEndDate,
        config: { multiplier: Number(formMultiplier) },
      };
      await eventsService.createEvent(payload);
      toast({ title: "创建成功", description: `活动「${formName}」已创建` });
      setCreateDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch {
      toast({ title: "创建失败", description: "无法创建活动", variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelEvent = async (id: string) => {
    if (!confirm("确定要取消此活动吗？")) return;
    try {
      await eventsService.cancelEvent(id);
      toast({ title: "已取消", description: "活动已取消" });
      fetchEvents();
    } catch {
      toast({ title: "操作失败", description: "取消活动失败", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormType("double_coins");
    setFormStartDate("");
    setFormEndDate("");
    setFormMultiplier("2");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">活动管理</h1>
          <p className="text-muted-foreground">创建和管理游戏内活动</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> 创建活动
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {(["all", "active", "scheduled", "ended", "draft", "cancelled"] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "全部" : EVENT_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {/* Events list */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <p className="text-muted-foreground">暂无活动</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm">{event.name}</h3>
                  <Badge variant="outline" className={EVENT_STATUS_COLORS[event.status]}>
                    {EVENT_STATUS_LABELS[event.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {EVENT_TYPE_LABELS[event.type]}
                    </Badge>
                  </div>
                  <p>开始: {formatDate(event.startDate)}</p>
                  <p>结束: {formatDate(event.endDate)}</p>
                </div>
                <Separator className="my-3" />
                <div className="flex gap-2">
                  {event.status === "active" && (
                    <Button variant="destructive" size="sm" className="text-xs" onClick={() => handleCancelEvent(event.id)}>
                      取消活动
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>创建活动</DialogTitle>
            <DialogDescription>创建一个新的游戏内活动</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">活动名称 *</Label>
              <Input id="event-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="输入活动名称" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-desc">活动描述</Label>
              <Input id="event-desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="输入活动描述" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>活动类型 *</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as EventType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-multiplier">倍率</Label>
                <Input id="event-multiplier" type="number" value={formMultiplier} onChange={(e) => setFormMultiplier(e.target.value)} min="1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start">开始时间 *</Label>
                <Input id="event-start" type="datetime-local" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end">结束时间 *</Label>
                <Input id="event-end" type="datetime-local" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
            <Button onClick={handleCreateEvent} loading={createLoading}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
