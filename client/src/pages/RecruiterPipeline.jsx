import React, { useState, useEffect } from 'react';
import { useRecruiterStore } from '../store/recruiterStore.js';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  LayoutGrid, 
  GripVertical, 
  Users, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  XCircle,
  Eye
} from 'lucide-react';

const COLUMNS = [
  { id: 'Applied',     label: 'Applied',     color: 'bg-slate-100',  textColor: 'text-slate-600', border: 'border-slate-200' },
  { id: 'Reviewed',    label: 'Reviewed',    color: 'bg-amber-50',   textColor: 'text-amber-700', border: 'border-amber-200' },
  { id: 'Shortlisted', label: 'Shortlisted', color: 'bg-sky-50',     textColor: 'text-primary',   border: 'border-sky-200' },
  { id: 'Hired',       label: 'Hired',       color: 'bg-emerald-50', textColor: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'Rejected',    label: 'Rejected',    color: 'bg-rose-50',    textColor: 'text-rose-600',  border: 'border-rose-200' },
];

function KanbanCard({ app }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-sky-100 transition-all"
      role="article"
      aria-roledescription="draggable card"
      aria-label={`${app.candidate?.name || 'Unknown Candidate'} applying for ${app.job?.title || 'Unknown Job'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-accent truncate leading-none">{app.candidate?.name || 'Unknown Candidate'}</h4>
          <p className="text-[10px] text-text-muted mt-0.5 truncate">{app.job?.title}</p>
          <p className="text-[9px] text-text-muted mt-1 opacity-70">
            Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-400 cursor-grab mt-0.5 shrink-0"
          aria-label={`Drag ${app.candidate?.name || 'candidate'}`}
          title={`Drag ${app.candidate?.name || 'candidate'}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {app.candidate?.currentTitle && (
        <p className="text-[9px] text-text-muted mt-2 px-2 py-1 bg-slate-50 rounded-lg truncate font-medium">
          {app.candidate.currentTitle}
        </p>
      )}
    </div>
  );
}

function DragOverlayCard({ app }) {
  if (!app) return null;
  return (
    <div className="bg-white border border-sky-200 rounded-xl p-3.5 shadow-2xl rotate-1 scale-105 cursor-grabbing" aria-hidden="true">
      <h4 className="text-xs font-bold text-accent leading-none">{app.candidate?.name || 'Unknown'}</h4>
      <p className="text-[10px] text-text-muted mt-0.5">{app.job?.title}</p>
    </div>
  );
}

function KanbanColumn({ column, items }) {
  const { setNodeRef } = useSortable({ id: column.id });

  return (
    <div 
      ref={setNodeRef} 
      className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden min-w-0 w-full flex-1"
      role="region"
      aria-label={`${column.label} pipeline column with ${items.length} candidates`}
    >
      {/* Column Header */}
      <div className={`px-4 py-3 border-b ${column.border} ${column.color}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-extrabold uppercase tracking-wider ${column.textColor}`}>
            {column.label}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border ${column.border} ${column.textColor}`}>
            {items.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="p-3 space-y-2.5 flex-1 min-h-[200px] overflow-y-auto" role="list" aria-label={`Candidates in ${column.label}`}>
        <SortableContext items={items.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-[10px] text-text-muted font-medium">Drop cards here</p>
            </div>
          ) : (
            items.map(app => <KanbanCard key={app.id} app={app} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function RecruiterPipeline() {
  const { pipeline, fetchPipeline, updateApplicationStatus, loading } = useRecruiterStore();
  const [activeApp, setActiveApp] = useState(null);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = ({ active }) => {
    const app = pipeline.find(a => a.id === active.id);
    setActiveApp(app || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveApp(null);
    if (!over) return;

    const draggedApp = pipeline.find(a => a.id === active.id);
    if (!draggedApp) return;

    // Determine target column — over.id could be a column id or another card's id
    const targetColumn = COLUMNS.find(c => c.id === over.id);
    const targetApp = pipeline.find(a => a.id === over.id);
    const targetStatus = targetColumn?.id || targetApp?.status;

    if (targetStatus && targetStatus !== draggedApp.status) {
      updateApplicationStatus(draggedApp.id, targetStatus);
    }
  };

  const getColumnApps = (status) => pipeline.filter(app => app.status === status);

  const totalStats = {
    total: pipeline.length,
    hired: pipeline.filter(a => a.status === 'Hired').length,
    shortlisted: pipeline.filter(a => a.status === 'Shortlisted').length,
    rejected: pipeline.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div className="max-w-full px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-accent flex items-center gap-2.5">
              <LayoutGrid className="h-7 w-7 text-primary" />
              Candidate Pipeline
            </h1>
            <p className="text-text-muted text-sm mt-1">Drag applicant cards across status columns to update their stage in real time.</p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 text-center">
            <div className="px-4 py-2 bg-white border border-border-subtle rounded-xl shadow-sm">
              <p className="text-lg font-heading font-extrabold text-accent leading-none">{totalStats.total}</p>
              <p className="text-[10px] text-text-muted mt-0.5">Total</p>
            </div>
            <div className="px-4 py-2 bg-sky-50 border border-sky-200 rounded-xl shadow-sm">
              <p className="text-lg font-heading font-extrabold text-primary leading-none">{totalStats.shortlisted}</p>
              <p className="text-[10px] text-primary/70 mt-0.5">Shortlisted</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
              <p className="text-lg font-heading font-extrabold text-emerald-700 leading-none">{totalStats.hired}</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">Hired</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-text-muted font-medium">Loading pipeline data...</p>
        </div>
      ) : pipeline.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-20 bg-white border border-border-subtle rounded-2xl shadow-sm">
          <Users className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg text-accent">Pipeline is empty</h3>
          <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
            Once candidates apply to your job listings, they will appear here for drag-and-drop status management.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="max-w-full overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {COLUMNS.map(column => (
                <div key={column.id} className="w-56 shrink-0">
                  <KanbanColumn
                    column={column}
                    items={getColumnApps(column.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            <DragOverlayCard app={activeApp} />
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
