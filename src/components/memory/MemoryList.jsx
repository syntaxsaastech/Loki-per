import MemoryCard from "./MemoryCard";

export default function MemoryList({ memories = [], onDelete, onClick }) {
  if (!memories.length) {
    return (
      <div className="routine-empty">
        🌱 No memories yet. Add your first one above.
      </div>
    );
  }

  return (
    <div className="memory-list">
      {memories.map((memory) => (
        <MemoryCard
          key={memory.id}
          memory={memory}
          onDelete={onDelete}
          onClick={onClick ? () => onClick(memory) : undefined}
        />
      ))}
    </div>
  );
}