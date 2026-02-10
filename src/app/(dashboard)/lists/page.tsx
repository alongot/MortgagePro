"use client";

import { useState } from "react";
import {
  Plus,
  FolderOpen,
  Users,
  ChevronRight,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mockData } from "@/lib/mock-data";
import { cn, formatCurrency, getLeadStatusColor } from "@/lib/utils";
import type { Lead, List } from "@/types";

const LIST_COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#22c55e", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function ListsPage() {
  const [activeList, setActiveList] = useState<List | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);

  if (activeList) {
    return (
      <ListDetailView
        list={activeList}
        onBack={() => setActiveList(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Lists</h1>
          <p className="text-muted-foreground text-sm">
            Organize leads into custom lists
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New List
        </Button>
      </div>

      {/* List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockData.lists.map((list) => (
          <Card
            key={list.id}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => setActiveList(list)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: list.color + "20" }}
                  >
                    <FolderOpen
                      className="h-5 w-5"
                      style={{ color: list.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{list.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {list.lead_count} lead{list.lead_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
          className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
          onClick={() => setCreateOpen(true)}
        >
          <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[120px]">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Create a new list</p>
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
          <Button variant="outline" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setNewListName("");
              setNewListDesc("");
            }}
            disabled={!newListName.trim()}
          >
            Create List
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

// ---- List Detail View ----
function ListDetailView({ list, onBack }: { list: List; onBack: () => void }) {
  const leads = mockData.getLeadsForList(list.id);
  const [, setSelectedLead] = useState<Lead | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: list.color + "20" }}
        >
          <FolderOpen className="h-4 w-4" style={{ color: list.color }} />
        </div>
        <div>
          <h1 className="text-xl font-bold">{list.name}</h1>
          <p className="text-sm text-muted-foreground">{list.description}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {leads.length} lead{leads.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="grid gap-3">
        {leads.map((lead) => (
          <Card
            key={lead.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedLead(lead)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold",
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
                  <Badge className={cn("capitalize text-xs", getLeadStatusColor(lead.status))}>
                    {lead.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {lead.tags.length > 0 && (
                <div className="flex gap-1 mt-2 pl-[52px]">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
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
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="font-medium text-muted-foreground">No leads in this list yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add leads from the search page
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
