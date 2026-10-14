import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, CalendarDays, Clock, Clock11Icon, FolderGit2, LayoutGrid, Scissors, ScissorsLineDashed, ScissorsSquare, ScissorsSquareDashedBottom } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { tenants } from '@/routes/central';
import type { NavItem } from '@/types';
import {index as schedules } from '@/routes/schedules';
import {index as services} from '@/routes/services';
import {index as operation} from '@/routes/operation';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Barbearias',
        href: '/tenants',
        icon: Scissors,
    },
];

const mainNavItemsTenant: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Agendamentos',
        href: schedules(),
        icon: CalendarDays,
    },
    {
        title: 'Serviços',
        href: services(),
        icon: ScissorsSquare,
    },
    {
        title: 'Horários',
        href: operation(),
        icon: Clock
    }
    
];


const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {

    const { auth, tenant } = usePage().props;

    console.log(auth.centralRole);

    const mainNavItemsTenantFilter = mainNavItemsTenant.filter(item => {
        if(auth.role === 'client' || auth.role === 'barber'){
            const itens = ['Serviços', 'Horários'];
            return !itens.includes(item.title);
        }

        return true;
    });

    const mainNavItemsFilter = mainNavItems.filter(item => {
        if(auth.centralRole === 'tenant'){
            return item.title === 'Barbearias';
        }

        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={tenant ? mainNavItemsTenantFilter : mainNavItemsFilter} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}


