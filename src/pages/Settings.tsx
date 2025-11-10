import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DepositModal } from "@/components/DepositModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const { user } = useAuth();

  const handleDepositClick = () => {
    setDepositModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onDepositClick={handleDepositClick} />

      <div className="container mx-auto px-4 md:px-6 py-8 flex-1">
        <div className="grid grid-cols-[240px_1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="space-y-1">
            <button className="w-full text-left px-4 py-2 rounded-lg bg-secondary text-foreground font-medium">
              Profile
            </button>
          </aside>

          {/* Main Content */}
          <main className="max-w-2xl">
            <h1 className="text-2xl font-semibold mb-8">Profile Settings</h1>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl">
                    {user?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  className="bg-background"
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-muted-foreground">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  defaultValue={user?.username}
                  className="bg-background"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm text-muted-foreground">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Bio"
                  className="bg-background min-h-[100px]"
                />
              </div>

              {/* Social Connections */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Social Connections</Label>
                <Button variant="outline" size="sm">
                  Connect X
                </Button>
              </div>

              {/* Save Button */}
              <Button className="mt-6">Save changes</Button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
      <DepositModal open={depositModalOpen} onOpenChange={setDepositModalOpen} />
    </div>
  );
};

export default Settings;
