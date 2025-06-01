async function main() {
  const categories = ['HOUSE', 'APARTMENT']
  for (const category of categories) {
    const response = await fetch(`http://localhost:3000/api/properties?category=${category}`)
    const data = await response.json()
    console.log(`API Response for category ${category}:`, data)
  }
}

main().catch(console.error) 