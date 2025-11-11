import Link from "next/link";
import Image from "next/image";

import logoImg from "@/assets/logo.png";
import styles from "./main-header.module.css";
import NavLink from "./nav-link";

export default function MainHeader() {
    return (
        <header className={styles.header}>
            <Link className={styles.logo} href="/">
                <Image src={logoImg} alt="Some nice logo" priority/>
                Next Level Food
            </Link>
            <nav className={styles.nav}>
                <ul>
                    <li><NavLink href="/meals">Browse Meals</NavLink></li>
                    <li><NavLink href="/community">Foodies Community</NavLink></li>
                </ul>
            </nav>
            
        </header>
  );
}