
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import { PageHeader } from '@/components/ui/page-header';
import AddHealthRecordForm from '@/components/animal-health/AddHealthRecordForm';
import HealthRecordsList from '@/components/animal-health/HealthRecordsList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, FilePlus, Filter, Syringe } from 'lucide-react';

const AnimalHealth = () => {
  const [showForm, setShowForm] = useState(false);
  const healthRecords = useStore((state) => state.healthRecords || []);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <Navbar />
        <div className="mb-8">
          <PageHeader
            heading="Controle de Sanidade Animal"
            subheading="Registre e acompanhe vacinações, medicações e outros procedimentos de saúde"
            icon={<Syringe className="h-8 w-8 text-primary" />}
            className="mb-4"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <Button onClick={toggleForm} className="flex items-center gap-2">
              <FilePlus size={18} />
              {showForm ? "Cancelar Registro" : "Novo Registro de Saúde"}
            </Button>
          </div>

          {showForm && (
            <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Novo Registro de Saúde Animal</h2>
              <AddHealthRecordForm onComplete={() => setShowForm(false)} />
            </div>
          )}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos Registros</TabsTrigger>
              <TabsTrigger value="vaccinations">Vacinações</TabsTrigger>
              <TabsTrigger value="medications">Medicações</TabsTrigger>
              <TabsTrigger value="examinations">Exames</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <HealthRecordsList records={healthRecords} />
            </TabsContent>
            <TabsContent value="vaccinations">
              <HealthRecordsList 
                records={healthRecords.filter(record => record.type === 'vaccination')} 
              />
            </TabsContent>
            <TabsContent value="medications">
              <HealthRecordsList 
                records={healthRecords.filter(record => record.type === 'medication')} 
              />
            </TabsContent>
            <TabsContent value="examinations">
              <HealthRecordsList 
                records={healthRecords.filter(record => record.type === 'examination')} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AnimalHealth;
