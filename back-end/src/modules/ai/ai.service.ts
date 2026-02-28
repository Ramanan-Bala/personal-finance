import { and, eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { db } from '../../db';
import { categories } from '../../db/schema';
import { LUCIDE_ICONS } from './ai.constants';

interface CategorizeResult {
  categoryId: string;
  isNew: boolean;
}

interface OverrideContext {
  notes: string;
  fromCategory: string;
  toCategory: string;
}

export class AiService {
  private client = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
  });

  async categorizeTransaction(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
    amount: number,
    notes: string,
    overrides?: OverrideContext[],
  ): Promise<CategorizeResult> {
    const userCategories = await db.query.categories.findMany({
      where: and(eq(categories.userId, userId), eq(categories.type, type)),
      columns: { id: true, name: true, icon: true },
    });

    const prompt = this.buildPrompt(
      type,
      amount,
      notes,
      userCategories,
      overrides,
    );

    try {
      const text = await this.callModel(prompt);
      return await this.parseResponse(text, userCategories, userId, type);
    } catch (error) {
      console.error('AI categorization failed:', error);
      return this.fallback(userId, type);
    }
  }

  private buildPrompt(
    type: string,
    amount: number,
    notes: string,
    userCategories: { id: string; name: string; icon: string | null }[],
    overrides?: OverrideContext[],
  ): string {
    const categoryList = userCategories
      .map(c => `- "${c.name}" (id: ${c.id}, icon: ${c.icon || 'Tag'})`)
      .join('\n');

    let overrideContext = '';
    if (overrides?.length) {
      overrideContext =
        '\n\nUser has previously corrected these categorizations (respect these preferences):\n' +
        overrides
          .map(
            o =>
              `- Notes "${o.notes}": changed from "${o.fromCategory}" to "${o.toCategory}"`,
          )
          .join('\n');
    }

    return `You are a personal finance categorization assistant.

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
  }

  private async callModel(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [
        {
          role: 'system',
          content:
            'You are a personal finance categorization assistant. Always respond with valid JSON only, no markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    return response.choices[0].message.content?.trim() ?? '';
  }

  private async parseResponse(
    text: string,
    userCategories: { id: string; name: string; icon: string | null }[],
    userId: string,
    type: 'INCOME' | 'EXPENSE',
  ): Promise<CategorizeResult> {
    const jsonStr = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.match === 'existing' && parsed.categoryId) {
      const exists = userCategories.find(c => c.id === parsed.categoryId);
      if (exists) return { categoryId: exists.id, isNew: false };
    }

    if (parsed.match === 'new' && parsed.name) {
      const icon = LUCIDE_ICONS.includes(parsed.icon) ? parsed.icon : 'Tag';
      const [newCat] = await db
        .insert(categories)
        .values({ userId, name: parsed.name, type, icon, isAiGenerated: true })
        .returning();
      return { categoryId: newCat.id, isNew: true };
    }

    return this.fallback(userId, type);
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
