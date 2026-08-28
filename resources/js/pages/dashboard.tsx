import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { 
    Card, 
    CardContent, 
    CardDescription, 
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
import { Badge } from '@/components/ui/badge';
import { 
    Activity, 
    DollarSign, 
    Scissors, 
    Users, 
    TrendingUp 
} from 'lucide-react';

// Tipagem simulando as props vindas do Controller Laravel
interface DashboardProps {
    stats?: {
        mrr: string;
        activeTenants: number;
        newSignups: number;
        totalAppointments: number;
    };
    recentTenants?: Array<{
        id: string;
        name: string;
        plan: string;
        status: 'active' | 'trial' | 'inactive';
        createdAt: string;
    }>;
}

export default function Dashboard({ stats, recentTenants }: DashboardProps) {
    // Dados de fallback caso as props ainda não estejam vindo do backend
    const currentStats = stats || {
        mrr: 'R$ 4.250,00',
        activeTenants: 32,
        newSignups: 12,
        totalAppointments: 12450,
    };

    const tenants = recentTenants || [
        { id: '1', name: 'Barbearia do Zé', plan: 'Pro', status: 'active', createdAt: 'Hoje' },
        { id: '2', name: 'Vintage Barber', plan: 'Starter', status: 'trial', createdAt: 'Ontem' },
        { id: '3', name: 'Corte Fino', plan: 'Premium', status: 'active', createdAt: '2 dias atrás' },
        { id: '4', name: 'Navalha de Ouro', plan: 'Starter', status: 'inactive', createdAt: '5 dias atrás' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Ativo</Badge>;
            case 'trial': return <Badge variant="outline" className="text-blue-500">Período de Teste</Badge>;
            case 'inactive': return <Badge variant="destructive">Inativo</Badge>;
            default: return <Badge variant="secondary">Desconhecido</Badge>;
        }
    };

    return (
        <>
            <Head title="Dashboard Central" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Visão Geral da Plataforma</h2>
                </div>

                {/* Top Metrics Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receita Recorrente (MRR)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currentStats.mrr}</div>
                            <p className="text-xs text-muted-foreground">
                                +15% em relação ao mês passado
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Barbearias Ativas</CardTitle>
                            <Scissors className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currentStats.activeTenants}</div>
                            <p className="text-xs text-muted-foreground">
                                +4 novos inquilinos esta semana
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Novas Assinaturas</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{currentStats.newSignups}</div>
                            <p className="text-xs text-muted-foreground">
                                Cadastros nos últimos 30 dias
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Agendamentos Globais</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currentStats.totalAppointments.toLocaleString('pt-BR')}</div>
                            <p className="text-xs text-muted-foreground">
                                Volume total processado na plataforma
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section: Tables and Charts */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                    
                    {/* Recent Signups Table */}
                    <Card className="col-span-4 border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Inquilinos Recentes</CardTitle>
                            <CardDescription>
                                Últimas barbearias cadastradas na plataforma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='relative  w-full overflow-auto rounded-md border'>
                                <Table>
                                    <TableHeader className="sticky top-0 z-10">
                                        <TableRow>
                                            <TableHead>Barbearia</TableHead>
                                            <TableHead>Plano</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Cadastro</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tenants.map((tenant) => (
                                            <TableRow key={tenant.id}>
                                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                                <TableCell>{tenant.plan}</TableCell>
                                                <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{tenant.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Secondary Info Card */}
                    <Card className="col-span-3 border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Distribuição de Planos</CardTitle>
                            <CardDescription>
                                Base atual de clientes por assinatura.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Plano Starter</p>
                                    <p className="text-sm text-muted-foreground">Funcionalidades básicas</p>
                                </div>
                                <div className="ml-auto font-medium">18 assinantes</div>
                            </div>
                            <div className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Plano Pro</p>
                                    <p className="text-sm text-muted-foreground">Gestão completa</p>
                                </div>
                                <div className="ml-auto font-medium">10 assinantes</div>
                            </div>
                            <div className="flex items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">Plano Premium</p>
                                    <p className="text-sm text-muted-foreground">Franquias e Redes</p>
                                </div>
                                <div className="ml-auto font-medium">4 assinantes</div>
                            </div>
                        </CardContent>
                    </Card>
                    
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};