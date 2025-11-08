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
                price: 50000,
                freePosts: 4,
                description: "Gói đồng với 4 bài đăng miễn phí"
            },
            {
                name: "Gói Bạc",
                type: PACKAGE_TYPES.SILVER,
                price: 100000,
                freePosts: 6,
                description: "Gói bạc với 6 bài đăng miễn phí"
            },
            {
                name: "Gói Vàng", 
                type: PACKAGE_TYPES.GOLD,
                price: 200000,
                freePosts: 8,
                description: "Gói vàng với 8 bài đăng miễn phí"
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


