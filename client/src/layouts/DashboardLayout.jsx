import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ClipboardCheck,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    ShoppingBag,
    Activity,
    ChevronLeft,
    ChevronRight,
    Truck,
    BarChart2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Loader } from '../components/ui/Loader';

const SidebarItem = ({ to, icon: Icon, label, onClick, isCollapsed }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden whitespace-nowrap",
                isActive
                    ? "bg-primary-500/10 text-primary-400 font-medium border border-primary-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",

            )}
            title={isCollapsed ? label : ''}
        >
            {({ isActive }) => (
                <>
                    <Icon size={22} className={cn("min-w-[22px] transition-colors", isActive ? "text-primary-400" : "text-slate-500 group-hover:text-white")} />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                        >
                            {label}
                        </motion.span>
                    )}
                    {isActive && !isCollapsed && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full"
                        />
                    )}
                </>
            )}
        </NavLink>
    );
};

const DashboardLayout = ({ children, role }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    // Persist collapsed state
    useEffect(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState) setIsCollapsed(JSON.parse(savedState));
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Corrected Navigation Items
    const getNavItems = () => {
        const common = [
            { to: '/profile', icon: Settings, label: 'Settings' },
        ];

        switch (user?.role || role) {
            case 'FARMER':
                return [
                    { to: '/', icon: LayoutDashboard, label: 'Overview' },
                    { to: '/create-batch', icon: Package, label: 'Create Batch' },
                    { to: '/batches', icon: ClipboardCheck, label: 'My Batches' },
                    { to: '/quality-results', icon: BarChart2, label: 'Quality Results' },
                    ...common
                ];
            case 'QUALITY_INSPECTOR':
                return [
                    { to: '/', icon: ClipboardCheck, label: 'Lab Hub' },
                    { to: '/quality/analytics', icon: BarChart2, label: 'Analytics' },
                    ...common
                ];
            case 'BUYER':
                return [
                    { to: '/', icon: ShoppingBag, label: 'Marketplace' },
                    { to: '/orders', icon: ShoppingCart, label: 'My Orders' },
                    ...common
                ];
            case 'MILL_OPERATOR':
                return [
                    { to: '/', icon: LayoutDashboard, label: 'Floor Ops' },
                    { to: '/monitoring', icon: Activity, label: 'Monitoring' },
                    { to: '/create-batch', icon: Truck, label: 'Intake' },
                    ...common
                ];
            case 'ADMIN':
                return [
                    { to: '/admin', icon: Activity, label: 'Admin Panel' },
                    { to: '/batches', icon: Package, label: 'All Batches' },
                    ...common
                ];
            default:
                return [
                    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
                    ...common
                ];
        }
    };

    const navItems = getNavItems();

    if (!user) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader /></div>;

    return (
        <div className="min-h-screen bg-background flex text-wool-100 overflow-hidden relative">
            {/* Ambient Background - Optimized */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-primary-900/10 rounded-full blur-[100px] opacity-70" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-secondary-900/10 rounded-full blur-[100px] opacity-70" />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                animate={{ width: isCollapsed ? 80 : 288 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 bg-glass-100 border-r border-glass-border backdrop-blur-xl flex flex-col transition-transform duration-300 transform h-full",
                    isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Header */}
                <div className={cn("p-6 flex items-center justify-between", isCollapsed && "justify-center p-4")}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-900/20">
                            <Package className="text-white" size={24} />
                        </div>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h1 className="font-display font-bold text-lg text-white leading-none">WoolFlow</h1>
                                <p className="text-xs text-slate-500 font-medium">Supply Chain</p>
                            </motion.div>
                        )}
                    </div>
                    {/* Mobile Close */}
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
                    <div className={cn("px-2 mb-2 transition-opacity", isCollapsed ? "opacity-0 h-0" : "opacity-100")}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
                    </div>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            onClick={() => setSidebarOpen(false)}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>

                {/* Footer User Info */}
                <div className="p-4 border-t border-white/5 relative">
                    {/* Collapse Toggle Button */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:flex absolute -right-3 top-[-16px] w-6 h-6 bg-surface border border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-white z-50 hover:bg-primary-500 hover:border-primary-500 transition-colors shadow-lg"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>


                    <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br from-surface to-surfaceHighlight border border-white/5 mb-4 transition-all overflow-hidden relative group",
                        isCollapsed ? "justify-center px-0 bg-transparent border-0" : ""
                    )}>
                        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                            <div className="h-8 w-8 min-w-[32px] rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                <User size={16} />
                            </div>
                            {!isCollapsed && (
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-400 truncate capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className={cn("w-full text-red-400 hover:text-red-300 hover:bg-red-500/10", isCollapsed && "px-0 justify-center")}
                        onClick={handleLogout}
                        title={isCollapsed ? "Logout" : ""}
                    >
                        <LogOut size={20} className={cn(!isCollapsed && "mr-2")} />
                        {!isCollapsed && "Logout"}
                    </Button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden h-screen">
                {/* Header */}
                <header className="h-16 min-h-[64px] border-b border-glass-border bg-glass-100/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 px-4"></div>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                            {user?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
