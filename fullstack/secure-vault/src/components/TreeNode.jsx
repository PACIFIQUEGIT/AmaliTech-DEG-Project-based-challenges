// src/components/TreeNode.jsx
export default function TreeNode({
  item,
  level = 0,
  onSelect,
  selectedId,
  focusedId,
  expanded,
  toggleFolder,
}) {
  const isFolder = item.type === "folder";
  const open = expanded[item.id];

  const active = selectedId === item.id;
  const focused = focusedId === item.id;

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(item.id);
    } else {
      onSelect(item);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition
        ${
          active
            ? "bg-blue-600 text-white"
            : focused
            ? "bg-zinc-700 text-white"
            : "hover:bg-zinc-800 text-zinc-200"
        }`}
        style={{ marginLeft: `${level * 14}px` }}
      >
        <span>
          {isFolder ? (open ? "📂" : "📁") : "📄"}
        </span>

        <span className="truncate">{item.name}</span>
      </div>

      {isFolder &&
        open &&
        item.children?.map((child) => (
          <TreeNode
            key={child.id}
            item={child}
            level={level + 1}
            onSelect={onSelect}
            selectedId={selectedId}
            focusedId={focusedId}
            expanded={expanded}
            toggleFolder={toggleFolder}
          />
        ))}
    </div>
  );
}