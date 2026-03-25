type PaginationProps = {
    readonly page: number;
    readonly totalPages: number;
    readonly onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages: (number | string)[] = [];
        const delta = 1;

        const rangeStart = Math.max(0, page - delta);
        const rangeEnd = Math.min(totalPages - 1, page + delta);

        if (rangeStart > 0) {
            pages.push(0);
            if (rangeStart > 1) pages.push('...');
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        if (rangeEnd < totalPages - 1) {
            if (rangeEnd < totalPages - 2) pages.push('...');
            pages.push(totalPages - 1);
        }

        return pages;
    };

    const pages = getPages();

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                className="px-3 py-2 rounded-md border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                ←
            </button>

            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p as number)}
                        className={`px-3 py-2 min-w-[36px] rounded-md text-sm border transition ${page === p
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'text-gray-700 hover:bg-gray-100 border-gray-200'
                            }`}
                    >
                        {(p as number) + 1}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages - 1}
                className="px-3 py-2 rounded-md border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                →
            </button>
        </div>
    );
}