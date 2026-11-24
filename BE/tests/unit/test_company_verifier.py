"""Unit test cho phần kiểm tra mã số thuế (không gọi API bên ngoài)."""
import os

import pytest

from src.verification import company_verifier
from src.verification.company_verifier import CompanyVerifier


@pytest.mark.parametrize("tax_code", ["0310634373", "0310634373001", "  0310634373  "])
def test_valid_tax_code_formats(tax_code):
    assert CompanyVerifier._is_valid_tax_code_format(tax_code) is True


@pytest.mark.parametrize("tax_code", ["", None, "123", "03106343731", "031063437a", "0310-634373"])
def test_invalid_tax_code_formats(tax_code):
    assert CompanyVerifier._is_valid_tax_code_format(tax_code) is False


def test_verify_tax_code_rejects_bad_format_without_calling_api(monkeypatch):
    def fail(*args, **kwargs):
        raise AssertionError("Không được gọi API khi sai định dạng")

    monkeypatch.setattr(company_verifier.requests, "get", fail)
    result = CompanyVerifier().verify_tax_code("abc")
    assert result["is_valid"] is False
    assert result["format_valid"] is False
    assert result["error"]


def test_email_template_file_exists():
    # Đường dẫn mẫu email OTP phải trỏ đúng tới BE/form/email_verification.html
    assert os.path.exists(os.path.abspath(company_verifier._TEMPLATE_PATH))
