import React, { useState, useEffect } from 'react';
import client from '../api/axiosClient';
import { Thermometer, Droplets, Activity, CheckCircle, AlertTriangle, CloudSun } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const MonitoringDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const res = await client.get('/monitoring/sensors');
            setData(res.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching sensor data:', err);
            setError('Failed to load sensor data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <DashboardLayout role="Operator">
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout role="Operator">
            <div className="flex h-[80vh] items-center justify-center text-red-400">{error}</div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Mill Operator">
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary-500/20 rounded-xl text-secondary-400">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Factory Monitoring</h1>
                        <p className="text-slate-400">Real-time IoT sensor data.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Environmental Sensors */}
                    <Card className="p-0 overflow-hidden bg-glass-200/30">
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-orange-900/10 to-transparent">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <CloudSun size={20} className="text-orange-400" /> Environment (Live)
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div className="text-center p-6 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-orange-400/5 transition-opacity group-hover:opacity-10" />
                                <Thermometer className="text-orange-400 mb-3" size={32} />
                                <div className="text-4xl font-bold text-white mb-1">
                                    {data?.weather?.temperature?.toFixed(1)}°
                                </div>
                                <p className="text-sm text-orange-200/60 font-medium tracking-wide">TEMPERATURE</p>
                            </div>

                            <div className="text-center p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-400/5 transition-opacity group-hover:opacity-10" />
                                <Droplets className="text-blue-400 mb-3" size={32} />
                                <div className="text-4xl font-bold text-white mb-1">
                                    {data?.weather?.humidity}%
                                </div>
                                <p className="text-sm text-blue-200/60 font-medium tracking-wide">HUMIDITY</p>
                            </div>

                            {data?.weather?.condition && (
                                <div className="col-span-2 text-center p-3 bg-white/5 rounded-xl text-sm text-slate-400 border border-white/5">
                                    Current Condition: <strong className="text-white ml-1">{data.weather.condition}</strong> in {data.weather.location}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Machine Status */}
                    <Card className="p-0 overflow-hidden bg-glass-200/30">
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-secondary-900/10 to-transparent">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity size={20} className="text-secondary-400" /> Machine Status
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {data?.machines?.map(m => (
                                <div key={m.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div>
                                        <span className="font-bold text-white block mb-1">{m.name}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-slate-700 h-1.5 w-24 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${m.health > 80 ? 'bg-green-500' : m.health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${m.health}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400">Health: {m.health}%</span>
                                        </div>
                                    </div>
                                    <Badge variant={m.status === 'Running' ? 'success' : 'warning'} className="flex items-center gap-1">
                                        {m.status === 'Running' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                        {m.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="text-center text-xs text-slate-500 font-mono">
                    Last updated: {new Date(data?.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MonitoringDashboard;
