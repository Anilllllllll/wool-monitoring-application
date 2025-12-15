import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BatchesList from './pages/BatchesList';
import CreateBatch from './pages/CreateBatch';
import BatchDetail from './pages/BatchDetail';
import AdminPanel from './pages/AdminPanel';
import FarmerDashboard from './pages/FarmerDashboard';
import QualityResults from './pages/QualityResults';
import ProfileSettings from './pages/ProfileSettings';
import OperatorDashboard from './pages/OperatorDashboard';
import MonitoringDashboard from './pages/MonitoringDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import InspectionForm from './pages/InspectionForm';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Marketplace from './pages/Marketplace';
import MyOrders from './pages/MyOrders';
import ProtectedRoute from './components/ProtectedRoute';
import { Warehouse, LogOut, User, Activity, LayoutDashboard, Truck, ClipboardCheck, BarChart2, ShoppingBag, Package } from 'lucide-react';
import Chatbot from './components/Chatbot';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (['/login', '/register'].includes(location.pathname)) return null;

    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-primary-700 flex items-center gap-2">
                    <Warehouse /> WoolMonitor
                </Link>
                <div className="flex items-center gap-6">
                    {user && (
                        <div className="flex items-center gap-4">
                            {user.role === 'FARMER' && (
                                <>
                                    <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary-600">Dashboard</Link>
                                    <Link to="/create-batch" className="text-sm font-medium text-gray-600 hover:text-primary-600">Sell Wool</Link>
                                    <Link to="/quality-results" className="text-sm font-medium text-gray-600 hover:text-primary-600">Quality</Link>
                                    <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-primary-600">Profile</Link>
                                </>
                            )}
                            {user.role === 'MILL_OPERATOR' && (
                                <>
                                    <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary-600 flex items-center gap-1">
                                        <LayoutDashboard size={14} /> Dashboard
                                    </Link>
                                    <Link to="/monitoring" className="text-sm font-medium text-gray-600 hover:text-primary-600 flex items-center gap-1">
                                        <Activity size={14} /> Monitor
                                    </Link>
                                    <Link to="/create-batch" className="text-sm font-medium text-gray-600 hover:text-primary-600 flex items-center gap-1">
                                        <Truck size={14} /> Intake
                                    </Link>
                                </>
                            )}
                            {user.role === 'QUALITY_INSPECTOR' && (
                                <>
                                    <Link to="/" className="text-sm font-medium text-gray-600 hover:text-teal-600 flex items-center gap-1">
                                        <ClipboardCheck size={14} /> Lab Hub
                                    </Link>
                                    <Link to="/quality/analytics" className="text-sm font-medium text-gray-600 hover:text-teal-600 flex items-center gap-1">
                                        <BarChart2 size={14} /> Analytics
                                    </Link>
                                </>
                            )}
                            {user.role === 'BUYER' && (
                                <>
                                    <Link to="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                                        <ShoppingBag size={14} /> Marketplace
                                    </Link>
                                    <Link to="/orders" className="text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                                        <Package size={14} /> My Orders
                                    </Link>
                                </>
                            )}
                            {user.role === 'ADMIN' && (
                                <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-primary-600">
                                    Admin
                                </Link>
                            )}
                            <Link to="/profile" className="text-sm text-gray-500 flex items-center gap-1 hover:text-primary-600 transition">
                                <User size={16} /> {user.name} ({user.role})
                            </Link>
                            <button
                                onClick={logout}
                                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

const HomeRoute = () => {
    const { user } = useAuth();
    if (user && user.role === 'FARMER') {
        return <FarmerDashboard />;
    }
    if (user && user.role === 'MILL_OPERATOR') {
        return <OperatorDashboard />;
    }
    if (user && user.role === 'QUALITY_INSPECTOR') {
        return <InspectorDashboard />;
    }
    if (user && user.role === 'BUYER') {
        return <Marketplace />;
    }
    return <BatchesList />;
};

function App() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Navbar />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomeRoute />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/quality-results"
                    element={
                        <ProtectedRoute permission="view_quality_results">
                            <QualityResults />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfileSettings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/monitoring"
                    element={
                        <ProtectedRoute permission="access_monitoring_dashboard">
                            <MonitoringDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Inspector Routes */}
                <Route
                    path="/quality/analytics"
                    element={
                        <ProtectedRoute permission="view_quality_analytics">
                            <AnalyticsDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/inspect/:id"
                    element={
                        <ProtectedRoute permission="create_quality_inspection">
                            <InspectionForm />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-batch"
                    element={
                        <ProtectedRoute permission={['create_batch', 'sell_wool']}>
                            <CreateBatch />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/batches"
                    element={
                        <ProtectedRoute>
                            <BatchesList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/marketplace"
                    element={
                        <ProtectedRoute permission={['view_marketplace']}>
                            <Marketplace />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/batches/:id"
                    element={
                        <ProtectedRoute>
                            <BatchDetail />
                        </ProtectedRoute>
                    }
                />

                {/* Buyer Routes */}
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute permission="view_order_history">
                            <MyOrders />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="ADMIN">
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Chatbot />
        </div>
    );
}

export default App;
