"use client";
import styles from "../styles/Navbar.module.css";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import Image from "next/image";
import { useState, useEffect } from "react";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type NavbarProps = {
  user?: User;
};

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <button
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <span className={styles.hamburgerIcon}>☰</span>
        </button>

        {/* Logo */}
        <div
          className={styles.logo}
          onClick={() => handleNavigation("/")}
          style={{ cursor: "pointer" }}
        >
          TrashNav
        </div>

        {/* Navigation Links */}
        <ul
          className={`${styles.navList} ${menuOpen ? styles.mobileMenuOpen : ""}`}
        >
          <li>
            <button
              className={styles.navButton}
              onClick={() => handleNavigation("/report")}
            >
              Report
            </button>
          </li>
          <li>
            <button
              className={styles.navButton}
              onClick={() => handleNavigation("/map")}
            >
              Map
            </button>
          </li>
          <li>
            <button
              className={styles.navButton}
              onClick={() => handleNavigation("/insights")}
            >
              Insights
            </button>
          </li>
        </ul>

        {/* Profile or Sign In */}
        <div className={styles.profileContainer}>
          {user ? (
            // Show profile picture if user is signed in
            <Image
              src={user.image || "/default-profile.png"} // Fallback to a default image
              alt="Profile Picture"
              width={35}
              height={35}
              className={styles.profileImage}
              onClick={() => handleNavigation("/profile")}
            />
          ) : (
            // Show Sign In button if user is not signed in
            <button
              className={styles.signInButton}
              onClick={() => handleNavigation("/api/auth/signin")}
              aria-label="Sign In"
            >
              <span className={styles.signInText}>Sign In</span>
            </button>
          )}

          {/* Sign Out Button (only visible if user is signed in) */}
          {user && (
            <button
              className={styles.signOutButton}
              onClick={() => handleNavigation("/api/auth/signout")}
              aria-label="Sign Out"
            >
              <FiLogOut size={22} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
