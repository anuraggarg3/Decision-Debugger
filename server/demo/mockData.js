/**
 * Mock data for the competitor selection demo
 * 
 * This simulates:
 * - Prospect products (seller's products)
 * - Competitor products (search results)
 * - LLM keyword generation responses
 */

export const sampleProducts = {
  // Prospect products (the seller's products we're finding competitors for)
  prospects: [
    {
      asin: 'B0XYZ001',
      title: 'ProBrand Stainless Steel Water Bottle 32oz Insulated',
      category: 'Sports & Outdoors > Water Bottles',
      price: 29.99,
      rating: 4.2,
      reviews: 1247,
      features: ['Double-wall vacuum insulation', 'BPA-free', 'Keeps drinks cold 24hrs']
    },
    {
      asin: 'B0XYZ002',
      title: 'SoundMax Pro Wireless Earbuds with Noise Cancelling',
      category: 'Electronics > Headphones',
      price: 79.99,
      rating: 4.1,
      reviews: 892,
      features: ['Active noise cancellation', '30hr battery', 'IPX5 water resistant']
    },
    {
      asin: 'B0XYZ003',
      title: 'ZenFlex Premium Yoga Mat 6mm Extra Thick',
      category: 'Sports & Outdoors > Yoga',
      price: 45.99,
      rating: 4.4,
      reviews: 2103,
      features: ['Non-slip surface', 'Eco-friendly TPE', 'Carrying strap included']
    }
  ],

  // Competitor products that might be returned from search
  competitors: {
    'water-bottles': [
      { asin: 'B0COMP001', title: 'HydroFlask Wide Mouth 32oz', price: 44.99, rating: 4.5, reviews: 8932, isCompetitor: true },
      { asin: 'B0COMP002', title: 'Yeti Rambler 26oz Bottle', price: 34.99, rating: 4.4, reviews: 5621, isCompetitor: true },
      { asin: 'B0COMP003', title: 'Stanley Classic Vacuum Bottle', price: 35.00, rating: 4.3, reviews: 4102, isCompetitor: true },
      { asin: 'B0COMP004', title: 'Contigo AutoSeal Water Bottle', price: 14.99, rating: 4.2, reviews: 12543, isCompetitor: true },
      { asin: 'B0COMP005', title: 'Nalgene Wide Mouth 32oz', price: 12.99, rating: 4.6, reviews: 7891, isCompetitor: true },
      { asin: 'B0COMP006', title: 'CamelBak Chute Mag', price: 16.99, rating: 4.3, reviews: 6234, isCompetitor: true },
      { asin: 'B0COMP007', title: 'Generic Plastic Bottle', price: 5.99, rating: 3.1, reviews: 45, isCompetitor: true },
      { asin: 'B0COMP008', title: 'Premium Titanium Water Bottle', price: 129.00, rating: 4.8, reviews: 234, isCompetitor: true },
      { asin: 'B0COMP009', title: 'Iron Flask Sports Bottle 40oz', price: 24.99, rating: 4.5, reviews: 9876, isCompetitor: true },
      { asin: 'B0COMP010', title: 'Simple Modern Wave Bottle', price: 19.99, rating: 4.4, reviews: 5432, isCompetitor: true },
      // False positives (not actual competitors)
      { asin: 'B0FALSE001', title: 'Bottle Cleaning Brush Set', price: 9.99, rating: 4.6, reviews: 3421, isCompetitor: false },
      { asin: 'B0FALSE002', title: 'Replacement Lid for HydroFlask', price: 8.99, rating: 4.2, reviews: 1234, isCompetitor: false },
      { asin: 'B0FALSE003', title: 'Water Bottle Carrier Bag with Strap', price: 12.99, rating: 4.1, reviews: 876, isCompetitor: false },
      { asin: 'B0FALSE004', title: 'Insulated Bottle Sleeve', price: 7.99, rating: 4.0, reviews: 543, isCompetitor: false },
      { asin: 'B0FALSE005', title: 'Straw Lid Accessory Pack', price: 14.99, rating: 4.3, reviews: 2341, isCompetitor: false }
    ],
    'wireless-earbuds': [
      { asin: 'B0COMP101', title: 'Apple AirPods Pro 2nd Gen', price: 249.00, rating: 4.7, reviews: 45678, isCompetitor: true },
      { asin: 'B0COMP102', title: 'Sony WF-1000XM5', price: 279.99, rating: 4.6, reviews: 12345, isCompetitor: true },
      { asin: 'B0COMP103', title: 'Samsung Galaxy Buds2 Pro', price: 159.99, rating: 4.4, reviews: 8765, isCompetitor: true },
      { asin: 'B0COMP104', title: 'Jabra Elite 85t', price: 179.99, rating: 4.3, reviews: 5432, isCompetitor: true },
      { asin: 'B0COMP105', title: 'Bose QuietComfort Earbuds II', price: 279.00, rating: 4.5, reviews: 9876, isCompetitor: true },
      { asin: 'B0COMP106', title: 'JBL Tune 230NC TWS', price: 79.99, rating: 4.2, reviews: 4321, isCompetitor: true },
      { asin: 'B0COMP107', title: 'Anker Soundcore Liberty 4', price: 99.99, rating: 4.4, reviews: 6543, isCompetitor: true },
      { asin: 'B0COMP108', title: 'Cheap Generic Earbuds', price: 15.99, rating: 2.8, reviews: 123, isCompetitor: true },
      // False positives
      { asin: 'B0FALSE101', title: 'Earbuds Replacement Tips', price: 8.99, rating: 4.5, reviews: 2345, isCompetitor: false },
      { asin: 'B0FALSE102', title: 'Wireless Charging Case Only', price: 29.99, rating: 4.1, reviews: 876, isCompetitor: false },
      { asin: 'B0FALSE103', title: 'Earbuds Cleaning Kit', price: 12.99, rating: 4.3, reviews: 1234, isCompetitor: false }
    ],
    'yoga-mats': [
      { asin: 'B0COMP201', title: 'Manduka PRO Yoga Mat 6mm', price: 120.00, rating: 4.7, reviews: 15678, isCompetitor: true },
      { asin: 'B0COMP202', title: 'Liforme Original Yoga Mat', price: 149.99, rating: 4.6, reviews: 8765, isCompetitor: true },
      { asin: 'B0COMP203', title: 'Gaiam Essentials Yoga Mat', price: 21.99, rating: 4.5, reviews: 34567, isCompetitor: true },
      { asin: 'B0COMP204', title: 'JadeYoga Harmony Mat', price: 79.95, rating: 4.5, reviews: 6543, isCompetitor: true },
      { asin: 'B0COMP205', title: 'Lululemon The Mat 5mm', price: 98.00, rating: 4.4, reviews: 4321, isCompetitor: true },
      { asin: 'B0COMP206', title: 'BalanceFrom GoYoga Mat', price: 19.99, rating: 4.4, reviews: 23456, isCompetitor: true },
      { asin: 'B0COMP207', title: 'Amazon Basics Yoga Mat', price: 18.49, rating: 4.3, reviews: 12345, isCompetitor: true },
      { asin: 'B0COMP208', title: 'Ultra Thin Travel Mat', price: 9.99, rating: 3.2, reviews: 234, isCompetitor: true },
      // False positives
      { asin: 'B0FALSE201', title: 'Yoga Mat Carrying Strap', price: 8.99, rating: 4.4, reviews: 2345, isCompetitor: false },
      { asin: 'B0FALSE202', title: 'Yoga Block Set (2 Pack)', price: 14.99, rating: 4.6, reviews: 5678, isCompetitor: false },
      { asin: 'B0FALSE203', title: 'Mat Cleaning Spray', price: 12.99, rating: 4.2, reviews: 987, isCompetitor: false }
    ]
  }
};

