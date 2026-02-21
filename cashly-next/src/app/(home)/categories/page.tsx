"use client";

import api from "@/lib/api/axios";
import {
  Category,
  CategoryForm,
  CategoryFormOutput,
  ICON_MAP,
  PageHeader,
  ResponsiveModal,
  Tabs,
  TabsList,
  TabsTrigger,
  TransactionType,
} from "@/shared";
import {
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Skeleton,
  Text,
  TextField,
} from "@radix-ui/themes";
import {
  Filter,
  Pencil,
  Plus,
  Search,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">(
    "ALL",
  );

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<Category[]>("/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CategoryFormOutput) => {
    try {
      setIsCreating(true);
      await api.post("/categories", data, { showSuccessToast: true });
      await fetchCategories();
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const updateCategory = async (data: CategoryFormOutput) => {
    try {
      const id = data.id;
      setLoading(true);
      const response = await api.patch<Category>(`/categories/${id}`, data, {
        showSuccessToast: true,
      });
      setCategories((prev) =>
        prev.map((item) => (item.id === id ? response.data : item)),
      );
      setIsEditDialogOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = cat.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "ALL" || cat.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [categories, searchQuery, filterType]);

  const incomeCategories = filteredCategories.filter(
    (cat) => cat.type === TransactionType.INCOME,
  );
  const expenseCategories = filteredCategories.filter(
    (cat) => cat.type === TransactionType.EXPENSE,
  );

  return (
    <div className="space-y-6">
      <ResponsiveModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Category"
        description="Edit the category details below."
      >
        <CategoryForm
          onSubmit={updateCategory}
          defaultValues={editData as never}
          isLoading={loading}
        />
      </ResponsiveModal>

      <PageHeader
        title="Categories"
        description="Manage your transaction categories"
        actions={
          <>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus size={18} />
              Add Category
            </Button>
            <ResponsiveModal
              open={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              title="Add New Category"
              description="Add a new category to manage your transactions."
            >
              <CategoryForm onSubmit={createCategory} isLoading={isCreating} />
            </ResponsiveModal>
          </>
        }
      />

      {loading ? (
        <Flex direction="column" gap="4">
          <Flex gap="4" direction={{ initial: "column", sm: "row" }}>
            <Skeleton className="h-10 w-full sm:w-60" />
            <Skeleton className="h-10 w-full sm:w-60" />
          </Flex>
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </Grid>
        </Flex>
      ) : categories.length > 0 ? (
        <>
          {/* Search and Filter */}
          <Flex
            direction={{ initial: "column-reverse", sm: "row" }}
            gap="4"
            align={{ sm: "center" }}
            mb="4"
          >
            <TextField.Root
              size="3"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80"
            >
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>

            <Tabs
              value={filterType}
              onValueChange={(val) => setFilterType(val as never)}
            >
              <TabsList>
                <TabsTrigger value="ALL">
                  <Filter size={16} />
                  All
                </TabsTrigger>
                <TabsTrigger value="INCOME" className="bg-primary">
                  <TrendingUp size={16} />
                  Income
                </TabsTrigger>
                <TabsTrigger value="EXPENSE" className="bg-red-400">
                  <TrendingDown size={16} />
                  Expense
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Flex>

          {/* Category Grid */}
          <div
            className={
              filterType === "ALL"
                ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                : ""
            }
          >
            {/* Income Column */}
            {(filterType === "ALL" || filterType === "INCOME") && (
              <div className="space-y-4">
                <Flex asChild align="center" gap="2" mb="2">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <TrendingUp className="text-green-500" />
                    <Heading size="4">Income Categories</Heading>
                    <Badge color="green" variant="soft">
                      {incomeCategories.length}
                    </Badge>
                  </motion.div>
                </Flex>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {incomeCategories.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        editClicked={() => {
                          setEditData(cat);
                          setIsEditDialogOpen(true);
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {incomeCategories.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Text
                      color="gray"
                      size="2"
                      align="center"
                      className="block rounded-lg border-2 border-dashed py-7 -mt-4"
                    >
                      No income categories found
                    </Text>
                  </motion.div>
                )}
              </div>
            )}

            {/* Expense Column */}
            {(filterType === "ALL" || filterType === "EXPENSE") && (
              <div className="space-y-4">
                <Flex asChild align="center" gap="2" mb="2">
                  <motion.div
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <TrendingDown className="text-red-500" />
                    <Heading size="4">Expense Categories</Heading>
                    <Badge color="red" variant="soft">
                      {expenseCategories.length}
                    </Badge>
                  </motion.div>
                </Flex>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {expenseCategories.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        editClicked={() => {
                          setEditData(cat);
                          setIsEditDialogOpen(true);
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                {expenseCategories.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Text
                      color="gray"
                      size="2"
                      align="center"
                      className="block rounded-lg border-2 border-dashed py-7 -mt-4"
                    >
                      No expense categories found
                    </Text>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <Flex align="center" justify="center" p="8">
          <Text color="gray">No categories found</Text>
        </Flex>
      )}
    </div>
  );
}

function CategoryCard({
  category,
  editClicked,
  deleteClicked,
}: {
  category: Category;
  editClicked?: (data: Category) => void;
  deleteClicked?: (id: string) => void;
}) {
  const Icon = ICON_MAP[category.icon || "Tag"] || Tag;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
    >
      <Card asChild variant="classic" style={{ height: "100%" }}>
        <motion.div layout className="w-full h-full">
          <Flex justify="between" align="center" gap="2">
            <Flex direction="column" justify="between" align="start" gap="2">
              <motion.div layout className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2 ${category.type === "INCOME" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"}`}
                >
                  <Icon size={18} />
                </div>
                <Heading size="3">{category.name}</Heading>
              </motion.div>
              {category.description && (
                <Text
                  size="1"
                  color="gray"
                  className="line-clamp-1 text-ellipsis max-w-max"
                  asChild
                >
                  <motion.div layout>{category.description}</motion.div>
                </Text>
              )}
            </Flex>
            <Flex asChild justify="between" align="center">
              <motion.div layout>
                {editClicked && (
                  <Button
                    variant="ghost"
                    color="gray"
                    onClick={() => editClicked(category)}
                    className="mr-1 py-2"
                  >
                    <Pencil size={16} />
                  </Button>
                )}
              </motion.div>
            </Flex>
          </Flex>
        </motion.div>
      </Card>
    </motion.div>
  );
}
