"use client";

// import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/tailwind-light/theme.css";
import "./globals.css";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Test",
// };

import { signIn } from "next-auth/react";

export default function RootLayout({
  children,
  params: { session, ...params },
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="absolute top-0 left-0 right-0 p-3 bg-white shadow-sm">
          <div className="relative flex justify-end w-full">
            <button
              onClick={() =>
                signOut({
                  callbackUrl: "http://localhost:22137",
                })
              }
              className="px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign out
            </button>
          </div>
        </div>

        <SessionProvider session={session}>
          {isLoading ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center w-screen h-screen bg-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-loader-2 animate-spin"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  stroke="none"
                  d="M0 0h24v24H0z"
                  fill="none"
                />
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
            </div>
          ) : (
            <>{children}</>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
