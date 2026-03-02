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

  it("prefixes log with [SDK-Playground]", () => {
    logger.log("hello");
    expect(console.log).toHaveBeenCalledWith("[SDK-Playground]", "hello");
  });

  it("prefixes warn with [SDK-Playground]", () => {
    logger.warn("warning");
    expect(console.warn).toHaveBeenCalledWith("[SDK-Playground]", "warning");
  });

  it("prefixes error with [SDK-Playground]", () => {
    logger.error("error");
    expect(console.error).toHaveBeenCalledWith("[SDK-Playground]", "error");
  });

  it("prefixes info with [SDK-Playground]", () => {
    logger.info("info");
    expect(console.info).toHaveBeenCalledWith("[SDK-Playground]", "info");
  });

  it("prefixes debug with [SDK-Playground]", () => {
    logger.debug("debug");
    expect(console.debug).toHaveBeenCalledWith("[SDK-Playground]", "debug");
  });

  it("formats objects as JSON string in log", () => {
    logger.log({ foo: 1 });
    expect(console.log).toHaveBeenCalledWith(
      "[SDK-Playground]",
      expect.stringContaining('"foo": 1'),
    );
  });

  it("strips %c and style args from first arg when present", () => {
    logger.log("%cStyled%cMore", "color:red", "color:blue", "message");
    expect(console.log).toHaveBeenCalledWith(
      "[SDK-Playground]",
      "StyledMore",
      "message",
    );
  });
});
