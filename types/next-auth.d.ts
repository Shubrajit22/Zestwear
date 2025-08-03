import { DefaultSession, DefaultUser, AdapterUser } from "next-auth";

// Extend the AdapterUser type to include the 'mobile' and 'isAdmin' fields
declare module "next-auth" {
  interface User extends DefaultUser {
    mobile?: string;  // Add mobile to User type
    isAdmin: boolean;  // Add isAdmin to User type
  }

  // Extend AdapterUser to include mobile and isAdmin
  interface AdapterUser extends DefaultUser {
    mobile?: string;
    isAdmin: boolean;  // Add isAdmin to AdapterUser
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      mobile?: string; 
      isAdmin: boolean; // Add isAdmin to Session user
    } & DefaultSession["user"];
    cartItems?: any[]; // Replace `any` with your actual CartItem type
  }

  interface JWT {
    id: string;
    email: string;
    name: string;
    picture?: string;
    mobile?: string;  // Add mobile to JWT
    isAdmin: boolean; // Add isAdmin to JWT
  }
}
