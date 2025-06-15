async function checkApi() {
  const categories = ['HOUSE', 'APARTMENT']
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  for (const category of categories) {
    const response = await fetch(`${baseUrl}/api/properties?category=${category}`)
    const data = await response.json()
    console.log(`API Response for category ${category}:`, data)
  }
}

checkApi().catch(console.error) 