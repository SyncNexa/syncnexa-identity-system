namespace Express {
  interface Request {
    user?: User | Student | Developer | Staff;
    authRole?: "student" | "developer" | "staff";
  }
}
