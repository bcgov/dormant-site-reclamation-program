import math


def apply_pagination_to_records(records, page_number, page_size):
    total_records = len(records[:page_size])
    total_pages = math.ceil(len(records) / page_size)
    items_per_page = min(total_records, page_size)
    paginated_records = records[(page_number - 1) * page_size:page_number * page_size]
    return {
        'records': paginated_records,
        'current_page': page_number,
        'total_pages': total_pages,
        'items_per_page': items_per_page,
        'total': total_records
    }
