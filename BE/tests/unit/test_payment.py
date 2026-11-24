"""Unit test cho thanh toán VNPay: ký HMAC, bỏ dấu, tạo link và kiểm tra kết quả trả về."""
import hashlib
import hmac
import urllib.parse
from types import SimpleNamespace

import pytest

from src.api.v1 import payment

SECRET = "TESTSECRET"


@pytest.fixture
def vnpay_env(monkeypatch):
    monkeypatch.setenv("VNPAY_TMN_CODE", "TESTCODE")
    monkeypatch.setenv("VNPAY_HASH_SECRET", SECRET)
    monkeypatch.delenv("VNPAY_URL", raising=False)


def test_sign_sorts_params_skips_empty_and_matches_hmac_sha512():
    query, secure_hash = payment._sign({"b": "2", "a": "x y", "c": "", "d": None}, SECRET)
    assert query == "a=x+y&b=2"
    expected = hmac.new(SECRET.encode(), query.encode(), hashlib.sha512).hexdigest()
    assert secure_hash == expected


@pytest.mark.parametrize("text, expected", [
    ("Thanh toán gói Đăng tin", "Thanh toan goi Dang tin"),
    ("  nhiều   khoảng   trắng ", "nhieu khoang trang"),
    ("", "Thanh toan Unijob"),
    (None, "Thanh toan Unijob"),
])
def test_ascii_removes_vietnamese_marks(text, expected):
    assert payment._ascii(text) == expected


def test_ascii_respects_limit():
    assert len(payment._ascii("a" * 300, limit=10)) == 10


def _request(host="10.0.0.1"):
    return SimpleNamespace(client=SimpleNamespace(host=host))


def test_create_payment_link_requires_config(monkeypatch):
    monkeypatch.delenv("VNPAY_TMN_CODE", raising=False)
    monkeypatch.delenv("VNPAY_HASH_SECRET", raising=False)
    body = payment.CreatePaymentRequest(amount=100000, description="x", return_url="http://localhost/r")
    res = payment.create_payment_link(body, _request())
    assert res.status_code == 403


def test_create_payment_link_rejects_small_amount(vnpay_env):
    body = payment.CreatePaymentRequest(amount=1000, description="x", return_url="http://localhost/r")
    res = payment.create_payment_link(body, _request())
    assert res.status_code == 403


def test_create_payment_link_builds_signed_url(vnpay_env):
    body = payment.CreatePaymentRequest(amount=99000, description="Gói Cơ bản", return_url="http://localhost/r")
    res = payment.create_payment_link(body, _request())

    assert res["status"] is True
    url = res["checkoutUrl"]
    assert url.startswith(payment.VNPAY_SANDBOX_URL + "?")

    params = dict(urllib.parse.parse_qsl(url.split("?", 1)[1]))
    assert params["vnp_Amount"] == "9900000"  # VNPay tính theo x100
    assert params["vnp_TmnCode"] == "TESTCODE"
    assert params["vnp_OrderInfo"] == "Goi Co ban"
    assert params["vnp_IpAddr"] == "10.0.0.1"
    assert params["vnp_TxnRef"] == res["orderCode"]

    # Chữ ký trong URL phải khớp khi ký lại các tham số còn lại
    received = params.pop("vnp_SecureHash")
    _, expected = payment._sign(params, SECRET)
    assert received == expected


def _signed_return(**overrides):
    params = {
        "vnp_Amount": "9900000",
        "vnp_TxnRef": "20261125120000123",
        "vnp_ResponseCode": "00",
        "vnp_TransactionStatus": "00",
        "vnp_BankCode": "NCB",
        "vnp_TransactionNo": "14000000",
    }
    params.update(overrides)
    _, secure_hash = payment._sign(params, SECRET)
    return {**params, "vnp_SecureHash": secure_hash, "vnp_SecureHashType": "HmacSHA512"}


def test_verify_return_valid_and_paid(vnpay_env):
    res = payment.verify_return(payment.VerifyReturnRequest(query=_signed_return()))
    assert res["valid"] is True
    assert res["paid"] is True
    assert res["amount"] == 99000
    assert res["orderCode"] == "20261125120000123"


def test_verify_return_valid_but_cancelled(vnpay_env):
    res = payment.verify_return(payment.VerifyReturnRequest(query=_signed_return(vnp_ResponseCode="24")))
    assert res["valid"] is True
    assert res["paid"] is False


def test_verify_return_detects_tampering(vnpay_env):
    query = _signed_return()
    query["vnp_Amount"] = "100"  # sửa số tiền sau khi ký
    res = payment.verify_return(payment.VerifyReturnRequest(query=query))
    assert res["valid"] is False
    assert res["paid"] is False


def test_verify_return_without_hash(vnpay_env):
    query = _signed_return()
    query.pop("vnp_SecureHash")
    res = payment.verify_return(payment.VerifyReturnRequest(query=query))
    assert res["valid"] is False
