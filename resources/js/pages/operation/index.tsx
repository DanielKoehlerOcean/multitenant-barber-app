import * as React from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Clock3,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { toast, useToast } from '@/components/ui/use-toast';

interface BreakTime {
    id: number;
    start_time: string;
    end_time: string;
}

interface DaySchedule {
    day_of_week: number;
    label: string;
    short_label: string;
    is_open: boolean;
    start_time: string;
    end_time: string;
    breaks: BreakTime[];
}

interface BarberSchedule extends DaySchedule {
    is_working: boolean;
}

interface Barber {
    id: number;
    name: string;
     working_hours: BarberWorkingHour[];
}

interface BusinessHour {
    id: number;
    tenant_id: string;
    day_of_week: number;
    is_open: boolean;
    start_time: string | null;
    end_time: string | null;
    breaks: BreakTime[];
}

interface BarberWorkingHour {
    id: number;
    day_of_week: number;
    is_working: boolean;
    start_time: string | null;
    end_time: string | null;
    breaks: BreakTime[];
}

interface HoursSettingsProps {
    business_hours: BusinessHour[];
    barbers: Barber[];
}

const days = [
    { day_of_week: 1, label: 'Segunda-feira', short_label: 'Seg' },
    { day_of_week: 2, label: 'Terça-feira', short_label: 'Ter' },
    { day_of_week: 3, label: 'Quarta-feira', short_label: 'Qua' },
    { day_of_week: 4, label: 'Quinta-feira', short_label: 'Qui' },
    { day_of_week: 5, label: 'Sexta-feira', short_label: 'Sex' },
    { day_of_week: 6, label: 'Sábado', short_label: 'Sáb' },
    { day_of_week: 0, label: 'Domingo', short_label: 'Dom' },
];

