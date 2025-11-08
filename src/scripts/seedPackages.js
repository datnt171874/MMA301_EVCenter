import dotenv from "dotenv";
import { connectDB } from "../libs/db.js";
import { Package, PACKAGE_TYPES } from "../models/Package.js";

// Load environment variables
dotenv.config();

const seedPackages = async () => {
    try {
        await connectDB();

        // Clear existing packages
        await Package.deleteMany({});

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
            console.log(`Created package: ${pkg.name}`);
        }

        console.log("Packages seeded successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Error seeding packages:", error);
        process.exit(1);
    }
};

seedPackages();


