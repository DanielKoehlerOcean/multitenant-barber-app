import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Check, Scissors, Store, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CreateTenant() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        document: '',
        subdomain: '',
        plan: 'starter',
    });

    const submit = () => {
        
        // Ajuste a rota para a que você definiu no seu routes/web.php
        post('/barbearias'); 
    };

    // Gera o subdomínio automaticamente baseado no nome (opcional, para UX)
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setData('name', newName);
        
        if (!data.subdomain || data.subdomain === formatSubdomain(data.name)) {
            setData('subdomain', formatSubdomain(newName));
        }
    };

    const formatSubdomain = (text: string) => {
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    };

    return (
        <>
            <Head title="Configure sua Barbearia" />
            
            <div className=" grid grid-cols-1 gap-2 lg:grid-cols-5 items-center justify-center bg-muted/40 p-4 py-8">
                <div className="col-span-2 px-5">
                       
                        <CardTitle className="text-xl xs:text-lg flex flex-row items-center gap-3"> <Store className="h-8 w-8 text-primary" /> Configure sua Barbearia</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Preencha os dados abaixo para criar o seu ambiente exclusivo.
                        </CardDescription>
                </div>
                <Card className="col-span-3 w-full  border-sidebar-border/70 shadow-lg mt-6">
                  

                    <form onSubmit={submit}>
                        <CardContent className="space-y-8 py-4">
                            
                            {/* Seleção de Planos */}
                            <div className="space-y-4">
                                <Label className="text-base font-semibold mb-2">1. Escolha seu Plano</Label>
                                <RadioGroup 
                                    defaultValue={data.plan} 
                                    onValueChange={(value) => setData('plan', value)}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
                                >
                                    {/* Plano Starter */}
                                    <div>
                                        <RadioGroupItem value="starter" id="starter" className="peer sr-only" />
                                        <Label
                                            htmlFor="starter"
                                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                        >
                                            <Scissors className="mb-3 h-6 w-6" />
                                            <span className="font-semibold text-lg">Starter</span>
                                            <span className="text-sm text-muted-foreground mt-1">Funcionalidades Básicas</span>
                                            <span className="text-xl font-bold mt-4">R$ 49<span className="text-sm font-normal text-muted-foreground">/mês</span></span>
                                        </Label>
                                    </div>

                                    {/* Plano Pro */}
                                    <div>
                                        <RadioGroupItem value="pro" id="pro" className="peer sr-only" />
                                        <Label
                                            htmlFor="pro"
                                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                        >
                                            <Building2 className="mb-3 h-6 w-6" />
                                            <span className="font-semibold text-lg">Pro</span>
                                            <span className="text-sm text-muted-foreground mt-1">Gestão Completa</span>
                                            <span className="text-xl font-bold mt-4">R$ 99<span className="text-sm font-normal text-muted-foreground">/mês</span></span>
                                        </Label>
                                    </div>

                                    {/* Plano Premium */}
                                    <div>
                                        <RadioGroupItem value="premium" id="premium" className="peer sr-only" />
                                        <Label
                                            htmlFor="premium"
                                            className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                        >
                                            <Check className="mb-3 h-6 w-6" />
                                            <span className="font-semibold text-lg">Premium</span>
                                            <span className="text-sm text-muted-foreground mt-1">Redes e Franquias</span>
                                            <span className="text-xl font-bold mt-4">R$ 199<span className="text-sm font-normal text-muted-foreground">/mês</span></span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                                {errors.plan && <p className="text-sm text-red-500 mt-1">{errors.plan}</p>}
                            </div>

                            <div className="space-y-6">
                                <Label className="text-base font-semibold">2. Dados do Negócio</Label>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome da Barbearia</Label>
                                        <Input
                                            id="name"
                                            placeholder="Ex: Navalha de Ouro"
                                            value={data.name}
                                            onChange={handleNameChange}
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
                                        <Input
                                            id="document"
                                            placeholder="00.000.000/0000-00"
                                            value={data.document}
                                            onChange={(e) => setData('document', e.target.value)}
                                        />
                                        {errors.document && <p className="text-sm text-red-500">{errors.document}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-mail Comercial</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="contato@barbearia.com"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subdomain">Link do seu sistema</Label>
                                        <div className="flex rounded-md shadow-sm">
                                            <Input
                                                id="subdomain"
                                                className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                placeholder="suabarbearia"
                                                value={data.subdomain}
                                                onChange={(e) => setData('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                                            />
                                            <div className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                                .barbershop.test
                                            </div>
                                        </div>
                                        {errors.subdomain && <p className="text-sm text-red-500">{errors.subdomain}</p>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <Separator></Separator>
                        <CardFooter className="flex justify-end pt-6">
                            <Button type="submit" size="lg" disabled={processing} className="w-full md:w-auto">
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Criando ambiente...
                                    </>
                                ) : (
                                    'Concluir e Acessar Sistema'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}