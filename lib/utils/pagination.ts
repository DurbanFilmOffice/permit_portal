export const PAGE_SIZES = [10, 25, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export function getPaginationParams(searchParams: {
  page?: string;
  pageSize?: string;
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const pageSize = PAGE_SIZES.includes(
    parseInt(
      searchParams.pageSize ?? String(DEFAULT_PAGE_SIZE),
    ) as (typeof PAGE_SIZES)[number],
  )
    ? parseInt(searchParams.pageSize ?? String(DEFAULT_PAGE_SIZE))
    : DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

export function getPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
  };
}

export type PaginationMeta = ReturnType<typeof getPaginationMeta>;
