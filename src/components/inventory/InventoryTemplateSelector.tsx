
import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InventoryItem } from '@/lib/types';
import { useStore } from '@/lib/store';

interface InventoryTemplateSelectorProps {
  selectedTemplate: InventoryItem | null;
  onSelectTemplate: (template: InventoryItem) => void;
}

export function InventoryTemplateSelector({ 
  selectedTemplate, 
  onSelectTemplate 
}: InventoryTemplateSelectorProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const templates = useStore(state => state.inventoryTemplates);

  return (
    <div className="space-y-2">
      <Label>Select Item Template</Label>
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between items-center">
            <span>{selectedTemplate ? selectedTemplate.name : 'Select Template'}</span>
            <Search className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Item Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            {templates.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium">No templates yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a template by filling out the manual form and clicking "Save as Template"
                </p>
              </div>
            )}
            <div className="grid gap-2 py-2">
              {templates.map(template => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    onSelectTemplate(template);
                    setShowTemplateDialog(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge>{template.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {template.properties?.length || 0} properties
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
