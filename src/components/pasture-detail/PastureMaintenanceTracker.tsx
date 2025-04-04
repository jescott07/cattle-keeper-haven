import { useState } from 'react';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface PastureMaintenanceTrackerProps {
  pastureId: string;
}

export function PastureMaintenanceTracker({ pastureId }: PastureMaintenanceTrackerProps) {
  const { toast } = useToast();
  const maintenanceRecords = useStore((state) => 
    state.maintenanceRecords.filter(record => record.pastureId === pastureId)
  );
  const addMaintenanceRecord = useStore((state) => state.addMaintenanceRecord);
  const updateMaintenanceRecord = useStore((state) => state.updateMaintenanceRecord);
  const removeMaintenanceRecord = useStore((state) => state.removeMaintenanceRecord);
  const completeMaintenanceRecord = useStore((state) => state.completeMaintenanceRecord);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaintenanceType>('fertilization');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [cost, setCost] = useState<number | undefined>();
  
  const [completedDate, setCompletedDate] = useState<Date | undefined>(new Date());
  const [completionNotes, setCompletionNotes] = useState('');
  
  const handleAddRecord = () => {
    if (!title || !scheduledDate) {
      toast({
        title: "Error",
        description: "Please provide a title and scheduled date",
        variant: "destructive"
      });
      return;
    }
    
    const newRecord = {
      pastureId,
      title,
      type,
      description,
      scheduledDate,
      status: 'scheduled' as MaintenanceStatus,
      cost
    };
    
    addMaintenanceRecord(newRecord);
    resetForm();
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Maintenance record added"
    });
  };
  
  const handleCompleteRecord = () => {
    if (!selectedRecord || !completedDate) {
      toast({
        title: "Error",
        description: "Please provide a completion date",
        variant: "destructive"
      });
      return;
    }
    
    completeMaintenanceRecord(selectedRecord.id, completedDate, completionNotes);
    resetCompletionForm();
    setIsCompleteDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Maintenance record marked as completed"
    });
  };
  
  const openCompleteDialog = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setCompletedDate(new Date());
    setCompletionNotes('');
    setIsCompleteDialogOpen(true);
  };
  
  const resetForm = () => {
    setTitle('');
    setType('fertilization');
    setDescription('');
    setScheduledDate(new Date());
    setCost(undefined);
  };
  
  const resetCompletionForm = () => {
    setSelectedRecord(null);
    setCompletedDate(new Date());
    setCompletionNotes('');
  };
  
  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Canceled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Maintenance Schedule</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Maintenance</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>
                Add a new maintenance task for this pasture.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Spring Fertilization"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as MaintenanceType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fertilization">Fertilization</SelectItem>
                    <SelectItem value="weed-control">Weed Control</SelectItem>
                    <SelectItem value="fence-repair">Fence Repair</SelectItem>
                    <SelectItem value="water-system">Water System</SelectItem>
                    <SelectItem value="planting">Planting</SelectItem>
                    <SelectItem value="harvesting">Harvesting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the maintenance task"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cost">Estimated Cost (Optional)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={cost || ''}
                  onChange={(e) => setCost(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddRecord}>Add Maintenance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {maintenanceRecords.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell>{record.type.replace('-', ' ')}</TableCell>
                  <TableCell>{format(new Date(record.scheduledDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                    {record.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCompleteDialog(record)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No maintenance records found.</p>
            <p className="text-muted-foreground">
              Schedule maintenance tasks to keep track of pasture upkeep.
            </p>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Maintenance Task</DialogTitle>
            <DialogDescription>
              Mark this maintenance task as completed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedRecord && (
              <p>
                <span className="font-semibold">Task:</span> {selectedRecord.title}
              </p>
            )}
            
            <div className="grid gap-2">
              <Label>Completion Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {completedDate ? format(completedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={completedDate}
                    onSelect={setCompletedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="completion-notes">Notes (Optional)</Label>
              <Textarea
                id="completion-notes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about the completed task"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCompleteRecord}>Mark as Completed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
