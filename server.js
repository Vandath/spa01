const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// Cho phép truy cập các file tĩnh (HTML, CSS, JS frontend) trong cùng thư mục
app.use(express.static(__dirname));

// --- 2. KẾT NỐI MONGODB ATLAS ---
// Mình đã thêm tên database 'thuytramspa' vào link của bạn để dữ liệu được phân loại rõ ràng
const MONGODB_URI = 'mongodb+srv://cfwvandat_db_user:clmm11As11!@ryoobotnew.v8x1oby.mongodb.net/thuytramspa?retryWrites=true&w=majority&appName=ryoobotnew';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Đã kết nối MongoDB Atlas thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// --- 3. ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU (SCHEMA) ---
const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    message: String,
    seen: { type: Boolean, default: false },
    contacted: { type: Boolean, default: false },
    booked: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false },
    bookingDate: String,
    bookingTime: String,
    bookingService: String,
    bookingNote: String,
    timestamp: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// --- 4. CÁC ĐƯỜNG DẪN GIAO DIỆN (FRONTEND ROUTES) ---

// Trang chủ cho khách hàng
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Trang quản lý cho Admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- 5. CÁC API XỬ LÝ DỮ LIỆU (BACKEND ROUTES) ---

// Lấy danh sách đơn hàng
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ timestamp: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Khách hàng gửi đơn mới
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi tạo đơn' });
    }
});

// Cập nhật trạng thái đơn (Đã xem, Chốt lịch...)
app.put('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi cập nhật' });
    }
});

// Xóa đơn hàng
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa' });
    } catch (error) {
        res.status(400).json({ message: 'Lỗi xóa' });
    }
});

// --- 6. KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});

// Xuất app để Vercel có thể nhận diện làm Serverless Function
module.exports = app;