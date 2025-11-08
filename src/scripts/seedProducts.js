import dotenv from "dotenv";
import { connectDB } from "../libs/db.js";
import { Product, PRODUCT_STATUS, PRODUCT_CATEGORIES } from "../models/Product.js";
import { Shop } from "../models/Shop.js";
import { User } from "../models/User.js";

// Load environment variables
dotenv.config();

const seedProducts = async () => {
    try {
        await connectDB();

        // Find a shop user
        const shopUser = await User.findOne({ roleName: "SHOP" });
        if (!shopUser) {
            console.log("❌ Không tìm thấy Shop nào. Vui lòng tạo Shop trước.");
            process.exit(1);
        }

        // Find or create shop
        let shop = await Shop.findOne({ shopId: shopUser._id });
        if (!shop) {
            shop = new Shop({
                shopId: shopUser._id,
                shopName: "Shop Xe Điện ABC",
                address: "123 Đường ABC, Quận 1, TP.HCM",
                description: "Chuyên bán pin và xe điện đã qua sử dụng",
                isActive: true,
            });
            await shop.save();
        }

        // Clear existing products (optional - comment out if you want to keep existing)
        // await Product.deleteMany({});

        // Create 5 products
        const products = [
            {
                shopId: shop._id,
                name: "Pin xe điện 48V 20Ah - Hàng chính hãng",
                description: "Pin xe điện 48V 20Ah, dung lượng cao, tuổi thọ lâu dài. Đã qua sử dụng nhưng còn tốt, đảm bảo chất lượng.",
                images: [],
                category: PRODUCT_CATEGORIES.BATTERY,
                brand: "Panasonic",
                price: { amount: 2500000, currency: "VND" },
                stock: 3,
                specs: {
                    batteryCapacityWh: 960,
                    rangeKm: 50,
                },
                status: PRODUCT_STATUS.APPROVED,
            },
            {
                shopId: shop._id,
                name: "Xe điện Yadea G5 - Xe còn mới 90%",
                description: "Xe điện Yadea G5, đã sử dụng 6 tháng, còn bảo hành. Xe chạy êm, pin còn tốt, không có sự cố gì.",
                images: [],
                category: PRODUCT_CATEGORIES.ELECTRIC_SCOOTER,
                brand: "Yadea",
                price: { amount: 8500000, currency: "VND" },
                stock: 1,
                specs: {
                    batteryCapacityWh: 1200,
                    motorPowerW: 800,
                    rangeKm: 60,
                    topSpeedKmh: 45,
                    weightKg: 55,
                },
                status: PRODUCT_STATUS.APPROVED,
            },
            {
                shopId: shop._id,
                name: "Pin xe điện 60V 30Ah - Pin mới thay",
                description: "Pin xe điện 60V 30Ah, mới thay được 3 tháng. Pin còn rất tốt, sạc đầy chạy được 70-80km.",
                images: [],
                category: PRODUCT_CATEGORIES.BATTERY,
                brand: "LG",
                price: { amount: 3500000, currency: "VND" },
                stock: 2,
                specs: {
                    batteryCapacityWh: 1800,
                    rangeKm: 75,
                },
                status: PRODUCT_STATUS.APPROVED,
            },
            {
                shopId: shop._id,
                name: "Xe điện VinFast Klara S - Hàng đã qua sử dụng",
                description: "Xe điện VinFast Klara S, đã sử dụng 1 năm. Xe còn tốt, pin ổn định, đầy đủ phụ kiện.",
                images: [],
                category: PRODUCT_CATEGORIES.ELECTRIC_SCOOTER,
                brand: "VinFast",
                price: { amount: 12000000, currency: "VND" },
                stock: 1,
                specs: {
                    batteryCapacityWh: 1500,
                    motorPowerW: 1000,
                    rangeKm: 80,
                    topSpeedKmh: 50,
                    weightKg: 65,
                },
                status: PRODUCT_STATUS.APPROVED,
            },
            {
                shopId: shop._id,
                name: "Pin xe điện 72V 40Ah - Pin cao cấp",
                description: "Pin xe điện 72V 40Ah, loại cao cấp, tuổi thọ cao. Pin còn tốt, sạc nhanh, chạy xa.",
                images: [],
                category: PRODUCT_CATEGORIES.BATTERY,
                brand: "Samsung",
                price: { amount: 5000000, currency: "VND" },
                stock: 1,
                specs: {
                    batteryCapacityWh: 2880,
                    rangeKm: 100,
                },
                status: PRODUCT_STATUS.APPROVED,
            },
        ];

        for (const productData of products) {
            const product = new Product(productData);
            await product.save();
            console.log(`✅ Created product: ${product.name}`);
        }

        console.log("✅ Products seeded successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error seeding products:", error);
        process.exit(1);
    }
};

seedProducts();

