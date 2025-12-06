import { useState } from 'react';
import { useTenant } from '@/hooks/useTenant';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddStoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStoreModal({ open, onOpenChange }: AddStoreModalProps) {
  const { addTenant, isLoading } = useTenant();
  const [formData, setFormData] = useState({
    name: '',
    shopDomain: '',
    accessToken: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.shopDomain || !formData.accessToken) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addTenant({
        name: formData.name,
        shopDomain: formData.shopDomain,
        accessToken: formData.accessToken,
      });

      toast({
        title: 'Store added',
        description: `${formData.name} has been connected successfully.`,
      });

      setFormData({ name: '', shopDomain: '', accessToken: '' });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add store. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Shopify Store</DialogTitle>
          <DialogDescription>
            Add your Shopify store credentials to start syncing data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Store"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shopDomain">Shop Domain</Label>
              <Input
                id="shopDomain"
                placeholder="your-store.myshopify.com"
                value={formData.shopDomain}
                onChange={(e) =>
                  setFormData({ ...formData, shopDomain: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Your Shopify store URL (e.g., store-name.myshopify.com)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="shpat_xxxxxxxxxxxxx"
                value={formData.accessToken}
                onChange={(e) =>
                  setFormData({ ...formData, accessToken: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Get this from your Shopify Admin → Apps → Develop apps
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect Store
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
