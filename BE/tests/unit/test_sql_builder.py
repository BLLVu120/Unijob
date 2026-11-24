"""Unit test cho hàm dựng câu INSERT/UPDATE động."""
import pytest

from src.utils.sql_builder import build_insert_parts


def test_build_insert_parts_drops_none_values():
    data, columns, values = build_insert_parts({"name": "A", "phone": None, "age": 0})
    assert data == {"name": "A", "age": 0}
    assert columns == "name, age"
    assert values == ":name, :age"


def test_build_insert_parts_keeps_false_and_empty_string():
    data, _, _ = build_insert_parts({"is_verified": False, "note": ""})
    assert data == {"is_verified": False, "note": ""}


def test_build_insert_parts_raises_when_nothing_to_insert():
    with pytest.raises(ValueError):
        build_insert_parts({"a": None})
