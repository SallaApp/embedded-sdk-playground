import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import logger from "../logger.js";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefixes log with [sdk-test]", () => {
    logger.log("hello");
    expect(console.log).toHaveBeenCalledWith("[sdk-test]", "hello");
  });

  it("prefixes warn with [sdk-test]", () => {
    logger.warn("warning");
    expect(console.warn).toHaveBeenCalledWith("[sdk-test]", "warning");
  });

  it("prefixes error with [sdk-test]", () => {
    logger.error("error");
    expect(console.error).toHaveBeenCalledWith("[sdk-test]", "error");
  });

  it("prefixes info with [sdk-test]", () => {
    logger.info("info");
    expect(console.info).toHaveBeenCalledWith("[sdk-test]", "info");
  });

  it("prefixes debug with [sdk-test]", () => {
    logger.debug("debug");
    expect(console.debug).toHaveBeenCalledWith("[sdk-test]", "debug");
  });

  it("formats objects as JSON string in log", () => {
    logger.log({ foo: 1 });
    expect(console.log).toHaveBeenCalledWith(
      "[sdk-test]",
      expect.stringContaining('"foo": 1'),
    );
  });

  it("strips %c and style args from first arg when present", () => {
    logger.log("%cStyled%cMore", "color:red", "color:blue", "message");
    expect(console.log).toHaveBeenCalledWith(
      "[sdk-test]",
      "StyledMore",
      "message",
    );
  });
});
