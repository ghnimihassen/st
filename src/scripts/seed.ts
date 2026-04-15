import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Models
import { User } from '../models/User.model';
import { Client } from '../models/Client.model';
import { Employee } from '../models/Employee.model';
import { Product } from '../models/Product.model';
import { Batch } from '../models/Batch.model';
import { StockCategory } from '../models/StockCategory.model';
import { SubCategory } from '../models/SubCategory.model';
import { StorageLocation } from '../models/StorageLocation.model';
import { Supplier } from '../models/Supplier.model';
import { MenuCategory } from '../models/MenuCategory.model';
import { MenuItem } from '../models/MenuItem.model';
import { Order } from '../models/Order.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';
import { Reward } from '../models/Reward.model';
import { Mission } from '../models/Mission.model';
import { Game } from '../models/Game.model';
import { SpecialDay } from '../models/SpecialDay.model';
import { RecipeCategory } from '../models/RecipeCategory.model';
import { Recipe } from '../models/Recipe.model';
import { Showcase } from '../models/Showcase.model';
import { ShowcaseItem } from '../models/ShowcaseItem.model';
import { ProductionOrder } from '../models/ProductionOrder.model';
import { Referral } from '../models/Referral.model';
import { ShareLink } from '../models/Sharelink.model';
import { GamePlay } from '../models/GamePlay.model';
import { ClientMission } from '../models/ClientMission.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lpda';

