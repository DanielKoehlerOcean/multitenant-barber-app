import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
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
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Search, 
    Plus, 
    MoreHorizontal, 
    Edit, 
    Ban, 
    ExternalLink, 
    CheckCircle2
} from 'lucide-react';7
import { tenants } from '@/routes/central';

// Tipagem baseada na estrutura do model Tenant com uuid
interface Tenant {
    id: string;
    domain: string;
    name: string;
    email: string;
    plan: string;
    is_active: boolean;
    created_at: string;
}

interface TenantsPageProps {
    tenants?: Tenant[];
}

export default function TenantsIndex({ tenants: initialTenants }: TenantsPageProps) {
    // Mock de dados caso a prop venha vazia do backend durante o desenvolvimento
    const [tenants, setTenants] = useState<Tenant[]>(initialTenants || [
        { id: 'uuid-1', domain: 'ze.barbershop.test', name: 'Barbearia do Zé', email: 'ze@email.com', plan: 'Pro', is_active: true, created_at: '10/08/2026' },
        { id: 'uuid-2', domain: 'vintage.barbershop.test', name: 'Vintage Barber', email: 'contato@vintage.com', plan: 'Starter', is_active: true, created_at: '15/08/2026' },
        { id: 'uuid-3', domain: 'cortefino.barbershop.test', name: 'Corte Fino', email: 'admin@cortefino.com', plan: 'Premium', is_active: true, created_at: '20/08/2026' },
        { id: 'uuid-4', domain: 'inativo.barbershop.test', name: 'Navalha de Ouro', email: 'teste@navalha.com', plan: 'Starter', is_active: false, created_at: '22/08/2026' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    // Filtro simples de busca no frontend (pode ser substituído por busca no backend via Inertia)
    const filteredTenants = tenants.filter(tenant => 
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tenant.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (isActive: boolean) => {
        return isActive 
            ? <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400">Ativo</Badge>
            : <Badge variant="destructive">Suspenso</Badge>;
    };

    return (
        <>
            <Head title="Gerenciar Barbearias" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
                {/* Cabeçalho da Página */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Barbearias</h2>
                        <p className="text-muted-foreground mt-1">
                            Gerencie os assinantes, planos e acessos da plataforma.
                        </p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Barbearia
                    </Button>
                </div>

                {/* Área de Filtros e Tabela */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Lista de Inquilinos</CardTitle>
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por nome ou subdomínio..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Barbearia</TableHead>
                                        <TableHead className="hidden md:table-cell">Subdomínio</TableHead>
                                        <TableHead className="hidden lg:table-cell">Contato</TableHead>
                                        <TableHead>Plano</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden xl:table-cell text-right">Cadastro</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTenants.length > 0 ? (
                                        filteredTenants.map((tenant) => (
                                            <TableRow key={tenant.id}>
                                                <TableCell className="font-medium">
                                                    {tenant.name}
                                                    <div className="text-xs text-muted-foreground md:hidden mt-1">
                                                        {tenant.domain}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                                    {tenant.domain}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                    {tenant.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{tenant.plan}</Badge>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(tenant.is_active)}</TableCell>
                                                <TableCell className="hidden xl:table-cell text-right text-muted-foreground">
                                                    {tenant.created_at}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Abrir menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                            <DropdownMenuItem className="cursor-pointer" asChild>
                                                                <a href={`http://${tenant.domain}`} target="_blank" rel="noopener noreferrer">
                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                    Acessar Painel
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar Dados
                                                            </DropdownMenuItem>
                                                            {tenant.is_active ? (
                                                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50">
                                                                    <Ban className="mr-2 h-4 w-4" />
                                                                    Suspender Conta
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem className="cursor-pointer text-green-600 focus:bg-green-50 focus:text-green-600 dark:focus:bg-green-950/50">
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Reativar Conta
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                Nenhuma barbearia encontrada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

// Configuração do layout/breadcrumbs do starter kit
TenantsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Barbearias',
            href: tenants(),
        },
    ],
};