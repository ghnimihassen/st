import type { Request, Response } from 'express';
import { MenuItem } from '../models/MenuItem.model';
import { MenuCategory } from '../models/MenuCategory.model';

export class MenuController {
  // ==================== PUBLIQUES ====================
  
  /**
   * GET /api/menu/categories
   * Retourne toutes les catégories actives triées par order
   */
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await MenuCategory.find({ isActive: true })
        .sort({ order: 1 });
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  /**
   * GET /api/menu?category=slug&isActive=true
   * Filtre optionnel par catégorie (slug)
   */
  static async getAllItems(req: Request, res: Response) {
    try {
      const { category, isActive = 'true' } = req.query;

      const filter: any = { isAvailable: isActive === 'true' };

      if (category && typeof category === 'string') {
        const categoryDoc = await MenuCategory.findOne({
          slug: category,
          isActive: true
        });
        if (!categoryDoc) {
          return res.status(404).json({
            success: false,
            error: `Catégorie avec slug "${category}" non trouvée`
          });
        }
        filter.category = category;
      }

      const items = await MenuItem.find(filter);

      res.json({ success: true, data: items });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  /**
   * GET /api/menu/:id
   * Détail d'un article par son ID
   */
  static async getItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await MenuItem.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Article non trouvé' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  // ==================== ADMIN (CRUD catégories) ====================

  static async createCategory(req: Request, res: Response) {
    try {
      const { name, slug, icon, order, isActive = true } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ success: false, error: 'name et slug requis' });
      }
      const newCategory = await MenuCategory.create({
        name,
        slug,
        icon: icon || '',
        order: order || 0,
        isActive,
      });
      res.status(201).json({ success: true, data: newCategory });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug, icon, order, isActive } = req.body;
      
      const updated = await MenuCategory.findByIdAndUpdate(
        id,
        { name, slug, icon, order, isActive },
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Catégorie non trouvée' });
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await MenuCategory.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Catégorie non trouvée' });
      }
      res.json({ success: true, message: 'Catégorie supprimée' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  // ==================== ADMIN (CRUD items) ====================

  static async createItem(req: Request, res: Response) {
    try {
      const { name, description, price, category, image, allergens, tags, supplements, promotion, isAvailable = true } = req.body;
      if (!name || !price || !category) {
        return res.status(400).json({ success: false, error: 'name, price et category requis' });
      }
      const newItem = await MenuItem.create({
        name,
        description: description || '',
        price,
        category,
        image: image || '',
        allergens: allergens || [],
        tags: tags || [],
        supplements: supplements || [],
        promotion: promotion || undefined,
        isAvailable,
      });
      res.status(201).json({ success: true, data: newItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, category, image, allergens, tags, supplements, promotion, isAvailable } = req.body;
      
      const updated = await MenuItem.findByIdAndUpdate(
        id,
        { name, description, price, category, image, allergens, tags, supplements, promotion, isAvailable },
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Article non trouvé' });
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }

  static async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await MenuItem.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Article non trouvé' });
      }
      res.json({ success: true, message: 'Article supprimé' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }
}