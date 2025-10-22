Ban đầu register thì role của User sẽ là Customer, nếu muốn trở thành Shop thì phải gửi thông tin (sellingCertificate) và Admin sẽ xác nhận => Shop.IsVerified = true => User.RoleName = SHOP

### Register
- URL: `POST /api/auth/register`
- Body:
```json
{
  "email": "user@example.com",
  "password": "123456",
  "confirmPassword": "123456"
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