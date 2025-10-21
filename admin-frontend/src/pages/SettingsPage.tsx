import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { profileApi } from "@/lib/api";
import {
  Save,
  Upload,
  User,
  Bell,
  Shield,
  Globe,
  Plus,
  FileText,
  FolderOpen,
} from "lucide-react";

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fname: user?.fname || "",
    lname: user?.lname || "",
    email: user?.email || "",
    number: user?.number || "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [notifications, setNotifications] = useState({
    emailArticles: true,
    emailComments: false,
    pushNotifications: true,
    weeklyDigest: true,
  });

  const [siteSettings, setSiteSettings] = useState({
    siteName: "News Platform",
    siteDescription: "Your trusted source for news and information",
    contactEmail: "contact@newsplatform.com",
    allowRegistrations: false,
    requireApproval: true,
  });

  const handleProfileSave = async () => {
    try {
      setIsLoading(true);

      // Only include fields that have been changed
      const updateData: any = {};
      if (profileData.fname !== user?.fname)
        updateData.fname = profileData.fname;
      if (profileData.lname !== user?.lname)
        updateData.lname = profileData.lname;
      if (profileData.email !== user?.email)
        updateData.email = profileData.email;
      if (profileData.number !== user?.number)
        updateData.number = profileData.number;

      // Only include password fields if new password is being set
      if (profileData.new_password) {
        updateData.current_password = profileData.current_password;
        updateData.new_password = profileData.new_password;
        updateData.new_password_confirmation =
          profileData.new_password_confirmation;
      }

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await profileApi.update(updateData);
        updateUser(response.data.user);

        // Reset password fields
        setProfileData((prev) => ({
          ...prev,
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        }));

        toast({
          title: "Success",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsSave = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };

  const handleSiteSettingsSave = () => {
    toast({
      title: "Site settings updated",
      description: "Site configuration has been saved successfully.",
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Avatar upload functionality will be implemented later
      toast({
        title: "Not implemented",
        description: "Avatar upload functionality will be added soon.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and platform settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Profile Settings</CardTitle>
                </div>
                <CardDescription>
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" alt={user?.name} />
                    <AvatarFallback className="text-lg">
                      {user?.fname?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Change Avatar
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fname">First Name</Label>
                    <Input
                      id="fname"
                      value={profileData.fname}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          fname: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lname">Last Name</Label>
                    <Input
                      id="lname"
                      value={profileData.lname}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          lname: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="number">Phone Number</Label>
                  <Input
                    id="number"
                    value={profileData.number}
                    onChange={(e) =>
                      setProfileData({ ...profileData, number: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Change Password</h3>
                  <div>
                    <Label htmlFor="current_password">Current Password</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={profileData.current_password}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          current_password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={profileData.new_password}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          new_password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="new_password_confirmation">
                      Confirm New Password
                    </Label>
                    <Input
                      id="new_password_confirmation"
                      type="password"
                      value={profileData.new_password_confirmation}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          new_password_confirmation: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleProfileSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-articles">
                      Email for new articles
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get notified when articles are published
                    </p>
                  </div>
                  <Switch
                    id="email-articles"
                    checked={notifications.emailArticles}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailArticles: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-comments">Email for comments</Label>
                    <p className="text-sm text-gray-600">
                      Get notified about new comments
                    </p>
                  </div>
                  <Switch
                    id="email-comments"
                    checked={notifications.emailComments}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailComments: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">
                      Push notifications
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-digest">Weekly digest</Label>
                    <p className="text-sm text-gray-600">
                      Receive a weekly summary email
                    </p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        weeklyDigest: checked,
                      })
                    }
                  />
                </div>

                <Button onClick={handleNotificationsSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Site Settings (Admin only) */}
            {user?.role === "admin" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <CardTitle>Site Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure global site settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input
                      id="site-name"
                      value={siteSettings.siteName}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          siteName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea
                      id="site-description"
                      value={siteSettings.siteDescription}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          siteDescription: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          contactEmail: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allow-registrations">
                        Allow new registrations
                      </Label>
                      <p className="text-sm text-gray-600">
                        Allow new users to register
                      </p>
                    </div>
                    <Switch
                      id="allow-registrations"
                      checked={siteSettings.allowRegistrations}
                      onCheckedChange={(checked) =>
                        setSiteSettings({
                          ...siteSettings,
                          allowRegistrations: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-approval">
                        Require admin approval
                      </Label>
                      <p className="text-sm text-gray-600">
                        New users need admin approval
                      </p>
                    </div>
                    <Switch
                      id="require-approval"
                      checked={siteSettings.requireApproval}
                      onCheckedChange={(checked) =>
                        setSiteSettings({
                          ...siteSettings,
                          requireApproval: checked,
                        })
                      }
                    />
                  </div>

                  <Button onClick={handleSiteSettingsSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Site Settings
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>Account Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-gray-600 capitalize">
                    {user?.role}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Member since</Label>
                  <p className="text-sm text-gray-600">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Articles published
                  </Label>
                  <p className="text-sm text-gray-600">
                    {user?.article_count || 0} articles
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/articles/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Article
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href="/articles">
                    <FileText className="h-4 w-4 mr-2" />
                    View My Articles
                  </a>
                </Button>
                {(user?.role === "editor" || user?.role === "admin") && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <a href="/categories">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Manage Categories
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
