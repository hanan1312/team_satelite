import { signIn, signOut, useSession } from "next-auth/client";

export default function handler(req, res) {
  res.status(200).json({ name: "John Doe" });
}
