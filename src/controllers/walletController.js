import { Wallet, Transaction, TRANSACTION_TYPES, TRANSACTION_STATUS } from "../models/Wallet.js";


export const getWalletInfo = async (req, res) => {
    try {
        const shopId = req.user.userId;

        let wallet = await Wallet.findOne({ shopId });
        if (!wallet) {
            wallet = new Wallet({ shopId, balance: 0 });
            await wallet.save();
        }

        res.json({
            success: true,
            data: { wallet }
        });

    } catch (error) {
        console.error("Get wallet error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy thông tin ví"
        });
    }
};


export const getTransactions = async (req, res) => {
    try {
        const shopId = req.user.userId;
        const { page = 1, limit = 10, type } = req.query;

        const filter = { shopId };
        if (type) {
            filter.type = type;
        }

        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments(filter);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error("Get transactions error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy lịch sử giao dịch"
        });
    }
};


export const depositMoney = async (req, res) => {
    try {
        const { amount, method = "BANK_TRANSFER" } = req.body;
        const shopId = req.user.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Số tiền nạp không hợp lệ"
            });
        }

       
        let wallet = await Wallet.findOne({ shopId });
        if (!wallet) {
            wallet = new Wallet({ shopId, balance: 0 });
            await wallet.save();
        }

        
        const transaction = new Transaction({
            walletId: wallet._id,
            shopId,
            type: TRANSACTION_TYPES.DEPOSIT,
            amount,
            description: `Nạp tiền qua ${method}`,
            status: TRANSACTION_STATUS.PENDING
        });
        await transaction.save();

        
        wallet.balance += amount;
        await wallet.save();

        transaction.status = TRANSACTION_STATUS.COMPLETED;
        transaction.completedAt = new Date();
        await transaction.save();

        res.status(201).json({
            success: true,
            message: "Nạp tiền thành công",
            data: {
                transaction,
                wallet: { balance: wallet.balance }
            }
        });

    } catch (error) {
        console.error("Deposit money error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi nạp tiền"
        });
    }
};


export const withdrawMoney = async (req, res) => {
    try {
        const { amount, bankAccount, bankName, accountHolder } = req.body;
        const shopId = req.user.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Số tiền rút không hợp lệ"
            });
        }

        if (!bankAccount || !bankName || !accountHolder) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng"
            });
        }

        // Tìm ví
        let wallet = await Wallet.findOne({ shopId });
        if (!wallet) {
            wallet = new Wallet({ shopId, balance: 0 });
            await wallet.save();
        }

        // Kiểm tra số dư
        if (wallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Số dư không đủ để rút tiền"
            });
        }

        // Tạo transaction
        const transaction = new Transaction({
            walletId: wallet._id,
            shopId,
            type: TRANSACTION_TYPES.WITHDRAW,
            amount,
            description: `Rút tiền về tài khoản ${bankName} - ${accountHolder} (${bankAccount})`,
            status: TRANSACTION_STATUS.PENDING
        });
        await transaction.save();

        // Trừ số dư
        wallet.balance -= amount;
        await wallet.save();

        // Cập nhật transaction thành completed
        transaction.status = TRANSACTION_STATUS.COMPLETED;
        transaction.completedAt = new Date();
        await transaction.save();

        res.status(201).json({
            success: true,
            message: "Yêu cầu rút tiền đã được gửi thành công. Tiền sẽ được chuyển vào tài khoản của bạn trong vòng 1-3 ngày làm việc.",
            data: {
                transaction,
                wallet: { balance: wallet.balance }
            }
        });

    } catch (error) {
        console.error("Withdraw money error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi rút tiền"
        });
    }
};


