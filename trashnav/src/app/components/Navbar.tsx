"use client";
import styles from "../styles/Navbar.module.css";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.logo}>TrashNav</div>
                <ul className={styles.navList}>
                    <li><button className={styles.navButton} onClick={() => handleNavigation('/')}>Home</button></li>
                    <li><button className={styles.navButton} onClick={() => handleNavigation('/api/auth/signin')}>Sign In</button></li>
                    <li><button className={styles.navButton} onClick={() => handleNavigation('/api/auth/signout')}>Sign Out</button></li>
                    <li><button className={styles.navButton} onClick={() => handleNavigation('/report')}>Report</button></li>
                    <li><button className={styles.navButton} onClick={() => handleNavigation('/map')}>Map</button></li>
                </ul>
            </div>
        </nav>
    );
}
