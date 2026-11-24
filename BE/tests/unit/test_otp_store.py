"""Unit test cho kho OTP trong bộ nhớ (src/verification/otp_store.py)."""
import pytest

from src.verification import otp_store


@pytest.fixture(autouse=True)
def clear_store():
    otp_store._store.clear()
    yield
    otp_store._store.clear()


def test_generate_otp_has_requested_length_and_only_digits():
    otp = otp_store.generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()
    assert len(otp_store.generate_otp(8)) == 8


def test_verify_otp_succeeds_once_then_is_consumed():
    otp_store.save_otp("a@example.com", "123456")
    assert otp_store.verify_otp("a@example.com", "123456") is True
    # Mã đã dùng thì bị xoá, không dùng lại được
    assert otp_store.verify_otp("a@example.com", "123456") is False


def test_verify_otp_wrong_code_keeps_entry():
    otp_store.save_otp("a@example.com", "123456")
    assert otp_store.verify_otp("a@example.com", "000000") is False
    assert otp_store.verify_otp("a@example.com", "123456") is True


def test_verify_otp_unknown_email():
    assert otp_store.verify_otp("nobody@example.com", "123456") is False


def test_verify_otp_expired(monkeypatch):
    now = 1_000_000.0
    monkeypatch.setattr(otp_store.time, "time", lambda: now)
    otp_store.save_otp("a@example.com", "123456")

    monkeypatch.setattr(otp_store.time, "time", lambda: now + otp_store.OTP_TTL_SECONDS + 1)
    assert otp_store.verify_otp("a@example.com", "123456") is False
    assert "a@example.com" not in otp_store._store


def test_save_otp_overwrites_previous_code():
    otp_store.save_otp("a@example.com", "111111")
    otp_store.save_otp("a@example.com", "222222")
    assert otp_store.verify_otp("a@example.com", "111111") is False
    assert otp_store.verify_otp("a@example.com", "222222") is True
