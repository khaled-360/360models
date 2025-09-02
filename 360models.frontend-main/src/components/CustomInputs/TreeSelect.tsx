import { FetchedTreeBranchData } from "dependencies/@360models.platform/types/dist/DTO/tree-branch";
import { useEffect, useState } from "react";
import { Popover } from "react-tiny-popover";
import { IconCircleFilled, IconPackages, IconPlus } from "@tabler/icons-react";
import DetailsSelect from "@components/Details/DetailsSelect";

export type TreeSelectProps = {
  data?: FetchedTreeBranchData;
  value: string;
  onChange: (id: string) => void;
  treeName?: string;
  isModelForm?: boolean;
  onAddBranch?: (parentId: string) => void;
  onUpdateBranch?: (data: FetchedTreeBranchData) => void;
  onDeleteBranch?: (data: FetchedTreeBranchData) => void;
};

export function TreeSelect({
  data,
  value,
  onChange,
  treeName = "Default",
  isModelForm = false,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
}: TreeSelectProps) {
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());

  const hasKids = (node?: FetchedTreeBranchData) => !!node?.children?.length;

  const findPath = (
    node: FetchedTreeBranchData,
    targetId: string
  ): string[] | null => {
    if (node.id === targetId) return [node.id];
    if (!node.children) return null;
    for (const child of node.children) {
      const p = findPath(child, targetId);
      if (p) return [node.id, ...p];
    }
    return null;
  };

  const toggleNode = (id: string) => {
    setOpenNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openNodeAndDirectChildren = (node: FetchedTreeBranchData) => {
    setOpenNodes((prev) => {
      const next = new Set(prev);
      next.add(node.id);
      node.children?.forEach((c) => next.add(c.id));
      return next;
    });
  };

  useEffect(() => {
    if (!data || !value) return;
    const path = findPath(data, value);
    if (path) {
      setOpenNodes((prev) => new Set([...prev, ...path]));
    }
  }, [value, data]);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const NodeMenu = ({
    node,
    isRoot,
  }: {
    node: FetchedTreeBranchData;
    isRoot: boolean;
  }) => {
    if (!onAddBranch && !onUpdateBranch && !onDeleteBranch) return null;
    const isOpen = activeMenuId === node.id;

    return (
      <Popover
        isOpen={isOpen}
        positions={["right"]}
        padding={4}
        onClickOutside={() => setActiveMenuId(null)}
        content={() => (
          <div
            className="z-10 flex min-w-[80px] flex-col gap-1 rounded border bg-white p-1 shadow-md"
            onMouseEnter={() => setActiveMenuId(node.id)}
            onMouseLeave={() => setActiveMenuId(null)}
          >
            {onAddBranch && (
              <button
                className="cursor-pointer text-left text-sm text-red-500 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddBranch(node.id);
                  setActiveMenuId(null);
                }}
              >
                Add
              </button>
            )}
            {onUpdateBranch && !isRoot && (
              <button
                className="cursor-pointer text-left text-sm text-red-500 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateBranch(node);
                  setActiveMenuId(null);
                }}
              >
                Update
              </button>
            )}
            {onDeleteBranch && !isRoot && (
              <button
                className="cursor-pointer text-left text-sm text-red-500 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBranch(node);
                  setActiveMenuId(null);
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuId(isOpen ? null : node.id);
          }}
          className="cursor-pointer px-1 text-gray-500 hover:text-gray-700"
        >
          ⋮
        </button>
      </Popover>
    );
  };

  const renderNode = (node: FetchedTreeBranchData, isRoot = false) => {
    const hasChildren = hasKids(node);
    const isNodeOpen = openNodes.has(node.id);
    const rowGrid =
      "grid grid-cols-[auto_1fr_auto] items-center gap-2 cursor-pointer";

    const onHover = () => setHoveredNodeId(node.id);
    const onLeave = () => setHoveredNodeId(null);

    const showEllipsis = hoveredNodeId === node.id || activeMenuId === node.id;

    if (isRoot) {
      return (
        <div
          key={node.id}
          className={`flex flex-col gap-1`}
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          <div
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer relative ${
              value === node.id ? "bg-gray-200" : "hover:bg-gray-200"
            }`}
            onClick={() => onChange(node.id)}
          >
            <div className="flex items-center gap-2">
              <IconPackages />
              <div className="truncate">{treeName}</div>
            </div>

            {!isModelForm && (
              <div className="flex-shrink-0">
                <NodeMenu node={node} isRoot={true} />
              </div>
            )}
          </div>

          {hasKids(node) && (
            <div className="pl-6 flex flex-col gap-1 mt-1">
              {node.children!.map((child) => renderNode(child))}
            </div>
          )}
        </div>
      );
    }

    if (hasChildren) {
      return (
        <DetailsSelect
          key={node.id}
          isOpen={isNodeOpen}
          onChevronToggle={() => toggleNode(node.id)}
          onCategoryClick={() => {
            onChange(node.id);
            openNodeAndDirectChildren(node);
          }}
          className={rowGrid}
        >
          <summary
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className={`flex justify-between items-center py-1 rounded relative ${
              value === node.id ? "bg-gray-200" : "hover:bg-gray-200"
            }`}
          >
            <div className="truncate">{node.name}</div>
            {!isModelForm && showEllipsis && (
              <NodeMenu node={node} isRoot={isRoot} />
            )}
          </summary>

          <div className="pl-6 flex flex-col gap-1 mt-1">
            {node.children!.map((child) => renderNode(child))}
          </div>
          {isModelForm && (
            <div
              className="py-1 pr-3 hover:bg-gray-200 rounded-lg flex gap-1 items-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onAddBranch?.(node.id);
                setActiveMenuId(null);
              }}
            >
              <IconPlus className="h-[80%] aspect-square" color="black" />
              <p className="text-black text-1xl">New</p>
            </div>
          )}
        </DetailsSelect>
      );
    }

    // Leaf in model
    if (isModelForm) {
      return (
        <DetailsSelect
          key={node.id}
          isOpen={isNodeOpen}
          onChevronToggle={() => toggleNode(node.id)}
          onCategoryClick={() => onChange(node.id)}
          className={rowGrid}
        >
          <summary
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className={`flex justify-between items-center py-1 rounded relative ${
              value === node.id ? "bg-gray-200" : "hover:bg-gray-200"
            }`}
          >
            <div className="truncate pl-2.5">{node.name}</div>
            {!isModelForm && showEllipsis && (
              <NodeMenu node={node} isRoot={isRoot} />
            )}
          </summary>

          <div
            className="py-1 pr-3 hover:bg-gray-200 rounded-lg flex gap-1 items-center cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onAddBranch?.(node.id);
              setActiveMenuId(null);
            }}
          >
            <IconPlus className="h-[80%] aspect-square" color="black" />
            <p className="text-black text-1xl">New</p>
          </div>
        </DetailsSelect>
      );
    }

		// Leaf
    return (
      <div
        key={node.id}
        className="items-center py-1 rounded"
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
				<div
					className={`flex items-center justify-between py-1 rounded cursor-pointer grow ${
						value === node.id ? "bg-gray-200" : "hover:bg-gray-200"
					}`}
					onClick={() => onChange(node.id)}
				>
					<div className="flex items-center gap-1 px-2">
						<IconCircleFilled className="h-3 w-3 text-red-500" />
						<div className="truncate pl-2.5">{node.name}</div>
					</div>

					{!isModelForm && showEllipsis && (	
						<NodeMenu node={node} isRoot={isRoot} />
					)}
				</div>
      </div>
    );
  };

  return <div>{data && renderNode(data, true)}</div>;
}