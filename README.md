#  Finance Data System

A modern **full-stack finance management platform** to track transactions, analyze spending, manage goals, and provide actionable financial insights with an admin-controlled system.

---

##  Overview

The **Finance Data System** enables users to manage their finances efficiently while providing admins with tools to monitor and control system data.

-  Real-time financial tracking  
-  Advanced analytics & insights  
-  Goal-based savings tracking  
-  Admin panel with user management  
-  Light/Dark theme support  

---

##  Features

###  User Features

- Add / Edit / Delete transactions  
- Categorize income and expenses  
- Track spending patterns  
- View financial insights  
- Manage savings goals  
- Dynamic greeting (Morning / Afternoon / Evening)  

---

###  Dashboard

- Total Users  
- Active Users  
- Transactions Count  
- Total Income / Expenses  
- Net Balance  

- Charts:
  - Transactions (last 30 days)
  - User role distribution  

---

###  Insights

- Month-over-month comparison  
- Income vs Expense trends  
- Category breakdown  
- Top spending category  
- Highest expense day  
- Average daily spending  

---

###  Goals

- Create and manage financial goals  
- Track:
  - Total saved  
  - Target amount  
  - Progress percentage  
- Add savings to goals  

---

###  Admin Panel

####  User Management
- View all users  
- Activate / Deactivate users  
- Delete users  
- Search and filter users  

####  Transaction Management
- Add transaction via form  
- Filter by date, type, category  
- Sort and paginate data  
- Export CSV  

---

##  Application Routes

###  User Routes

| Route | Description |
|------|------------|
| `/dashboard` | Main dashboard with overview |
| `/transactions` | Manage all transactions |
| `/goals` | Goal tracking page |
| `/insights` | Financial analytics page |

---

###  Admin Routes

| Route | Description |
|------|------------|
| `/admin/dashboard` | Admin overview dashboard |
| `/admin/transactions` | Manage all transactions |
| `/admin/adminpanel` | User management panel |
| `/admin/insights` | Admin analytics view |

---

##  UI/UX Highlights

-  Light & Dark mode (persistent)  
-  Fully responsive design  
-  Clean dashboard layout  
-  Sidebar navigation  
-  Notification system  
-  Smooth interactions  

---

##  Tech Stack

### Frontend
- React.js
- Tailwind CSS  
- Recharts / Chart.js  

### Backend
- Node.js  
- Express.js  

### Database
- MongoDB atlas

---

## Key Implementations

- Centralized theme management
- Role-based access control (Admin / Analyst / Viewer)
- Real-time UI updates
- Modular architecture
- Efficient filtering and sorting

---

## Install Dependencies
`npm install`

## Future Enhancements

- Real-time notifications
- Mobile app version
- Advanced authentication
- AI-based financial insights
- Bank API integration

## Conclusion

This project demonstrates:

- Strong full-stack development
- Clean UI/UX design
- Practical system design
- Real-world finance application logic

