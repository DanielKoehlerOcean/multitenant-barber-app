import { Input } from '@/components/ui/input';

type MoneyInputProps = {
    value?: number;
    onChange: (value: number) => void;
    id?: string;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

const formatMoney = (value: number) => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

const parseMoney = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    return Number(numeric) / 100;
};

export default function MoneyInput({
    value = 0,
    onChange,
    id,
    name,
    placeholder,
    disabled,
    className,
}: MoneyInputProps) {
    const handleChange = (input: string) => {
        const numericValue = parseMoney(input);
        onChange(numericValue);
    };

    return (
        <Input
            id={id}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            value={formatMoney(value)}
            onChange={(e) => handleChange(e.target.value)}
            className={className}
        />
    );
}