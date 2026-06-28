from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

import fitz
import pikepdf

MAX_FILE_SIZE = 100 * 1024 * 1024

PRESET_SETTINGS: dict[str, str] = {
    "low": "/screen",
    "medium": "/ebook",
    "high": "/printer",
}


class CompressError(Exception):
    pass


def _find_ghostscript() -> str | None:
    for candidate in ("gswin64c", "gswin32c", "gs"):
        path = shutil.which(candidate)
        if path:
            return path
    return None


def _validate_pdf(input_path: Path) -> None:
    try:
        with pikepdf.open(input_path) as pdf:
            if pdf.is_encrypted:
                raise CompressError(
                    "This PDF is password-protected. Use Unlock first."
                )
    except pikepdf.PasswordError as error:
        raise CompressError(
            "This PDF is password-protected. Use Unlock first."
        ) from error
    except pikepdf.PdfError as error:
        raise CompressError(
            "This file appears corrupted or is not a valid PDF."
        ) from error


def _run_ghostscript(input_path: Path, output_path: Path, preset: str) -> None:
    gs_binary = _find_ghostscript()
    if not gs_binary:
        raise CompressError("Ghostscript is not installed.")

    pdf_settings = PRESET_SETTINGS.get(preset, PRESET_SETTINGS["medium"])
    command = [
        gs_binary,
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS={pdf_settings}",
        "-dDetectDuplicateImages=true",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={output_path}",
        str(input_path),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0 or not output_path.exists():
        stderr = (result.stderr or result.stdout or "").strip()
        raise CompressError(stderr or "Ghostscript failed to compress the PDF.")


def _optimize_with_pikepdf(input_path: Path, output_path: Path) -> None:
    with pikepdf.open(input_path) as pdf:
        pdf.save(
            output_path,
            compress_streams=True,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            linearize=True,
            recompress_flate=True,
        )


def _compress_with_pymupdf(input_path: Path, output_path: Path) -> None:
    document = fitz.open(input_path)
    try:
        if document.is_encrypted:
            raise CompressError(
                "This PDF is password-protected. Use Unlock first."
            )

        document.save(
            output_path,
            garbage=4,
            deflate=True,
            clean=True,
            linear=True,
        )
    finally:
        document.close()


def compress_pdf_bytes(data: bytes, preset: str) -> bytes:
    if not data:
        raise CompressError("A valid PDF file is required to compress.")

    if len(data) > MAX_FILE_SIZE:
        raise CompressError("File exceeds the 100 MB limit.")

    if not data.startswith(b"%PDF"):
        raise CompressError("This file appears corrupted or is not a valid PDF.")

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        input_path = temp_path / "input.pdf"
        working_path = temp_path / "working.pdf"
        final_output_path = temp_path / "output.pdf"

        input_path.write_bytes(data)
        _validate_pdf(input_path)

        if _find_ghostscript():
            _run_ghostscript(input_path, working_path, preset)
            _optimize_with_pikepdf(working_path, final_output_path)
        else:
            _compress_with_pymupdf(input_path, working_path)
            _optimize_with_pikepdf(working_path, final_output_path)

        output = final_output_path.read_bytes()
        if not output.startswith(b"%PDF"):
            raise CompressError("Compressed PDF validation failed.")

        return output
