import math

from app.api.constants import PAGE_SIZE_OPTIONS


def apply_pagination_to_records(records, page_number, page_size):
    page_size = ensure_valid_page_size(page_size)
    total_records = len(records)
    total_pages = math.ceil(total_records / page_size)
    items_per_page = min(total_records, page_size)
    paginated_records = records[(page_number - 1) * page_size:page_number * page_size]
    return {
        'records': paginated_records,
        'current_page': page_number,
        'total_pages': total_pages,
        'items_per_page': items_per_page,
        'total': total_records
    }


def ensure_valid_page_size(page_size):
    return PAGE_SIZE_OPTIONS[min(
        range(len(PAGE_SIZE_OPTIONS)), key=lambda i: abs(PAGE_SIZE_OPTIONS[i] - page_size))]
