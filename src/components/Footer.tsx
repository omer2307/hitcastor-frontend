import { Globe, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export const Footer = () => {
  return <footer className="border-t bg-background mt-auto">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="https://x.com/hitcastor" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            
          </a>
          <Link to="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <Link to="/docs" className="hover:text-primary transition-colors">
            Docs
          </Link>
          <Link to="/support" className="hover:text-primary transition-colors">
            Support
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Globe className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>;
};