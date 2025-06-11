import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, Upload, Mic, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const riskConfig = {
  baixo: { label: 'Baixo', color: 'bg-green-100 text-green-800', icon: ShieldCheck },
  médio: { label: 'Médio', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
  alto: { label: 'Alto', color: 'bg-red-100 text-red-800', icon: ShieldAlert },
};

export default function AnalysisHistory({ analyses, onDelete, isLoading }) {
  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle>Histórico de Análises</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-8 w-8 mx-auto rounded-full" /></TableCell>
                    </TableRow>
                ))
            ) : analyses.length > 0 ? (
              analyses.map((analysis) => {
                const config = riskConfig[analysis.risk_level];
                const Icon = config.icon;
                return (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">
                      {format(new Date(analysis.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {analysis.inputType === 'upload' ? <Upload className="w-4 h-4 text-slate-500"/> : <Mic className="w-4 h-4 text-slate-500"/>}
                        <span>{analysis.inputType === 'upload' ? 'Upload' : 'Gravação'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${config.color}`}>
                        <Icon className="w-3.5 h-3.5 mr-1"/>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{analysis.score.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => onDelete(analysis.id)}>
                        <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center h-24 text-slate-500">
                  Nenhuma análise realizada ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
Dependências necessárias (package.json)
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "lucide-react": "latest",
    "date-fns": "latest",
    "@/components/ui/button": "shadcn/ui",
    "@/components/ui/card": "shadcn/ui",
    "@/components/ui/table": "shadcn/ui",
    "@/components/ui/badge": "shadcn/ui",
    "@/components/ui/alert": "shadcn/ui",
    "@/components/ui/skeleton": "shadcn/ui"
  }
}
