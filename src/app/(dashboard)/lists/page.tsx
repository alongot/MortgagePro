"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  FolderOpen,
  Users,
  ChevronRight,
  ArrowLeft,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatCurrency, getLeadStatusColor } from "@/lib/utils";
import type { Lead, List } from "@/types";

const LIST_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#22c55e", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<List | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);

  // Fetch lists on mount
  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    setLoading(true);
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data = await response.json();
        setLists(data);
      }
    } catch (err) {
      console.error("Failed to fetch lists:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName.trim(),
          description: newListDesc.trim() || null,
          color: newListColor,
        }),
      });

      if (response.ok) {
        const newList = await response.json();
        setLists(prev => [newList, ...prev]);
        setCreateOpen(false);
        setNewListName("");
        setNewListDesc("");
        setNewListColor(LIST_COLORS[0]);
      }
    } catch (err) {
      console.error("Failed to create list:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLists(prev => prev.filter(l => l.id !== listId));
        if (activeList?.id === listId) {
          setActiveList(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
    }
  };

  if (activeList) {
    return (
      <ListDetailView
        list={activeList}
        onBack={() => setActiveList(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-2xl font-bold">My Lists</h1>
          <p className="text-muted-foreground text-sm">
            Organize leads into custom lists
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="hover:scale-105 active:scale-95 transition-transform">
          <Plus className="h-4 w-4 mr-1" />
          New List
        </Button>
      </div>

      {/* List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list, index) => (
          <Card
            key={list.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group animate-card-in"
            style={{ animationDelay: `${index * 75}ms` }}
            onClick={() => setActiveList(list)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{ backgroundColor: list.color + "20" }}
                  >
                    <FolderOpen
                      className="h-5 w-5"
                      style={{ color: list.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors duration-300">{list.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {list.lead_count} lead{list.lead_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
              {list.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {list.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Empty create card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-dashed hover:border-primary hover:bg-primary/5 animate-card-in group"
          style={{ animationDelay: `${lists.length * 75}ms` }}
          onClick={() => setCreateOpen(true)}
        >
          <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[120px]">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-90">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Create a new list</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogHeader onClose={() => setCreateOpen(false)}>
          <DialogTitle>Create New List</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="e.g. High Equity Austin"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe this list..."
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2">
                {LIST_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewListColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform",
                      newListColor === c ? "scale-125 ring-2 ring-offset-2 ring-primary" : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateList}
            disabled={!newListName.trim() || creating}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create List"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

// ---- List Detail View ----
function ListDetailView({ list, onBack }: { list: List; onBack: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchListItems();
  }, [list.id]);

  async function fetchListItems() {
    setLoading(true);
    try {
      const response = await fetch(`/api/lists/${list.id}`);
      if (response.ok) {
        const data = await response.json();
        // The API returns leads directly on the response
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to fetch list items:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 animate-slide-in-up">
      <div className="flex items-center gap-3 animate-in">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:scale-110 active:scale-95 transition-transform">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-6"
          style={{ backgroundColor: list.color + "20" }}
        >
          <FolderOpen className="h-4 w-4" style={{ color: list.color }} />
        </div>
        <div>
          <h1 className="text-xl font-bold">{list.name}</h1>
          <p className="text-sm text-muted-foreground">{list.description}</p>
        </div>
        <Badge variant="secondary" className="ml-auto animate-badge-pop">
          {loading ? "..." : `${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <>
      <div className="grid gap-3">
        {leads.map((lead, index) => (
          <Card
            key={lead.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:translate-x-1 animate-card-in group"
            style={{ animationDelay: `${index * 75}ms` }}
            onClick={() => setSelectedLead(lead)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-110",
                    lead.score >= 80 ? "bg-green-100 text-green-800" : lead.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                  )}>
                    {lead.score}
                  </div>
                  <div>
                    <p className="font-medium">
                      {lead.owner?.first_name} {lead.owner?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lead.property?.address}, {lead.property?.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {lead.property?.estimated_value
                        ? formatCurrency(lead.property.estimated_value)
                        : "—"}
                    </p>
                    {lead.mortgage?.estimated_equity && (
                      <p className="text-xs text-green-600">
                        {formatCurrency(lead.mortgage.estimated_equity)} equity
                      </p>
                    )}
                  </div>
                  <Badge className={cn("capitalize text-xs transition-transform group-hover:scale-105", getLeadStatusColor(lead.status))}>
                    {lead.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {lead.tags.length > 0 && (
                <div className="flex gap-1 mt-2 pl-[52px]">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] transition-all duration-200 hover:bg-primary/10 hover:border-primary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {leads.length === 0 && (
        <Card className="animate-card-in">
          <CardContent className="p-12 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40 animate-bounce-subtle" />
            <p className="font-medium text-muted-foreground">No leads in this list yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add leads from the search page
            </p>
          </CardContent>
        </Card>
      )}
      </>
      )}
    </div>
  );
}
