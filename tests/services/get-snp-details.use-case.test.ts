import { describe, expect, it } from "bun:test";
import { GetSnpDetailsUseCase } from "../../src/services/get-snp-details.use-case.js";
import { makeMockRepo } from "./mock-repo.js";

describe("GetSnpDetailsUseCase", () => {
  it("returns the SNP when the rsID is found", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs00001");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.rsid).toBe("rs00001");
    }
  });

  it("returns an error object when the rsID is not found", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999");
    expect("error" in result).toBe(true);
  });

  it("error message mentions the missing rsID", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999");
    if ("error" in result) {
      expect(result.error).toContain("rs99999");
    }
  });

  it("error message includes the total SNP count from the repository", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("rs99999");
    if ("error" in result) {
      expect(result.error).toContain("2"); // 2 SNPs in mock
    }
  });

  it("rsID lookup is case-insensitive", async () => {
    const useCase = new GetSnpDetailsUseCase(makeMockRepo());
    const result = await useCase.execute("RS00001");
    expect("error" in result).toBe(false);
  });
});
