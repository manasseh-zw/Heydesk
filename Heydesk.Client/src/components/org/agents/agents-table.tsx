import { useEffect, useId, useRef, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  CircleXIcon,
  Columns3Icon,
  EditIcon,
  EllipsisIcon,
  ListFilterIcon,
  TrashIcon,
} from "lucide-react";
import Avatar from "boring-avatars";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Agent, AgentType } from "@/lib/types/agent";
import { type Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AgentRow = Agent;

const searchFilterFn: FilterFn<AgentRow> = (row, _columnId, filterValue) => {
  const haystack =
    `${row.original.name} ${row.original.description}`.toLowerCase();
  const needle = String(filterValue ?? "").toLowerCase();
  return haystack.includes(needle);
};

const columns: ColumnDef<AgentRow>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar
          name={row.original.name}
          size={28}
          colors={["#0ea5e9", "#22c55e", "#f59e0b", "#6366f1", "#ec4899"]}
        />
        <div
          className="font-medium truncate max-w-[28ch]"
          title={row.original.name}
        >
          {row.original.name}
        </div>
      </div>
    ),
    size: 260,
    filterFn: searchFilterFn,
    enableHiding: false,
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
    size: 120,
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => (
      <div className="truncate max-w-[48ch]" title={row.original.description}>
        {row.original.description || "—"}
      </div>
    ),
    size: 420,
  },
  {
    header: "Created",
    accessorKey: "createdAt",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    size: 220,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <AgentRowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
];

export default function AgentsTable() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<AgentRow[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const placeholders: AgentRow[] = [
      {
        id: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        name: "Support Bot",
        description: "Handles common customer queries",
        systemPrompt: "Be helpful and concise",
        type: AgentType.Chat,
        createdAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        organizationId: crypto.randomUUID(),
        name: "Voice Assistant",
        description: "Phone IVR assistant",
        systemPrompt: "Assist callers politely",
        type: AgentType.Voice,
        createdAt: new Date().toISOString(),
      },
    ];
    setData(placeholders);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, pagination, columnFilters },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(table.getColumn("name")?.getFilterValue()) && "pe-9"
              )}
              value={
                (table.getColumn("name")?.getFilterValue() ?? "") as string
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
              placeholder="Filter by name or description..."
              type="text"
              aria-label="Filter by name or description"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <ListFilterIcon size={16} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("name")?.getFilterValue()) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("name")?.setFilterValue("");
                  if (inputRef.current) inputRef.current.focus();
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="normal">
                <Columns3Icon
                  className="opacity-60"
                  size={10}
                  aria-hidden="true"
                />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    onSelect={(event) => event.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3" />
      </div>

      <div className="bg-background overflow-hidden rounded-md border p-3 md:p-4">
        <Table className="table-fixed ">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}
                    className="h-10"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="p-3">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-11"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 last:py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No agents.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AgentRowActions({ row }: { row: Row<AgentRow> }) {
  const handleEdit = () => {
    console.log("Edit agent:", row.original.id);
  };

  const handleDelete = () => {
    console.log("Delete agent:", row.original.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Actions"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleEdit}>
            <EditIcon size={16} className="mr-2" />
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <TrashIcon size={16} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
