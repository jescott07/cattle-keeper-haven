
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, Wrench, DollarSign, Calendar as CalendarIcon2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '@/lib/types';

interface PastureMaintenanceTrackerProps {
  pastureId: string;
}

const PastureMaintenanceTracker = ({ pastureId }: PastureMaintenanceTrackerProps) => {
  const { toast } = useToast();
  const maintenanceRecords = useStore(state => state.maintenanceRecords);
  const addMaintenanceRecord = useStore(state => state.addMaintenanceRecord);
  const completeMaintenanceRecord = useStore(state => state.completeMaintenanceRecord);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [pastureMaintenanceRecords, setPastureMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  
  // Form state
  const [type, setType] = useState<MaintenanceType>('fertilization');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  
  // Complete form state
  const [completedDate, setCompletedDate] = useState<Date>(new Date());
  const [completionNotes, setCompletionNotes] = useState('');
  
  // Update pastureMaintenanceRecords when maintenanceRecords changes
  useEffect(() => {
    const filteredRecords = maintenanceRecords
      .filter(record => record.pastureId === pastureId)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    
    setPastureMaintenanceRecords(filteredRecords);
  }, [maintenanceRecords, pastureId]);
  
  const resetForm = () => {
    setType('fertilization');
    setTitle('');
    setDescription('');
    setScheduledDate(new Date());
    setCost('');
    setNotes('');
  };
  
  const resetCompleteForm = () => {
    setCompletedDate(new Date());
    setCompletionNotes('');
  };
  
  const handleSubmit = () => {
    // Validate required fields
    if (!title || !scheduledDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Parse cost if provided
    let costValue: number | undefined = undefined;
    if (cost) {
      costValue = parseFloat(cost);
      if (isNaN(costValue) || costValue < 0) {
        toast({
          title: "Invalid cost",
          description: "Cost must be a positive number.",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Add maintenance record
    addMaintenanceRecord({
      pastureId,
      type,
      title,
      description: description.trim() || undefined,
      scheduledDate,
      status: 'scheduled',
      cost: costValue,
      notes: notes.trim() || undefined
    });
    
    toast({
      title: "Maintenance scheduled",
      description: "The maintenance task has been scheduled successfully."
    });
    
    resetForm();
    setDialogOpen(false);
  };
  
  const handleCompleteSubmit = () => {
    if (!selectedRecord) return;
    
    completeMaintenanceRecord(
      selectedRecord.id, 
      completedDate,
      completionNotes.trim() || undefined
    );
    
    toast({
      title: "Maintenance completed",
      description: "The maintenance task has been marked as completed."
    });
    
    resetCompleteForm();
    setCompleteDialogOpen(false);
    setSelectedRecord(null);
  };
  
  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-500"><Clock className="h-3 w-3" /> Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3" /> Completed</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-500"><XCircle className="h-3 w-3" /> Canceled</Badge>;
      default:
        return null;
    }
  };
  
  const getTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case 'fertilization':
        return <span className="emoji">🌱</span>;
      case 'weed-control':
        return <span className="emoji">🌿</span>;
      case 'fence-repair':
        return <span className="emoji">🔧</span>;
      case 'water-system':
        return <span className="emoji">💧</span>;
      case 'planting':
        return <span className="emoji">🌾</span>;
      case 'harvesting':
        return <span className="emoji">🚜</span>;
      default:
        return <span className="emoji">📝</span>;
    }
  };
  
  const groupedRecords = pastureMaintenanceRecords.reduce<Record<string, MaintenanceRecord[]>>((groups, record) => {
    // Group by status
    const status = record.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(record);
    return groups;
  }, {});
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Maintenance Tracker</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>
                Plan and track maintenance activities for this pasture.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Maintenance Type */}
              <div className="grid gap-2">
                <Label htmlFor="type">Maintenance Type*</Label>
                <Select value={type} onValueChange={(value) => setType(value as MaintenanceType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fertilization">Fertilization</SelectItem>
                    <SelectItem value="weed-control">Weed Control</SelectItem>
                    <SelectItem value="fence-repair">Fence Repair</SelectItem>
                    <SelectItem value="water-system">Water System Check/Repair</SelectItem>
                    <SelectItem value="planting">Planting/Reseeding</SelectItem>
                    <SelectItem value="harvesting">Harvesting/Mowing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for the maintenance task"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              {/* Scheduled Date */}
              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">Scheduled Date*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => date && setScheduledDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about the maintenance"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Estimated Cost */}
              <div className="grid gap-2">
                <Label htmlFor="cost">Estimated Cost (Optional)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cost"
                    className="pl-9"
                    placeholder="Enter estimated cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Schedule Maintenance</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Complete Maintenance Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Maintenance</DialogTitle>
            <DialogDescription>
              Mark this maintenance task as completed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Completion Date */}
            <div className="grid gap-2">
              <Label htmlFor="completedDate">Completion Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !completedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completedDate ? format(completedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={completedDate}
                    onSelect={(date) => date && setCompletedDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Completion Notes */}
            <div className="grid gap-2">
              <Label htmlFor="completionNotes">Completion Notes (Optional)</Label>
              <Textarea
                id="completionNotes"
                placeholder="Add any notes about the completed maintenance"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCompleteSubmit}>Mark as Completed</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Maintenance Records */}
      {pastureMaintenanceRecords.length > 0 ? (
        <div className="space-y-8">
          {/* Scheduled Maintenance */}
          {groupedRecords['scheduled'] && groupedRecords['scheduled'].length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scheduled Maintenance</h3>
              <div className="grid gap-4">
                {groupedRecords['scheduled'].map((record) => (
                  <Card key={record.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getTypeIcon(record.type)}
                          <span>{record.title}</span>
                        </CardTitle>
                        {getStatusBadge(record.status)}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <CalendarIcon2 className="h-3 w-3" />
                        Scheduled for {format(new Date(record.scheduledDate), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {record.description && (
                        <p className="text-sm mb-3">{record.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {record.cost !== undefined && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>Estimated cost: ${record.cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      {record.notes && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <div className="text-xs text-muted-foreground">Notes:</div>
                          <p>{record.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setSelectedRecord(record);
                            setCompleteDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark as Completed
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Completed Maintenance */}
          {groupedRecords['completed'] && groupedRecords['completed'].length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Completed Maintenance</h3>
              <div className="grid gap-4">
                {groupedRecords['completed'].map((record) => (
                  <Card key={record.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getTypeIcon(record.type)}
                          <span>{record.title}</span>
                        </CardTitle>
                        {getStatusBadge(record.status)}
                      </div>
                      <CardDescription className="flex flex-col space-y-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon2 className="h-3 w-3" />
                          Scheduled for {format(new Date(record.scheduledDate), "MMM d, yyyy")}
                        </span>
                        {record.completedDate && (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle className="h-3 w-3" />
                            Completed on {format(new Date(record.completedDate), "MMM d, yyyy")}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {record.description && (
                        <p className="text-sm mb-3">{record.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {record.cost !== undefined && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            <span>Cost: ${record.cost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      {record.notes && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <div className="text-xs text-muted-foreground">Notes:</div>
                          <p>{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Canceled Maintenance */}
          {groupedRecords['canceled'] && groupedRecords['canceled'].length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Canceled Maintenance</h3>
              <div className="grid gap-4">
                {groupedRecords['canceled'].map((record) => (
                  <Card key={record.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getTypeIcon(record.type)}
                          <span>{record.title}</span>
                        </CardTitle>
                        {getStatusBadge(record.status)}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <CalendarIcon2 className="h-3 w-3" />
                        Originally scheduled for {format(new Date(record.scheduledDate), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {record.description && (
                        <p className="text-sm mb-3">{record.description}</p>
                      )}
                      
                      {record.notes && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <div className="text-xs text-muted-foreground">Notes:</div>
                          <p>{record.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Wrench className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No maintenance records yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking pasture maintenance by scheduling your first task.
            </p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Schedule Maintenance
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PastureMaintenanceTracker;
