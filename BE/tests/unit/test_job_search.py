"""Unit test cho hàm dựng câu tìm kiếm tin tuyển dụng (không cần database)."""
from src.db.job import SEARCH_MAX_LIMIT, SEARCH_SORTS, build_search_query


def test_default_only_open_jobs_newest_first():
    query, params = build_search_query({})
    assert "j.is_active = TRUE" in query
    assert "j.expiry_date IS NULL OR j.expiry_date >= CURRENT_DATE" in query
    assert query.endswith("LIMIT :limit")
    assert SEARCH_SORTS["newest"] in query
    assert params == {"limit": 100}


def test_keyword_searches_title_role_company_without_accents():
    query, params = build_search_query({"keyword": "  pha chế  "})
    assert "unaccent(j.title) ILIKE unaccent(:keyword)" in query
    assert "unaccent(e.emp_name) ILIKE unaccent(:keyword)" in query
    assert params["keyword"] == "%pha chế%"


def test_blank_keyword_and_location_are_ignored():
    query, params = build_search_query({"keyword": "   ", "location": ""})
    assert ":keyword" not in query and ":location" not in query
    assert "keyword" not in params and "location" not in params


def test_location_salary_and_job_type_filters():
    query, params = build_search_query({"location": "Đà Nẵng", "salary_min": 5_000_000, "job_type": "remote"})
    assert params["location"] == "%Đà Nẵng%"
    assert params["salary_min"] == 5_000_000
    assert params["job_type"] == "remote"
    assert "j.job_type = :job_type" in query


def test_salary_zero_is_still_a_filter():
    query, params = build_search_query({"salary_min": 0})
    assert ":salary_min" in query and params["salary_min"] == 0


def test_unknown_job_type_and_sort_fall_back_safely():
    query, params = build_search_query({"job_type": "x; DROP TABLE jobs", "sort_by": "drop"})
    assert "job_type" not in params
    assert "DROP" not in query
    assert SEARCH_SORTS["newest"] in query


def test_sort_options():
    for key, clause in SEARCH_SORTS.items():
        query, _ = build_search_query({"sort_by": key})
        assert f"ORDER BY {clause}" in query


def test_limit_is_clamped():
    assert build_search_query({"limit": 10_000})[1]["limit"] == SEARCH_MAX_LIMIT
    assert build_search_query({"limit": 5})[1]["limit"] == 5
