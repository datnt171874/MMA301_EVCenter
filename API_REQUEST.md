Ban đầu register thì role của User sẽ là Customer, nếu muốn trở thành Shop thì phải gửi thông tin (sellingCertificate) và Admin sẽ xác nhận => Shop.IsVerified = true => User.RoleName = SHOP

### Register
- URL: `POST /api/auth/register`
- Body:
```json
{
  "email": "user@example.com",
  "password": "123456",
  "confirmPassword": "123456",
  "roleName": "SHOP" //CUSTOMER
}
```
- Response 201:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "<userId>",
      "email": "user@example.com",
      "roleName": "CUSTOMER"
    },
    "token": "<jwt-token>"
  }
}
```

### Login
- URL: `POST /api/auth/login`
- Body:
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```
- Response 200:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "<userId>",
      "email": "user@example.com",
      "roleName": "CUSTOMER"
    },
    "token": "<jwt-token>"
  }
}
```

---

## 📦 Package APIs

### Get All Packages
- URL: `GET /api/packages`
- Auth: Không cần
- Response 200:
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "_id": "68fbb406a32fadfe310534d3",
        "name": "Gói Đồng",
        "type": "BRONZE",
        "price": 0,
        "freePosts": 4,
        "description": "Miễn phí 4 bài đăng đầu tiên",
        "isActive": true
      },
      {
        "_id": "68fbb406a32fadfe310534d4",
        "name": "Gói Vàng",
        "type": "GOLD",
        "price": 500000,
        "freePosts": 8,
        "description": "Mua gói vàng để có 8 bài đăng miễn phí",
        "isActive": true
      }
    ]
  }
}
```

### Purchase Package
- URL: `POST /api/packages/purchase`
- Auth: Bearer token (SHOP)
- Body:
```json
{
  "packageId": "68fbb406a32fadfe310534d4"
}
```
- Response 201:
```json
{
  "success": true,
  "message": "Mua gói thành công",
  "data": {
    "shopPackage": {
      "shopId": "68f9b7dcf54f5f28eb4cc244",
      "packageId": "68fbb406a32fadfe310534d4",
      "packageName": "Gói Vàng",
      "packageType": "GOLD",
      "freePosts": 8,
      "usedPosts": 0,
      "remainingPosts": 8,
      "status": "ACTIVE"
    },
    "wallet": {
      "balance": 4500000
    }
  }
}
```

### Get Shop Packages
- URL: `GET /api/packages/shop/my-packages`
- Auth: Bearer token (SHOP)
- Query params: `?page=1&limit=10`
- Response 200:
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "_id": "68fbb41da32fadfe310534eb",
        "shopId": "68f9b7dcf54f5f28eb4cc244",
        "packageId": {
          "_id": "68fbb406a32fadfe310534d4",
          "name": "Gói Vàng",
          "type": "GOLD",
          "price": 500000,
          "freePosts": 8
        },
        "packageName": "Gói Vàng",
        "packageType": "GOLD",
        "freePosts": 8,
        "usedPosts": 2,
        "remainingPosts": 6,
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1
    }
  }
}
```

### Get Remaining Posts
- URL: `GET /api/packages/shop/remaining-posts`
- Auth: Bearer token (SHOP)
- Response 200:
```json
{
  "success": true,
  "data": {
    "remainingPosts": 6,
    "packages": [
      {
        "_id": "68fbb41da32fadfe310534eb",
        "packageName": "Gói Vàng",
        "remainingPosts": 6,
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

## 💰 Wallet APIs

### Get Wallet Info
- URL: `GET /api/wallet`
- Auth: Bearer token (SHOP)
- Response 200:
```json
{
  "success": true,
  "data": {
    "wallet": {
      "_id": "68fbb41ea32fadfe310534ec",
      "shopId": "68f9b7dcf54f5f28eb4cc244",
      "balance": 4500000,
      "isActive": true
    }
  }
}
```

### Deposit Money
- URL: `POST /api/wallet/deposit`
- Auth: Bearer token (SHOP)
- Body:
```json
{
  "amount": 1000000,
  "method": "BANK_TRANSFER"
}
```
- Response 201:
```json
{
  "success": true,
  "message": "Nạp tiền thành công",
  "data": {
    "transaction": {
      "_id": "68fbb41fa32fadfe310534ed",
      "type": "DEPOSIT",
      "amount": 1000000,
      "description": "Nạp tiền qua BANK_TRANSFER",
      "status": "COMPLETED",
      "completedAt": "2024-10-24T00:00:00.000Z"
    },
    "wallet": {
      "balance": 5500000
    }
  }
}
```

### Get Transactions
- URL: `GET /api/wallet/transactions`
- Auth: Bearer token (SHOP)
- Query params: `?page=1&limit=10&type=DEPOSIT`
- Response 200:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "_id": "68fbb41fa32fadfe310534ed",
        "type": "DEPOSIT",
        "amount": 1000000,
        "description": "Nạp tiền qua BANK_TRANSFER",
        "status": "COMPLETED",
        "completedAt": "2024-10-24T00:00:00.000Z"
      },
      {
        "_id": "68fbb41da32fadfe310534eb",
        "type": "PURCHASE_PACKAGE",
        "amount": -500000,
        "description": "Mua gói Gói Vàng",
        "status": "COMPLETED",
        "completedAt": "2024-10-23T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 2
    }
  }
}
```

---

## 🏪 Shop APIs

### Get Shop Profile
- URL: `GET /api/shop/profile`
- Auth: Bearer token (SHOP)
- Response 200:
```json
{
  "success": true,
  "data": {
    "shop": {
      "_id": "68f9b7dcf54f5f28eb4cc244",
      "shopId": {
        "_id": "68f9b7dcf54f5f28eb4cc244",
        "email": "shop1@gmail.com",
        "fullName": "Shop ABC",
        "phoneNumber": "0123456789"
      },
      "shopName": "Shop ABC",
      "address": "123 Đường ABC, Quận 1",
      "description": "Chuyên bán xe điện",
      "logo": "https://example.com/logo.jpg",
      "isVerified": true,
      "isActive": true
    }
  }
}
```

### Update Shop Profile
- URL: `PUT /api/shop/profile`
- Auth: Bearer token (SHOP)
- Body:
```json
{
  "shopName": "Shop ABC",
  "address": "123 Đường ABC, Quận 1",
  "description": "Chuyên bán xe điện",
  "logo": "https://example.com/logo.jpg"
}
```
- Response 200:
```json
{
  "success": true,
  "message": "Cập nhật thông tin shop thành công",
  "data": {
    "shop": {
      "_id": "68f9b7dcf54f5f28eb4cc244",
      "shopName": "Shop ABC",
      "address": "123 Đường ABC, Quận 1",
      "description": "Chuyên bán xe điện",
      "logo": "https://example.com/logo.jpg"
    }
  }
}
```

### Upload Certificate
- URL: `POST /api/shop/certificate`
- Auth: Bearer token (SHOP)
- Body:
```json
{
  "sellingCertificate": "https://example.com/certificate.pdf"
}
```
- Response 200:
```json
{
  "success": true,
  "message": "Upload giấy phép kinh doanh thành công, đang chờ Admin xác nhận",
  "data": {
    "shop": {
      "_id": "68f9b7dcf54f5f28eb4cc244",
      "shopId": "68f9b7dcf54f5f28eb4cc244",
      "shopName": "Shop ABC",
      "sellingCertificate": "https://example.com/certificate.pdf",
      "isVerified": false
    }
  }
}
```