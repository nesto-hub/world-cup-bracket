"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { countryCodes } from "@/data/countryCodes";

function Flag({ team }: { team: string }) {
  const code = countryCodes[team];

  if (!code) return <span className="h-5 w-7 rounded bg-slate-700" />;

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={`${team} flag`}
      className="h-5 w-7 rounded object-cover shadow"
      draggable={false}
    />
  );
}

function SortableItem({ id, index }: { id: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    userSelect: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 font-bold text-white shadow-lg select-none ${
        isDragging ? "z-50 scale-105 bg-lime-400 text-black" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 pointer-events-none">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
            index < 2
              ? "bg-lime-400 text-black"
              : index === 2
              ? "bg-yellow-300 text-black"
              : "bg-slate-700 text-white"
          }`}
        >
          {index + 1}
        </span>

        <Flag team={id} />

        <span className="truncate">{id}</span>
      </div>

      <button
        type="button"
        {...listeners}
        className="touch-none select-none rounded-xl bg-white/10 px-3 py-2 text-slate-300 active:bg-lime-400 active:text-black"
        aria-label={`Drag ${id}`}
      >
        ☰
      </button>
    </div>
  );
}

type Props = {
  teams: string[];
  onChange: (teams: string[]) => void;
};

export default function SortableTeamList({ teams, onChange }: Props) {
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(PointerSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = teams.indexOf(active.id as string);
        const newIndex = teams.indexOf(over.id as string);

        onChange(arrayMove(teams, oldIndex, newIndex));
      }}
    >
      <SortableContext items={teams} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {teams.map((team, index) => (
            <SortableItem key={team} id={team} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}