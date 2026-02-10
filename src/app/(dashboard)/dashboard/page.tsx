"use client";

import Link from "next/link";
import {
  Users,
  Phone,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Circle,
  Loader2,
  Calendar,
  Mail,
  MessageSquare,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockData } from "@/lib/mock-data";
import { cn, formatCurrency, formatPercent, formatDate, getLeadStatusColor, getPriorityColor } from "@/lib/utils";

const COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#6366f1", "#f97316", "#22c55e"];

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  sms: <MessageSquare className="h-3.5 w-3.5" />,
  note: <Eye className="h-3.5 w-3.5" />,
  status_change: <ArrowUpRight className="h-3.5 w-3.5" />,
  contact_reveal: <Eye className="h-3.5 w-3.5" />,
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  in_progress: <Loader2 className="h-3.5 w-3.5 text-blue-500" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
};

export default function DashboardPage() {
  const urgentTasks = mockData.tasks.filter(
    (t) => t.status !== "completed" && (t.priority === "urgent" || t.priority === "high")
  );
  const recentLeads = mockData.leads.filter((l) => l.status === "new" || l.status === "contacted");

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning</h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s what&apos;s happening with your pipeline today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button size="sm">
              <Users className="h-4 w-4 mr-1.5" />
              Find Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Apollo-style KPI row — compact, horizontal stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Leads",
            value: mockData.dashboardStats.total_leads.toString(),
            change: "+12%",
            positive: true,
            icon: Users,
            accent: "text-blue-600 bg-blue-500/10",
          },
          {
            label: "Pipeline Value",
            value: formatCurrency(mockData.dashboardStats.total_pipeline_value),
            change: "+8%",
            positive: true,
            icon: DollarSign,
            accent: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Conversion Rate",
            value: formatPercent(mockData.dashboardStats.conversion_rate),
            change: "+2.1%",
            positive: true,
            icon: TrendingUp,
            accent: "text-purple-600 bg-purple-500/10",
          },
          {
            label: "Tasks Due Today",
            value: mockData.dashboardStats.tasks_due_today.toString(),
            change: "",
            positive: true,
            icon: CheckCircle2,
            accent: "text-orange-600 bg-orange-500/10",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold mt-1 tracking-tight">{kpi.value}</p>
                  {kpi.change && (
                    <p className={cn(
                      "text-xs font-medium mt-1 flex items-center gap-0.5",
                      kpi.positive ? "text-green-600" : "text-red-600"
                    )}>
                      <ArrowUpRight className="h-3 w-3" />
                      {kpi.change} this week
                    </p>
                  )}
                </div>
                <div className={cn("p-2 rounded-lg", kpi.accent)}>
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main 3-column layout like Apollo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Activity feed + Pipeline chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline overview bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Pipeline Overview</CardTitle>
                <Link href="/pipeline" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View Pipeline <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData.pipelineChartData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(220, 13%, 91%)",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {mockData.pipelineChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lead volume trend */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Lead Volume Trend</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] font-normal">Last 6 months</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData.monthlyLeadsData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="hsl(220, 70%, 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220, 13%, 91%)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(220, 13%, 91%)",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(220, 70%, 50%)"
                      strokeWidth={2}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity feed — Apollo style */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                <span className="text-xs text-muted-foreground">{mockData.activities.length} activities</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockData.activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                    <div className="mt-1 p-1.5 rounded-md bg-muted shrink-0">
                      {activityIcons[activity.type] ?? <Circle className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.title}</span>
                      </p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] font-normal capitalize">
                        {activity.type.replace("_", " ")}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Tasks, Hot Leads, Sources */}
        <div className="space-y-6">
          {/* Action Items (Urgent Tasks) */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Action Items</CardTitle>
                <Link href="/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">
                  All Tasks <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {urgentTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 px-6 py-3">
                    <div className="mt-0.5 shrink-0">
                      {statusIcon[task.status]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{task.title}</p>
                      {task.lead?.owner && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.lead.owner.first_name} {task.lead.owner.last_name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className={cn("text-[10px]", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(task.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {urgentTasks.length === 0 && (
                  <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                    No urgent tasks
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hot Leads */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Hot Leads</CardTitle>
                <Link href="/search" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Search <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      lead.score >= 80 ? "bg-green-100 text-green-800" : lead.score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                    )}>
                      {lead.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {lead.owner?.first_name} {lead.owner?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.property?.address}, {lead.property?.city}
                      </p>
                    </div>
                    <Badge className={cn("text-[10px] capitalize shrink-0", getLeadStatusColor(lead.status))}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lead Sources donut */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold">Lead Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockData.leadsBySourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {mockData.leadsBySourceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                {mockData.leadsBySourceData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
