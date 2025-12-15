import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Truck, Activity, AlertTriangle, Package } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const OperatorDashboard = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const stages = ['Received', 'Cleaning', 'Carding', 'Spinning', 'Finished'];

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

    const getBatchesByStage = (stage) => batches.filter(b => b.currentStage === stage);

    if (loading) {
        return (
            <DashboardLayout role="Operator">
                <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="Mill Operator">
            <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Floor Operations</h1>
                        <p className="text-slate-400">Welcome, <span className="text-primary-400 font-semibold">{user?.name}</span>. Live view of the production line.</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-2 rounded-lg border border-yellow-500/20 text-sm mr-2">
                            <AlertTriangle size={16} />
                            <span>2 Machines Maintenance Due</span>
                        </div>
                        <Link to="/monitoring">
                            <Button variant="secondary" className="shadow-none">
                                <Activity size={18} className="mr-2" /> Monitoring
                            </Button>
                        </Link>
                        <Link to="/create-batch">
                            <Button>
                                <Truck size={18} className="mr-2" /> Receive Wool
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Kanban Board - Fill remaining height */}
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-6 h-full min-w-max">
                        {stages.map(stage => (
                            <div key={stage} className="w-80 flex flex-col h-full bg-white/5 rounded-xl border border-white/5">
                                {/* Column Header */}
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-xl">
                                    <h3 className="font-bold text-slate-200">{stage}</h3>
                                    <Badge variant="neutral" className="bg-black/30 border-0">{getBatchesByStage(stage).length}</Badge>
                                </div>

                                {/* Draggable Area (Concept) */}
                                <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                                    {getBatchesByStage(stage).map(batch => (
                                        <Card key={batch._id} hoverEffect className="p-4 cursor-pointer border-white/5 bg-surface/80">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="text-[10px] font-mono opacity-70">
                                                    #{batch.batchId || batch._id.slice(-6)}
                                                </Badge>
                                                <span className="text-xs font-bold text-primary-400">{batch.weight}kg</span>
                                            </div>
                                            <h4 className="font-bold text-white mb-1 text-sm">{batch.woolType}</h4>
                                            <p className="text-xs text-slate-500 mb-3 truncate">{batch.source || 'Unknown Source'}</p>

                                            <Link to={`/batches/${batch._id}`}>
                                                <Button size="sm" variant="secondary" className="w-full text-xs h-8">Manage</Button>
                                            </Link>
                                        </Card>
                                    ))}

                                    {getBatchesByStage(stage).length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-30 min-h-[100px]">
                                            <Package size={32} className="mb-2" />
                                            <span className="text-xs">No batches</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OperatorDashboard;
