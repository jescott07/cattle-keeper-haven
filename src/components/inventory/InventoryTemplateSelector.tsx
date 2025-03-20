
import { useState } from 'react';
import { Search, Package, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InventoryItem, InventoryItemTemplate } from '@/lib/types';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface InventoryTemplateSelectorProps {
  selectedTemplate: InventoryItemTemplate | null;
  onSelectTemplate: (template: InventoryItemTemplate) => void;
  onEditTemplate?: (template: InventoryItemTemplate) => void;
}

export function InventoryTemplateSelector({ 
  selectedTemplate, 
  onSelectTemplate,
  onEditTemplate
}: InventoryTemplateSelectorProps) {
  const { toast } = useToast();
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const templates = useStore(state => state.inventoryTemplates);
  const removeInventoryTemplate = useStore(state => state.removeInventoryTemplate);

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeInventoryTemplate(id);
    toast({
      title: "Template deleted",
      description: "The template has been removed"
    });
  };
  
  return (
    <div className="space-y-2">
      <Label>Select Template</Label>
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full flex justify-between items-center">
            <span>{selectedTemplate ? selectedTemplate.name : 'Select Template'}</span>
            <Search className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            {templates.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium">No templates yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a template by clicking the "Add Template" button
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
                      <div className="flex items-center gap-2">
                        <Badge>{template.type}</Badge>
                        {onEditTemplate && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTemplate(template);
                              setShowTemplateDialog(false);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                        >
                          <span className="sr-only">Delete</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="h-4 w-4"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>
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
