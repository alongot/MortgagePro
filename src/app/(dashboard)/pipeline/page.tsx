"use client";

import { useState, useCallback } from "react";
import {
  GripVertical,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency } from "@/lib/utils";
import type { PipelineStage, PipelineCard, Activity } from "@/types";

export default function PipelinePage() {
  const [stages] = useState<PipelineStage[]>([
    { id: "stage-1", user_id: "user-1", name: "New Lead", position: 0, color: "#3b82f6", created_at: new Date().toISOString() },
    { id: "stage-2", user_id: "user-1", name: "Contacted", position: 1, color: "#f59e0b", created_at: new Date().toISOString() },
    { id: "stage-3", user_id: "user-1", name: "Qualified", position: 2, color: "#8b5cf6", created_at: new Date().toISOString() },
    { id: "stage-4", user_id: "user-1", name: "Proposal", position: 3, color: "#06b6d4", created_at: new Date().toISOString() },
    { id: "stage-5", user_id: "user-1", name: "Closed Won", position: 4, color: "#22c55e", created_at: new Date().toISOString() },
  ]);
  const [cards, setCards] = useState<PipelineCard[]>([]);
  const [, setActivities] = useState<Activity[]>([]);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [logActivityOpen, setLogActivityOpen] = useState(false);
  const [activityLeadId, setActivityLeadId] = useState<string | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [addLeadStageId, setAddLeadStageId] = useState<string | null>(null);

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

  const moveCard = useCallback((cardId: string, direction: "left" | "right") => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const currentStageIndex = stages.findIndex(s => s.id === card.stage_id);
    const newStageIndex = direction === "left" ? currentStageIndex - 1 : currentStageIndex + 1;

    if (newStageIndex < 0 || newStageIndex >= stages.length) return;

    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, stage_id: stages[newStageIndex].id } : c
    ));
  }, [cards, stages]);

  const deleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  const addLeadToPipeline = useCallback((leadId: string, stageId: string) => {
    // No leads to add yet - user needs to save leads from search first
    // This will be connected to the database later
    console.log("Add lead to pipeline:", leadId, stageId);
  }, []);

  const logActivity = useCallback((leadId: string, type: string, title: string, description: string) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user_id: "user-1",
      lead_id: leadId,
      type: type as Activity["type"],
      title,
      description,
      metadata: null,
      created_at: new Date().toISOString(),
    };

    setActivities(prev => [newActivity, ...prev]);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Drag leads between stages to track progress
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="animate-number">{cards.length} leads in pipeline</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, stageIndex) => {
          const stageCards = cards.filter((c) => c.stage_id === stage.id);
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              className={cn(
                "flex-shrink-0 w-72 rounded-xl transition-all duration-300 animate-card-in",
                isOver ? "bg-primary/10 ring-2 ring-primary/30 scale-[1.02]" : "bg-muted/30"
              )}
              style={{ animationDelay: `${stageIndex * 100}ms` }}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Stage header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full transition-transform duration-300",
                      isOver && "scale-125 animate-pulse-soft"
                    )}
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-semibold text-sm">{stage.name}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] transition-all duration-300",
                      isOver && "scale-110 bg-primary text-primary-foreground"
                    )}
                  >
                    {stageCards.length}
                  </Badge>
                </div>
                <button
                  onClick={() => {
                    setAddLeadStageId(stage.id);
                    setAddLeadOpen(true);
                  }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Cards */}
              <div className="px-3 pb-3 space-y-2 min-h-[200px]">
                {stageCards.map((card, cardIndex) => {
                  const lead = card.lead;
                  if (!lead) return null;

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      className={cn(
                        "bg-background rounded-lg border p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-card-in group",
                        draggedCard === card.id && "opacity-50 scale-95 rotate-2 shadow-xl"
                      )}
                      style={{ animationDelay: `${stageIndex * 100 + cardIndex * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform duration-200 group-hover:scale-110",
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
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveCard(card.id, "left");
                            }}
                            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            disabled={stageIndex === 0}
                          >
                            <ChevronLeft className={cn("h-3.5 w-3.5", stageIndex === 0 && "opacity-30")} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveCard(card.id, "right");
                            }}
                            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            disabled={stageIndex === stages.length - 1}
                          >
                            <ChevronRight className={cn("h-3.5 w-3.5", stageIndex === stages.length - 1 && "opacity-30")} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCard(card.id);
                            }}
                            className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab" />
                        </div>
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
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            className="p-1 rounded hover:bg-muted transition-all hover:scale-110 active:scale-95"
                            onClick={() => {
                              setActivityLeadId(lead.id);
                              setLogActivityOpen(true);
                            }}
                          >
                            <Phone className="h-3 w-3 text-muted-foreground hover:text-green-600 transition-colors" />
                          </button>
                          <button className="p-1 rounded hover:bg-muted transition-all hover:scale-110 active:scale-95">
                            <Mail className="h-3 w-3 text-muted-foreground hover:text-blue-600 transition-colors" />
                          </button>
                          <button className="p-1 rounded hover:bg-muted transition-all hover:scale-110 active:scale-95">
                            <MessageSquare className="h-3 w-3 text-muted-foreground hover:text-purple-600 transition-colors" />
                          </button>
                        </div>
                      </div>

                      {lead.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {lead.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
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
                  <div className={cn(
                    "text-center py-8 text-xs text-muted-foreground border-2 border-dashed rounded-lg transition-all duration-300",
                    isOver ? "border-primary/50 bg-primary/5 text-primary" : "border-transparent"
                  )}>
                    {isOver ? "Release to drop" : "Drop leads here"}
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
        onLogActivity={logActivity}
      />

      {/* Add Lead Dialog */}
      <AddLeadDialog
        open={addLeadOpen}
        onClose={() => {
          setAddLeadOpen(false);
          setAddLeadStageId(null);
        }}
        stageId={addLeadStageId}
        existingLeadIds={cards.map(c => c.lead_id)}
        onAddLead={addLeadToPipeline}
      />
    </div>
  );
}

function LogActivityDialog({
  open,
  onClose,
  leadId,
  onLogActivity,
}: {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  onLogActivity: (leadId: string, type: string, title: string, description: string) => void;
}) {
  const [activityType, setActivityType] = useState("call");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const activityTypes = [
    { value: "call", label: "Phone Call" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "note", label: "Note" },
    { value: "meeting", label: "Meeting" },
  ];

  const handleSubmit = () => {
    if (leadId && title.trim()) {
      onLogActivity(leadId, activityType, title.trim(), description.trim());
      setTitle("");
      setDescription("");
      setActivityType("call");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Log Activity</DialogTitle>
      </DialogHeader>
      <DialogContent>
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
        <Button onClick={handleSubmit} disabled={!title.trim()}>Log Activity</Button>
      </DialogFooter>
    </Dialog>
  );
}

function AddLeadDialog({
  open,
  onClose,
  stageId,
  existingLeadIds: _existingLeadIds,
  onAddLead,
}: {
  open: boolean;
  onClose: () => void;
  stageId: string | null;
  existingLeadIds: string[];
  onAddLead: (leadId: string, stageId: string) => void;
}) {
  void _existingLeadIds; // Will be used when leads are saved to database
  const [selectedLead, setSelectedLead] = useState<string>("");

  // No leads available yet - user needs to add leads from search
  const availableLeads: { id: string; owner?: { first_name: string; last_name: string }; property?: { address: string; city: string }; score: number }[] = [];

  const handleSubmit = () => {
    if (selectedLead && stageId) {
      onAddLead(selectedLead, stageId);
      setSelectedLead("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Add Lead to Pipeline</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          {availableLeads.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Lead</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableLeads.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead.id)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all",
                      selectedLead === lead.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {lead.owner?.first_name} {lead.owner?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.property?.address}, {lead.property?.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                          lead.score >= 80 ? "bg-green-100 text-green-800" : lead.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                        )}>
                          {lead.score}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium">All leads are already in the pipeline</p>
              <p className="text-sm">Search for new leads to add them here</p>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!selectedLead || availableLeads.length === 0}>
          Add to Pipeline
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
