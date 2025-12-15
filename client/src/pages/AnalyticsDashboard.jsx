import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { BarChart2, PieChart, TrendingUp } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await client.get('/quality/analytics');
                setStats(data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div className="p-8 text-center text-teal-600">Generating Analytics...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                <BarChart2 className="text-teal-600" /> Quality Analytics
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-sm mb-1">Total Inspections</p>
                    <p className="text-4xl font-bold text-gray-800">{stats.totalInspections}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-sm mb-1">Pass Rate</p>
                    <p className="text-4xl font-bold text-green-600">{stats.passRate}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-sm mb-1">Rejections</p>
                    <p className="text-4xl font-bold text-red-600">{stats.rejectedCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 text-sm mb-1">Avg Fiber Microns</p>
                    <p className="text-4xl font-bold text-blue-600">{stats.avgDiameter}µm</p>
                </div>
            </div>

            {/* Mock Charts Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center text-gray-400">
                    <PieChart size={48} className="mb-2 opacity-50" />
                    <p>Decisions Breakdown Chart</p>
                    <div className="mt-4 w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: `${stats.passRate}%` }}></div>
                        <div className="bg-red-500 h-full" style={{ width: `${100 - stats.passRate}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp size={48} className="mb-2 opacity-50" />
                    <p>Fiber Quality Trend (Monthly)</p>
                    {/* Placeholder for real chart lib */}
                    <div className="mt-4 flex gap-2 items-end h-24">
                        <div className="w-8 bg-blue-200 h-12 rounded-t"></div>
                        <div className="w-8 bg-blue-300 h-16 rounded-t"></div>
                        <div className="w-8 bg-blue-400 h-14 rounded-t"></div>
                        <div className="w-8 bg-blue-500 h-20 rounded-t"></div>
                        <div className="w-8 bg-blue-600 h-24 rounded-t"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
