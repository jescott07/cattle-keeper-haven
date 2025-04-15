
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimalHealthRecord } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { 
  Syringe, 
  Pill, 
  Stethoscope, 
  Scissors, 
  FileQuestion 
} from 'lucide-react';

interface HealthRecordsListProps {
  records: AnimalHealthRecord[];
}

const HealthRecordsList: React.FC<HealthRecordsListProps> = ({ records }) => {
  const lots = useStore((state) => state.lots);
  const inventory = useStore((state) => state.inventory);

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return <Syringe className="h-4 w-4 text-green-500" />;
      case 'medication':
        return <Pill className="h-4 w-4 text-blue-500" />;
      case 'examination':
        return <Stethoscope className="h-4 w-4 text-purple-500" />;
      case 'surgery':
        return <Scissors className="h-4 w-4 text-red-500" />;
      default:
        return <FileQuestion className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vaccination': return 'Vacinação';
      case 'medication': return 'Medicação';
      case 'examination': return 'Exame';
      case 'surgery': return 'Cirurgia';
      default: return 'Outro';
    }
  };

  const getLotName = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    return lot ? lot.name : 'Lote não encontrado';
  };

  const getMedicationName = (medicationId?: string) => {
    if (!medicationId) return '-';
    const medication = inventory.find(item => item.id === medicationId);
    return medication ? medication.name : 'Medicamento não encontrado';
  };

  if (records.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum registro de saúde encontrado</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Medicamento</TableHead>
            <TableHead>Animais</TableHead>
            <TableHead>Técnico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                {format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getRecordTypeIcon(record.type)}
                  {getTypeLabel(record.type)}
                </div>
              </TableCell>
              <TableCell>{record.title}</TableCell>
              <TableCell>{getLotName(record.lotId)}</TableCell>
              <TableCell>{getMedicationName(record.medicationId)}</TableCell>
              <TableCell>
                {record.appliedToAll ? (
                  <Badge variant="secondary">Todos</Badge>
                ) : (
                  record.numberOfAnimals
                )}
              </TableCell>
              <TableCell>{record.technician || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HealthRecordsList;
