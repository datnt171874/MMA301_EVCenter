import { connectDB } from "../libs/db.js";
import { Package, PACKAGE_TYPES } from "../models/Package.js";

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


