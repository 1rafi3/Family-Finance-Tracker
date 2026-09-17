import { useState, useMemo } from 'react'
import { Users, Plus, Search, Filter, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PersonCard } from './components/PersonCard'
import { PersonDetailDrawer } from './components/PersonDetailDrawer'
import { PersonFormDialog, type PersonFormData } from './components/PersonFormDialog'
import { PeopleStatsWidget } from './components/PeopleStatsWidget'
import { usePeople } from './usePeople'
import type { PersonWithStats } from './people.api'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

export function PeoplePage() {
  const [search, setSearch] = useState('')
  const [selectedRel, setSelectedRel] = useState<string>('ALL')
  const [showArchived, setShowArchived] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<PersonWithStats | null>(null)
  const [detailPerson, setDetailPerson] = useState<PersonWithStats | null>(null)

  const {
    people,
    isLoading,
    isError,
    error,
    createPerson,
    updatePerson,
    archivePerson,
    isSubmitting,
  } = usePeople(showArchived)

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase())) ||
        p.relationship.toLowerCase().includes(search.toLowerCase())

      const matchesRel =
        selectedRel === 'ALL' ||
        (selectedRel === 'OTHER'
          ? !['Child', 'Parent', 'Spouse'].includes(p.relationship)
          : p.relationship.toUpperCase() === selectedRel.toUpperCase())

      return matchesSearch && matchesRel
    })
  }, [people, search, selectedRel])

  const handleFormSubmit = async (data: PersonFormData) => {
    if (data.id) {
      await updatePerson({
        id: data.id,
        data: {
          name: data.name,
          relationship: data.relationship,
          color: data.color,
          notes: data.notes,
        },
      })
    } else {
      await createPerson({
        name: data.name,
        relationship: data.relationship,
        color: data.color,
        notes: data.notes,
      })
    }
  }

  const handleOpenAdd = () => {
    setEditingPerson(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (p: PersonWithStats) => {
    setEditingPerson(p)
    setIsDialogOpen(true)
  }

  const handleArchive = async (p: PersonWithStats) => {
    if (confirm(`Are you sure you want to archive ${p.name}?`)) {
      await archivePerson(p.id)
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            People & Dependents (Spent For)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track expenses dedicated to children, parents, spouse, or others without requiring them to have accounts.
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Person Profile
        </Button>
      </div>

      {/* Summary KPI Widget */}
      <PeopleStatsWidget people={people} />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, role or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border-border/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Relationship Filter Tabs */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'CHILD', label: 'Children' },
              { key: 'PARENT', label: 'Parents' },
              { key: 'SPOUSE', label: 'Spouse' },
              { key: 'OTHER', label: 'Others' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedRel(tab.key)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
                  selectedRel === tab.key
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Archived Toggle */}
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
              showArchived
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/60 text-muted-foreground hover:bg-muted/60',
            )}
          >
            <Filter className="h-3 w-3" />
            <span>{showArchived ? 'Showing Archived' : 'Active Only'}</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {isError ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error instanceof Error ? error.message : 'Failed to load people profiles.'}</span>
        </div>
      ) : null}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border bg-card p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="pt-4 flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* People Grid */}
      {!isLoading && !isError ? (
        filteredPeople.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border/80 bg-card text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No people profiles found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {search
                ? `No profiles match "${search}". Try clearing your search filters.`
                : 'Create profiles for your children, parents, spouse, or others to track how much you spend for them.'}
            </p>
            <Button size="sm" onClick={handleOpenAdd} className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" />
              Add First Person
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredPeople.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onEdit={handleOpenEdit}
                  onArchive={handleArchive}
                  onView={(p) => setDetailPerson(p)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )
      ) : null}

      {/* Detail Analytics Drawer */}
      <PersonDetailDrawer
        person={detailPerson}
        isOpen={Boolean(detailPerson)}
        onClose={() => setDetailPerson(null)}
        onEdit={handleOpenEdit}
      />

      {/* Form Modal */}
      <PersonFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingPerson(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editingPerson}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default PeoplePage
