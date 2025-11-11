import Link from "next/link";

export default function ShareMealsPage() {
  return (
    <main>
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        Share Meals
      </h1>
      <p><Link href="/">Home</Link></p>
      <p><Link href="/meals">Meals</Link></p>
    </main>
  );
}