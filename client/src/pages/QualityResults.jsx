import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { ClipboardCheck } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const QualityResults = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const { data } = await client.get('/quality/my');
                setReports(data);
            } catch (error) {
                console.error("Error fetching quality reports:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <ClipboardCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Quality Reports</h1>
                        <p className="text-slate-400">View official inspection results provided by the lab.</p>
                    </div>
                </div>

                <Card className="p-0 overflow-hidden bg-surface/50 border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-5 text-slate-300 font-medium text-sm">Batch ID</th>
                                    <th className="p-5 text-slate-300 font-medium text-sm">Wool Type</th>
                                    <th className="p-5 text-slate-300 font-medium text-sm">Date</th>
                                    <th className="p-5 text-slate-300 font-medium text-sm">Result</th>
                                    <th className="p-5 text-slate-300 font-medium text-sm">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {reports.map(report => (
                                    <tr key={report.batchId} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5 font-mono text-white text-sm">#{report.batchId}</td>
                                        <td className="p-5 font-medium text-white">{report.woolType}</td>
                                        <td className="p-5 text-slate-400 text-sm">{new Date(report.date).toLocaleDateString()}</td>
                                        <td className="p-5">
                                            <Badge variant={report.grade === 'Approved' ? 'success' : 'danger'}>
                                                {report.grade}
                                            </Badge>
                                        </td>
                                        <td className="p-5 text-slate-400 text-sm max-w-xs truncate">
                                            {report.notes || 'Full lab report available.'}
                                        </td>
                                    </tr>
                                ))}
                                {reports.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-slate-500">
                                            No quality reports found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default QualityResults;
