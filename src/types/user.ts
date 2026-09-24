export interface User {
  uid: string;
  email: string;
  displayName: string;
  studentId: string;
  createdAt?: string;
  /** @deprecated Tương thích ngược: alias cho displayName */
  name?: string;
  /** @deprecated Tương thích ngược: alias cho uid */
  id?: string;
}
