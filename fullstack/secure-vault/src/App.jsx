import { useEffect, useMemo, useState } from "react";
import data from "./data/data.json";
import TreeNode from "./components/TreeNode";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const toggleFolder = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // SEARCH FILTER TREE
  function filterTree(nodes, term) {
    return nodes
      .map((node) => {
        if (node.type === "folder") {
          const filteredChildren = filterTree(
            node.children || [],
            term
          );

          if (
            node.name.toLowerCase().includes(term.toLowerCase()) ||
            filteredChildren.length
          ) {
            return {
              ...node,
              children: filteredChildren,
            };
          }
        }

        if (
          node.name.toLowerCase().includes(term.toLowerCase())
        ) {
          return node;
        }

        return null;
      })
      .filter(Boolean);
  }

  const visibleData = useMemo(() => {
    if (!search.trim()) return data;
    return filterTree(data, search);
  }, [search]);

  // AUTO EXPAND SEARCH RESULTS
  useEffect(() => {
    if (!search.trim()) return;

    const all = {};

    function expandAll(nodes) {
      nodes.forEach((node) => {
        if (node.type === "folder") {
          all[node.id] = true;
          if (node.children) expandAll(node.children);
        }
      });
    }

    expandAll(visibleData);

    setExpanded((prev) => ({
      ...prev,
      ...all,
    }));
  }, [search, visibleData]);

  // FLAT TREE FOR KEYBOARD NAV
  const flatItems = useMemo(() => {
    const items = [];

    function walk(nodes, level = 0) {
      nodes.forEach((node) => {
        items.push({ ...node, level });

        if (
          node.type === "folder" &&
          expanded[node.id] &&
          node.children?.length
        ) {
          walk(node.children, level + 1);
        }
      });
    }

    walk(visibleData);
    return items;
  }, [expanded, visibleData]);

  // KEEP FOCUS VALID
  useEffect(() => {
    if (focusedIndex > flatItems.length - 1) {
      setFocusedIndex(0);
    }
  }, [flatItems, focusedIndex]);

  // KEYBOARD CONTROLS
  useEffect(() => {
    const handleKey = (e) => {
      if (!flatItems.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, flatItems.length - 1)
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.max(prev - 1, 0)
        );
      }

      if (e.key === "Enter") {
        const item = flatItems[focusedIndex];

        if (item?.type === "file") {
          setSelected(item);
        }
      }

      if (e.key === "ArrowRight") {
        const item = flatItems[focusedIndex];

        if (item?.type === "folder") {
          setExpanded((prev) => ({
            ...prev,
            [item.id]: true,
          }));
        }
      }

      if (e.key === "ArrowLeft") {
        const item = flatItems[focusedIndex];

        if (item?.type === "folder") {
          setExpanded((prev) => ({
            ...prev,
            [item.id]: false,
          }));
        }
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [flatItems, focusedIndex]);

  const focusedItem = flatItems[focusedIndex];

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="h-16 border-b border-zinc-800 flex items-center px-6 text-xl font-semibold">
        SecureVault Dashboard
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-zinc-800 p-4 overflow-y-auto bg-zinc-900">
          <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
            Vault Explorer
          </h2>

          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full mb-4 px-3 py-2 rounded-lg bg-zinc-800 text-sm outline-none"
          />

          {visibleData.map((item) => (
            <TreeNode
              key={item.id}
              item={item}
              onSelect={setSelected}
              selectedId={selected?.id}
              focusedId={focusedItem?.id}
              expanded={expanded}
              toggleFolder={toggleFolder}
            />
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 bg-zinc-950">
          <h1 className="text-3xl font-semibold mb-3">
            Secure File Explorer
          </h1>

          <p className="text-zinc-400 max-w-xl">
            Search, navigate and inspect deeply nested
            enterprise files efficiently.
          </p>
        </main>

        {/* Properties */}
        <aside className="w-80 border-l border-zinc-800 p-6 bg-zinc-900">
          <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-6">
            Properties
          </h3>

          {selected ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-zinc-500">Name</p>
                <p>{selected.name}</p>
              </div>

              <div>
                <p className="text-zinc-500">Type</p>
                <p>{selected.type}</p>
              </div>

              <div>
                <p className="text-zinc-500">Size</p>
                <p>{selected.size || "-"}</p>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">
              Select a file to inspect.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}