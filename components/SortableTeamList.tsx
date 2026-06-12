"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
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

function SortableItem({ id }: { id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-xl border border-white/10 bg-black/40 p-4 font-bold text-white"
    >
      {id}
    </div>
  );
}

type Props = {
  teams: string[];
  onChange: (teams: string[]) => void;
};

export default function SortableTeamList({
  teams,
  onChange,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
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
      <SortableContext
        items={teams}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {teams.map((team) => (
            <SortableItem key={team} id={team} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}