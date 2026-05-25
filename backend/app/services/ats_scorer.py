def calculate_keyword_score(found_count: int, missing_count: int) -> int:
    """
    Optional helper to calculate a basic score percentage from keywords.
    """
    total = found_count + missing_count
    if total == 0:
        return 0
    return int((found_count / total) * 100)
