
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CalendarDays,
    Clock3,
    Plus,
    Search,
    Scissors,
    UserRound,
    UsersRound,
    Wallet,
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CancelSchedule from '@/components/schedules/cancel-schedule';
import { Toaster } from '@/components/ui/toaster';

type UserRole = 'client' | 'barber' | 'admin';

type ScheduleStatus = 'pendente' | 'concluido' | 'cancelado';

interface ScheduleService {
    id: number;
    name: string;
    value: number;
    duration: number;
}

interface SchedulePerson {
    id: number;
    name: string;
}

interface Schedule {
    id: number;
    started_at: string;
    end_at: string;
    status: ScheduleStatus;
    client?: SchedulePerson | null;
    barber?: SchedulePerson | null;
    services: ScheduleService[];
    total_value: number;
}

interface Props {
    schedules: Schedule[];
    role: UserRole;
}

const statusConfig: Record<
    ScheduleStatus,
    { label: string; className: string }
> = {
    pendente: {
        label: 'Pendente',
        className:
            'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    concluido: {
        label: 'Concluído',
        className:
            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    cancelado: {
        label: 'Cancelado',
        className:
            'bg-destructive/10 text-destructive',
    },
};

const roleConfig = {
    client: {
        title: 'Meus agendamentos',
        description:
            'Acompanhe seus horários e consulte seus próximos atendimentos.',
        personLabel: 'Barbeiro',
        emptyTitle: 'Você ainda não tem agendamentos',
        emptyDescription:
            'Quando marcar um horário, ele aparecerá aqui.',
    },
    barber: {
        title: 'Minha agenda',
        description:
            'Consulte seus atendimentos e acompanhe os horários do dia.',
        personLabel: 'Cliente',
        emptyTitle: 'Sua agenda está livre',
        emptyDescription:
            'Os atendimentos marcados aparecerão aqui.',
    },
    admin: {
        title: 'Agendamentos',
        description:
            'Acompanhe os atendimentos e a movimentação da barbearia.',
        personLabel: 'Cliente',
        emptyTitle: 'Nenhum agendamento encontrado',
        emptyDescription:
            'Os agendamentos do estabelecimento aparecerão aqui.',
    },
};

function formatCurrency(value: number) {
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatDate(value: string) {
    const date = new Date(value);

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
}

function isToday(value: string) {
    const date = new Date(value);
    const today = new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

function getScheduleDate(value: string) {
    const date = new Date(value);

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTodayDate() {
    const today = new Date();

    return `${today.getFullYear()}-${String(
        today.getMonth() + 1,
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default function Index({ schedules, role }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [selectedDate, setSelectedDate] = useState(getTodayDate);

    const config = roleConfig[role];

    const filteredSchedules = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return schedules
            .filter((schedule) => {
                const person =
                    role === 'client'
                        ? schedule.barber?.name
                        : schedule.client?.name;

                const serviceNames = schedule.services
                    .map((service) => service.name)
                    .join(' ');

                const matchesSearch =
                    !normalizedSearch ||
                    person?.toLowerCase().includes(normalizedSearch) ||
                    serviceNames.toLowerCase().includes(normalizedSearch) ||
                    String(schedule.id).includes(normalizedSearch);

                const matchesStatus =
                    statusFilter === 'todos' ||
                    schedule.status === statusFilter;

               const matchesDate = getScheduleDate(schedule.started_at) === selectedDate;

                return matchesSearch && matchesStatus && matchesDate;

                return matchesSearch && matchesStatus && matchesDate;
            })
            .sort(
                (a, b) =>
                    new Date(a.started_at).getTime() -
                    new Date(b.started_at).getTime(),
            );
    }, [schedules, search, statusFilter, selectedDate, role]);

    const todaySchedules = schedules.filter(
        (schedule) =>
            isToday(schedule.started_at) &&
            schedule.status !== 'cancelado',
    );

    const pendingSchedules = schedules.filter(
        (schedule) => schedule.status === 'pendente',
    );

    const completedSchedules = schedules.filter(
        (schedule) => schedule.status === 'concluido',
    );

    const totalValue = schedules
        .filter((schedule) => schedule.status === 'concluido')
        .reduce(
            (total, schedule) => total + Number(schedule.total_value),
            0,
        );

    return (
        <>
            <Head title={config.title} />
            <Toaster></Toaster>
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Cabeçalho */}
                    <Card className="relative overflow-hidden rounded-3xl border bg-card bg-gradient-to-br from-card to-muted/30 px-5 py-6 shadow-sm sm:px-7 sm:py-8">
                        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="max-w-xl">
                                <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                    <div className='flex flex-row gap-2'>
                                        <CalendarDays className="size-4 text-primary" />
                                        Agenda
                                    </div>
                                </div>

                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    {config.title}
                                </h1>

                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                    {config.description}
                                </p>
                            </div>
                            {role === 'client' &&
                                <Button
                                    asChild
                                    className="h-11 rounded-xl py-4"
                                >
                                    <Link href="/schedules/create">
                                        <Plus className="mr-2 size-4" />
                                        Novo agendamento
                                    </Link>
                                </Button>}
                        </div>
                    </Card>

                    {/* Indicadores */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <MetricCard
                            title="Total"
                            value={schedules.length}
                            icon={<CalendarDays className="size-4" />}
                        />

                        <MetricCard
                            title="Hoje"
                            value={todaySchedules.length}
                            icon={<Clock3 className="size-4" />}
                        />

                        <MetricCard
                            title="Pendentes"
                            value={pendingSchedules.length}
                            icon={<Scissors className="size-4" />}
                        />

                        {role === 'admin' ? (
                            <MetricCard
                                title="Faturamento realizado"
                                value={formatCurrency(totalValue)}
                                icon={<Wallet className="size-4" />}
                                compact
                            />
                        ) : (
                            <MetricCard
                                title="Concluídos"
                                value={completedSchedules.length}
                                icon={<UsersRound className="size-4" />}
                            />
                        )}
                    </div>

                    {/* Listagem */}
                    <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
                        <CardHeader className="space-y-4 border-b border-border/60 px-5 py-5 sm:px-6">
                            <div>
                                <CardTitle className="text-base">
                                    Lista de agendamentos
                                </CardTitle>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    {filteredSchedules.length}{' '}
                                    {filteredSchedules.length === 1
                                        ? 'agendamento encontrado'
                                        : 'agendamentos encontrados'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_180px_180px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder={
                                            role === 'client'
                                                ? 'Buscar barbeiro ou serviço...'
                                                : 'Buscar cliente ou serviço...'
                                        }
                                        className="h-10 rounded-xl pl-9"
                                    />
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="todos">
                                        Todos os status
                                    </option>
                                    <option value="pendente">
                                        Pendentes
                                    </option>
                                    <option value="concluido">
                                        Concluídos
                                    </option>
                                    <option value="cancelado">
                                        Cancelados
                                    </option>
                                </select>

                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(event) => setSelectedDate(event.target.value)}
                                        className="h-10 rounded-xl pl-10"
                                        aria-label="Filtrar agendamentos por data"
                                    />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {filteredSchedules.length === 0 ? (
                                <div className="flex flex-col items-center px-6 py-16 text-center">
                                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                        <CalendarDays className="size-6 text-muted-foreground" />
                                    </div>

                                    <h3 className="font-medium">
                                        {schedules.length === 0
                                            ? config.emptyTitle
                                            : 'Nenhum resultado encontrado'}
                                    </h3>

                                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                        {schedules.length === 0
                                            ? config.emptyDescription
                                            : 'Tente alterar os filtros ou o termo pesquisado.'}
                                    </p>

                                    {schedules.length === 0 && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="mt-5 rounded-xl"
                                        >
                                            <Link href="/schedules/create">
                                                <Plus className="mr-2 size-4" />
                                                Agendar horário
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-border/60">
                                    {filteredSchedules.map((schedule) => {
                                        const person =
                                            role === 'client'
                                                ? schedule.barber
                                                : schedule.client;

                                        const duration = schedule.services.reduce(
                                            (total, service) =>
                                                total + Number(service.duration),
                                            0,
                                        );

                                        const status =
                                            statusConfig[schedule.status];

                                        return (
                                            <div
                                                key={schedule.id}
                                                className="flex flex-col gap-4 p-5 transition-colors hover:bg-muted/20 sm:px-6"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Data e horário */}
                                                    <div className="flex w-[66px] shrink-0 flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/30 px-2 py-3 text-center">
                                                        <span className="text-[11px] font-medium uppercase text-muted-foreground">
                                                            {formatDate(
                                                                schedule.started_at,
                                                            ).split(' ')[2]?.replace('.', '')}
                                                        </span>

                                                        <span className="mt-1 text-xl font-semibold tracking-tight">
                                                            {new Date(
                                                                schedule.started_at,
                                                            ).getDate()}
                                                        </span>

                                                        <span className="mt-1 text-[11px] text-muted-foreground">
                                                            {formatTime(
                                                                schedule.started_at,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="truncate text-sm font-semibold">
                                                                {person?.name ??
                                                                    'Pessoa não informada'}
                                                            </h3>

                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        </div>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Agendamento #
                                                            {schedule.id}
                                                        </p>

                                                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                                                            {role !== 'barber' &&
                                                                schedule.barber && (
                                                                    <span className="inline-flex items-center gap-1.5">
                                                                        <Scissors className="size-3.5" />
                                                                        {schedule.barber.name}
                                                                    </span>
                                                                )}

                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Clock3 className="size-3.5" />
                                                                {formatTime(
                                                                    schedule.started_at,
                                                                )}{' '}
                                                                –{' '}
                                                                {formatTime(
                                                                    schedule.end_at,
                                                                )}
                                                            </span>

                                                            {duration > 0 && (
                                                                <span>
                                                                    {formatDuration(
                                                                        duration,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {schedule.services.map(
                                                                (service) => (
                                                                    <span
                                                                        key={
                                                                            service.id
                                                                        }
                                                                        className="rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                                                                    >
                                                                        {service.name}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="hidden shrink-0 text-right sm:block">
                                                        <p className="text-sm font-semibold">
                                                            {formatCurrency(
                                                                schedule.total_value,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Total
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:hidden">
                                                    <span className="text-xs text-muted-foreground">
                                                        Valor total
                                                    </span>

                                                    <span className="text-sm font-semibold">
                                                        {formatCurrency(
                                                            schedule.total_value,
                                                        )}
                                                    </span>
                                                </div>
                                                {
                                                    role === 'client' &&
                                                    <div className='flex flex-row justify-end gap-4 '>
                                                        <Button size={'sm'} variant={'outline'}>Editar</Button>
                                                        <CancelSchedule id={schedule.id}></CancelSchedule>
                                                    </div>
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function MetricCard({
    title,
    value,
    icon,
    compact = false,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    compact?: boolean;
}) {
    return (
        <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="px-4 sm:py-0 py-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        {title}
                    </p>

                    <span className="text-muted-foreground">{icon}</span>
                </div>

                <p
                    className={`mt-3 truncate font-semibold tracking-tight ${
                        compact
                            ? 'text-base sm:text-lg'
                            : 'text-2xl sm:text-3xl'
                    }`}
                >
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}
