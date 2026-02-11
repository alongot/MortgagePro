"use client";

import { useState } from "react";
import {
  User,
  Shield,
  CreditCard,
  Users,
  Download,
  Trash2,
  Camera,
  Check,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  Key,
  Smartphone,
  LogOut,
  ChevronRight,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [fullName, setFullName] = useState("Demo User");
  const [email, setEmail] = useState("demo@mortgagepro.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [company, setCompany] = useState("MortgagePro Inc.");
  const [jobTitle, setJobTitle] = useState("Senior Loan Officer");
  const [location, setLocation] = useState("Austin, TX");
  const [website, setWebsite] = useState("https://mortgagepro.com");
  const [bio, setBio] = useState("Experienced mortgage professional with 10+ years helping families achieve their homeownership dreams.");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "team", label: "Team", icon: Users },
    { id: "data", label: "Data & Privacy", icon: Download },
  ];

  const teamMembers = [
    { name: "Demo User", email: "demo@mortgagepro.com", role: "Admin", avatar: "DU", status: "active" },
    { name: "Sarah Johnson", email: "sarah@mortgagepro.com", role: "Member", avatar: "SJ", status: "active" },
    { name: "Mike Chen", email: "mike@mortgagepro.com", role: "Member", avatar: "MC", status: "pending" },
  ];


  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account, team, and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 animate-card-in group",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <tab.icon className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
                )} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-card-in">
              {/* Avatar Section */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-4 ring-background shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <span className="text-2xl font-bold text-primary">DU</span>
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{fullName}</h3>
                      <p className="text-sm text-muted-foreground">{jobTitle}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="animate-badge-pop">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro Plan
                        </Badge>
                        <Badge variant="outline">Verified</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        Full Name
                      </label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        Job Title
                      </label>
                      <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        Email
                      </label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        Phone
                      </label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        Company
                      </label>
                      <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Location
                      </label>
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Website
                    </label>
                    <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200 hover:border-ring/50"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button>
                      <Check className="h-4 w-4 mr-1.5" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-card-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <CardTitle className="text-base">Password</CardTitle>
                  </div>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button variant="outline">Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                  </div>
                  <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">2FA is enabled</p>
                        <p className="text-xs text-muted-foreground">Using authenticator app</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active Sessions</CardTitle>
                  <CardDescription>Manage your active login sessions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { device: "Chrome on MacOS", location: "Austin, TX", current: true, time: "Now" },
                    { device: "Safari on iPhone", location: "Austin, TX", current: false, time: "2 hours ago" },
                    { device: "Firefox on Windows", location: "Dallas, TX", current: false, time: "Yesterday" },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors animate-card-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          session.current ? "bg-green-500 animate-pulse-soft" : "bg-muted-foreground"
                        )} />
                        <div>
                          <p className="text-sm font-medium">{session.device}</p>
                          <p className="text-xs text-muted-foreground">{session.location} · {session.time}</p>
                        </div>
                      </div>
                      {session.current ? (
                        <Badge variant="secondary">Current</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6 animate-card-in">
              {/* Current Plan */}
              <Card className="overflow-hidden border-primary/50">
                <div className="h-1 bg-gradient-to-r from-primary to-blue-400" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold">Professional Plan</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Unlimited searches, 500 contact reveals/month, full analytics
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold">$149</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Renews on March 15, 2026</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="ghost" className="text-muted-foreground">Cancel Subscription</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Usage This Month</CardTitle>
                  <CardDescription>Track your feature usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Property Searches", used: 847, limit: "Unlimited", percent: null },
                    { label: "Contact Reveals", used: 312, limit: 500, percent: 62 },
                    { label: "Lists Created", used: 8, limit: "Unlimited", percent: null },
                    { label: "Team Members", used: 3, limit: 10, percent: 30 },
                  ].map((item, index) => (
                    <div key={item.label} className="animate-card-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.used.toLocaleString()} / {typeof item.limit === 'number' ? item.limit.toLocaleString() : item.limit}
                        </span>
                      </div>
                      {item.percent !== null && (
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Method</CardTitle>
                  <CardDescription>Manage your payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-lg border">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/2027</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { date: "Feb 15, 2026", amount: "$149.00", status: "Paid" },
                      { date: "Jan 15, 2026", amount: "$149.00", status: "Paid" },
                      { date: "Dec 15, 2025", amount: "$149.00", status: "Paid" },
                    ].map((invoice, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors animate-card-in cursor-pointer group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div>
                          <p className="text-sm font-medium">{invoice.date}</p>
                          <p className="text-xs text-muted-foreground">{invoice.amount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600 border-green-200">{invoice.status}</Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-6 animate-card-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Team Members</CardTitle>
                      <CardDescription>Manage your team and their permissions</CardDescription>
                    </div>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Users className="h-4 w-4 mr-1.5" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-200 animate-card-in group"
                        style={{ animationDelay: `${index * 75}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-semibold text-sm group-hover:scale-110 transition-transform duration-200">
                            {member.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{member.name}</p>
                              {member.status === "pending" && (
                                <Badge variant="outline" className="text-[10px]">Pending</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{member.role}</Badge>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data & Privacy Tab */}
          {activeTab === "data" && (
            <div className="space-y-6 animate-card-in">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <CardTitle className="text-base">Export Your Data</CardTitle>
                  </div>
                  <CardDescription>Download a copy of all your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export all your leads, lists, tasks, and activity history. The export will be sent to your email as a ZIP file.
                  </p>
                  <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
                    <Download className="h-4 w-4 mr-1.5" />
                    Request Data Export
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <CardTitle className="text-base text-destructive">Delete Account</CardTitle>
                  </div>
                  <CardDescription>Permanently delete your account and all data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. All your data will be permanently removed. Please be certain.
                  </p>
                  <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogHeader onClose={() => setInviteDialogOpen(false)}>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the email address of the person you want to invite to your team.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setInviteDialogOpen(false)}>
            <Mail className="h-4 w-4 mr-1.5" />
            Send Invite
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogHeader onClose={() => setExportDialogOpen(false)}>
          <DialogTitle>Export Your Data</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We&apos;ll prepare a ZIP file containing all your data and send it to <strong>{email}</strong>.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-medium">Export includes:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All leads and contact information</li>
                <li>• Custom lists and tags</li>
                <li>• Tasks and activity history</li>
                <li>• Pipeline data and notes</li>
              </ul>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setExportDialogOpen(false)}>
            <Download className="h-4 w-4 mr-1.5" />
            Start Export
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogHeader onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle className="text-destructive">Delete Account</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-medium">You will lose access to:</p>
              <ul className="text-sm text-destructive/80 mt-2 space-y-1">
                <li>• All {teamMembers.length} team members</li>
                <li>• All leads and contact data</li>
                <li>• Your subscription and billing history</li>
              </ul>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type &quot;DELETE&quot; to confirm</label>
              <Input placeholder="DELETE" />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete Forever
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
