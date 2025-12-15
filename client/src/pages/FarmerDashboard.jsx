import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { Package, TrendingUp, CheckCircle, Clock, Plus, ArrowRight, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import BatchTimeline from '../components/BatchTimeline';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader } from '../components/ui/Loader';
import { Badge } from '../components/ui/Badge';

const FarmerDashboard = () => {
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

    // Computed Stats
    const totalBatches = batches.length;
    const processingBatches = batches.filter(b => b.currentStage !== 'Finished').length;
    const finishedBatches = batches.filter(b => b.currentStage === 'Finished').length;
    const mostRecentBatch = batches.sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived))[0];

    if (loading) {
        return (
            <DashboardLayout role="Farmer">
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader size="xl" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="Farmer">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome, <span className="text-primary-400">{user?.name}</span></h1>
                        <p className="text-slate-400">Here's what's happening with your wool today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/quality-results">
                            <Button variant="secondary">Quality Results</Button>
                        </Link>
                        <Link to="/create-batch">
                            <Button className="shadow-neon">
                                <Plus size={18} className="mr-2" /> New Batch
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card hoverEffect className="relative overflow-hidden group bg-gradient-to-br from-emerald-900/40 to-emerald-800/10 border-emerald-500/20">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                                <DollarSign size={24} />
                            </div>
                            <p className="text-slate-400 font-medium">Total Revenue</p>
                            <h2 className="text-3xl font-bold text-white mt-1">
                                ${batches.reduce((sum, b) => sum + (b.financials?.netFarmerEarnings || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                        </div>
                    </Card>

                    <Card hoverEffect className="relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                                <Package size={24} />
                            </div>
                            <p className="text-slate-400 font-medium">Total Batches</p>
                            <h2 className="text-3xl font-bold text-white mt-1">{totalBatches}</h2>
                        </div>
                    </Card>

                    <Card hoverEffect className="relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                                <Clock size={24} />
                            </div>
                            <p className="text-slate-400 font-medium">In Processing</p>
                            <h2 className="text-4xl font-bold text-white mt-1">{processingBatches}</h2>
                        </div>
                    </Card>

                    <Card hoverEffect className="relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
                                <CheckCircle size={24} />
                            </div>
                            <p className="text-slate-400 font-medium">Completed</p>
                            <h2 className="text-4xl font-bold text-white mt-1">{finishedBatches}</h2>
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Timeline Card - Spans 2 cols */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-4">Live Tracking</h2>
                        {mostRecentBatch ? (
                            <Card className="h-64 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-white">Batch #{mostRecentBatch.batchId || mostRecentBatch._id.slice(-6)}</h3>
                                            <Badge variant="primary">{mostRecentBatch.woolType}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">Updated {new Date(mostRecentBatch.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <Link to={`/batches/${mostRecentBatch._id}`}>
                                        <Button variant="ghost" size="sm">View Details <ArrowRight size={16} className="ml-1" /></Button>
                                    </Link>
                                </div>
                                <div className="px-4 pb-4">
                                    <BatchTimeline currentStage={mostRecentBatch.currentStage} />
                                </div>
                            </Card>
                        ) : (
                            <Card className="h-64 flex items-center justify-center text-slate-500">
                                No active batches to track.
                            </Card>
                        )}
                    </div>

                    {/* Quick List - Spans 1 col */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Recent Batches</h2>
                        <div className="space-y-3">
                            {batches.slice(0, 4).map(batch => (
                                <Card key={batch._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-surfaceHighlight flex items-center justify-center text-slate-400 group-hover:text-primary-400 transition-colors">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{batch.woolType}</p>
                                            <p className="text-xs text-slate-500">{batch.weight}kg • {new Date(batch.dateReceived).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={batch.currentStage === 'Finished' ? 'success' : 'neutral'}>
                                            {batch.currentStage}
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                            {batches.length === 0 && <div className="text-slate-500 text-sm">No recent history.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FarmerDashboard;
