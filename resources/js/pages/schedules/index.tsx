import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import {
    CalendarDays,
    Check,
    ChevronRight,
    Clock3,
    Scissors,
    UserRound,
    UsersRound,
    Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { GlassCalendar } from '@/components/glass-calendar';

interface Client {
    id: number;
    name: string;
}

interface Barber {
    id: number;
    name: string;
}

interface Service {
    id: number;
    name: string;
    value: number;
    duration: number;
    photo_path?: string | null;
}

interface Props {
    clients: Client[];
    barbers: Barber[];
    services: Service[];
}

export default function Create({ clients, barbers, services }: Props) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date(),
    );

    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [loadingTimes, setLoadingTimes] = useState(false);

    const [selectedClient, setSelectedClient] = useState<number | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<number | null>(null);

    const [selectedServices, setSelectedServices] = useState<number[]>([]);

    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [clientSearch, setClientSearch] = useState('');

    const filteredClients = useMemo(() => {
        const value = clientSearch.trim().toLowerCase();

        if (!value) {
            return clients;
        }

        return clients.filter((client) =>
            client.name.toLowerCase().includes(value),
        );
    }, [clients, clientSearch]);

    const selectedServiceItems = useMemo(() => {
        return services?.filter((service) =>
            selectedServices.includes(service.id),
        );
    }, [services, selectedServices]);

    const totalValue = useMemo(() => {
        return selectedServiceItems?.reduce(
            (total, service) => total + Number(service.value),
            0,
        );
    }, [selectedServiceItems]);

    const totalDuration = useMemo(() => {
        return selectedServiceItems.reduce(
            (total, service) => total + Number(service.duration),
            0,
        );
    }, [selectedServiceItems]);

    const selectedClientData = clients.find(
        (client) => client.id === selectedClient,
    );

    const selectedBarberData = barbers.find(
        (barber) => barber.id === selectedBarber,
    );

    const formatPrice = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const formatDuration = (duration: number) => {
        if (duration < 60) {
            return `${duration} min`;
        }

        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        if (!minutes) {
            return `${hours}h`;
        }

        return `${hours}h ${minutes}min`;
    };

    const formatDate = (date?: Date) => {
        if (!date) {
            return '';
        }

        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
        });
    };

    const toggleService = (serviceId: number) => {
        setSelectedServices((current) =>
            current.includes(serviceId)
                ? current.filter((id) => id !== serviceId)
                : [...current, serviceId],
        );
    };

    useEffect(() => {
        if (
            !selectedDate ||
            !selectedBarber ||
            totalDuration <= 0
        ) {
            setAvailableTimes([]);
            setSelectedTime(null);

            return;
        }

        const loadAvailableTimes = async () => {
            setLoadingTimes(true);
            setSelectedTime(null);

            try {
                const date = selectedDate.toISOString().split('T')[0];

                const params = new URLSearchParams({
                    date,
                    barber_id: String(selectedBarber),
                    duration: String(totalDuration),
                });

                const response = await fetch(
                    `/schedules/availability?${params.toString()}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        'Não foi possível carregar os horários.',
                    );
                }

                const data = await response.json();

                console.log(data);

                setAvailableTimes(data.times ?? []);
            } catch (error) {
                console.error(error);

                setAvailableTimes([]);
            } finally {
                setLoadingTimes(false);
            }
        };

        loadAvailableTimes();
    }, [
        selectedDate,
        selectedBarber,
        totalDuration,
    ]);

    console.log(availableTimes);

    const submit = () => {
        // Posteriormente ligaremos ao backend:
        //
        // post('/schedules', {
        //     date: selectedDate,
        //     client_id: selectedClient,
        //     user_id: selectedBarber,
        //     services: selectedServices,
        //     started_at: selectedTime,
        // });
    };

    return (
        <>
            <Head title="Novo agendamento" />

            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="space-y-7">
                        {/* Header */}
                        <Card className="relative overflow-hidden rounded-3xl border bg-card bg-gradient-to-br from-card to-muted/30 px-5 py-6 shadow-sm shadow-xs sm:px-7 sm:py-8">
                            <div className="absolute -top-10 -right-10 size-24 rounded-full bg-primary/30 blur-2xl" />
                            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="max-w-xl">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                                            <Scissors className="size-4 text-primary" />
                                        </div>

                                        <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                                            AGENDA
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                        Novo Agendamento
                                    </h1>

                                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        Escolha a data, horário, cliente,
                                        barbeiro e os serviços que serão
                                        realizados.
                                    </p>
                                </div>
                            </div>

                            <div className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-primary/5 blur-3xl" />
                        </Card>

                        {/* Conteúdo */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                            {/* Coluna esquerda */}
                            <div className="space-y-6">
                                {/* Calendário */}

                                <div className="px-5 py-2 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <CardTitle className="text-lg">
                                                Escolha a data
                                            </CardTitle>

                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Selecione o dia do atendimento
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <GlassCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                >

                                </GlassCalendar>

                                {/* Barbeiro */}
                                <Card className="rounded-2xl border-border/60 shadow-sm">
                                    <CardHeader className="px-5 pt-5 pb-3 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                                                <Scissors className="size-4 text-primary" />
                                            </div>

                                            <div>
                                                <CardTitle className="text-base">
                                                    Barbeiro
                                                </CardTitle>

                                                <p className="text-xs text-muted-foreground">
                                                    Quem realizará o
                                                    atendimento?
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="grid grid-cols-1 gap-2 px-5 pb-5 sm:grid-cols-2 sm:px-6">
                                        {barbers.map((barber) => {
                                            const selected =
                                                selectedBarber === barber.id;

                                            return (
                                                <button
                                                    key={barber.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedBarber(
                                                            barber.id,
                                                        )
                                                    }
                                                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                                        selected
                                                            ? 'border-primary bg-primary/5 shadow-sm'
                                                            : 'border-border/60 bg-card hover:border-border hover:bg-muted/40'
                                                    }`}
                                                >
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                                                        <UserRound className="size-4 text-muted-foreground" />
                                                    </div>

                                                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                                        {barber.name}
                                                    </span>

                                                    {selected && (
                                                        <Check className="size-4 text-primary" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </CardContent>
                                </Card>

                                {/* Serviços */}
                                <Card className="rounded-2xl border-border/60 shadow-sm">
                                    <CardHeader className="px-5 pt-5 pb-3 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                                                <Scissors className="size-4 text-primary" />
                                            </div>

                                            <div>
                                                <CardTitle className="text-base">
                                                    Serviços
                                                </CardTitle>

                                                <p className="text-xs text-muted-foreground">
                                                    Selecione um ou mais
                                                    serviços
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6">
                                        {services.map((service) => {
                                            const selected =
                                                selectedServices.includes(
                                                    service.id,
                                                );

                                            return (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleService(
                                                            service.id,
                                                        )
                                                    }
                                                    className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                                                        selected
                                                            ? 'border-primary bg-primary/5 shadow-sm'
                                                            : 'border-border/60 hover:border-border hover:bg-muted/40'
                                                    }`}
                                                >
                                                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                                                        {service.photo_path ? (
                                                            <img
                                                                src={`/services/${service.id}/photo`}
                                                                alt={
                                                                    service.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Scissors className="size-4 text-muted-foreground" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {service.name}
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>
                                                                {formatPrice(
                                                                    service.value,
                                                                )}
                                                            </span>

                                                            <span>•</span>

                                                            <span>
                                                                {formatDuration(
                                                                    service.duration,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                                            selected
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-muted-foreground/30'
                                                        }`}
                                                    >
                                                        {selected && (
                                                            <Check className="size-3" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Coluna direita */}
                            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
                                {/* Data selecionada */}
                                <Card className="overflow-hidden rounded-2xl border-border/60 shadow-sm">
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Data selecionada
                                                </p>

                                                <p className="mt-1 text-lg font-semibold capitalize">
                                                    {formatDate(selectedDate)}
                                                </p>
                                            </div>

                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                                                <CalendarDays className="size-5 text-primary" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Horários */}
                                <Card className="rounded-2xl border-border/60 shadow-sm">
                                    <CardHeader className="px-5 pt-5 pb-3 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                                                <Clock3 className="size-4 text-primary" />
                                            </div>

                                            <div>
                                                <CardTitle className="text-base">
                                                    Horário
                                                </CardTitle>

                                                <p className="text-xs text-muted-foreground">
                                                    Escolha um horário
                                                    disponível
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                   <CardContent className="px-5 pb-5 sm:px-6">
                                        {loadingTimes ? (
                                            <div className="py-8 text-center text-sm text-muted-foreground">
                                                Calculando horários disponíveis...
                                            </div>
                                        ) : !selectedBarber ? (
                                            <div className="py-8 text-center text-sm text-muted-foreground">
                                                Selecione um barbeiro para visualizar os horários.
                                            </div>
                                        ) : totalDuration <= 0 ? (
                                            <div className="py-8 text-center text-sm text-muted-foreground">
                                                Selecione pelo menos um serviço para visualizar os horários.
                                            </div>
                                        ) : availableTimes.length === 0 ? (
                                            <div className="py-8 text-center text-sm text-muted-foreground">
                                                Nenhum horário disponível para esta data.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                                {availableTimes.map((time) => {
                                                    const selected = selectedTime === time;

                                                    return (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            onClick={() => setSelectedTime(time)}
                                                            className={`h-10 rounded-xl border text-sm font-medium transition-all ${
                                                                selected
                                                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                                    : 'border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5'
                                                            }`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Resumo */}
                                <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
                                    <CardHeader className="border-b bg-muted/10 px-5 py-5 sm:px-6">
                                        <CardTitle className="text-base">
                                            Resumo do agendamento
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-5 p-5 sm:p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm text-muted-foreground">
                                                    Cliente
                                                </span>

                                                <span className="max-w-[55%] truncate text-right text-sm font-medium">
                                                    {selectedClientData?.name ??
                                                        'Não selecionado'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm text-muted-foreground">
                                                    Barbeiro
                                                </span>

                                                <span className="max-w-[55%] truncate text-right text-sm font-medium">
                                                    {selectedBarberData?.name ??
                                                        'Não selecionado'}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm text-muted-foreground">
                                                    Horário
                                                </span>

                                                <span className="text-sm font-medium">
                                                    {selectedTime ??
                                                        'Não selecionado'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-border/60" />

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Scissors className="size-4" />
                                                    Serviços
                                                </div>

                                                <span className="text-sm font-medium">
                                                    {selectedServices.length}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock3 className="size-4" />
                                                    Duração
                                                </div>

                                                <span className="text-sm font-medium">
                                                    {formatDuration(
                                                        totalDuration,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Wallet className="size-4" />
                                                    Total
                                                </div>

                                                <span className="text-lg font-semibold">
                                                    {formatPrice(totalValue)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={submit}
                                            size="lg"
                                            className="h-12 w-full rounded-xl shadow-sm"
                                        >
                                            Confirmar agendamento
                                            <ChevronRight className="ml-2 size-4" />
                                        </Button>

                                        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                                            O agendamento será registrado como
                                            pendente até sua conclusão.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
