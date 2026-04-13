# MongoDB Backend Setup Guide

This is the MongoDB version of the Visitor Management System backend. It uses Mongoose ODM instead of PostgreSQL.

## Prerequisites

- Node.js 16+ installed
- MongoDB 4.4+ installed or MongoDB Atlas account
- npm or yarn package manager

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

**Key Configuration:**

- `MONGODB_URI`: Your MongoDB connection string
  - Local: `mongodb://localhost:27017/visitor_management_system`
  - MongoDB Atlas: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/visitor_management_system?retryWrites=true&w=majority`

- `JWT_SECRET`: Change to a strong secret in production
- `SMTP_*`: Email configuration for password reset notifications
- `FRONTEND_URL`: URL of your React frontend for email links

### 3. Start MongoDB (if running locally)

```bash
# macOS/Linux
mongod

# Windows
net start MongoDB
# or manually run: "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"
```

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT)

## MongoDB vs PostgreSQL Changes

### What Was Changed

This backend was converted from PostgreSQL to MongoDB using Mongoose:

| Aspect | PostgreSQL | MongoDB |
|--------|-----------|---------|
| **Driver** | `pg` | Mongoose |
| **Queries** | SQL parameterized queries | Mongoose model methods |
| **IDs** | Numeric `user_id` | ObjectId `_id` |
| **JOINs** | SQL JOIN clauses | `.populate()` method |
| **Timestamps** | Manual with `NOW()` | Automatic with `timestamps: true` |
| **Transactions** | Direct support | Sessions required |
| **TTL Indexes** | Manual cleanup logic | Built-in TTL expiration |

### Models Created

1. **User** - System users (admins, security guards, etc.)
2. **Visitor** - Visitor records with check-in/out tracking
3. **Meeting** - Meeting schedules between hosts and visitors
4. **PasswordResetOTP** - OTP for password reset (auto-expires in 10 minutes)
5. **VisitorCategory** - Visitor classification categories

### What Stayed the Same

- ✅ **API Endpoints** - All routes remain identical
- ✅ **Controllers** - No changes needed
- ✅ **Middleware** - JWT authentication unchanged
- ✅ **Business Logic** - All functionality preserved
- ✅ **Error Handling** - Same error responses
- ✅ **Authentication** - JWT-based auth still used
- ✅ **Email Service** - Nodemailer for notifications

## Project Structure

```
mongobackend/
├── config/
│   ├── database.js         # MongoDB/Mongoose connection
│   └── mailer.js           # Nodemailer SMTP setup
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Visitor.js
│   ├── Meeting.js
│   ├── PasswordResetOTP.js
│   └── VisitorCategory.js
├── controllers/            # Request handlers (6 files)
├── services/               # Business logic (6 files)
├── routes/                 # API endpoints (6 files)
├── middleware/             # Express middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── utils/                  # Utility functions
│   ├── auth.js
│   ├── validators.js
│   └── constants.js
├── index.js                # Main server file
├── package.json
.env.example               # Environment template
└── .gitignore
```

## API Endpoints

All endpoints remain the same as the PostgreSQL version:

### Authentication
- `POST /api/auth/check-user` - Check if user exists
- `POST /api/auth/verify-password` - Verify login credentials

### Users
- `GET /api/users/pending` - Get pending user approvals
- `GET /api/users/approved` - Get approved users
- `POST /api/users/approve/:id` - Approve a user
- `DELETE /api/users/reject/:id` - Reject a user

### Visitors
- `POST /api/visitors/register` - Register new visitor
- `GET /api/visitors/pending` - Get pending visitor approvals
- `POST /api/visitors/approve/:id` - Approve visitor
- `DELETE /api/visitors/reject/:id` - Reject visitor

### Meetings
- `POST /api/meetings/schedule` - Schedule a meeting
- `GET /api/meetings/user/:id` - Get user meetings
- `GET /api/meetings/:id` - Get meeting details
- `PUT /api/meetings/:id` - Update meeting status

### Password Reset
- `POST /api/password-reset/request` - Request password reset
- `POST /api/password-reset/verify-otp` - Verify OTP
- `POST /api/password-reset/reset` - Reset password

### Security Guard
- `GET /api/security/unvalidated-visitors` - Get unvalidated visitors
- `POST /api/security/validate/:id` - Validate visitor ID
- `DELETE /api/security/reject/:id` - Reject visitor
- `POST /api/security/check-in/:id` - Check in visitor
- `POST /api/security/check-out/:id` - Check out visitor
- `GET /api/security/logs` - Get visitor logs

## Development vs Production

### Development
```bash
npm run dev
# Uses nodemon for hot reloading
```

### Production
```bash
npm start
# Direct execution
```

**⚠️ Remember to:**
- Set `NODE_ENV=production` in `.env`
- Use strong `JWT_SECRET`
- Configure proper SMTP credentials
- Enable TLS for production database
- Add HTTPS to frontend URL

## Database Initialization

The MongoDB collections will be created automatically on first write. No schema migration needed.

For seed data, add your initialization script to `config/database.js`:

```javascript
// After connection established
await User.create([...initial users...]);
await VisitorCategory.create([...categories...]);
```

## Troubleshooting

### Connection Issues
```
Error: MongooseError - connect ECONNREFUSED
```
- Ensure MongoDB is running
- Check `MONGODB_URI` is correct
- Verify network connectivity for Atlas

### JWT Errors
```
Error: Invalid or expired token
```
- Header format should be: `Authorization: Bearer <token>`
- Verify `JWT_SECRET` matches between server and client

### Email Not Sending
- Verify SMTP credentials in `.env`
- For Gmail: Use "App Password" not regular password
- Check "Less secure app access" settings

### ID Mismatch
- If receiving `Cannot read property 'toString' of undefined`
- Ensure IDs are valid MongoDB ObjectIds
- Check controller is converting string IDs if needed

## Migration Notes

If migrating from PostgreSQL version:
1. All numeric IDs will need to be mapped to new ObjectIds
2. User scripts should handle `_id` instead of `user_id`
3. Test all `.populate()` chains for relationship loading
4. OTP auto-expires (no manual cleanup needed)

## Performance Tips

1. **Indexing** - Already indexed on email, status, dates
2. **Projections** - Use `.select()` to limit fetched fields
3. **Batch Operations** - Use `.insertMany()` for bulk inserts
4. **Connection Pooling** - Mongoose handles automatically

```javascript
// Example optimizations
User.find({status: 'approved'}).select('email full_name');
Visitor.find({}).limit(10).skip(page * 10);
Meeting.find({}).populate('visitor_id', 'name email');
```

## Monitoring

Check MongoDB Atlas dashboard or local MongoDB:

```bash
# Local MongoDB shell
mongosh

# View databases
show dbs

# Switch to app database
use visitor_management_system

# View collections
show collections

# Check document count
db.users.countDocuments()

# Monitor indexes
db.users.getIndexes()
```

## Security Checklist

- [ ] Changed `JWT_SECRET` to unique value
- [ ] Using strong database password
- [ ] SMTP credentials are secure
- [ ] `.env` is in `.gitignore` (never commit)
- [ ] TLS enabled for production MongoDB
- [ ] CORS configured for frontend origin
- [ ] Rate limiting implemented (optional)
- [ ] Input validation on all routes
- [ ] No console.log() in production
- [ ] Error messages don't leak sensitive data

## Support

For issues or questions:
1. Check MongoDB logs: `mongosh` → `db.getProfilingStatus()`
2. Enable debug mode: `DEBUG=*` before running
3. Check application logs in console output
4. Verify `.env` configuration

---

**Last Updated:** 2024
**Version:** 2.0 (MongoDB)
**Previous Version:** 1.0 (PostgreSQL VMS-Backend)
