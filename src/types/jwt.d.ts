interface JwtPayload {
  id: string;
  role: "student" | "developer" | "staff";
  email: string;
}

interface TokenPayload {
  id: string;
  email: string;
  user_role: "student" | "developer" | "staff";
}