export default function HoursSettings({business_hours, barbers}: any) {
    const [businessSaving, setBusinessSaving] = useState(false);
    const [barberSaving, setBarberSaving] = useState(false);
    const [isCustomizingBarber, setIsCustomizingBarber] = useState(false);

    const mapBusinessHours = (
        businessHours: BusinessHour[],
    ): DaySchedule[] => {
        return days.map((day) => {
            const savedDay = businessHours.find(
                (item) => item.day_of_week === day.day_of_week,
            );

            return {
                ...day,
                is_open: savedDay?.is_open ?? false,
                start_time: savedDay?.start_time ?? '',
                end_time: savedDay?.end_time ?? '',
                breaks:
                    savedDay?.breaks?.map((item) => ({
                        id: item.id,
                        start_time: item.start_time,
                        end_time: item.end_time,
                    })) ?? [],
            };
        });
    };

    const mapBarberWorkingHours = (
        workingHours: BarberWorkingHour[],
    ): BarberSchedule[] => {
        return days.map((day) => {
            const savedDay = workingHours.find(
                (item) => item.day_of_week === day.day_of_week,
            );

            return {
                ...day,
                is_open: savedDay?.is_working ?? false,
                is_working: savedDay?.is_working ?? false,
                start_time: savedDay?.start_time ?? '',
                end_time: savedDay?.end_time ?? '',
                breaks:
                    savedDay?.breaks?.map((item) => ({
                        id: item.id,
                        start_time: item.start_time,
                        end_time: item.end_time,
                    })) ?? [],
            };
        });
    };

    const [businessHours, setBusinessHours] = useState<DaySchedule[]>(
        () => mapBusinessHours(business_hours),
    );

    const [selectedBarberId, setSelectedBarberId] = useState<string>(
        String(barbers[0]?.id ?? ''),
    );

    const handleSaveBusinessHours = () => {
        setBusinessSaving(true);

        router.put(
            '/operation/business-hour',
            {
                days: businessHours.map((day) => ({
                    day_of_week: day.day_of_week,
                    is_open: day.is_open,
                    start_time: day.start_time || null,
                    end_time: day.end_time || null,
                    breaks: day.breaks.map((item) => ({
                        start_time: item.start_time,
                        end_time: item.end_time,
                    })),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBusinessSaving(false);
                    toast({
                        title: 'Horário salvo',
                        description: 'Horários da barbearia salvos com sucesso.'
                    });
                },
            },
        );
    };

    const handleSaveBarberHours = () => {
        if (!selectedBarberId) {
            return;
        }

        setBarberSaving(true);

        router.put(
            `/operation/barber-hour/${selectedBarberId}`,
            {
                days: selectedBarberSchedules.map((day) => ({
                    day_of_week: day.day_of_week,
                    is_working: day.is_working,
                    start_time: day.start_time || null,
                    end_time: day.end_time || null,
                    breaks: day.breaks.map((item) => ({
                        start_time: item.start_time,
                        end_time: item.end_time,
                    })),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setBarberSaving(false);
                    toast({
                        title: 'Horário salvo',
                        description: 'Horários do barbeiro salvos com sucesso.'
                    })
                },
            },
        );
    };

    const handleEnableBarberCustomization = () => {
        if (!selectedBarberId) {
            return;
        }

        const barberId = Number(selectedBarberId);

        const schedule: BarberSchedule[] = businessHours.map((day) => ({
            day_of_week: day.day_of_week,
            label: day.label,
            short_label: day.short_label,
            is_open: day.is_open,
            is_working: day.is_open,
            start_time: day.start_time,
            end_time: day.end_time,
            breaks: day.breaks.map((breakItem) => ({
                ...breakItem,
            })),
        }));

        setBarberSchedules((current) => ({
            ...current,
            [barberId]: schedule,
        }));

        setIsCustomizingBarber(true);
    };

    const handleUseBusinessHours = () => {
        if (!selectedBarberId) {
            return;
        }

        const barberId = Number(selectedBarberId);

        const schedule: BarberSchedule[] = businessHours.map((day) => ({
            day_of_week: day.day_of_week,
            label: day.label,
            short_label: day.short_label,
            is_open: day.is_open,
            is_working: day.is_open,
            start_time: day.start_time,
            end_time: day.end_time,
            breaks: day.breaks.map((breakItem) => ({
                ...breakItem,
            })),
        }));

        setBarberSchedules((current) => ({
            ...current,
            [barberId]: schedule,
        }));

        setIsCustomizingBarber(true);

        toast({
            title: 'Horários copiados',
            description:
                'Os horários da barbearia foram aplicados ao barbeiro. Clique em "Salvar horários" para confirmar.',
        });
    };

    const [barberSchedules, setBarberSchedules] = useState<
        Record<number, BarberSchedule[]>
    >(() => {
        const schedules: Record<number, BarberSchedule[]> = {};

        barbers.forEach((barber: Barber) => {
            if (barber.working_hours?.length) {
                schedules[barber.id] = mapBarberWorkingHours(
                    barber.working_hours,
                );
            }
        });

        return schedules;
    });

    const selectedBarber = barbers.find(
        (barber: Barber) => String(barber.id) === selectedBarberId,
    );

    const hasCustomSchedule = (selectedBarber?.working_hours?.length ?? 0) > 0;

    const selectedBarberSchedules =
        barberSchedules[Number(selectedBarberId)] ?? [];

    const updateBusinessDay = (
        dayOfWeek: number,
        changes: Partial<DaySchedule>,
    ) => {
        setBusinessHours((current) =>
            current.map((day) =>
                day.day_of_week === dayOfWeek ? { ...day, ...changes } : day,
            ),
        );
    };

    const updateBarberDay = (
        dayOfWeek: number,
        changes: Partial<BarberSchedule>,
    ) => {
        const barberId = Number(selectedBarberId);

        setBarberSchedules((current) => ({
            ...current,
            [barberId]: (current[barberId] ?? []).map((day) =>
                day.day_of_week === dayOfWeek ? { ...day, ...changes } : day,
            ),
        }));
    };

    const addBusinessBreak = (dayOfWeek: number) => {
        setBusinessHours((current) =>
            current.map((day) =>
                day.day_of_week === dayOfWeek
                    ? {
                          ...day,
                          breaks: [
                              ...day.breaks,
                              {
                                  id: Date.now(),
                                  start_time: '12:00',
                                  end_time: '13:00',
                              },
                          ],
                      }
                    : day,
            ),
        );
    };

    const removeBusinessBreak = (dayOfWeek: number, breakId: number) => {
        setBusinessHours((current) =>
            current.map((day) =>
                day.day_of_week === dayOfWeek
                    ? {
                          ...day,
                          breaks: day.breaks.filter(
                              (item) => item.id !== breakId,
                          ),
                      }
                    : day,
            ),
        );
    };

    const updateBusinessBreak = (
        dayOfWeek: number,
        breakId: number,
        changes: Partial<BreakTime>,
    ) => {
        setBusinessHours((current) =>
            current.map((day) =>
                day.day_of_week === dayOfWeek
                    ? {
                          ...day,
                          breaks: day.breaks.map((item) =>
                              item.id === breakId
                                  ? { ...item, ...changes }
                                  : item,
                          ),
                      }
                    : day,
            ),
        );
    };

    const addBarberBreak = (dayOfWeek: number) => {
        const barberId = Number(selectedBarberId);

        setBarberSchedules((current) => ({
            ...current,
            [barberId]: (current[barberId] ?? []).map((day) =>
                day.day_of_week === dayOfWeek
                    ? {
                          ...day,
                          breaks: [
                              ...day.breaks,
                              {
                                  id: Date.now(),
                                  start_time: '12:00',
                                  end_time: '13:00',
                              },
                          ],
                      }
                    : day,
            ),
        }));
    };

    const removeBarberBreak = (dayOfWeek: number, breakId: number) => {
        const barberId = Number(selectedBarberId);

        setBarberSchedules((current) => ({
            ...current,
            [barberId]: (current[barberId] ?? []).map((day) =>
                day.day_of_week === dayOfWeek
                    ? {
                          ...day,
                          breaks: day.breaks.filter(
                              (item) => item.id !== breakId,
                          ),
                      }
                    : day,
            ),
        }));
    };

    const updateBarberBreak = (
        dayOfWeek: number,
        breakId: number,
        changes: Partial<BreakTime>,
    ) => {
        const barberId = Number(selectedBarberId);

        setBarberSchedules((current) => ({
            ...current,
            [barberId]: (current[barberId] ?? []).map((day) =>
                day.day_of_week === dayOfWeek
                    ? {
                          ...day,
                          breaks: day.breaks.map((item) =>
                              item.id === breakId
                                  ? { ...item, ...changes }
                                  : item,
                          ),
                      }
                    : day,
            ),
        }));
    };

    return (
        <>
            <Head title="Horários" />
            <Toaster></Toaster>
            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
                {/* Header */}
                <Card className="relative overflow-hidden rounded-3xl border bg-card bg-gradient-to-br from-card to-muted/30 px-5 py-6 shadow-sm shadow-xs sm:px-7 sm:py-8">
                    <div className="absolute -top-10 -right-10 size-24 rounded-full bg-primary/30 blur-2xl" />
                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-xl">
                            <div className="mb-3 flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                                    <Clock3 className="h-5 w-5" />
                                </div>

                                <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                                    HORÁRIOS
                                </span>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Configuração de Horários
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                Configure o funcionamento da barbearia e dos
                                barbeiros.
                            </p>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-primary/5 blur-3xl" />
                </Card>

                {/* Horário geral */}
                <Card className="overflow-hidden rounded-3xl border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                    <CardHeader className="border-b border-border/50 px-5 py-5 md:px-6">
                        <div className="flex items-start gap-3">
                          

                            <div>
                                <CardTitle className="text-lg">
                                    Horário da barbearia
                                </CardTitle>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Define o horário padrão de funcionamento do
                                    estabelecimento.
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3 p-4 md:p-6">
                        {businessHours.map((day) => (
                            <div
                                key={day.day_of_week}
                                className={cn(
                                    'rounded-2xl border p-4 transition-colors',
                                    day.is_open
                                        ? 'border-border/60 bg-background/60'
                                        : 'border-border/40 bg-muted/20',
                                )}
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                    {/* Dia */}
                                    <div className="flex items-center justify-between md:w-44">
                                        <div>
                                            <p className="font-medium">
                                                {day.label}
                                            </p>

                                            <p className="text-xs text-muted-foreground md:hidden">
                                                {day.is_open
                                                    ? 'Aberto'
                                                    : 'Fechado'}
                                            </p>
                                        </div>

                                        <Switch
                                            checked={day.is_open}
                                            onCheckedChange={(checked) =>
                                                updateBusinessDay(
                                                    day.day_of_week,
                                                    {
                                                        is_open: checked,
                                                    },
                                                )
                                            }
                                        />
                                    </div>

                                    {day.is_open ? (
                                        <div className="flex flex-1 flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={day.start_time}
                                                    onChange={(event) =>
                                                        updateBusinessDay(
                                                            day.day_of_week,
                                                            {
                                                                start_time:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm transition outline-none focus:border-primary"
                                                />

                                                <span className="text-sm text-muted-foreground">
                                                    até
                                                </span>

                                                <input
                                                    type="time"
                                                    value={day.end_time}
                                                    onChange={(event) =>
                                                        updateBusinessDay(
                                                            day.day_of_week,
                                                            {
                                                                end_time:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm transition outline-none focus:border-primary"
                                                />
                                            </div>

                                            {day.breaks.length > 0 && (
                                                <div className="space-y-2 border-t border-border/50 pt-3">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Intervalos
                                                    </p>

                                                    {day.breaks.map(
                                                        (breakTime) => (
                                                            <div
                                                                key={
                                                                    breakTime.id
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        breakTime.start_time
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateBusinessBreak(
                                                                            day.day_of_week,
                                                                            breakTime.id,
                                                                            {
                                                                                start_time:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-primary"
                                                                />

                                                                <span className="text-xs text-muted-foreground">
                                                                    até
                                                                </span>

                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        breakTime.end_time
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateBusinessBreak(
                                                                            day.day_of_week,
                                                                            breakTime.id,
                                                                            {
                                                                                end_time:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-primary"
                                                                />

                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeBusinessBreak(
                                                                            day.day_of_week,
                                                                            breakTime.id,
                                                                        )
                                                                    }
                                                                    className="shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addBusinessBreak(
                                                        day.day_of_week,
                                                    )
                                                }
                                                className="flex w-fit items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary/80"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Adicionar intervalo
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 items-center">
                                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                Fechado
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <div className="flex justify-end px-4">
                        <Button
                            type="button"
                            onClick={handleSaveBusinessHours}
                            disabled={businessSaving}
                            className="rounded-xl py-5"
                        >
                            <Save className="mr-2 h-4 w-4" />

                            {businessSaving
                                ? 'Salvando...'
                                : 'Salvar horários'}
                        </Button>
                    </div>
                </Card>

                {/* Horários dos barbeiros */}
                <Card className="overflow-hidden rounded-3xl border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                    <CardHeader className="border-b border-border/50 px-5 py-5 md:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div>
                                    <CardTitle className="text-lg">
                                        Horários dos barbeiros
                                    </CardTitle>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Personalize a jornada de cada barbeiro.
                                    </p>
                                </div>
                            </div>

                            <Select
                                value={selectedBarberId}
                                onValueChange={(value) => {
                                    setSelectedBarberId(value);
                                    setIsCustomizingBarber(false);
                                }}
                            >
                                <SelectTrigger className="w-full rounded-xl sm:w-[220px]">
                                    <SelectValue placeholder="Selecione um barbeiro" />
                                </SelectTrigger>

                                <SelectContent>
                                    {barbers.map((barber: Barber) => (
                                        <SelectItem
                                            key={barber.id}
                                            value={String(barber.id)}
                                        >
                                            {barber.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3 p-4 md:p-6">
                        {!hasCustomSchedule && !isCustomizingBarber ? (
                            <div className="rounded-2xl border border-dashed bg-muted/30 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-medium">
                                            Horário personalizado não configurado
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Este barbeiro seguirá automaticamente os horários
                                            gerais da barbearia.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-xl"
                                        onClick={handleEnableBarberCustomization}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Personalizar horários
                                    </Button>
                                </div>
                            </div>
                        ): selectedBarberSchedules.map((day) => (
                            <div
                                key={day.day_of_week}
                                className={cn(
                                    'rounded-2xl border p-4 transition-colors',
                                    day.is_working
                                        ? 'border-border/60 bg-background/60'
                                        : 'border-border/40 bg-muted/20',
                                )}
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                                    {/* Dia */}
                                    <div className="flex items-center justify-between md:w-44">
                                        <div>
                                            <p className="font-medium">
                                                {day.label}
                                            </p>

                                            <p className="text-xs text-muted-foreground">
                                                {day.is_working
                                                    ? 'Trabalhando'
                                                    : 'Folga'}
                                            </p>
                                        </div>

                                        <Switch
                                            checked={day.is_working}
                                            onCheckedChange={(checked) =>
                                                updateBarberDay(
                                                    day.day_of_week,
                                                    {
                                                        is_working: checked,
                                                    },
                                                )
                                            }
                                        />
                                    </div>

                                    {day.is_working ? (
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={day.start_time}
                                                    onChange={(event) =>
                                                        updateBarberDay(
                                                            day.day_of_week,
                                                            {
                                                                start_time:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm transition outline-none focus:border-primary"
                                                />

                                                <span className="text-sm text-muted-foreground">
                                                    até
                                                </span>

                                                <input
                                                    type="time"
                                                    value={day.end_time}
                                                    onChange={(event) =>
                                                        updateBarberDay(
                                                            day.day_of_week,
                                                            {
                                                                end_time:
                                                                    event.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                    className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm transition outline-none focus:border-primary"
                                                />
                                            </div>

                                            {day.breaks.length > 0 && (
                                                <div className="space-y-2 border-t border-border/50 pt-3">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Intervalos
                                                    </p>

                                                    {day.breaks.map(
                                                        (breakTime) => (
                                                            <div
                                                                key={
                                                                    breakTime.id
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        breakTime.start_time
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateBarberBreak(
                                                                            day.day_of_week,
                                                                            breakTime.id,
                                                                            {
                                                                                start_time:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-primary"
                                                                />

                                                                <span className="text-xs text-muted-foreground">
                                                                    até
                                                                </span>

                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        breakTime.end_time
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateBarberBreak(
                                                                            day.day_of_week,
                                                                            breakTime.id,
                                                                            {
                                                                                end_time:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm outline-none focus:border-primary"
                                                                />

                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeBarberBreak(
                                                                            day.day_of_week,
                                                                            breakTime.id,
                                                                        )
                                                                    }
                                                                    className="shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addBarberBreak(
                                                        day.day_of_week,
                                                    )
                                                }
                                                className="flex w-fit items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary/80"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Adicionar intervalo
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 items-center">
                                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                Folga
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <div className="flex flex-row gap-2 justify-between px-4 ">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl py-5"
                            onClick={handleUseBusinessHours}
                            disabled={!selectedBarberId || barberSaving}
                        >
                            <Clock3 className="mr-2 h-4 w-4" />
                            Resetar Horários
                        </Button>

                        <Button
                            type="button"
                            className="rounded-xl py-5"
                            onClick={handleSaveBarberHours}
                            disabled={
                                barberSaving ||
                                (!hasCustomSchedule && !isCustomizingBarber)
                            }
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {barberSaving ? 'Salvando...' : 'Salvar horários'}
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    );
}
