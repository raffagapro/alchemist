import Link from "next/link";

export default function CustomMealPage({ params}) {
  return (
    <main>
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        Meal #{params.mealSlug}
      </h1>
      <p><Link href="/">Home</Link></p>
      <p><Link href="/meals">Meals</Link></p>
    </main>
  );
}