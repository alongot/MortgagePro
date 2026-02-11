"use client";

import { useState, useEffect } from "react";
import { ListPlus, Plus, Loader2, Check, FolderPlus } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

interface List {
  id: string;
  name: string;
  description?: string;
  color: string;
  lead_count: number;
}

export function AddToListDialog() {
  const { addToListDialogOpen, setAddToListDialogOpen, selectedLeadIds, clearSelection } = useAppStore();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch lists when dialog opens
  useEffect(() => {
    if (addToListDialogOpen) {
      fetchLists();
      setSelectedListId(null);
      setShowNewList(false);
      setNewListName("");
      setError("");
      setSuccess("");
    }
  }, [addToListDialogOpen]);

  async function fetchLists() {
    setLoading(true);
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data = await response.json();
        setLists(data);
        // If no lists exist, show new list form
        if (data.length === 0) {
          setShowNewList(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch lists:", err);
      setError("Failed to load lists");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateList() {
    if (!newListName.trim()) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to create list");
      }

      const newList = await response.json();
      setLists([newList, ...lists]);
      setSelectedListId(newList.id);
      setShowNewList(false);
      setNewListName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create list");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToList() {
    if (!selectedListId || selectedLeadIds.length === 0) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/lists/${selectedListId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: selectedLeadIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to add leads to list");
      }

      const data = await response.json();
      setSuccess(`Added ${data.added} lead${data.added !== 1 ? "s" : ""} to list!`);

      // Close dialog and clear selection after a moment
      setTimeout(() => {
        setAddToListDialogOpen(false);
        clearSelection();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add leads");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setAddToListDialogOpen(false);
  }

  const selectedList = lists.find((l) => l.id === selectedListId);

  return (
    <Dialog open={addToListDialogOpen} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>
        <DialogTitle className="flex items-center gap-2">
          <ListPlus className="h-5 w-5 text-primary" />
          Add to List
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">{success}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adding {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? "s" : ""} to a list
            </p>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            {/* New List Form */}
            {showNewList ? (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium">Create New List</p>
                <Input
                  placeholder="List name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newListName.trim()) {
                      handleCreateList();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateList}
                    disabled={!newListName.trim() || saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Create
                      </>
                    )}
                  </Button>
                  {lists.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowNewList(false)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Existing Lists */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedListId(list.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200",
                        selectedListId === list.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: list.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{list.name}</p>
                        {list.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {list.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {list.lead_count} leads
                      </span>
                      {selectedListId === list.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Create New List Button */}
                <button
                  onClick={() => setShowNewList(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="text-sm">Create new list</span>
                </button>
              </>
            )}
          </div>
        )}
      </DialogContent>
      {!loading && !success && !showNewList && (
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToList}
            disabled={!selectedListId || saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add to {selectedList?.name || "List"}
              </>
            )}
          </Button>
        </DialogFooter>
      )}
    </Dialog>
  );
}
