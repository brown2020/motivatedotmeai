import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapAuthError } from "../src/lib/auth-errors.ts";

describe("mapAuthError", () => {
  it("maps invalid credentials to a friendly sign-in message", () => {
    assert.equal(
      mapAuthError({ code: "auth/invalid-credential" }, "signin"),
      "Invalid email or password."
    );
  });

  it("maps weak password on signup", () => {
    assert.equal(
      mapAuthError({ code: "auth/weak-password" }, "signup"),
      "Choose a password with at least 6 characters."
    );
  });

  it("does not leak raw Firebase messages", () => {
    const msg = mapAuthError({ code: "auth/internal-error", message: "SECRET" }, "signin");
    assert.equal(msg.includes("SECRET"), false);
    assert.match(msg, /couldn't sign you in/i);
  });
});
