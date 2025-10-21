import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Plus, Trash2, Save, RefreshCw } from "lucide-react";

interface BreakingNewsSettings {
  use_manual_news: boolean;
  manual_news: string[];
  use_newsapi: boolean;
  use_newsdata: boolean;
}

const BreakingNewsPage: React.FC = () => {
  const [settings, setSettings] = useState<BreakingNewsSettings>({
    use_manual_news: false,
    manual_news: [],
    use_newsapi: true,
    use_newsdata: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHeadline, setNewHeadline] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/breaking-news/settings");
      setSettings(response.data.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast({
        title: "Error",
        description: "Failed to load breaking news settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.post("/breaking-news/settings", settings);
      toast({
        title: "Success",
        description: "Breaking news settings updated successfully",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save breaking news settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addHeadline = () => {
    if (newHeadline.trim()) {
      setSettings((prev) => ({
        ...prev,
        manual_news: [...prev.manual_news, newHeadline.trim()],
      }));
      setNewHeadline("");
    }
  };

  const removeHeadline = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      manual_news: prev.manual_news.filter((_, i) => i !== index),
    }));
  };

  const updateHeadline = (index: number, value: string) => {
    setSettings((prev) => ({
      ...prev,
      manual_news: prev.manual_news.map((headline, i) =>
        i === index ? value : headline
      ),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addHeadline();
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Breaking News Management</h1>
            <p className="text-gray-600 mt-2">
              Configure breaking news sources and manage manual headlines
            </p>
          </div>
          <Button onClick={fetchSettings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual News Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Manual News Mode
                <Badge
                  variant={settings.use_manual_news ? "default" : "secondary"}
                >
                  {settings.use_manual_news ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="manual-mode"
                  checked={settings.use_manual_news}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      use_manual_news: checked,
                    }))
                  }
                />
                <Label htmlFor="manual-mode">
                  Use manual breaking news headlines
                </Label>
              </div>

              {settings.use_manual_news && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <Label>Add New Headline</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newHeadline}
                        onChange={(e) => setNewHeadline(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter breaking news headline..."
                        className="flex-1"
                      />
                      <Button onClick={addHeadline} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Manual Headlines ({settings.manual_news.length})
                    </Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {settings.manual_news.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          No manual headlines added yet
                        </p>
                      ) : (
                        settings.manual_news.map((headline, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 border rounded"
                          >
                            <Input
                              value={headline}
                              onChange={(e) =>
                                updateHeadline(index, e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button
                              onClick={() => removeHeadline(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle>External API Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsapi">NewsAPI</Label>
                    <p className="text-sm text-gray-500">
                      Fetch headlines from NewsAPI
                    </p>
                  </div>
                  <Switch
                    id="newsapi"
                    checked={settings.use_newsapi}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, use_newsapi: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsdata">NewsData.io</Label>
                    <p className="text-sm text-gray-500">
                      Fetch headlines from NewsData.io (fallback)
                    </p>
                  </div>
                  <Switch
                    id="newsdata"
                    checked={settings.use_newsdata}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        use_newsdata: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Priority Order</Label>
                <div className="text-sm text-gray-600 space-y-1">
                  {settings.use_manual_news && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">1</Badge>
                      <span>Manual Headlines</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {settings.use_manual_news ? "2" : "1"}
                    </Badge>
                    <span>Cached News (1 hour)</span>
                  </div>
                  {settings.use_newsapi && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {settings.use_manual_news ? "3" : "2"}
                      </Badge>
                      <span>NewsAPI</span>
                    </div>
                  )}
                  {settings.use_newsdata && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {settings.use_manual_news
                          ? settings.use_newsapi
                            ? "4"
                            : "3"
                          : settings.use_newsapi
                          ? "3"
                          : "2"}
                      </Badge>
                      <span>NewsData.io</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {settings.use_manual_news
                        ? settings.use_newsapi && settings.use_newsdata
                          ? "5"
                          : "4"
                        : settings.use_newsapi && settings.use_newsdata
                        ? "4"
                        : "3"}
                    </Badge>
                    <span>Fallback Headlines</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BreakingNewsPage;
