
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { HealthRecordType, ApplicationRoute } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const healthRecordSchema = z.object({
  lotId: z.string().min(1, { message: 'Selecione um lote' }),
  date: z.date({ required_error: 'Selecione uma data' }),
  type: z.enum(['vaccination', 'medication', 'examination', 'surgery', 'other'], {
    required_error: 'Selecione um tipo',
  }),
  title: z.string().min(2, { message: 'Informe um título com pelo menos 2 caracteres' }),
  description: z.string().optional(),
  applicationRoute: z.enum(['oral', 'injection', 'topical', 'intravenous', 'other']).optional(),
  medicationId: z.string().optional(),
  dosage: z.number().optional(),
  dosageUnit: z.string().optional(),
  appliedToAll: z.boolean().default(false),
  numberOfAnimals: z.number().int().optional(),
  technician: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.date().optional(),
});

type HealthRecordFormValues = z.infer<typeof healthRecordSchema>;

interface AddHealthRecordFormProps {
  onComplete: () => void;
}

const AddHealthRecordForm: React.FC<AddHealthRecordFormProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const lots = useStore((state) => state.lots);
  const inventory = useStore((state) => state.inventory.filter(i => 
    i.type === 'medication' || i.type === 'other'
  ));
  const addHealthRecord = useStore((state) => state.addHealthRecord);

  const form = useForm<HealthRecordFormValues>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      date: new Date(),
      appliedToAll: false,
    },
  });

  const watchType = form.watch('type');
  const watchLotId = form.watch('lotId');
  const watchAppliedToAll = form.watch('appliedToAll');

  const selectedLot = lots.find(lot => lot.id === watchLotId);

  const onSubmit = (data: HealthRecordFormValues) => {
    const newHealthRecord = {
      id: uuidv4(),
      ...data,
      numberOfAnimals: data.appliedToAll ? 
        (selectedLot?.numberOfAnimals || 0) : 
        (data.numberOfAnimals || 0),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending' as const,
      followUpCompleted: false,
    };

    addHealthRecord(newHealthRecord);
    
    toast({
      title: "Registro de saúde criado",
      description: `${newHealthRecord.title} adicionado com sucesso.`,
    });
    
    onComplete();
  };

  const getApplicationRouteLabel = (route: ApplicationRoute) => {
    switch (route) {
      case 'oral': return 'Via Oral';
      case 'injection': return 'Injeção';
      case 'topical': return 'Tópico';
      case 'intravenous': return 'Intravenoso';
      default: return 'Outro';
    }
  };

  const recordTypeLabels: Record<HealthRecordType, string> = {
    'vaccination': 'Vacinação',
    'medication': 'Medicação',
    'examination': 'Exame',
    'surgery': 'Cirurgia',
    'other': 'Outro'
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="lotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lote</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um lote" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {lots.map((lot) => (
                      <SelectItem key={lot.id} value={lot.id}>
                        {lot.name} ({lot.numberOfAnimals} animais)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Procedimento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(recordTypeLabels) as HealthRecordType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {recordTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Vacinação contra Febre Aftosa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(watchType === 'vaccination' || watchType === 'medication') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="medicationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamento/Vacina</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventory.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.quantity} {item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicationRoute"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Via de Aplicação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a via" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['oral', 'injection', 'topical', 'intravenous', 'other'] as ApplicationRoute[]).map((route) => (
                        <SelectItem key={route} value={route}>
                          {getApplicationRouteLabel(route)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {(watchType === 'vaccination' || watchType === 'medication') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosagem</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ex: 5" 
                      {...field} 
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dosageUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade de Dosagem</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: ml, mg, g" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              control={form.control}
              name="appliedToAll"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Aplicado a todos os animais do lote
                    </FormLabel>
                    <FormDescription>
                      Marque esta opção se o procedimento foi aplicado a todos os animais do lote
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {!watchAppliedToAll && selectedLot && (
            <FormField
              control={form.control}
              name="numberOfAnimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Animais</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={`Máximo: ${selectedLot.numberOfAnimals}`}
                      max={selectedLot.numberOfAnimals}
                      {...field} 
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Quantidade máxima: {selectedLot.numberOfAnimals} animais
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="technician"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Técnico/Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Nome do técnico ou veterinário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva detalhes do procedimento" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="followUpDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Acompanhamento (opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className="w-full pl-3 text-left font-normal"
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data para acompanhamento</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Data para acompanhamento ou para nova aplicação
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações adicionais" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-1">
            <Check size={16} />
            Salvar Registro
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddHealthRecordForm;
