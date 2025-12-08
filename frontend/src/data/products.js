export const products = [
  {
    id: 1,
    name: 'Developer Hoodie',
    description: 'Comfortable hoodie for late-night coding sessions. Features "I am not a bug" print.',
    price: 149900, // in paise (₹1499)
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    category: 'Apparel',
    emoji: '👕',
  },
  {
    id: 2,
    name: 'Mechanical Keyboard',
    description: 'Cherry MX Blue switches. RGB backlight. Built for developers who appreciate the click.',
    price: 299900, // ₹2999
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=400&fit=crop',
    category: 'Gear',
    emoji: '⌨️',
  },
  {
    id: 3,
    name: 'Coffee Mug - Debug Mode',
    description: 'Large 400ml ceramic mug. "First I drink coffee, then I debug" inscription.',
    price: 49900, // ₹499
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    category: 'Accessories',
    emoji: '☕',
  },
  {
    id: 4,
    name: 'Laptop Stand Pro',
    description: 'Aluminum ergonomic stand. Adjustable height. Keep your posture healthy.',
    price: 199900, // ₹1999
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    category: 'Gear',
    emoji: '💻',
  },
  {
    id: 5,
    name: 'Rubber Duck Debugger',
    description: 'The ultimate debugging companion. Explain your code to the duck.',
    price: 19900, // ₹199
    image: 'https://images.unsplash.com/photo-1594489573469-8e47dcf8fa9d?w=400&h=400&fit=crop',
    category: 'Accessories',
    emoji: '🦆',
  },
  {
    id: 6,
    name: 'Tech Book Bundle',
    description: 'Clean Code + Design Patterns + System Design Interview. Essential reads.',
    price: 249900, // ₹2499
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop',
    category: 'Books',
    emoji: '📚',
  },
];

export const formatPrice = (paise) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(paise / 100);
};

