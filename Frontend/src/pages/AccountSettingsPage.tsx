import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Mail, Lock } from "lucide-react";

export function AccountSettings() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your profile information. No password confirmation required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="space-y-3">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Change Photo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Remove Photo
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="johndoe" 
                defaultValue="johndoe"
              />
              <p className="text-sm text-muted-foreground">
                This is your public display name.
              </p>
            </div>

            {/* Save Button */}
            <Button className="w-full">
              Save Profile Changes
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Update your email and password. Password confirmation required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                placeholder="Enter your current password"
              />
              <p className="text-sm text-muted-foreground">
                Required to make security changes.
              </p>
            </div>

            <Separator />

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                defaultValue="john@example.com"
              />
            </div>

            {/* New Password */}
            <div className="space-y-4">
              <Label>Change Password</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-password" className="text-sm">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-sm">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Leave blank to keep current password.
              </p>
            </div>

            {/* Save Button */}
            <Button className="w-full" variant="destructive">
              Update Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="gap-2">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
