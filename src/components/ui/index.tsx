import Link from 'next/link';

interface BackButtonProps {
    href?: string;
}

export function BackButton({ href = '/' }: BackButtonProps) {
    return (
        <Link href={href} className="p-2 rounded-lg hover:bg-card transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </Link>
    );
}

interface StatusBadgeProps {
    status: 'ready' | 'pending' | 'error';
    label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    const colors = {
        ready: 'bg-success/20 text-success',
        pending: 'bg-warning/20 text-warning',
        error: 'bg-error/20 text-error',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'ready' ? 'bg-success' :
                    status === 'pending' ? 'bg-warning' : 'bg-error'
                }`} />
            {label || status}
        </span>
    );
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
    interactive?: boolean;
}

export function Card({ children, className = '', interactive = false }: CardProps) {
    return (
        <div className={`glass rounded-2xl p-6 ${interactive ? 'card-interactive' : ''} ${className}`}>
            {children}
        </div>
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    loading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    backHref?: string;
}

export function PageHeader({ title, description, backHref = '/' }: PageHeaderProps) {
    return (
        <header className="glass sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                <BackButton href={backHref} />
                <div>
                    <h1 className="text-xl font-bold">{title}</h1>
                    {description && <p className="text-sm text-muted">{description}</p>}
                </div>
            </div>
        </header>
    );
}
