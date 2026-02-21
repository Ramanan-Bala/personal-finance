import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../../db';
import { categories } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

const LUCIDE_ICONS = [
  'Banknote', 'Briefcase', 'Car', 'Coffee', 'CreditCard', 'Gamepad2',
  'GraduationCap', 'HeartPulse', 'Home', 'Lightbulb', 'ShoppingBag',
  'Utensils', 'Tag', 'Plane', 'Bus', 'Train', 'Fuel', 'Shirt', 'Gift',
  'Music', 'Film', 'Tv', 'Phone', 'Wifi', 'Zap', 'Droplet', 'Flame',
  'Snowflake', 'Sun', 'Moon', 'Baby', 'Dog', 'Cat', 'Trees', 'Flower2',
  'Apple', 'Pizza', 'Wine', 'Beer', 'Cigarette', 'Pill', 'Stethoscope',
  'Dumbbell', 'Bike', 'Footprints', 'Scissors', 'Paintbrush', 'Wrench',
  'Hammer', 'Key', 'Lock', 'Shield', 'BookOpen', 'Newspaper', 'Mail',
  'MessageSquare', 'Camera', 'Image', 'MapPin', 'Navigation', 'Globe',
  'Building', 'Building2', 'Store', 'Warehouse', 'Church', 'Landmark',
  'PiggyBank', 'Wallet', 'Receipt', 'BadgeDollarSign', 'TrendingUp',
  'TrendingDown', 'BarChart', 'PieChart', 'Calculator', 'Percent',
  'HandCoins', 'CircleDollarSign', 'Coins', 'DollarSign', 'IndianRupee',
  'Sparkles', 'Heart', 'Star', 'Trophy', 'Award', 'Crown', 'Gem',
  'Rocket', 'Laptop', 'Monitor', 'Smartphone', 'Tablet', 'Watch',
  'Headphones', 'Speaker', 'Printer', 'HardDrive', 'Cpu', 'MemoryStick',
  'UtensilsCrossed', 'ChefHat', 'Salad', 'Soup', 'IceCream', 'Cake',
  'Cookie', 'Popcorn', 'Sandwich', 'Egg', 'Fish', 'Beef',
  'ShoppingCart', 'Package', 'Truck', 'Ship', 'Ambulance',
  'Siren', 'Bed', 'Bath', 'Sofa', 'Lamp', 'Fan', 'AirVent',
  'Refrigerator', 'WashingMachine', 'Microwave', 'Tv2',
];

interface CategorizeResult {
  categoryId: string;
  isNew: boolean;
}

export class AiService {
  private genAI: GoogleGenerativeAI | null = null;

  private getClient() {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  async categorizeTransaction(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
    amount: number,
    notes: string,
    overrides?: { notes: string; fromCategory: string; toCategory: string }[],
  ): Promise<CategorizeResult> {
    const userCategories = await db.query.categories.findMany({
      where: and(eq(categories.userId, userId), eq(categories.type, type)),
      columns: { id: true, name: true, icon: true },
    });

    const categoryList = userCategories
      .map(c => `- "${c.name}" (id: ${c.id}, icon: ${c.icon || 'Tag'})`)
      .join('\n');

    let overrideContext = '';
    if (overrides && overrides.length > 0) {
      overrideContext = `\n\nUser has previously corrected these categorizations (respect these preferences):\n${overrides.map(o => `- Notes "${o.notes}": changed from "${o.fromCategory}" to "${o.toCategory}"`).join('\n')}`;
    }

    const prompt = `You are a personal finance categorization assistant.

Given this transaction, assign it to the best matching existing category or suggest a new one.

Transaction:
- Type: ${type}
- Amount: ${amount}
- Notes: "${notes}"

Existing ${type} categories:
${categoryList || '(none yet)'}
${overrideContext}

Rules:
1. If an existing category is a good match, return its exact id.
2. If no existing category fits, suggest a new category name and a Lucide React icon name.
3. The icon MUST be one of these valid Lucide icon names: ${LUCIDE_ICONS.join(', ')}
4. Keep category names short (1-3 words), capitalized (e.g. "Food & Dining", "Transport", "Groceries").
5. Prefer matching existing categories over creating new ones.

Respond with ONLY valid JSON, no markdown:
For existing: {"match": "existing", "categoryId": "<id>"}
For new: {"match": "new", "name": "<name>", "icon": "<LucideIconName>"}`;

    try {
      const client = this.getClient();
      const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      if (parsed.match === 'existing' && parsed.categoryId) {
        const exists = userCategories.find(c => c.id === parsed.categoryId);
        if (exists) {
          return { categoryId: exists.id, isNew: false };
        }
      }

      if (parsed.match === 'new' && parsed.name) {
        const icon = LUCIDE_ICONS.includes(parsed.icon) ? parsed.icon : 'Tag';
        const [newCat] = await db
          .insert(categories)
          .values({
            userId,
            name: parsed.name,
            type,
            icon,
            isAiGenerated: true,
          })
          .returning();

        return { categoryId: newCat.id, isNew: true };
      }

      return this.fallback(userId, type);
    } catch (error) {
      console.error('AI categorization failed:', error);
      return this.fallback(userId, type);
    }
  }

  private async fallback(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
  ): Promise<CategorizeResult> {
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.userId, userId),
        eq(categories.type, type),
        eq(categories.name, 'Uncategorized'),
      ),
    });

    if (existing) return { categoryId: existing.id, isNew: false };

    const [newCat] = await db
      .insert(categories)
      .values({
        userId,
        name: 'Uncategorized',
        type,
        icon: 'Tag',
        isAiGenerated: true,
      })
      .returning();

    return { categoryId: newCat.id, isNew: true };
  }
}

export const aiService = new AiService();
