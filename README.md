# Eco-Mali Exchange Platform

A waste management exchange platform connecting generators, recyclers, and stakeholders in Kenya.

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install MongoDB locally
   ```

4. **Seed RBAC System**
   ```bash
   cd server
   node src/scripts/seedRBAC.js
   ```

5. **Start Server**
   ```bash
   npm start
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin/dashboard.html
   - API: http://localhost:3000/api

## 🌐 Deploy to Production

See [DEPLOY_RENDER.md](DEPLOY_RENDER.md) for complete deployment guide to Render.

**Quick Deploy:**
1. Push to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy!

## 📚 Documentation

- [RBAC System](server/src/docs/RBAC_SYSTEM.md)
- [RBAC Integration](server/src/docs/RBAC_INTEGRATION.md)
- [SSH & HTTPS Security](server/src/docs/SSH_HTTPS_SECURITY.md)
- [Deployment Guide](DEPLOY_RENDER.md)

## 🔐 Default Roles

- **Super Admin** - Full system access
- **Admin** - User & transaction management
- **Moderator** - Content moderation
- **County Agent** - Regional oversight
- **Partner** - Partner programs
- **Generator** - Waste producers
- **Recycler** - Waste recyclers
- **Volunteer** - Community support

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- RBAC Authorization
- bcrypt Password Hashing

**Frontend:**
- Vanilla JavaScript
- HTML5 + CSS3
- Responsive Design

## 📦 Project Structure

```
eco-mali-exchange/
├── server/
│   ├── src/
│   │   ├── auth/          # Authentication
│   │   ├── config/        # Configuration
│   │   ├── middleware/    # RBAC middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Utility scripts
│   │   └── utils/         # Helper functions
│   └── package.json
├── js/                    # Frontend JavaScript
├── css/                   # Stylesheets
├── images/                # Assets
├── admin/                 # Admin pages
├── portal/                # User dashboards
└── *.html                 # Public pages
```

## 🔒 Security Features

- JWT token authentication
- RBAC permission system
- Password hashing with bcrypt
- 2FA support (TOTP + SMS)
- Rate limiting
- Audit logging
- Input validation
- CORS protection

## 💰 Wallet System

- Demo mode for testing
- Multiple payment methods (M-Pesa, Bank, Airtel Money)
- Transaction history
- Rate limiting (5 transactions/minute)
- Transaction limits (deposits: KES 10-500K, withdrawals: KES 100-200K)
- Automatic balance updates

## 📊 Features

- ✅ User registration & authentication
- ✅ Role-based access control
- ✅ Waste listing management
- ✅ Bidding system
- ✅ Transaction processing
- ✅ Wallet management
- ✅ Commission calculation
- ✅ Eco-points rewards
- ✅ Admin dashboard
- ✅ Dump site reporting
- ✅ County oversight

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary software for Eco-Mali Exchange Limited.

## 📞 Support

For support, email support@eco-mali.com or open an issue.

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Render for application hosting
- All contributors and testers
