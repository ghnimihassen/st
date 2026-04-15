import { MenuItem } from '../models/MenuItem.model';
import { MenuCategory } from '../models/MenuCategory.model';

export const MenuService = {
  // Menu Items
  async getAllMenuItems(filters: { category?: string; available?: boolean; search?: string }) {
    let query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.available === true) query.isAvailable = true;
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }
    return await MenuItem.find(query).sort({ createdAt: -1 });
  },

  async getMenuItemById(id: string) {
    return await MenuItem.findById(id);
  },

  async createMenuItem(data: any) {
    const item = new MenuItem(data);
    await item.save();
    return item;
  },

  async updateMenuItem(id: string, updates: any) {
    return await MenuItem.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteMenuItem(id: string) {
    await MenuItem.findByIdAndDelete(id);
    return true;
  },

  // Menu Categories
  async getAllMenuCategories() {
    return await MenuCategory.find().sort({ order: 1 });
  },

  async createMenuCategory(data: any) {
    const existing = await MenuCategory.findOne({ slug: data.slug });
    if (existing) throw new Error(`Menu category with slug "${data.slug}" already exists`);
    const category = new MenuCategory(data);
    await category.save();
    return category;
  },

  async updateMenuCategory(id: string, updates: any) {
    if (updates.slug) {
      const existing = await MenuCategory.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (existing) throw new Error(`Menu category with slug "${updates.slug}" already exists`);
    }
    return await MenuCategory.findByIdAndUpdate(id, updates, { new: true });
  },

  async deleteMenuCategory(id: string) {
    await MenuCategory.findByIdAndDelete(id);
    return true;
  },
};