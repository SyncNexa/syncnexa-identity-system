namespace Express {
  interface Request {
    user?: User | Student | Developer | Staff;
    authRole?: "student" | "developer" | "staff";
    auditLog?: {
      action: string;
      admin_id: string;
      admin_email: string;
      timestamp: string;
      ip_address: string;
      user_agent: string;
    };
  }
}
