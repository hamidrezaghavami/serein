import type { Database } from "../config/database.js";
import type { Product } from "../generated/prisma/client.js";
import type { Locale } from "../utils/request.js";
import { AppError } from "../utils/app-error.js";

export function productDto(p: Product, locale: Locale = "en") {
  const number = (value: number) => locale === "fa" ? String(value).replace(/\d/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]!) : String(value);
  return {
    id: p.id, slug: p.slug, name: locale === "fa" ? p.nameFa : p.name,
    subtitle: locale === "fa" ? p.subtitleFa : p.subtitle,
    description: locale === "fa" ? p.descriptionFa : p.description,
    size: `${number(p.sizeMl)} ${locale === "fa" ? "میلی‌لیتر" : "mL"}`,
    sizeMl: p.sizeMl, price: p.priceCents / 100, priceCents: p.priceCents, currency: "USD",
    image: p.image, hover: p.hover, hoverImage: p.hover,
    imageUrl: `/images/landing/${p.image}`, hoverImageUrl: `/images/landing/${p.hover}`,
    inStock: p.active && p.stock > 0,
  };
}
export class ProductsService {
  constructor(private db: Database) {}
  async list(locale: Locale) {
    return (await this.db.product.findMany({ where: { active: true }, orderBy: { id: "asc" } })).map(p => productDto(p, locale));
  }
  async get(slug: string, locale: Locale) {
    const p = await this.db.product.findFirst({ where: { active: true, OR: [{ slug }, { id: slug }] } });
    if (!p) throw new AppError(404, "PRODUCT_NOT_FOUND", "This formula does not exist.");
    return productDto(p, locale);
  }
}
