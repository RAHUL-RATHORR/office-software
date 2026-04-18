export const clients = [
  {
    id: 1,
    name: "Rahul",
    phone: "9876543210",
    email: "rahul@example.com",
    avatar: "https://ui-avatars.com/api/?name=Rahul&background=8b5cf6&color=fff",
  },
  {
    id: 2,
    name: "Aman",
    phone: "9876543211",
    email: "aman@example.com",
    avatar: "https://ui-avatars.com/api/?name=Aman&background=10b981&color=fff",
  },
  {
    id: 3,
    name: "Suresh",
    phone: "9876543212",
    email: "suresh@example.com",
    avatar: "https://ui-avatars.com/api/?name=Suresh&background=ef4444&color=fff",
  },
];

export const domains = [
  {
    id: 1,
    clientName: "Rahul",
    domainName: "rahulstore.com",
    expiryDate: "2026-04-24", // 7 days from Apr 17
    daysLeft: 7,
    paymentStatus: "Pending",
    remainingAmount: 2000,
    status: "Expiring Soon",
    platform: "GoDaddy",
  },
  {
    id: 2,
    clientName: "Aman",
    domainName: "amanblog.in",
    expiryDate: "2026-05-17", // 30 days
    daysLeft: 30,
    paymentStatus: "Paid",
    remainingAmount: 0,
    status: "Active",
    platform: "Hostinger",
  },
  {
    id: 3,
    clientName: "Suresh",
    domainName: "sureshprint.com",
    expiryDate: "2026-04-18", // 1 day
    daysLeft: 1,
    paymentStatus: "Pending",
    remainingAmount: 1500,
    status: "Urgent",
    platform: "BigRock",
  },
];

export const stats = {
  totalClients: 3,
  totalPendingAmount: 3500,
  expiringDomains: 2,
};
