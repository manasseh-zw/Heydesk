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
  EyeIcon,
  FileTextIcon,
  GlobeIcon,
  ListFilterIcon,
  TrashIcon,
  TypeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
  type GetDocumentsResponse,
} from "@/lib/types/document";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { authState } from "@/lib/state/auth.state";
import { getDocuments } from "@/lib/services/documents.service";
import { type Row } from "@tanstack/react-table";
import { DocContentModal } from "./doc-content-modal";

type DocumentRow = Document;

const searchFilterFn: FilterFn<DocumentRow> = (row, _columnId, filterValue) => {
  const haystack =
    `${row.original.name} ${row.original.sourceUrl ?? ""}`.toLowerCase();
  const needle = String(filterValue ?? "").toLowerCase();
  return haystack.includes(needle);
};

const getStatusBadge = (status: DocumentIngestStatus) => {
  const getStatusDot = (status: DocumentIngestStatus) => {
    switch (status) {
      case DocumentIngestStatus.Pending:
        return "bg-amber-500";
      case DocumentIngestStatus.Processing:
        return "bg-blue-500";
      case DocumentIngestStatus.Completed:
        return "bg-lime-500";
      case DocumentIngestStatus.Failed:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={`size-1.5 rounded-full ${getStatusDot(status)}`}
        aria-hidden="true"
      ></span>
      {status}
    </Badge>
  );
};

const getDocumentTypeIcon = (type: DocumentType) => {
  switch (type) {
    case DocumentType.Url:
      return <GlobeIcon size={16} />;
    case DocumentType.Document:
      return <FileTextIcon size={16} />;
    case DocumentType.Text:
      return <TypeIcon size={16} />;
    default:
      return null;
  }
};

const extractWebsiteName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const columns: ColumnDef<DocumentRow>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      const { name, type, sourceUrl } = row.original;
      const displayName =
        type === DocumentType.Url && sourceUrl
          ? extractWebsiteName(sourceUrl)
          : name;

      return (
        <div className="flex items-center gap-2">
          {getDocumentTypeIcon(type)}
          <div className="font-medium truncate max-w-[28ch]" title={name}>
            {displayName}
          </div>
        </div>
      );
    },
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
    header: "Source",
    accessorKey: "sourceUrl",
    cell: ({ row }) => {
      const { sourceUrl, type } = row.original;

      if (type === DocumentType.Url && sourceUrl) {
        return (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[36ch] block"
            title={sourceUrl}
          >
            {sourceUrl}
          </a>
        );
      }

      if (type === DocumentType.Document) {
        return <Badge variant="outline">Uploaded</Badge>;
      }

      if (type === DocumentType.Text) {
        return <Badge variant="outline">Text Content</Badge>;
      }

      return <span className="text-muted-foreground">—</span>;
    },
    size: 360,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => getStatusBadge(row.original.status),
    size: 140,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row, table }) => (
      <DocumentRowActions
        row={row}
        onViewContent={(table as any).options.meta?.handleViewContent}
      />
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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { organization } = useStore(authState);
  const orgId = organization?.id;
  const currentPage = pagination.pageIndex + 1;
  const pageSize = pagination.pageSize;

  const query = useQuery<GetDocumentsResponse, Error>({
    queryKey: ["documents", orgId, { page: currentPage, pageSize }],
    queryFn: () =>
      orgId
        ? getDocuments(orgId, { page: currentPage, pageSize })
        : Promise.resolve({ documents: [], totalCount: 0 }),
    enabled: !!orgId,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.data) {
      setData(query.data.documents);
    }
  }, [query.data]);

  const handleViewContent = (document: Document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

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
    meta: {
      handleViewContent,
    },
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
            {query.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : query.isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {(query.error as Error).message ||
                    "Failed to load documents."}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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

      <DocContentModal
        document={selectedDocument}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

function DocumentRowActions({
  row,
  onViewContent,
}: {
  row: Row<DocumentRow>;
  onViewContent?: (document: Document) => void;
}) {
  const handleDelete = () => {
    console.log("Delete document:", row.original.id);
  };

  const handleViewContent = () => {
    if (onViewContent) {
      onViewContent(row.original);
    }
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
          <DropdownMenuItem onClick={handleViewContent}>
            <EyeIcon size={16} className="mr-2" />
            View Content
          </DropdownMenuItem>
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