function requireEntity<T>(value: T | undefined, name: string): T {
  if (!value) {
    throw new Error(`Seed error: missing ${name}`);
  }
  return value;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Client.deleteMany({}),
      Employee.deleteMany({}),
      Product.deleteMany({}),
      Batch.deleteMany({}),
      StockCategory.deleteMany({}),
      SubCategory.deleteMany({}),
      StorageLocation.deleteMany({}),
      Supplier.deleteMany({}),
      MenuCategory.deleteMany({}),
      MenuItem.deleteMany({}),
      Order.deleteMany({}),
      LoyaltyTransaction.deleteMany({}),
      Reward.deleteMany({}),
      Mission.deleteMany({}),
      Game.deleteMany({}),
      SpecialDay.deleteMany({}),
      RecipeCategory.deleteMany({}),
      Recipe.deleteMany({}),
      Showcase.deleteMany({}),
      ShowcaseItem.deleteMany({}),
      ProductionOrder.deleteMany({}),
      Referral.deleteMany({}),
      ShareLink.deleteMany({}),
      GamePlay.deleteMany({}),
      ClientMission.deleteMany({}),
    ]);
    console.log('🗑️ Cleared existing data');

    // ==================== USERS ====================
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'Admin User',
      email: 'admin@patisserie.tn',
      password: hashedPassword,
      role: 'admin',
      phone: '+216 99 999 999',
    });

    await User.create({
      name: 'Staff User',
      email: 'staff@patisserie.tn',
      password: hashedPassword,
      role: 'staff',
      phone: '+216 98 888 888',
    });

    console.log('✅ Created users');

    // ==================== EMPLOYEES ====================
    const employeePassword = await bcrypt.hash('employee123', 10);
    
    await Employee.create([
      {
        name: 'Ahmed Ben Ali',
        email: 'ahmed@patisserie.tn',
        password: employeePassword,
        phone: '+216 55 555 555',
        role: 'super_admin',
        permissions: ['dashboard', 'articles', 'menu', 'categories', 'suppliers', 'batches', 'alerts', 'clients', 'clients_loyalty', 'rewards', 'missions', 'games', 'special_days', 'referrals', 'pos', 'employees', 'production'],
        isActive: true,
      },
      {
        name: 'Sarra Mansour',
        email: 'sarra@patisserie.tn',
        password: employeePassword,
        phone: '+216 55 555 556',
        role: 'manager',
        permissions: ['dashboard', 'articles', 'menu', 'batches', 'alerts', 'clients', 'clients_loyalty', 'pos', 'production'],
        isActive: true,
      },
      {
        name: 'Khaled Saidi',
        email: 'khaled@patisserie.tn',
        password: employeePassword,
        phone: '+216 55 555 557',
        role: 'cashier',
        permissions: ['dashboard', 'pos', 'clients', 'clients_loyalty'],
        isActive: true,
      },
    ]);
    console.log('✅ Created employees');

    // ==================== CLIENTS ====================
    const clients = await Client.create([
      {
        name: 'Sophie Martin',
        email: 'sophie.martin@email.com',
        phone: '+216 22 111 222',
        gender: 'female',
        qrCode: 'QR-001-SOPHIE',
        loyaltyPoints: 1250,
        lifetimePoints: 1250,
        tier: 'gold',
        totalSpent: 450.50,
        totalOrders: 8,
        walletBalance: 25.00,
        referralCode: 'REF-SOPHIE',
        referralCount: 2,
        isActive: true,
        lastVisit: new Date(),
      },
      {
        name: 'Thomas Dubois',
        email: 'thomas.dubois@email.com',
        phone: '+216 22 111 223',
        gender: 'male',
        qrCode: 'QR-002-THOMAS',
        loyaltyPoints: 680,
        lifetimePoints: 680,
        tier: 'silver',
        totalSpent: 230.00,
        totalOrders: 5,
        walletBalance: 10.00,
        referralCode: 'REF-THOMAS',
        referralCount: 1,
        isActive: true,
        lastVisit: new Date(),
      },
      {
        name: 'Leila Ben Ali',
        email: 'leila.benali@email.com',
        phone: '+216 22 111 224',
        gender: 'female',
        qrCode: 'QR-003-LEILA',
        loyaltyPoints: 3200,
        lifetimePoints: 3200,
        tier: 'diamond',
        totalSpent: 980.00,
        totalOrders: 15,
        walletBalance: 50.00,
        referralCode: 'REF-LEILA',
        referralCount: 5,
        isActive: true,
        lastVisit: new Date(),
      },
      {
        name: 'Mehdi Trabelsi',
        email: 'mehdi.trabelsi@email.com',
        phone: '+216 22 111 225',
        gender: 'male',
        qrCode: 'QR-004-MEHDI',
        loyaltyPoints: 120,
        lifetimePoints: 120,
        tier: 'bronze',
        totalSpent: 45.00,
        totalOrders: 2,
        walletBalance: 0,
        referralCode: 'REF-MEHDI',
        referralCount: 0,
        isActive: true,
        lastVisit: new Date(),
      },
    ]);
    console.log('✅ Created clients');

    // ==================== STOCK CATEGORIES ====================
    const stockCategories = await StockCategory.create([
      { name: 'Patisserie', slug: 'patisserie', description: 'Ingredients pour patisserie', icon: '🎂', color: '#f59e0b', order: 1, isActive: true },
      { name: 'Cafe', slug: 'cafe', description: 'Produits pour cafe', icon: '☕', color: '#78350f', order: 2, isActive: true },
      { name: 'Restaurant', slug: 'restaurant', description: 'Ingredients pour restaurant', icon: '🍽️', color: '#dc2626', order: 3, isActive: true },
    ]);
    console.log('✅ Created stock categories');

    const patisserieCategory = requireEntity(stockCategories[0], 'stockCategories[0]');
    const cafeCategory = requireEntity(stockCategories[1], 'stockCategories[1]');
    const restaurantCategory = requireEntity(stockCategories[2], 'stockCategories[2]');

    // ==================== SUB CATEGORIES ====================
    const subCategories = await SubCategory.create([
      { categoryId: patisserieCategory._id, name: 'Chocolat', slug: 'chocolat', icon: '🍫', order: 1, isActive: true },
      { categoryId: patisserieCategory._id, name: 'Farine', slug: 'farine', icon: '🌾', order: 2, isActive: true },
      { categoryId: patisserieCategory._id, name: 'Produits Laitiers', slug: 'produits-laitiers', icon: '🥛', order: 3, isActive: true },
      { categoryId: cafeCategory._id, name: 'Cafe en grains', slug: 'cafe-grains', icon: '☕', order: 1, isActive: true },
      { categoryId: restaurantCategory._id, name: 'Epices', slug: 'epices', icon: '🌶️', order: 1, isActive: true },
    ]);
    console.log('✅ Created sub categories');

    const chocolatSub = requireEntity(subCategories[0], 'subCategories[0]');
    const farineSub = requireEntity(subCategories[1], 'subCategories[1]');
    const produitsLaitiersSub = requireEntity(subCategories[2], 'subCategories[2]');
    const cafeGrainsSub = requireEntity(subCategories[3], 'subCategories[3]');
    const epicesSub = requireEntity(subCategories[4], 'subCategories[4]');

    // ==================== STORAGE LOCATIONS ====================
    await StorageLocation.create([
      { name: 'Refrigerateur 1', type: 'refrigerator', temperature: '2-4°C', capacity: '500L', isActive: true },
      { name: 'Congelateur', type: 'freezer', temperature: '-18°C', capacity: '300L', isActive: true },
      { name: 'Chambre de Stock 1', type: 'room', temperature: 'Ambiante', capacity: 'Grande', isActive: true },
      { name: 'Etagere Aromes', type: 'shelf', isActive: true },
    ]);
    console.log('✅ Created storage locations');

    // ==================== SUPPLIERS ====================
    await Supplier.create([
      { name: 'Valrhona', contactName: 'Sophie Martin', email: 'pro@valrhona.com', phone: '+33 4 75 56 20 00', status: 'active' },
      { name: 'Lavazza', contactName: 'Marco Rossi', email: 'contact@lavazza.com', phone: '+39 011 2398 111', status: 'active' },
      { name: 'Isigny Sainte-Mere', contactName: 'Jean Bernard', email: 'contact@isigny.com', phone: '+33 2 31 51 33 00', status: 'active' },
    ]);
    console.log('✅ Created suppliers');

    // ==================== PRODUCTS ====================
    const products = await Product.create([
      { subCategoryId: chocolatSub._id, name: 'Chocolat Noir 70%', unit: 'kg', minQuantity: 5, unitPrice: 28.50, shelfLifeAfterOpening: 180, isActive: true },
      { subCategoryId: chocolatSub._id, name: 'Chocolat Blanc', unit: 'kg', minQuantity: 5, unitPrice: 25.00, shelfLifeAfterOpening: 180, isActive: true },
      { subCategoryId: farineSub._id, name: 'Farine T55', unit: 'kg', minQuantity: 20, unitPrice: 1.20, shelfLifeAfterOpening: 90, isActive: true },
      { subCategoryId: produitsLaitiersSub._id, name: 'Beurre AOP', unit: 'kg', minQuantity: 10, unitPrice: 12.50, shelfLifeAfterOpening: 7, isActive: true },
      { subCategoryId: cafeGrainsSub._id, name: 'Cafe Arabica', unit: 'kg', minQuantity: 5, unitPrice: 22.00, shelfLifeAfterOpening: 30, isActive: true },
    ]);
    console.log('✅ Created products');

    const chocolatNoir = requireEntity(products[0], 'products[0]');
    const chocolatBlanc = requireEntity(products[1], 'products[1]');
    const farine = requireEntity(products[2], 'products[2]');
    const beurre = requireEntity(products[3], 'products[3]');
    const cafe = requireEntity(products[4], 'products[4]');

    // ==================== BATCHES ====================
    await Batch.create([
      { productId: chocolatNoir._id, batchNumber: 'CHN-2026-001', quantity: 8, unitCost: 22.00, receptionDate: '2026-01-10', expirationDate: '2026-07-10', isOpened: true, openingDate: '2026-01-20', expirationAfterOpening: '2026-07-10' },
      { productId: chocolatNoir._id, batchNumber: 'CHN-2026-002', quantity: 15, unitCost: 23.00, receptionDate: '2026-02-15', expirationDate: '2026-08-15', isOpened: false },
      { productId: chocolatBlanc._id, batchNumber: 'CHB-2026-001', quantity: 10, unitCost: 20.00, receptionDate: '2026-01-15', expirationDate: '2026-07-15', isOpened: false },
      { productId: farine._id, batchNumber: 'FAR-2026-001', quantity: 50, unitCost: 0.90, receptionDate: '2026-03-01', expirationDate: '2026-09-01', isOpened: false },
      { productId: beurre._id, batchNumber: 'BEU-2026-001', quantity: 12, unitCost: 10.00, receptionDate: '2026-03-20', expirationDate: '2026-04-10', isOpened: false },
    ]);
    console.log('✅ Created batches');

    // ==================== MENU CATEGORIES ====================
    await MenuCategory.create([
      { name: 'Petit dejeuner', slug: 'petit-dejeuner', icon: '🍳', order: 0, isActive: true },
      { name: 'Viennoiseries', slug: 'viennoiseries', icon: '🥐', order: 1, isActive: true },
      { name: 'Patisseries', slug: 'patisseries', icon: '🎂', order: 2, isActive: true },
      { name: 'Spécialités Tunisiennes', slug: 'specialites-tunisiennes', icon: '🇹🇳', order: 3, isActive: true },
      { name: 'Boissons', slug: 'boissons', icon: '☕', order: 4, isActive: true },
    ]);
    console.log('✅ Created menu categories');

    // ==================== MENU ITEMS ====================
    await MenuItem.create([
      { name: 'Croissant Artisanal', description: 'Croissant pur beurre croustillant', price: 4.50, category: 'viennoiseries', image: '/croissant.png', allergens: ['Gluten', 'Lait'], isAvailable: true },
      { name: 'Pain au Chocolat', description: 'Viennoiserie au chocolat noir', price: 5.50, category: 'viennoiseries', image: '/pain-au-chocolat.png', allergens: ['Gluten', 'Lait'], isAvailable: true },
      { name: 'Éclair Café', description: 'Éclair garni de crème café', price: 8.00, category: 'patisseries', image: '/eclair-cafe.png', allergens: ['Gluten', 'Lait', 'Oeufs'], isAvailable: true },
      { name: 'Makroud', description: 'Pâtisserie tunisienne traditionnelle', price: 12.00, category: 'specialites-tunisiennes', image: '/makroud-tunisian-pastry.jpg', allergens: ['Gluten'], isAvailable: true },
      { name: 'Makroudh aux Dattes', description: 'Makroudh fourré aux dattes et amandes', price: 14.00, category: 'specialites-tunisiennes', image: '/makroudh-dates.jpg', allergens: ['Gluten', 'Fruits secs'], isAvailable: true },
      { name: 'Café Expresso', description: 'Café expresso classique', price: 2.50, category: 'boissons', image: '/french-breakfast-table-with-croissants-and-coffee.jpg', allergens: [], isAvailable: true },
      { name: 'Cappuccino', description: 'Café avec mousse de lait', price: 4.00, category: 'boissons', image: '/french-breakfast-table-with-croissants-and-coffee.jpg', allergens: ['Lait'], isAvailable: true },
    ]);
    console.log('✅ Created menu items');

    // ==================== REWARDS ====================
    await Reward.create([
      { name: 'Croissant Gratuit', description: 'Un croissant artisanal offert', pointsCost: 50, type: 'free_item', value: '1 croissant', image: '/golden-croissant.png', isActive: true },
      { name: 'Réduction 5 TND', description: '5 TND de réduction sur votre commande', pointsCost: 100, type: 'discount', value: '5 TND', image: '/placeholder.jpg', isActive: true },
      { name: 'Café Gratuit', description: 'Un café expresso offert', pointsCost: 75, type: 'free_item', value: '1 café', image: '/french-breakfast-table-with-croissants-and-coffee.jpg', isActive: true },
      { name: 'Réduction 15%', description: '15% sur toute la commande', pointsCost: 200, type: 'discount', value: '15', image: '/placeholder.jpg', isActive: true },
      { name: 'Petit Déjeuner Continental', description: 'Offre petit déjeuner complet', pointsCost: 300, type: 'special', value: 'Petit déjeuner', image: '/continental-breakfast-with-bread-and-fresh-fruits.jpg', isActive: true },
    ]);
    console.log('✅ Created rewards');

    // ==================== MISSIONS ====================
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    await Mission.create([
      {
        name: 'Bienvenue',
        description: 'Faites votre premier achat',
        type: 'spend',
        target: 1,
        pointsReward: 50,
        validFrom: now,
        validUntil: nextMonth,
        isActive: true,
        icon: '🎁',
      },
      {
        name: 'Client Fidèle',
        description: 'Effectuez 5 achats',
        type: 'visit',
        target: 5,
        pointsReward: 100,
        validFrom: now,
        validUntil: nextMonth,
        isActive: true,
        icon: '⭐',
      },
      {
        name: 'Parrainage',
        description: 'Parrainez un ami',
        type: 'refer',
        target: 1,
        pointsReward: 150,
        validFrom: now,
        validUntil: nextMonth,
        isActive: true,
        icon: '👥',
      },
      {
        name: 'Anniversaire',
        description: 'Jour de votre anniversaire',
        type: 'birthday',
        target: 1,
        pointsReward: 200,
        validFrom: now,
        validUntil: nextMonth,
        isActive: true,
        icon: '🎂',
      },
    ]);
    console.log('✅ Created missions');

    // ==================== GAMES ====================
    await Game.create([
      {
        name: 'Roulette de la Chance',
        type: 'roulette',
        enabled: true,
        startHour: 10,
        endHour: 22,
        maxPlaysPerDay: 3,
        minPointsRequired: 50,
        rewards: [
          { id: 'r1', name: '5 Points', points: 5, probability: 30, color: '#22c55e' },
          { id: 'r2', name: '10 Points', points: 10, probability: 25, color: '#3b82f6' },
          { id: 'r3', name: '25 Points', points: 25, probability: 15, color: '#a855f7' },
          { id: 'r4', name: '50 Points', points: 50, probability: 8, color: '#f59e0b' },
          { id: 'r5', name: '100 Points', points: 100, probability: 2, color: '#ef4444' },
          { id: 'r6', name: 'Rejouer', points: 0, probability: 20, color: '#64748b' },
        ],
      },
      {
        name: 'Chichbich',
        type: 'chichbich',
        enabled: true,
        startHour: 18,
        endHour: 23,
        maxPlaysPerDay: 2,
        minPointsRequired: 100,
        rewards: [
          { id: 'c1', name: 'Double', points: 20, probability: 16.67, color: '#22c55e' },
          { id: 'c2', name: 'Triple', points: 50, probability: 2.78, color: '#f59e0b' },
          { id: 'c3', name: 'Chichbich!', points: 200, probability: 0.46, color: '#ef4444' },
        ],
      },
    ]);
    console.log('✅ Created games');

    // ==================== SPECIAL DAYS ====================
    await SpecialDay.create([
      { name: 'Journee des Femmes', description: 'Multiplicateur x2 pour les femmes', targetGender: 'female', dayOfWeek: 5, multiplier: 2, isActive: true },
      { name: 'Week-end Special', description: 'Points doubles le week-end', targetGender: 'all', dayOfWeek: 6, multiplier: 2, isActive: true },
      { name: 'Black Friday', description: 'Points x5', specificDate: '2026-11-28', multiplier: 5, isActive: true },
    ]);
    console.log('✅ Created special days');

    // ==================== RECIPE CATEGORIES ====================
    const recipeCategories = await RecipeCategory.create([
      { name: 'Patisseries', icon: '🎂', color: 'bg-pink-100 text-pink-800', isActive: true },
      { name: 'Viennoiseries', icon: '🥐', color: 'bg-amber-100 text-amber-800', isActive: true },
      { name: 'Boulangerie', icon: '🥖', color: 'bg-yellow-100 text-yellow-800', isActive: true },
      { name: 'Boissons', icon: '☕', color: 'bg-stone-100 text-stone-800', isActive: true },
    ]);
    console.log('✅ Created recipe categories');

    const viennoiseriesCategory = requireEntity(recipeCategories[1], 'recipeCategories[1]');
    const boissonsCategory = requireEntity(recipeCategories[3], 'recipeCategories[3]');

    // ==================== RECIPES ====================
    const recipes = await Recipe.create([
      {
        name: 'Croissant',
        description: 'Croissant pur beurre croustillant',
        categoryId: viennoiseriesCategory._id,
        ingredients: [
          { productId: farine._id, quantity: 1, unit: 'kg' },
          { productId: beurre._id, quantity: 0.2, unit: 'kg' },
        ],
        yield: 20,
        yieldUnit: 'pieces',
        preparationTime: 90,
        cookingTime: 18,
        shelfLife: 24,
        sellingPrice: 4.5,
        isActive: true,
      },
      {
        name: 'Pain au Chocolat',
        description: 'Viennoiserie au chocolat noir',
        categoryId: viennoiseriesCategory._id,
        ingredients: [
          { productId: farine._id, quantity: 1, unit: 'kg' },
          { productId: beurre._id, quantity: 0.2, unit: 'kg' },
          { productId: chocolatNoir._id, quantity: 0.15, unit: 'kg' },
        ],
        yield: 20,
        yieldUnit: 'pieces',
        preparationTime: 100,
        cookingTime: 18,
        shelfLife: 24,
        sellingPrice: 5.5,
        isActive: true,
      },
      {
        name: 'Cafe',
        description: 'Cafe expresso classique',
        categoryId: boissonsCategory._id,
        ingredients: [{ productId: cafe._id, quantity: 0.02, unit: 'kg' }],
        yield: 20,
        yieldUnit: 'tasses',
        preparationTime: 5,
        cookingTime: 0,
        shelfLife: 4,
        sellingPrice: 2.5,
        isActive: true,
      },
      {
        name: 'Cappuccino',
        description: 'Cafe avec mousse de lait',
        categoryId: boissonsCategory._id,
        ingredients: [
          { productId: cafe._id, quantity: 0.02, unit: 'kg' },
          { productId: beurre._id, quantity: 0.01, unit: 'kg' },
        ],
        yield: 20,
        yieldUnit: 'tasses',
        preparationTime: 7,
        cookingTime: 0,
        shelfLife: 4,
        sellingPrice: 4.0,
        isActive: true,
      },
    ]);
    console.log('✅ Created recipes');

    // ==================== SHOWCASES ====================
    const showcases = await Showcase.create([
      { name: 'Vitrine Patisserie', type: 'refrigerated', temperature: '4-6°C', capacity: 50, location: 'Entree principale', isActive: true },
      { name: 'Vitrine Viennoiseries', type: 'ambient', temperature: 'Ambiante', capacity: 80, location: 'Comptoir central', isActive: true },
      { name: 'Comptoir Cafe', type: 'heated', temperature: 'Chaud', capacity: 30, location: 'Zone cafe', isActive: true },
    ]);
    console.log('✅ Created showcases');

    const viennoiseriesShowcase = requireEntity(showcases[1], 'showcases[1]');
    const cafeShowcase = requireEntity(showcases[2], 'showcases[2]');

    const croissantRecipe = requireEntity(recipes[0], 'recipes[0]');
    const painChocoRecipe = requireEntity(recipes[1], 'recipes[1]');
    const cafeRecipe = requireEntity(recipes[2], 'recipes[2]');
    const cappuccinoRecipe = requireEntity(recipes[3], 'recipes[3]');

    // ==================== SHOWCASE ITEMS ====================
    await ShowcaseItem.create([
      {
        recipeId: croissantRecipe._id,
        showcaseId: viennoiseriesShowcase._id,
        batchNumber: 'VIE-2026-001',
        quantity: 40,
        initialQuantity: 40,
        productionDate: '2026-04-11',
        productionTime: '06:30',
        expirationDate: '2026-04-12',
        expirationTime: '18:00',
        unitCost: 1.5,
        sellingPrice: 4.5,
        status: 'available',
      },
      {
        recipeId: painChocoRecipe._id,
        showcaseId: viennoiseriesShowcase._id,
        batchNumber: 'VIE-2026-002',
        quantity: 35,
        initialQuantity: 35,
        productionDate: '2026-04-11',
        productionTime: '06:45',
        expirationDate: '2026-04-12',
        expirationTime: '18:00',
        unitCost: 1.8,
        sellingPrice: 5.5,
        status: 'available',
      },
      {
        recipeId: cafeRecipe._id,
        showcaseId: cafeShowcase._id,
        batchNumber: 'CAF-2026-001',
        quantity: 60,
        initialQuantity: 60,
        productionDate: '2026-04-12',
        productionTime: '08:00',
        expirationDate: '2026-04-12',
        expirationTime: '20:00',
        unitCost: 0.4,
        sellingPrice: 2.5,
        status: 'available',
      },
      {
        recipeId: cappuccinoRecipe._id,
        showcaseId: cafeShowcase._id,
        batchNumber: 'CAF-2026-002',
        quantity: 40,
        initialQuantity: 40,
        productionDate: '2026-04-12',
        productionTime: '08:15',
        expirationDate: '2026-04-12',
        expirationTime: '20:00',
        unitCost: 0.7,
        sellingPrice: 4.0,
        status: 'available',
      },
    ]);
    console.log('✅ Created showcase items');

    // ==================== ORDERS ====================
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sophieClient = requireEntity(clients[0], 'clients[0]');
    const thomasClient = requireEntity(clients[1], 'clients[1]');
    const leilaClient = requireEntity(clients[2], 'clients[2]');

    // Get showcase items for orders
    const croissantItem = await ShowcaseItem.findOne({ recipeId: croissantRecipe._id });
    const cafeItem = await ShowcaseItem.findOne({ recipeId: cafeRecipe._id });
    const painChocoItem = await ShowcaseItem.findOne({ recipeId: painChocoRecipe._id });
    const cappuccinoItem = await ShowcaseItem.findOne({ recipeId: cappuccinoRecipe._id });

    if (croissantItem && cafeItem && painChocoItem && cappuccinoItem) {
      await Order.create([
        {
          items: [
            {
              showcaseItemId: croissantItem._id,
              recipeId: croissantRecipe._id,
              recipeName: 'Croissant',
              quantity: 2,
              unitPrice: 4.5,
              total: 9.0,
            },
          ],
          subtotal: 9.00,
          discount: 0,
          total: 9.00,
          paymentMethod: 'cash',
          customerId: sophieClient._id,
          pointsEarned: 9,
          status: 'completed',
          createdAt: yesterday,
        },
        {
          items: [
            {
              showcaseItemId: cafeItem._id,
              recipeId: cafeRecipe._id,
              recipeName: 'Cafe',
              quantity: 3,
              unitPrice: 2.5,
              total: 7.5,
            },
          ],
          subtotal: 7.50,
          discount: 0,
          total: 7.50,
          paymentMethod: 'card',
          customerId: thomasClient._id,
          pointsEarned: 7,
          status: 'completed',
          createdAt: yesterday,
        },
        {
          items: [
            {
              showcaseItemId: painChocoItem._id,
              recipeId: painChocoRecipe._id,
              recipeName: 'Pain au Chocolat',
              quantity: 1,
              unitPrice: 5.5,
              total: 5.5,
            },
            {
              showcaseItemId: cappuccinoItem._id,
              recipeId: cappuccinoRecipe._id,
              recipeName: 'Cappuccino',
              quantity: 1,
              unitPrice: 4.0,
              total: 4.0,
            },
          ],
          subtotal: 9.50,
          discount: 0,
          total: 9.50,
          paymentMethod: 'mobile',
          customerId: leilaClient._id,
          pointsEarned: 9,
          status: 'completed',
          createdAt: today,
        },
      ]);
      console.log('✅ Created orders');
    }

    // ==================== LOYALTY TRANSACTIONS ====================
    await LoyaltyTransaction.create([
      { clientId: sophieClient._id, type: 'earn', points: 50, description: 'Achat #1', createdAt: yesterday },
      { clientId: sophieClient._id, type: 'earn', points: 30, description: 'Achat #2', createdAt: today },
      { clientId: thomasClient._id, type: 'earn', points: 25, description: 'Achat #1', createdAt: yesterday },
      { clientId: leilaClient._id, type: 'earn', points: 100, description: 'Achat #1', createdAt: today },
      { clientId: leilaClient._id, type: 'bonus', points: 50, description: 'Parrainage', createdAt: today },
    ]);
    console.log('✅ Created loyalty transactions');

    console.log('\n🎉 SEED COMPLETED SUCCESSFULLY! 🎉\n');
    console.log('📝 Comptes de test:');
    console.log('   Admin: admin@patisserie.tn / admin123');
    console.log('   Staff: staff@patisserie.tn / admin123');
    console.log('   Employee (Ahmed): ahmed@patisserie.tn / employee123');
    console.log('   Employee (Sarra): sarra@patisserie.tn / employee123');
    console.log('   Employee (Khaled): khaled@patisserie.tn / employee123');
    console.log('\n👥 Clients de test:');
    console.log('   Sophie Martin (Gold) - sophie.martin@email.com');
    console.log('   Thomas Dubois (Silver) - thomas.dubois@email.com');
    console.log('   Leila Ben Ali (Diamond) - leila.benali@email.com');
    console.log('   Mehdi Trabelsi (Bronze) - mehdi.trabelsi@email.com');
    console.log('\n🔑 Mot de passe pour tous les clients: (à créer via inscription)');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();