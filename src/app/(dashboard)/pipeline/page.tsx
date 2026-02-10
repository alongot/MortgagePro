"use client";

import { useState, useCallback } from "react";
import {
  GripVertical,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockData } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import type { PipelineStage, PipelineCard } from "@/types";

export default function PipelinePage() {
  const [stages] = useState<PipelineStage[]>(mockData.pipelineStages);
  const [cards, setCards] = useState<PipelineCard[]>(mockData.pipelineCards);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [logActivityOpen, setLogActivityOpen] = useState(false);
  const [activityLeadId, setActivityLeadId] = useState<string | null>(null);

  const handleDragStart = useCallback((cardId: string) => {
    setDraggedCard(cardId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback(
    (stageId: string) => {
      if (!draggedCard) return;
      setCards((prev) =>
        prev.map((c) =>
          c.id === draggedCard ? { ...c, stage_id: stageId } : c
        )
      );
      setDraggedCard(null);
      setDragOverStage(null);
    },
    [draggedCard]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Drag leads between stages to track progress
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{cards.length} leads in pipeline</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageCards = cards.filter((c) => c.stage_id === stage.id);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              className={cn(
                "flex-shrink-0 w-72 rounded-xl transition-colors",
                isOver ? "bg-primary/5" : "bg-muted/30"
              )}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-semibold text-sm">{stage.name}</span>
                  <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                    {stageCards.length}
                  </Badge>
                </div>
              </div>

              {/* Cards */}
              <div className="px-3 pb-3 space-y-2 min-h-[200px]">
                {stageCards.map((card) => {
                  const lead = card.lead;
                  if (!lead) return null;

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      className={cn(
                        "bg-background rounded-lg border p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all",
                        draggedCard === card.id && "opacity-50 scale-95"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                            lead.score >= 80 ? "bg-green-100 text-green-800" : lead.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                          )}>
                            {lead.score}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {lead.owner?.first_name} {lead.owner?.last_name}
                            </p>
                          </div>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" />
                        {lead.property?.address}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">
                          {lead.mortgage?.estimated_equity
                            ? formatCurrency(lead.mortgage.estimated_equity)
                            : "—"}
                        </span>
                        <div className="flex gap-0.5">
                          <button
                            className="p-1 rounded hover:bg-muted transition-colors"
                            onClick={() => {
                              setActivityLeadId(lead.id);
                              setLogActivityOpen(true);
                            }}
                          >
                            <Phone className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button className="p-1 rounded hover:bg-muted transition-colors">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button className="p-1 rounded hover:bg-muted transition-colors">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>

                      {lead.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {lead.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {stageCards.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Activity Dialog */}
      <LogActivityDialog
        open={logActivityOpen}
        onClose={() => {
          setLogActivityOpen(false);
          setActivityLeadId(null);
        }}
        leadId={activityLeadId}
      />
    </div>
  );
}

function LogActivityDialog({
  open,
  onClose,
  leadId,
}: {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
}) {
  const [activityType, setActivityType] = useState("call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const lead = leadId ? mockData.getLeadById(leadId) : null;

  const activityTypes = [
    { value: "call", label: "Phone Call" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "note", label: "Note" },
    { value: "meeting", label: "Meeting" },
  ];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Log Activity</DialogTitle>
      </DialogHeader>
      <DialogContent>
        {lead && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium">{lead.owner?.first_name} {lead.owner?.last_name}</p>
            <p className="text-xs text-muted-foreground">{lead.property?.address}</p>
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              options={activityTypes}
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Brief summary..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Details about this activity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onClose}>Log Activity</Button>
      </DialogFooter>
    </Dialog>
  );
}
