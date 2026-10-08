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
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameDay,
    isToday,
    startOfMonth,
    startOfWeek,
    endOfWeek,
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

        React.useEffect(() => {
            if (!propSelectedDate) {
                return;
            }

            setSelectedDate(propSelectedDate);

            // Só muda o mês se a data selecionada estiver
            // em um mês diferente do atual.
            if (
                propSelectedDate.getMonth() !== currentMonth.getMonth() ||
                propSelectedDate.getFullYear() !==
                    currentMonth.getFullYear()
            ) {
                setCurrentMonth(propSelectedDate);
            }
        }, [propSelectedDate]);

        const monthDays = React.useMemo<Day[]>(() => {
            const start = startOfWeek(startOfMonth(currentMonth), {
                weekStartsOn: 0,
            });

            const end = endOfWeek(endOfMonth(currentMonth), {
                weekStartsOn: 0,
            });

            return eachDayOfInterval({
                start,
                end,
            }).map((date) => ({
                date,
                isToday: isToday(date),
                isSelected: isSameDay(date, selectedDate),
            }));
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
                        className="text-4xl font-bold tracking-tight capitalize"
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

                {/* Calendário */}
                <div className="px-1">
                    {/* Dias da semana */}
                    <div className="mb-3 grid grid-cols-7">
                        {[
                            'Dom',
                            'Seg',
                            'Ter',
                            'Qua',
                            'Qui',
                            'Sex',
                            'Sáb',
                        ].map((day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] font-bold tracking-wide text-white/40 uppercase"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Dias */}
                    <div className="grid grid-cols-7 gap-y-3">
                        {monthDays.map((day) => {
                            const isCurrentMonth =
                                day.date.getMonth() ===
                                    currentMonth.getMonth() &&
                                day.date.getFullYear() ===
                                    currentMonth.getFullYear();

                            return (
                                <div
                                    key={format(
                                        day.date,
                                        'yyyy-MM-dd',
                                    )}
                                    className="flex justify-center"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDateClick(
                                                day.date,
                                            )
                                        }
                                        className={cn(
                                            'relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200',
                                            day.isSelected
                                                ? 'bg-primary text-white shadow-md'
                                                : isCurrentMonth
                                                  ? 'text-white hover:bg-white/20'
                                                  : 'text-white/25 hover:bg-white/10',
                                        )}
                                    >
                                        {day.isToday &&
                                            !day.isSelected && (
                                                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-pink-400" />
                                            )}

                                        {format(
                                            day.date,
                                            'd',
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Divider */}
                
            </div>
        );
    },
);

GlassCalendar.displayName = 'GlassCalendar';