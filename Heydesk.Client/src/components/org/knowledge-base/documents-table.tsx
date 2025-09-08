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
  EllipsisIcon,
  ListFilterIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Document,
  DocumentIngestStatus,
  DocumentType,
} from "@/lib/types/document";

type DocumentRow = Document;

const searchFilterFn: FilterFn<DocumentRow> = (row, _columnId, filterValue) => {
  const haystack =
    `${row.original.name} ${row.original.sourceUrl ?? ""}`.toLowerCase();
  const needle = String(filterValue ?? "").toLowerCase();
  return haystack.includes(needle);
};

const statusBadgeClass = (status: DocumentIngestStatus) =>
  cn(
    "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
    status === DocumentIngestStatus.Pending && "bg-muted text-foreground",
    status === DocumentIngestStatus.Processing &&
      "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
    status === DocumentIngestStatus.Completed &&
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
    status === DocumentIngestStatus.Failed &&
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
  );

const columns: ColumnDef<DocumentRow>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <div
        className="font-medium truncate max-w-[28ch]"
        title={row.original.name}
      >
        {row.original.name}
      </div>
    ),
    size: 260,
    filterFn: searchFilterFn,
    enableHiding: false,
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
    size: 120,
  },
  {
    header: "Source",
    accessorKey: "sourceUrl",
    cell: ({ row }) => (
      <div
        className="truncate max-w-[36ch]"
        title={row.original.sourceUrl ?? undefined}
      >
        {row.original.sourceUrl ?? "—"}
      </div>
    ),
    size: 360,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <span className={statusBadgeClass(row.original.status)}>
        {row.original.status}
      </span>
    ),
    size: 140,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: () => (
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
    ),
    size: 60,
    enableHiding: false,
  },
];

export default function DocumentsTable() {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<DocumentRow[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const placeholders: DocumentRow[] = [
      {
        id: crypto.randomUUID(),
        name: "Getting Started Guide",
        type: DocumentType.Text,
        sourceUrl: null,
        status: DocumentIngestStatus.Completed,
        content: null,
      },
      {
        id: crypto.randomUUID(),
        name: "Support Portal",
        type: DocumentType.Url,
        sourceUrl: "https://example.com/support",
        status: DocumentIngestStatus.Processing,
        content: null,
      },
      {
        id: crypto.randomUUID(),
        name: "SLA.pdf",
        type: DocumentType.Document,
        sourceUrl: null,
        status: DocumentIngestStatus.Pending,
        content: null,
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
              placeholder="Filter by name or source..."
              type="text"
              aria-label="Filter by name or source"
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
                  No documents.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
