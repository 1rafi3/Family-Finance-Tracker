import { useState, useMemo } from 'react'
import { FolderTree, Plus, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import type { CategoryType, SuperCategory, SubCategory } from '@family-finance/shared'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CategoryCard } from './components/CategoryCard'
import { CategoryFilters } from './components/CategoryFilters'
import { CategoryFormDialog, type CategoryFormData } from './components/CategoryFormDialog'
import { CategorySkeleton } from './components/CategorySkeleton'
import { useCategories } from './useCategories'

export function CategoriesPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<CategoryType | 'ALL'>('ALL')
  const [showArchived, setShowArchived] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryFormData> | null>(null)
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({})

  const {
    superCategories,
    subCategories,
    isLoading,
    isError,
    error,
    createSuperCategory,
    updateSuperCategory,
    archiveSuperCategory,
    createSubCategory,
    updateSubCategory,
    archiveSubCategory,
    isSubmitting,
  } = useCategories(selectedType === 'ALL' ? undefined : selectedType, showArchived)

  const toggleParentCollapse = (id: string) => {
    setCollapsedParents((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Filtered categories
  const filteredSuperCategories = useMemo(() => {
    return superCategories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
      const matchesType = selectedType === 'ALL' || cat.type === selectedType
      return matchesSearch && matchesType
    })
  }, [superCategories, search, selectedType])

  const subCategoriesByParent = useMemo(() => {
    const map = new Map<string, SubCategory[]>()
    subCategories.forEach((sub) => {
      const list = map.get(sub.superCategoryId) ?? []
      if (
        sub.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedType === 'ALL' || sub.type === selectedType)
      ) {
        list.push(sub)
      }
      map.set(sub.superCategoryId, list)
    })
    return map
  }, [subCategories, search, selectedType])

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (data.id) {
      if (data.isSubCategory) {
        await updateSubCategory({
          id: data.id,
          data: {
            name: data.name,
            superCategoryId: data.superCategoryId,
            icon: data.icon,
            color: data.color,
            description: data.description,
          },
        })
      } else {
        await updateSuperCategory({
          id: data.id,
          data: {
            name: data.name,
            icon: data.icon,
            color: data.color,
            description: data.description,
          },
        })
      }
    } else {
      if (data.isSubCategory && data.superCategoryId) {
        await createSubCategory({
          name: data.name,
          type: data.type,
          superCategoryId: data.superCategoryId,
          icon: data.icon,
          color: data.color,
          description: data.description,
        })
      } else {
        await createSuperCategory({
          name: data.name,
          type: data.type,
          icon: data.icon,
          color: data.color,
          description: data.description,
        })
      }
    }
  }

  const handleEditSuper = (cat: SuperCategory) => {
    setEditingCategory({
      id: cat.id,
      isSubCategory: false,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      description: cat.description,
    })
    setIsDialogOpen(true)
  }

  const handleEditSub = (sub: SubCategory) => {
    setEditingCategory({
      id: sub.id,
      isSubCategory: true,
      superCategoryId: sub.superCategoryId,
      name: sub.name,
      type: sub.type,
      icon: sub.icon,
      color: sub.color,
      description: sub.description,
    })
    setIsDialogOpen(true)
  }

  const openAddSuper = () => {
    setEditingCategory({ isSubCategory: false })
    setIsDialogOpen(true)
  }

  const openAddSub = () => {
    setEditingCategory({ isSubCategory: true })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            Category Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize your household financial taxonomy for transactions, budgets, and analytics.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <CategoryFilters
        search={search}
        onSearchChange={setSearch}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
        onAddSuperCategory={openAddSuper}
        onAddSubCategory={openAddSub}
      />

      {/* Error state */}
      {isError ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error instanceof Error ? error.message : 'Failed to load categories.'}</span>
        </div>
      ) : null}

      {/* Loading state */}
      {isLoading ? <CategorySkeleton /> : null}

      {/* Categories Tree Grid */}
      {!isLoading && !isError ? (
        filteredSuperCategories.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border/80 bg-card text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No categories found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {search
                ? `No categories match "${search}". Try adjusting your filters.`
                : 'Create your first income or expense category to start categorizing transactions.'}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Button size="sm" onClick={openAddSuper} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSuperCategories.map((parent) => {
              const children = subCategoriesByParent.get(parent.id) ?? []
              const isCollapsed = !!collapsedParents[parent.id]

              return (
                <div
                  key={parent.id}
                  className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-4 shadow-sm"
                >
                  {/* SuperCategory Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
                    <button
                      type="button"
                      onClick={() => toggleParentCollapse(parent.id)}
                      className="flex items-center gap-2 text-left focus:outline-none group"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      )}
                      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {parent.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        ({children.length} {children.length === 1 ? 'subcategory' : 'subcategories'})
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2 gap-1"
                        onClick={() => {
                          setEditingCategory({
                            isSubCategory: true,
                            superCategoryId: parent.id,
                            type: parent.type,
                          })
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        Add Subcategory
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleEditSuper(parent)}
                      >
                        Edit Main
                      </Button>
                    </div>
                  </div>

                  {/* SuperCategory Card itself + Child Subcategories */}
                  {!isCollapsed ? (
                    <div className="space-y-4">
                      {/* Main Category Card */}
                      <CategoryCard
                        id={parent.id}
                        name={parent.name}
                        type={parent.type}
                        icon={parent.icon}
                        color={parent.color}
                        description={parent.description}
                        isArchived={parent.isArchived}
                        isSystem={parent.isSystem}
                        onEdit={() => handleEditSuper(parent)}
                        onArchive={() => archiveSuperCategory(parent.id)}
                      />

                      {/* Subcategory Grid */}
                      {children.length > 0 ? (
                        <div className="pl-4 sm:pl-6 border-l-2 border-primary/20 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Subcategories
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <AnimatePresence>
                              {children.map((sub) => (
                                <motion.div
                                  key={sub.id}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <CategoryCard
                                    id={sub.id}
                                    name={sub.name}
                                    type={sub.type}
                                    icon={sub.icon}
                                    color={sub.color}
                                    description={sub.description}
                                    parentName={parent.name}
                                    isSubCategory
                                    isArchived={sub.isArchived}
                                    onEdit={() => handleEditSub(sub)}
                                    onArchive={() => archiveSubCategory(sub.id)}
                                  />
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      ) : (
                        <div className="pl-4 text-xs text-muted-foreground/70 italic">
                          No subcategories under {parent.name} yet.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )
      ) : null}

      {/* Form Dialog */}
      <CategoryFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingCategory(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        superCategories={superCategories}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default CategoriesPage
