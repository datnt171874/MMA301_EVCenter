import { connectDB } from "../libs/db.js";
import { Package, PACKAGE_TYPES } from "../models/Package.js";

const initData = async () => {
    try {
        await connectDB();

        // Check if packages already exist
        const existingPackages = await Package.find({});
        if (existingPackages.length > 0) {
            console.log("✅ Packages already exist, skipping...");
            return;
        }

        // Create packages
        const packages = [
            {
                name: "Gói Đồng",
                type: PACKAGE_TYPES.BRONZE,
                price: 0,
                freePosts: 4,
                description: "Miễn phí 4 bài đăng đầu tiên"
            },
            {
                name: "Gói Vàng", 
                type: PACKAGE_TYPES.GOLD,
                price: 500000,
                freePosts: 8,
                description: "Mua gói vàng để có 8 bài đăng miễn phí"
            }
        ];

        for (const pkg of packages) {
            const packageDoc = new Package(pkg);
            await packageDoc.save();
            console.log(`✅ Created package: ${pkg.name}`);
        }

        console.log("✅ Data initialization completed!");

    } catch (error) {
        console.error("❌ Error initializing data:", error);
    }
};

export default initData;


