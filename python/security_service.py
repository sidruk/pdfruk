from __future__ import annotations

import io

import pikepdf

MAX_FILE_SIZE = 100 * 1024 * 1024


class SecurityError(Exception):
    pass


def _validate_pdf_bytes(data: bytes) -> None:
    if not data:
        raise SecurityError("A valid PDF file is required.")

    if len(data) > MAX_FILE_SIZE:
        raise SecurityError("File exceeds the 100 MB limit.")

    if not data.startswith(b"%PDF"):
        raise SecurityError("This file appears corrupted or is not a valid PDF.")


def protect_pdf_bytes(
    data: bytes,
    password: str,
    *,
    allow_print: bool = True,
    allow_copy: bool = False,
) -> bytes:
    _validate_pdf_bytes(data)

    if not password.strip():
        raise SecurityError("Password is required.")

    try:
        with pikepdf.open(io.BytesIO(data)) as pdf:
            if pdf.is_encrypted:
                raise SecurityError("This PDF is already password-protected.")

            output = io.BytesIO()
            pdf.save(
                output,
                encryption=pikepdf.Encryption(
                    user=password,
                    owner=password,
                    R=6,
                    allow=pikepdf.Permissions(
                        extract=allow_copy,
                        print_lowres=allow_print,
                        print_highres=allow_print,
                    ),
                ),
            )
            result = output.getvalue()
    except pikepdf.PdfError as error:
        raise SecurityError(
            "This file appears corrupted or is not a valid PDF."
        ) from error

    if not result.startswith(b"%PDF"):
        raise SecurityError("Protected PDF validation failed.")

    return result


def unlock_pdf_bytes(data: bytes, password: str) -> bytes:
    _validate_pdf_bytes(data)

    if not password:
        raise SecurityError("Password is required.")

    try:
        with pikepdf.open(io.BytesIO(data), password=password) as pdf:
            output = io.BytesIO()
            pdf.save(output)
            result = output.getvalue()
    except pikepdf.PasswordError as error:
        raise SecurityError("Incorrect password.") from error
    except pikepdf.PdfError as error:
        raise SecurityError(
            "This file appears corrupted or is not a valid PDF."
        ) from error

    if not result.startswith(b"%PDF"):
        raise SecurityError("Unlocked PDF validation failed.")

    return result
