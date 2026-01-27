"use client";

import { Category, ICON_MAP, toastStore, TransactionType } from "@/lib";
import api from "@/lib/utils/axios";
import {
  CategoryForm,
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
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
  X,
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
      toastStore.getState().addToast({
        title: "Error",
        description: "Failed to load categories",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: any) => {
    try {
      setIsCreating(true);
      await api.post("/categories", data);
      toastStore.getState().addToast({
        title: "Success",
        description: "Category created successfully",
        type: "success",
      });
      await fetchCategories();
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const updateCategory = async (data: any) => {
    try {
      const id = data.id;
      setLoading(true);
      const response = await api.patch<Category>(`/categories/${id}`, data);
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
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content maxWidth="450px">
          <Flex direction="column" justify="between" mb="4">
            <Flex justify="between">
              <Dialog.Title mb="0">Edit Category</Dialog.Title>
              <Dialog.Close>
                <Button variant="ghost" color="gray">
                  <X size={18} />
                </Button>
              </Dialog.Close>
            </Flex>
            <Dialog.Description size="2">
              Edit the category details below.
            </Dialog.Description>
          </Flex>
          <CategoryForm
            onSubmit={updateCategory}
            defaultValues={editData as any}
            isLoading={loading}
          />
        </Dialog.Content>
      </Dialog.Root>

      <PageHeader
        title="Categories"
        description="Manage your transaction categories"
        actions={
          <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <Dialog.Trigger>
              <Button>
                <Plus size={18} />
                Add Category
              </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="450px">
              <Flex direction="column" justify="between" mb="4">
                <Flex justify="between">
                  <Dialog.Title mb="0">Add New Category</Dialog.Title>
                  <Dialog.Close>
                    <IconButton variant="ghost">
                      <X size={18} />
                    </IconButton>
                  </Dialog.Close>
                </Flex>
                <Dialog.Description size="2">
                  Add a new category to manage your transactions.
                </Dialog.Description>
              </Flex>
              <CategoryForm onSubmit={createCategory} isLoading={isCreating} />
            </Dialog.Content>
          </Dialog.Root>
        }
      />

      {loading ? (
        <Flex direction="column" gap="4">
          <Flex gap="6">
            <Skeleton height="40px" width="300px" />
            <Skeleton height="40px" width="300px" />
          </Flex>
          <Grid columns="2" gap="6">
            <Skeleton height="40px" width="300px" />
            <Skeleton height="40px" width="300px" />
          </Grid>
          <Grid columns="2" gap="4">
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
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
              onValueChange={(val) => setFilterType(val as any)}
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
                <Flex align="center" gap="2" mb="2">
                  <TrendingUp className="text-green-500" />
                  <Heading size="4">Income Categories</Heading>
                  <Badge color="green" variant="soft">
                    {incomeCategories.length}
                  </Badge>
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
                <Flex align="center" gap="2" mb="2">
                  <TrendingDown className="text-red-500" />
                  <Heading size="4">Expense Categories</Heading>
                  <Badge color="red" variant="soft">
                    {expenseCategories.length}
                  </Badge>
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
      layout="position"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
    >
      <Card variant="classic">
        <Flex justify="between" align="center" gap="2">
          <Flex direction="column" justify="between" align="start" gap="2">
            <Flex align="center" gap="3">
              <div
                className={`rounded-lg p-2 ${category.type === "INCOME" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"}`}
              >
                <Icon size={18} />
              </div>
              <Heading size="3">{category.name}</Heading>
            </Flex>
            {category.description && (
              <Text
                size="1"
                color="gray"
                className="line-clamp-1 text-ellipsis max-w-max"
              >
                {category.description}
              </Text>
            )}
          </Flex>
          <Flex justify="between" align="center">
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
            {/* <Button variant="ghost" color="gray" onClick={() => deleteClicked(category.id)}>
              <Trash size={16} />
            </Button> */}
          </Flex>
        </Flex>
      </Card>
    </motion.div>
  );
}
