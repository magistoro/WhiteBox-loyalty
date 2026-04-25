import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RegisteredService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories(userId: number) {
    const [categories, favorites] = await Promise.all([
      this.prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, slug: true, name: true, icon: true },
      }),
      this.prisma.userFavoriteCategory.findMany({
        where: { userId },
        include: { category: { select: { slug: true } } },
        orderBy: { id: "asc" },
      }),
    ]);

    const favoriteSet = new Set(favorites.map((f) => f.category.slug));
    return categories.map((c) => ({ ...c, isFavorite: favoriteSet.has(c.slug) }));
  }

  async listFavoriteCategorySlugs(userId: number): Promise<string[]> {
    const rows = await this.prisma.userFavoriteCategory.findMany({
      where: { userId },
      include: { category: { select: { slug: true } } },
      orderBy: { id: "asc" },
    });
    return rows.map((r) => r.category.slug);
  }

  async replaceFavoriteCategories(userId: number, categorySlugs: string[]) {
    const uniqueSlugs = [...new Set(categorySlugs.map((s) => s.trim().toLowerCase()).filter(Boolean))];
    if (uniqueSlugs.length === 0) {
      throw new BadRequestException("At least one category is required.");
    }

    const categories = await this.prisma.category.findMany({
      where: { slug: { in: uniqueSlugs } },
      select: { id: true, slug: true },
    });

    if (categories.length !== uniqueSlugs.length) {
      throw new BadRequestException("One or more categories do not exist.");
    }

    const orderMap = new Map(uniqueSlugs.map((slug, idx) => [slug, idx]));
    const ordered = categories.sort(
      (a, b) => (orderMap.get(a.slug) ?? 0) - (orderMap.get(b.slug) ?? 0),
    );

    await this.prisma.$transaction([
      this.prisma.userFavoriteCategory.deleteMany({ where: { userId } }),
      this.prisma.userFavoriteCategory.createMany({
        data: ordered.map((c) => ({ userId, categoryId: c.id })),
      }),
    ]);

    return { favoriteCategorySlugs: ordered.map((c) => c.slug) };
  }
}
