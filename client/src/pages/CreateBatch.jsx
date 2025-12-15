import React, { useState } from 'react';
import client from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Package, Droplets, MapPin, Scale } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const CreateBatch = () => {
    const [formData, setFormData] = useState({
        woolType: '',
        weight: '',
        moisture: '',
        source: '',
    });
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 2) {
            alert("You can upload a maximum of 2 images.");
            return;
        }
        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        images.forEach(image => data.append('images', image));

        try {
            await client.post('/batches', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (error) {
            console.error('Error creating batch:', error);
            alert('Failed to create batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Register New Batch</h1>

                <Card className="hover:shadow-none bg-surface/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Wool Type / Breed"
                            name="woolType"
                            value={formData.woolType}
                            onChange={handleChange}
                            placeholder="e.g. Merino, Corriedale"
                            icon={Package}
                            required
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Weight (kg)"
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                icon={Scale}
                                required
                            />
                            <Input
                                label="Moisture (%)"
                                type="number"
                                name="moisture"
                                value={formData.moisture}
                                onChange={handleChange}
                                icon={Droplets}
                            />
                        </div>

                        <Input
                            label="Source / Farm Name"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            placeholder="e.g. Highland Farms"
                            icon={MapPin}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Upload Images (Max 2)</label>
                            <div className="grid grid-cols-3 gap-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {previews.length < 2 && (
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-primary-500/50 transition-all group">
                                        <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center mb-2 group-hover:bg-primary-500/20 group-hover:text-primary-400">
                                            <Upload size={20} className="text-slate-400 group-hover:text-primary-400" />
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">Click to upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                className="flex-1"
                            >
                                Create Batch
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default CreateBatch;