/**
 * Simulated LLM keyword generation responses
 */
export const keywordGenerationResponses = {
  'B0XYZ001': {
    keywords: [
      'stainless steel water bottle insulated 32oz',
      'vacuum insulated water bottle',
      'double wall water bottle sports'
    ],
    reasoning: 'Extracted key product attributes: material (stainless steel), capacity (32oz), primary feature (insulated/vacuum), use case (sports/outdoors)'
  },
  'B0XYZ002': {
    keywords: [
      'wireless earbuds noise cancelling',
      'bluetooth earbuds ANC',
      'true wireless earbuds water resistant'
    ],
    reasoning: 'Extracted key product attributes: type (wireless/bluetooth earbuds), primary feature (noise cancelling/ANC), secondary feature (water resistant)'
  },
  'B0XYZ003': {
    keywords: [
      'yoga mat 6mm thick',
      'non slip yoga mat',
      'eco friendly yoga mat TPE'
    ],
    reasoning: 'Extracted key product attributes: product type (yoga mat), thickness (6mm), key features (non-slip, eco-friendly TPE material)'
  }
};

/**
 * Get category key from prospect
 */
export function getCategoryKey(prospect) {
  const category = prospect.category.toLowerCase();
  if (category.includes('water bottle')) return 'water-bottles';
  if (category.includes('headphone') || category.includes('earbuds')) return 'wireless-earbuds';
  if (category.includes('yoga')) return 'yoga-mats';
  return 'water-bottles'; // default
}

