import * as React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Edit2,
    Plus,
    Settings,
} from 'lucide-react';
import {
    addMonths,
    format,
    getDate,
    getDaysInMonth,
    isSameDay,
    isToday,
    startOfMonth,
    subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface Day {
    date: Date;
    isToday: boolean;
    isSelected: boolean;
}

interface GlassCalendarProps
    extends React.HTMLAttributes<HTMLDivElement> {
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
    className?: string;
}

const ScrollbarHide = () => (
    <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }

        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `}</style>
);

export const GlassCalendar = React.forwardRef<
    HTMLDivElement,
    GlassCalendarProps
>(
    (
        {
            className,
            selectedDate: propSelectedDate,
            onDateSelect,
            ...props
        },
        ref,
    ) => {
        const initialDate = propSelectedDate ?? new Date();

        const [currentMonth, setCurrentMonth] =
            React.useState<Date>(initialDate);

        const [selectedDate, setSelectedDate] =
            React.useState<Date>(initialDate);

        /*
         * Mantém o calendário sincronizado caso o componente pai
         * altere a data selecionada.
         */
        React.useEffect(() => {
            if (!propSelectedDate) {
                return;
            }

            setSelectedDate(propSelectedDate);
            setCurrentMonth(propSelectedDate);
        }, [propSelectedDate]);

        const monthDays = React.useMemo(() => {
            const start = startOfMonth(currentMonth);
            const totalDays = getDaysInMonth(currentMonth);

            const days: Day[] = [];

            for (let i = 0; i < totalDays; i++) {
                const date = new Date(
                    start.getFullYear(),
                    start.getMonth(),
                    i + 1,
                );

                days.push({
                    date,
                    isToday: isToday(date),
                    isSelected: isSameDay(date, selectedDate),
                });
            }

            return days;
        }, [currentMonth, selectedDate]);

        const handleDateClick = (date: Date) => {
            setSelectedDate(date);
            onDateSelect?.(date);
        };

        const handlePrevMonth = () => {
            setCurrentMonth((current) =>
                subMonths(current, 1),
            );
        };

        const handleNextMonth = () => {
            setCurrentMonth((current) =>
                addMonths(current, 1),
            );
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'w-full max-w-[360px] overflow-hidden rounded-3xl p-5 shadow-2xl',
                    'border border-white/10 bg-black/20 backdrop-blur-xl',
                    'font-sans text-white',
                    className,
                )}
                {...props}
            >
                <ScrollbarHide />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 rounded-lg bg-black/20 p-1">
                        <button
                            type="button"
                            className="rounded-md bg-white px-4 py-1 text-xs font-bold text-black shadow-md"
                        >
                            Semanal
                        </button>

                        <button
                            type="button"
                            className="rounded-md px-4 py-1 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                        >
                            Mensal
                        </button>
                    </div>

                    <button
                        type="button"
                        className="rounded-full p-2 text-white/70 transition-colors hover:bg-black/20"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                {/* Mês */}
                <div className="my-6 flex items-center justify-between">
                    <motion.p
                        key={format(currentMonth, 'MMMM-yyyy')}
                        initial={{
                            opacity: 0,
                            y: -10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            duration: 0.3,
                        }}
                        className="text-4xl font-bold tracking-tight"
                    >
                        {format(currentMonth, 'MMMM', {
                            locale: ptBR,
                        })}
                    </motion.p>

                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="rounded-full p-1 text-white/70 transition-colors hover:bg-black/20"
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="rounded-full p-1 text-white/70 transition-colors hover:bg-black/20"
                            aria-label="Próximo mês"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Dias */}
                <div className="-mx-5 overflow-x-auto px-5 scrollbar-hide">
                    <div className="flex space-x-4">
                        {monthDays.map((day) => (
                            <div
                                key={format(
                                    day.date,
                                    'yyyy-MM-dd',
                                )}
                                className="flex shrink-0 flex-col items-center space-y-2"
                            >
                                <span className="text-xs font-bold uppercase text-white/50">
                                    {format(day.date, 'EEEE', {
                                        locale: ptBR,
                                    }).charAt(0)}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDateClick(day.date)
                                    }
                                    className={cn(
                                        'relative flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200',
                                        day.isSelected
                                            ? 'bg-primary text-white'
                                            : 'text-white hover:bg-white/20',
                                    )}
                                >
                                    {day.isToday &&
                                        !day.isSelected && (
                                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-pink-400" />
                                        )}

                                    {getDate(day.date)}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="mt-6 h-px bg-white/20" />

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        className="flex items-center space-x-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                    >
                        <Edit2 className="h-4 w-4" />

                        <span>Adicionar observação...</span>
                    </button>

                    <button
                        type="button"
                        className="flex items-center space-x-2 rounded-lg bg-black/20 px-3 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-black/30"
                    >
                        <Plus className="h-4 w-4" />

                        <span>Novo evento</span>
                    </button>
                </div>
            </div>
        );
    },
);

GlassCalendar.displayName = 'GlassCalendar';
