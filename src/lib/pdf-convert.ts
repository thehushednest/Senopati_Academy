import { spawn } from "child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { join, parse } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

/**
 * Cek apakah binary libreoffice tersedia di host. Cache hasil — tidak perlu
 * spawn berulang untuk health check.
 */
let cachedAvailability: boolean | null = null;

export async function isLibreOfficeAvailable(): Promise<boolean> {
  if (cachedAvailability !== null) return cachedAvailability;
  try {
    const ok = await new Promise<boolean>((resolve) => {
      const proc = spawn("libreoffice", ["--version"], { stdio: "ignore" });
      proc.on("error", () => resolve(false));
      proc.on("close", (code) => resolve(code === 0));
    });
    cachedAvailability = ok;
    return ok;
  } catch {
    cachedAvailability = false;
    return false;
  }
}

/**
 * Convert PPT/PPTX buffer ke PDF buffer via libreoffice headless.
 * Pakai unique UserInstallation per call supaya tidak bentrok kalau
 * convert paralel (libreoffice punya lock per profile).
 *
 * Throws kalau libreoffice tidak ada, timeout, atau output PDF kosong.
 */
export async function convertOfficeToPdf(input: Buffer, originalFilename: string): Promise<Buffer> {
  if (!(await isLibreOfficeAvailable())) {
    throw new Error("LibreOffice tidak terinstall di server — convert PPT tidak tersedia");
  }

  const callId = randomUUID();
  const workDir = join(tmpdir(), `senopati-pdfconv-${callId}`);
  const profileDir = join(tmpdir(), `senopati-loprofile-${callId}`);
  const inputName = parse(originalFilename).name + parse(originalFilename).ext;
  const inputPath = join(workDir, inputName);

  try {
    await mkdir(workDir, { recursive: true });
    await mkdir(profileDir, { recursive: true });
    await writeFile(inputPath, input);

    // Spawn libreoffice headless. 90s timeout untuk file besar.
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(
        "libreoffice",
        [
          "--headless",
          `-env:UserInstallation=file://${profileDir}`,
          "--convert-to",
          "pdf",
          inputPath,
          "--outdir",
          workDir,
        ],
        { stdio: "ignore" },
      );

      const timer = setTimeout(() => {
        proc.kill("SIGKILL");
        reject(new Error("Convert timeout (>90 detik) — file mungkin terlalu besar atau corrupt"));
      }, 90_000);

      proc.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
      proc.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(`LibreOffice exit code ${code} — convert gagal`));
      });
    });

    // Cari file PDF hasil — namanya sama dengan input tapi .pdf
    const files = await readdir(workDir);
    const pdfFile = files.find((f) => f.toLowerCase().endsWith(".pdf"));
    if (!pdfFile) {
      throw new Error("Convert sukses tapi PDF output tidak ditemukan");
    }
    const pdfPath = join(workDir, pdfFile);
    const buffer = await readFile(pdfPath);
    if (buffer.length < 100) {
      throw new Error("PDF output terlalu kecil — hasil convert kemungkinan corrupt");
    }
    return buffer;
  } finally {
    // Cleanup — best effort
    rm(workDir, { recursive: true, force: true }).catch(() => {});
    rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}
