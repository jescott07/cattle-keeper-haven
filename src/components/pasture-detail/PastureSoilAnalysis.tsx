
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Plus, TestTube, Beaker } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { SoilAnalysis } from '@/lib/types';

interface PastureSoilAnalysisProps {
  pastureId: string;
}

const PastureSoilAnalysis = ({ pastureId }: PastureSoilAnalysisProps) => {
  const { toast } = useToast();
  const soilAnalyses = useStore(state => state.soilAnalyses);
  const addSoilAnalysis = useStore(state => state.addSoilAnalysis);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pastureSoilAnalyses, setPastureSoilAnalyses] = useState<SoilAnalysis[]>([]);
  
  // Form state
  const [date, setDate] = useState<Date>(new Date());
  const [labName, setLabName] = useState('');
  const [phLevel, setPhLevel] = useState('');
  const [organicMatter, setOrganicMatter] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [calcium, setCalcium] = useState('');
  const [magnesium, setMagnesium] = useState('');
  const [sulfur, setSulfur] = useState('');
  const [zinc, setZinc] = useState('');
  const [copper, setCopper] = useState('');
  const [manganese, setManganese] = useState('');
  const [clayContent, setClayContent] = useState('');
  const [sandContent, setSandContent] = useState('');
  const [siltContent, setSiltContent] = useState('');
  const [cec, setCec] = useState('');
  const [baseSaturation, setBaseSaturation] = useState('');
  const [notes, setNotes] = useState('');
  
  // Update pastureSoilAnalyses when soilAnalyses changes
  useEffect(() => {
    const filteredAnalyses = soilAnalyses
      .filter(analysis => analysis.pastureId === pastureId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setPastureSoilAnalyses(filteredAnalyses);
  }, [soilAnalyses, pastureId]);
  
  const resetForm = () => {
    setDate(new Date());
    setLabName('');
    setPhLevel('');
    setOrganicMatter('');
    setPhosphorus('');
    setPotassium('');
    setCalcium('');
    setMagnesium('');
    setSulfur('');
    setZinc('');
    setCopper('');
    setManganese('');
    setClayContent('');
    setSandContent('');
    setSiltContent('');
    setCec('');
    setBaseSaturation('');
    setNotes('');
  };
  
  const handleSubmit = () => {
    // Validate required fields
    if (!labName || !phLevel || !organicMatter || !phosphorus || !potassium || !calcium || !magnesium || !sulfur) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields marked with *.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate numeric fields
    const numericFields = [
      { name: 'pH Level', value: phLevel },
      { name: 'Organic Matter', value: organicMatter },
      { name: 'Phosphorus', value: phosphorus },
      { name: 'Potassium', value: potassium },
      { name: 'Calcium', value: calcium },
      { name: 'Magnesium', value: magnesium },
      { name: 'Sulfur', value: sulfur }
    ];
    
    for (const field of numericFields) {
      const numValue = parseFloat(field.value);
      if (isNaN(numValue) || numValue < 0) {
        toast({
          title: "Invalid value",
          description: `${field.name} must be a positive number.`,
          variant: "destructive"
        });
        return;
      }
    }
    
    // Parse optional numeric fields
    const parseOptionalNumber = (value: string) => {
      if (!value) return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    };
    
    // Add soil analysis
    addSoilAnalysis({
      pastureId,
      date,
      labName,
      phLevel: parseFloat(phLevel),
      organicMatter: parseFloat(organicMatter),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      calcium: parseFloat(calcium),
      magnesium: parseFloat(magnesium),
      sulfur: parseFloat(sulfur),
      zinc: parseOptionalNumber(zinc),
      copper: parseOptionalNumber(copper),
      manganese: parseOptionalNumber(manganese),
      clayContent: parseOptionalNumber(clayContent),
      sandContent: parseOptionalNumber(sandContent),
      siltContent: parseOptionalNumber(siltContent),
      cec: parseOptionalNumber(cec),
      baseSaturation: parseOptionalNumber(baseSaturation),
      notes: notes.trim() || undefined
    });
    
    toast({
      title: "Soil analysis added",
      description: "The soil analysis has been recorded successfully."
    });
    
    resetForm();
    setDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Soil Analysis</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Soil Analysis
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Soil Analysis</DialogTitle>
              <DialogDescription>
                Record the results of soil testing for this pasture.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Analysis Date and Lab */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Analysis Date*</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="labName">Laboratory Name*</Label>
                  <Input
                    id="labName"
                    placeholder="Enter lab name"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Chemical Properties */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">CHEMICAL PROPERTIES</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phLevel">pH Level*</Label>
                    <Input
                      id="phLevel"
                      placeholder="e.g., 6.5"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={phLevel}
                      onChange={(e) => setPhLevel(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="organicMatter">Organic Matter (%)*</Label>
                    <Input
                      id="organicMatter"
                      placeholder="e.g., 3.5"
                      type="number"
                      step="0.1"
                      min="0"
                      value={organicMatter}
                      onChange={(e) => setOrganicMatter(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phosphorus">Phosphorus (ppm)*</Label>
                    <Input
                      id="phosphorus"
                      placeholder="e.g., 45"
                      type="number"
                      step="1"
                      min="0"
                      value={phosphorus}
                      onChange={(e) => setPhosphorus(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="potassium">Potassium (ppm)*</Label>
                    <Input
                      id="potassium"
                      placeholder="e.g., 200"
                      type="number"
                      step="1"
                      min="0"
                      value={potassium}
                      onChange={(e) => setPotassium(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="calcium">Calcium (ppm)*</Label>
                    <Input
                      id="calcium"
                      placeholder="e.g., 1200"
                      type="number"
                      step="1"
                      min="0"
                      value={calcium}
                      onChange={(e) => setCalcium(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="magnesium">Magnesium (ppm)*</Label>
                    <Input
                      id="magnesium"
                      placeholder="e.g., 150"
                      type="number"
                      step="1"
                      min="0"
                      value={magnesium}
                      onChange={(e) => setMagnesium(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="sulfur">Sulfur (ppm)*</Label>
                    <Input
                      id="sulfur"
                      placeholder="e.g., 12"
                      type="number"
                      step="1"
                      min="0"
                      value={sulfur}
                      onChange={(e) => setSulfur(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Micronutrients */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">MICRONUTRIENTS (OPTIONAL)</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="zinc">Zinc (ppm)</Label>
                    <Input
                      id="zinc"
                      placeholder="e.g., 2.5"
                      type="number"
                      step="0.1"
                      min="0"
                      value={zinc}
                      onChange={(e) => setZinc(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="copper">Copper (ppm)</Label>
                    <Input
                      id="copper"
                      placeholder="e.g., 1.2"
                      type="number"
                      step="0.1"
                      min="0"
                      value={copper}
                      onChange={(e) => setCopper(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="manganese">Manganese (ppm)</Label>
                    <Input
                      id="manganese"
                      placeholder="e.g., 15"
                      type="number"
                      step="0.1"
                      min="0"
                      value={manganese}
                      onChange={(e) => setManganese(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Physical Properties */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">PHYSICAL PROPERTIES (OPTIONAL)</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="clayContent">Clay Content (%)</Label>
                    <Input
                      id="clayContent"
                      placeholder="e.g., 30"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={clayContent}
                      onChange={(e) => setClayContent(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="sandContent">Sand Content (%)</Label>
                    <Input
                      id="sandContent"
                      placeholder="e.g., 40"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={sandContent}
                      onChange={(e) => setSandContent(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="siltContent">Silt Content (%)</Label>
                    <Input
                      id="siltContent"
                      placeholder="e.g., 30"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={siltContent}
                      onChange={(e) => setSiltContent(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cec">CEC</Label>
                    <Input
                      id="cec"
                      placeholder="e.g., 15"
                      type="number"
                      step="0.1"
                      min="0"
                      value={cec}
                      onChange={(e) => setCec(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="baseSaturation">Base Saturation (%)</Label>
                    <Input
                      id="baseSaturation"
                      placeholder="e.g., 80"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={baseSaturation}
                      onChange={(e) => setBaseSaturation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              <div className="border-t pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional observations or recommendations"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Analysis</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Soil Analyses List */}
      {pastureSoilAnalyses.length > 0 ? (
        <div className="grid gap-6">
          {pastureSoilAnalyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Analysis from {format(new Date(analysis.date), "MMM d, yyyy")} • {analysis.labName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chemical Properties */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Chemical Properties</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">pH Level</div>
                        <div className="font-medium">{analysis.phLevel.toFixed(1)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Organic Matter</div>
                        <div className="font-medium">{analysis.organicMatter.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Phosphorus</div>
                        <div className="font-medium">{analysis.phosphorus} ppm</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Potassium</div>
                        <div className="font-medium">{analysis.potassium} ppm</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Calcium</div>
                        <div className="font-medium">{analysis.calcium} ppm</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Magnesium</div>
                        <div className="font-medium">{analysis.magnesium} ppm</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Sulfur</div>
                        <div className="font-medium">{analysis.sulfur} ppm</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Micronutrients, if any */}
                  {(analysis.zinc !== undefined || analysis.copper !== undefined || analysis.manganese !== undefined) && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Micronutrients</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {analysis.zinc !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">Zinc</div>
                            <div className="font-medium">{analysis.zinc.toFixed(1)} ppm</div>
                          </div>
                        )}
                        {analysis.copper !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">Copper</div>
                            <div className="font-medium">{analysis.copper.toFixed(1)} ppm</div>
                          </div>
                        )}
                        {analysis.manganese !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">Manganese</div>
                            <div className="font-medium">{analysis.manganese.toFixed(1)} ppm</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Physical Properties, if any */}
                  {(analysis.clayContent !== undefined || analysis.sandContent !== undefined || 
                    analysis.siltContent !== undefined || analysis.cec !== undefined || 
                    analysis.baseSaturation !== undefined) && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Physical Properties</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {analysis.clayContent !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">Clay Content</div>
                            <div className="font-medium">{analysis.clayContent.toFixed(1)}%</div>
                          </div>
                        )}
                        {analysis.sandContent !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">Sand Content</div>
                            <div className="font-medium">{analysis.sandContent.toFixed(1)}%</div>
                          </div>
                        )}
                        {analysis.siltContent !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">Silt Content</div>
                            <div className="font-medium">{analysis.siltContent.toFixed(1)}%</div>
                          </div>
                        )}
                        {analysis.cec !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">CEC</div>
                            <div className="font-medium">{analysis.cec.toFixed(1)}</div>
                          </div>
                        )}
                        {analysis.baseSaturation !== undefined && (
                          <div>
                            <div className="text-xs text-muted-foreground">Base Saturation</div>
                            <div className="font-medium">{analysis.baseSaturation.toFixed(1)}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Notes, if any */}
                  {analysis.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                      <p className="text-sm">{analysis.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Beaker className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No soil analyses yet</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking soil health by adding your first analysis.
            </p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add First Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PastureSoilAnalysis;
