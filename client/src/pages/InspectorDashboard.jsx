import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const InspectorDashboard = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const { data } = await client.get('/batches');
                setBatches(data);
            } catch (error) {
                console.error("Error fetching batches:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="Inspector">
                <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
            </DashboardLayout>
        );
    }

    const pendingBatches = batches.filter(b => b.qualityStatus === 'Pending');
    const completedBatches = batches.filter(b => b.qualityStatus !== 'Pending');

    return (
        <DashboardLayout role="Inspector">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Lab Hub</h1>
                        <p className="text-slate-400">Welcome, <span className="text-primary-400 font-semibold">{user?.name}</span>. Manage quality inspections and lab reports.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card hoverEffect className="relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4">
                                <FileText size={24} />
                            </div>
                            <p className="text-slate-400 font-medium">Pending Review</p>
                            <h2 className="text-4xl font-bold text-white mt-1">{pendingBatches.length}</h2>
                        </div>
                    </Card>

                    <Card hoverEffect className="relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <p className="text-slate-400 font-medium">Completed Today</p>
                            <h2 className="text-4xl font-bold text-white mt-1">
                                {completedBatches.filter(b => new Date(b.updatedAt).toDateString() === new Date().toDateString()).length}
                            </h2>
                        </div>
                    </Card>

                    <Card hoverEffect className="bg-gradient-to-br from-teal-900/40 to-teal-800/20 flex flex-col justify-center items-center text-center cursor-pointer hover:border-teal-500/30">
                        <h3 className="text-lg font-bold text-white mb-2">Analytics</h3>
                        <p className="text-sm text-slate-400 mb-4">View detailed quality reports</p>
                        <Link to="/quality/analytics">
                            <Button variant="primary">View Dashboard</Button>
                        </Link>
                    </Card>
                </div>

                {/* Main Content Areas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pending Inspections List (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Batches Awaiting Inspection</h2>
                            <Badge variant="warning">{pendingBatches.length} Pending</Badge>
                        </div>

                        <div className="space-y-3">
                            {pendingBatches.length > 0 ? (
                                pendingBatches.map(batch => (
                                    <Card key={batch._id} className="p-0 overflow-hidden flex flex-col md:flex-row md:items-center">
                                        <div className="p-6 flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant="neutral" className="font-mono">#{batch.batchId || batch._id.slice(-6)}</Badge>
                                                <h3 className="text-lg font-bold text-white">{batch.woolType}</h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span>{batch.weight}kg</span>
                                                <span>•</span>
                                                <span>Stage: {batch.currentStage}</span>
                                            </div>
                                        </div>
                                        <div className="bg-surfaceHighlight/30 p-4 md:p-6 md:w-48 flex items-center justify-center md:border-l border-white/5">
                                            <Link to={`/inspect/${batch._id}`} className="w-full">
                                                <Button className="w-full">Start <ArrowRight size={16} className="ml-2" /></Button>
                                            </Link>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10">
                                    <CheckCircle size={48} className="text-green-500 mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium text-white">All Caught Up!</h3>
                                    <p className="text-slate-500">No pending inspections at the moment.</p>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Recent History (1/3 width) */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Recent History</h2>
                        <div className="space-y-3">
                            {completedBatches.slice(0, 5).map(batch => (
                                <Card key={batch._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-white">{batch.woolType}</p>
                                        <p className="text-xs text-slate-500 font-mono">#{batch.batchId || batch._id.slice(-6)}</p>
                                    </div>
                                    <Badge variant={batch.qualityStatus === 'Approved' ? 'success' : 'danger'}>
                                        {batch.qualityStatus}
                                    </Badge>
                                </Card>
                            ))}
                            {completedBatches.length === 0 && <p className="text-slate-500 text-sm">No inspection history.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InspectorDashboard;
