import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/axiosClient';
import BatchTimeline from '../components/BatchTimeline';
import { useAuth } from '../context/AuthContext';
import { FileText, Thermometer, PenTool, CheckCircle, XCircle, ArrowRight, Plus } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import { Input } from '../components/ui/Input';

const BatchDetail = () => {
    const { id } = useParams();
    const [batch, setBatch] = useState(null);
    const { hasPermission } = useAuth();
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showInspectionModal, setShowInspectionModal] = useState(false);

    const fetchBatch = async () => {
        try {
            const { data } = await client.get(`/batches/${id}`);
            setBatch(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatch();
    }, [id]);

    const updateStage = async (newStage) => {
        try {
            await client.patch(`/batches/${id}/status`, { stage: newStage, note: `Stage updated to ${newStage}` });
            fetchBatch();
        } catch (error) {
            alert('Failed to update stage');
        }
    };

    const handleApprove = async () => {
        try {
            await client.patch(`/quality/approve/${id}`);
            setShowInspectionModal(false);
            fetchBatch();
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleReject = async () => {
        if (!window.confirm('Are you sure you want to reject this batch?')) return;
        try {
            await client.patch(`/quality/reject/${id}`);
            setShowInspectionModal(false);
            fetchBatch();
        } catch (error) {
            alert('Failed to reject');
        }
    };

    const handleAddLog = (note) => {
        if (note) {
            // Quick hack to refresh active stage logs if needed, but mainly posting log
            client.post(`/batches/${id}/logs`, { note })
                .then(() => {
                    fetchBatch();
                })
                .catch(err => alert('Failed to add log'));
        }
    };

    if (loading || !batch) return (
        <DashboardLayout>
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    const getStatusBadgeVariant = (status) => {
        if (status === 'Approved') return 'success';
        if (status === 'Rejected') return 'danger';
        return 'warning';
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-white">Batch #{batch.batchId}</h1>
                            <Badge variant={getStatusBadgeVariant(batch.qualityStatus)} className="text-sm px-3 py-1">
                                {batch.qualityStatus}
                            </Badge>
                        </div>
                        <p className="text-slate-400">
                            Source: <span className="text-white font-medium">{batch.source}</span> • Created {new Date(batch.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Timeline Section */}
                <Card className="p-8 bg-surface/40 backdrop-blur-sm border-white/5">
                    <h2 className="text-xl font-bold text-white mb-8">Processing Pipeline</h2>
                    <BatchTimeline currentStage={batch.currentStage} />

                    {/* Stage Actions */}
                    {hasPermission('update_batch_stage') && (
                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-3">
                            <span className="text-sm text-slate-500 font-medium py-2 mr-2">Move to Stage:</span>
                            {['Cleaning', 'Carding', 'Spinning', 'Finished'].map(stage => (
                                <Button
                                    key={stage}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateStage(stage)}
                                    className={batch.currentStage === stage ? 'bg-primary-500/20 border-primary-500 text-primary-300' : ''}
                                >
                                    {stage}
                                </Button>
                            ))}
                        </div>
                    )}
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Details & Images */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            <Card className="text-center bg-white/5 border-white/5">
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Wool Type</p>
                                <p className="text-xl font-bold text-white">{batch.woolType}</p>
                            </Card>
                            <Card className="text-center bg-white/5 border-white/5">
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Weight</p>
                                <p className="text-xl font-bold text-white">{batch.weight} kg</p>
                            </Card>
                            <Card className="text-center bg-white/5 border-white/5">
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Moisture</p>
                                <p className="text-xl font-bold text-white">{batch.moisture || 0}%</p>
                            </Card>
                        </div>

                        {/* Image Gallery */}
                        <Card className="overflow-hidden">
                            <h3 className="text-lg font-bold text-white mb-4">Batch Images</h3>
                            {batch.images && batch.images.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {batch.images.map((img, i) => (
                                        <div
                                            key={i}
                                            className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group cursor-pointer shadow-lg"
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/20 transition-colors z-10" />
                                            <img
                                                src={`http://localhost:5000${img}`}
                                                alt={`Batch ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 border-2 border-dashed border-white/10 rounded-xl">
                                    No images uploaded.
                                </div>
                            )}
                        </Card>

                        {/* Inspection Action */}
                        {hasPermission('approve_batch') && (
                            <Card className="bg-gradient-to-r from-primary-900/40 to-secondary-900/40 border-primary-500/30 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Quality Inspection</h3>
                                    <p className="text-sm text-slate-400">Review images and batch data.</p>
                                </div>
                                <Button onClick={() => setShowInspectionModal(true)} className="shadow-neon">
                                    <FileText size={18} className="mr-2" /> Start Review
                                </Button>
                            </Card>
                        )}
                    </div>

                    {/* Logs Sidebar */}
                    <div className="space-y-6">
                        <Card className="h-full max-h-[600px] flex flex-col">
                            <div className="mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText size={20} className="text-primary-400" /> Logs
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                {batch.processingLogs?.map((log, i) => (
                                    <div key={i} className="relative pl-4 border-l-2 border-white/10 pb-4 last:pb-0">
                                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-background" />
                                        <p className="text-xs text-slate-500 font-mono mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                                        <p className="text-sm font-semibold text-primary-300">{log.stage}</p>
                                        <p className="text-sm text-slate-300 mt-1">{log.note}</p>
                                    </div>
                                ))}
                            </div>

                            {hasPermission('add_processing_logs') && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex gap-2">
                                        <input
                                            id="newLogInput"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                                            placeholder="Add note..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddLog(e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                const el = document.getElementById('newLogInput');
                                                handleAddLog(el.value);
                                                el.value = '';
                                            }}
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Inspection Modal */}
            <Modal
                isOpen={showInspectionModal}
                onClose={() => setShowInspectionModal(false)}
                title="Quality Inspection Review"
                className="max-w-4xl"
            >
                <div className="space-y-8">
                    {/* 1. Visuals */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide">1. Review Visuals</h3>
                        {batch.images && batch.images.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {batch.images.map((img, i) => (
                                    <div key={i} className="relative h-64 rounded-xl overflow-hidden border border-white/10">
                                        <img
                                            src={`http://localhost:5000${img}`}
                                            alt={`Inspection ${i}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-lg border border-yellow-500/20 flex items-center gap-3">
                                <Thermometer size={20} />
                                <span>No images uploaded for this batch. Proceed with caution.</span>
                            </div>
                        )}
                    </div>

                    {/* 2. Details */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide">2. Batch Data</h3>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center"><span className="text-slate-500 block mb-1">Type</span><span className="font-semibold text-white">{batch.woolType}</span></div>
                            <div className="text-center"><span className="text-slate-500 block mb-1">Weight</span><span className="font-semibold text-white">{batch.weight} kg</span></div>
                            <div className="text-center"><span className="text-slate-500 block mb-1">Stage</span><span className="font-semibold text-white">{batch.currentStage}</span></div>
                        </div>
                    </div>

                    {/* 3. Decision */}
                    <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowInspectionModal(false)}>Cancel</Button>
                        {hasPermission('reject_batch') && (
                            <Button variant="danger" onClick={handleReject}>Reject Batch</Button>
                        )}
                        {hasPermission('approve_batch') && (
                            <Button className="bg-green-600 hover:bg-green-500 border-green-500" onClick={handleApprove}>
                                <CheckCircle size={18} className="mr-2" /> Approve Quality
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-4 right-4 text-white hover:text-gray-300">
                        <XCircle size={32} />
                    </button>
                    <img
                        src={`http://localhost:5000${selectedImage}`}
                        alt="Full Preview"
                        className="max-w-[95vw] max-h-[95vh] rounded shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </DashboardLayout>
    );
};

export default BatchDetail;
