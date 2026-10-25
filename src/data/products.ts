const baseProducts = [
  {
    id: "01",
    slug: "balancing-toner",
    name: "Balancing Toner",
    subtitle: "Clarifying Liquid",
    size: "150 mL",
    price: 34,
    image: "image4.png",
    hover: "BalancingToner-Image4.png",
    description:
      "A refreshing liquid texture for a quiet moment after cleansing.",
  },
  {
    id: "02",
    slug: "daily-moisturizer",
    name: "Daily Moisturizer",
    subtitle: "Nourishing Cream",
    size: "50 mL",
    price: 42,
    image: "image3.png",
    hover: "DailyMoisturizer-image3.png",
    description:
      "A soft, comforting cream to complete your everyday ritual.",
  },
  {
    id: "03",
    slug: "still-serum",
    name: "Still Serum",
    subtitle: "Hydrating Serum",
    size: "30 mL",
    price: 46,
    image: "image1.png",
    hover: "StillSerum-image1.png",
    description:
      "A light serum texture that makes a little space for daily care.",
  },
  {
    id: "04",
    slug: "gentle-cleanser",
    name: "Gentle Cleanser",
    subtitle: "Balancing Wash",
    size: "100 mL",
    price: 28,
    image: "image5.png",
    hover: "GentleCleanser-Image5.png",
    description:
      "A gentle-feeling wash with a fresh lather. Begin your ritual here.",
  },
  {
    id: "05",
    slug: "eye-contour",
    name: "Eye Contour",
    subtitle: "Smoothing Balm",
    size: "15 mL",
    price: 32,
    image: "image6.png",
    hover: "EyeContour-Image6.png",
    description:
      "A silky balm texture for a thoughtful finishing touch.",
  },
];

export const products = baseProducts.map((product) => ({
  ...product,
  hoverImage: product.hover,
}));

export type Product = (typeof products)[number];

export const money = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export const photo = (filename: string): string =>
  `/images/landing/${filename}`;

// Support the helper names used in your earlier files.
export const landingImage = photo;
export const formatPrice = money;