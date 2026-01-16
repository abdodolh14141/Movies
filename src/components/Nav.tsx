"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setIsLoggedIn(true);
      setUserName(session.user.name || "User");
    } else {
      setIsLoggedIn(false);
    }
  }, [session, status]);

  const firstName = useMemo(() => userName.split(" ")[0], [userName]);

  type LinkButtonProps = React.PropsWithChildren<{
    href: string;
    className?: string;
    [key: string]: any;
  }>;

  const LinkButton: React.FC<LinkButtonProps> = ({
    href,
    children,
    className = "",
    ...props
  }) => (
    <Link
      href={href}
      className={`hover:bg-red-700 py-1 px-4 rounded transition ${className}`}
      {...props}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-zinc-600 text-white text-xl p-2 flex items-center justify-between">
      <div className="flex items-center space-x-5">
        <LinkButton href="/">Home</LinkButton>
        <LinkButton href="/movie">Movies</LinkButton>
      </div>

      {isLoggedIn && (
        <div>
          <h1 className="text-center m-2 p-1 text-2xl">
            Welcome, {firstName} !
          </h1>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            <LinkButton href="/about" className="hover:bg-emerald-600">
              About
            </LinkButton>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <LinkButton href="/about">About</LinkButton>
            <LinkButton href="/login">Login</LinkButton>
            <LinkButton href="/signIn">Sign Up</LinkButton>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
