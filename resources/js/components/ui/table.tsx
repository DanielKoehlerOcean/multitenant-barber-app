import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
    return (
        <div className="w-full overflow-auto">
            <table className={cn("w-full text-sm text-left border-collapse", className)} {...props} />
        </div>
    );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead className={cn("bg-muted text-muted-foreground", className)} {...props} />
    );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody className={cn("divide-y divide-border", className)} {...props} />
    );
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr className={cn("hover:bg-muted/50 transition-colors", className)} {...props} />
    );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            className={cn("align-middle px-3 py-2 font-semibold text-xs uppercase text-muted-foreground", className)}
            {...props}
        />
    );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td className={cn("px-3 py-2 align-middle", className)} {...props} />
    );
}