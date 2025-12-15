import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { Package, Download, Truck, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('UPI');

    const fetchOrders = async () => {
        try {
            const { data } = await client.get('/shop/orders/my');
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRemove = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await client.delete(`/shop/order/${orderId}`);
                fetchOrders();
            } catch (error) {
                console.error("Error removing order:", error);
                alert("Failed to remove order");
            }
        }
    };

    const initiatePayment = (order) => {
        setSelectedOrder(order);
        setShowPaymentModal(true);
    };

    const confirmPayment = async () => {
        if (!selectedOrder) return;

        try {
            // Mock Payment
            await client.post(`/shop/order/${selectedOrder._id}/pay`, { paymentMethod });
            setShowPaymentModal(false);
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            console.error("Error processing payment:", error);
            alert("Payment failed");
        }
    };

    const handleInvoice = (order) => {
        const invoiceWindow = window.open('', '_blank');
        const invoiceContent = `
            <html>
                <head>
                    <title>Invoice - ${order._id}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: end; }
                        .logo { font-size: 24px; font-weight: bold; }
                        .invoice-title { font-size: 36px; color: #666; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .box { background: #f9f9f9; padding: 20px; border-radius: 8px; }
                        table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 12px; border-bottom: 2px solid #ddd; color: #666; }
                        td { padding: 12px; border-bottom: 1px solid #eee; }
                        .total-row { font-size: 18px; font-weight: bold; }
                        .total-price { color: #2ecc71; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">WoolMonitor Inc.</div>
                        <div class="invoice-title">INVOICE</div>
                    </div>
                    
                    <div class="grid">
                        <div class="box">
                            <strong>Bill To:</strong><br>
                            Customer ID: ${order.user || 'N/A'}<br>
                            Date: ${new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div class="box">
                            <strong>Order Details:</strong><br>
                            ID: #${order._id.slice(-6).toUpperCase()}<br>
                            Status: ${order.paymentStatus || 'Pending'}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Weight</th>
                                <th>Grade</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.woolType} <br><small style="color:#999">Batch #${item.batchId}</small></td>
                                    <td>${item.weight} kg</td>
                                    <td>${item.qualityReport?.colorGrade || 'A'}</td>
                                    <td style="text-align: right;">$${((item.weight || 0) * 15).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="text-align: right;">
                        <p class="total-row">Total Amount: <span class="total-price">$${order.totalAmount.toLocaleString()}</span></p>
                    </div>

                    <script>window.print();</script>
                </body>
            </html>
        `;
        invoiceWindow.document.write(invoiceContent);
        invoiceWindow.document.close();
    };


    if (loading) return (
        <DashboardLayout role="Buyer">
            <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="Buyer">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Order History</h1>
                        <p className="text-slate-400">Track your purchases and download invoices.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {orders.map(order => (
                        <Card key={order._id} className="p-0 overflow-hidden bg-surface/50 border-white/5">
                            {/* Order Header */}
                            <div className="bg-white/5 p-4 md:px-6 flex flex-wrap justify-between items-center gap-4 border-b border-white/5">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Date</p>
                                        <p className="text-white font-medium text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total</p>
                                        <p className="text-white font-bold text-sm font-mono">${order.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Status</p>
                                        <Badge variant={order.status === 'Completed' ? 'success' : 'neutral'}>{order.status}</Badge>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {order.status === 'Pending' && order.paymentStatus !== 'Paid' ? (
                                        <Button size="sm" onClick={() => initiatePayment(order)} className="bg-indigo-600 hover:bg-indigo-500">
                                            <CreditCard size={14} className="mr-2" /> Pay Now
                                        </Button>
                                    ) : (
                                        <Badge variant="success" className="h-8"><CheckCircle size={14} className="mr-1" /> Paid</Badge>
                                    )}

                                    <Button size="sm" variant="outline" onClick={() => handleInvoice(order)}>
                                        <Download size={14} className="mr-2" /> Invoice
                                    </Button>

                                    {order.status === 'Pending' && order.paymentStatus !== 'Paid' && (
                                        <button
                                            onClick={() => handleRemove(order._id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                            title="Cancel Order"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4 md:px-6">
                                {order.items.map(item => (
                                    <div key={item._id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={`http://localhost:5000${item.images[0]}`} className="w-full h-full object-cover" alt="item" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Img</div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-medium">{item.woolType}</h4>
                                                <p className="text-xs text-slate-400 font-mono">#{item.batchId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-mono">${((item.weight || 0) * 15).toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">{item.weight} kg</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}

                    {orders.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                            <Package size={48} className="mx-auto text-slate-600 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">No orders placed yet</h3>
                            <Button variant="primary" onClick={() => window.location.href = '/'}>Browse Marketplace</Button>
                        </div>
                    )}
                </div>

                {/* Payment Modal */}
                <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Secure Payment">
                    <div className="space-y-6">
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                            <p className="text-slate-400 text-sm mb-1">Total Payable Amount</p>
                            <p className="text-3xl font-bold text-white font-mono">${selectedOrder?.totalAmount.toLocaleString()}</p>
                        </div>

                        <div className="space-y-3">
                            {['UPI', 'Net Banking', 'Cash on Delivery'].map(method => (
                                <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === method ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="text-indigo-500 focus:ring-indigo-500"
                                    />
                                    <span className="font-medium">{method}</span>
                                </label>
                            ))}
                        </div>

                        <div className="pt-4 flex gap-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 shadow-neon" onClick={confirmPayment}>Pay Now</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default MyOrders;
