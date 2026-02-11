"use client";

import { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { cn, getPriorityColor, formatDate } from "@/lib/utils";
import type { Task } from "@/types";

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Loader2 className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

const filterOptions = [
  { value: "all", label: "All Tasks" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TasksPage() {
  const [filter, setFilter] = useState("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");

  const filteredTasks = tasks.filter((t) =>
    filter === "all" ? true : t.status === filter
  );

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus =
          t.status === "pending"
            ? "in_progress"
            : t.status === "in_progress"
              ? "completed"
              : "pending";
        return { ...t, status: nextStatus };
      })
    );
  };

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      user_id: "user-1",
      lead_id: null,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
      priority: newPriority as "low" | "medium" | "high" | "urgent",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lead: undefined,
    };

    setTasks(prev => [newTask, ...prev]);
    setCreateOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setNewDueDate("");
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Manage your to-do items and follow-ups
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="hover:scale-105 active:scale-95 transition-transform">
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={cn(
            "cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-card-in group",
            filter === "pending" && "ring-2 ring-orange-500"
          )}
          style={{ animationDelay: '100ms' }}
          onClick={() => setFilter("pending")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold animate-number" style={{ animationDelay: '200ms' }}>{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-card-in group",
            filter === "in_progress" && "ring-2 ring-blue-500"
          )}
          style={{ animationDelay: '150ms' }}
          onClick={() => setFilter("in_progress")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Loader2 className={cn("h-5 w-5 text-blue-600", filter === "in_progress" && "animate-spin")} />
            </div>
            <div>
              <p className="text-2xl font-bold animate-number" style={{ animationDelay: '250ms' }}>{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-card-in group",
            filter === "completed" && "ring-2 ring-green-500"
          )}
          style={{ animationDelay: '200ms' }}
          onClick={() => setFilter("completed")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold animate-number" style={{ animationDelay: '300ms' }}>{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select
          options={filterOptions}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-44"
        />
        <span className="text-sm text-muted-foreground">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.map((task, index) => (
          <Card
            key={task.id}
            className="hover:shadow-md transition-all duration-200 hover:translate-x-1 animate-card-in group"
            style={{ animationDelay: `${300 + index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-0.5 shrink-0 transition-transform duration-200 hover:scale-125 active:scale-90"
                >
                  {statusIcon[task.status]}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium text-sm transition-all duration-300",
                      task.status === "completed" && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    <Badge className={cn("text-[10px] transition-transform hover:scale-105", getPriorityColor(task.priority))}>
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {task.lead && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="font-medium">
                          {task.lead.owner?.first_name} {task.lead.owner?.last_name}
                        </span>
                        — {task.lead.property?.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity">
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.due_date)}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="animate-card-in">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-40 animate-bounce-subtle" />
            <p className="font-medium text-muted-foreground">No tasks found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "all"
                ? "Create your first task to get started"
                : `No ${filter.replace("_", " ")} tasks`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogHeader onClose={() => setCreateOpen(false)}>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Add more details..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  options={priorityOptions}
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTask}
            disabled={!newTitle.trim()}
          >
            Create Task
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
