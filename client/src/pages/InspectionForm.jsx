import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/axiosClient';
import { ClipboardCheck, Save, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';

const InspectionForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        fiberDiameter: '',
        tensileStrength: '',
        colorGrade: 'B',
        cleanWoolYield: '',
        notes: '',
        decision: 'Approved'
    });

    useEffect(() => {
        const fetchBatch = async () => {
            try {
                const { data } = await client.get(`/batches/${id}`);
                setBatch(data);
            } catch (error) {
                console.error("Error fetching batch:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBatch();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await client.post('/quality/inspect', {
                batchId: id,
                ...formData,
                fiberDiameter: Number(formData.fiberDiameter),
                tensileStrength: Number(formData.tensileStrength),
                cleanWoolYield: Number(formData.cleanWoolYield),
            });
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Failed to submit report');
        }
    };

    if (loading || !batch) return (
        <DashboardLayout role="Quality Inspector">
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Quality Inspector">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-teal-500/20 rounded-xl text-teal-400">
                        <ClipboardCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Inspection Report</h1>
                        <p className="text-slate-400">Scientific analysis for batch validation.</p>
                    </div>
                </div>

                {/* Context Card */}
                <Card className="bg-white/5 border-white/5 text-sm">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Subject Batch</h3>
                    <div className="flex flex-wrap gap-8">
                        <div>
                            <span className="text-slate-400 block mb-1">Batch ID</span>
                            <span className="font-mono text-white text-lg">#{batch.batchId || batch._id.slice(-6)}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block mb-1">Wool Type</span>
                            <span className="font-semibold text-white text-lg">{batch.woolType}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block mb-1">Weight</span>
                            <span className="font-semibold text-white text-lg">{batch.weight} kg</span>
                        </div>
                    </div>
                </Card>

                <Card className="bg-surface/50">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-2">Lab Metrics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Fiber Diameter (µm)"
                                    type="number" step="0.1" required
                                    value={formData.fiberDiameter}
                                    onChange={e => setFormData({ ...formData, fiberDiameter: e.target.value })}
                                />
                                <Input
                                    label="Tensile Strength (N/ktex)"
                                    type="number" step="0.1" required
                                    value={formData.tensileStrength}
                                    onChange={e => setFormData({ ...formData, tensileStrength: e.target.value })}
                                />
                                <Input
                                    label="Clean Wool Yield (%)"
                                    type="number" step="0.1" max="100" required
                                    value={formData.cleanWoolYield}
                                    onChange={e => setFormData({ ...formData, cleanWoolYield: e.target.value })}
                                />
                                <div>
                                    <label className="text-sm font-medium text-slate-300 ml-1 mb-1 block">Color Grade</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                                        value={formData.colorGrade}
                                        onChange={e => setFormData({ ...formData, colorGrade: e.target.value })}
                                    >
                                        <option value="A" className="bg-surface">Grade A (Excellent)</option>
                                        <option value="B" className="bg-surface">Grade B (Good)</option>
                                        <option value="C" className="bg-surface">Grade C (Average)</option>
                                        <option value="D" className="bg-surface">Grade D (Poor)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Inspector Notes</h3>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 min-h-[100px] focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                                placeholder="Add observations..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Final Decision</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer rounded-xl p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all ${formData.decision === 'Approved'
                                        ? 'bg-green-500/20 border-green-500 text-white'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                    }`}>
                                    <input
                                        type="radio" name="decision" value="Approved" className="hidden"
                                        checked={formData.decision === 'Approved'}
                                        onChange={e => setFormData({ ...formData, decision: e.target.value })}
                                    />
                                    <CheckCircle size={32} className={formData.decision === 'Approved' ? 'text-green-400' : 'text-slate-500'} />
                                    <span className="font-bold">Approve Batch</span>
                                </label>

                                <label className={`cursor-pointer rounded-xl p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all ${formData.decision === 'Rejected'
                                        ? 'bg-red-500/20 border-red-500 text-white'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                    }`}>
                                    <input
                                        type="radio" name="decision" value="Rejected" className="hidden"
                                        checked={formData.decision === 'Rejected'}
                                        onChange={e => setFormData({ ...formData, decision: e.target.value })}
                                    />
                                    <XCircle size={32} className={formData.decision === 'Rejected' ? 'text-red-400' : 'text-slate-500'} />
                                    <span className="font-bold">Reject Batch</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" variant="primary" className="px-8 shadow-neon">
                                <Save size={18} className="mr-2" /> Submit Report
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default InspectionForm;
