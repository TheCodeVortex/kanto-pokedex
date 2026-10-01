import { describe, expect, it } from "vitest";
import { AggregateRoot, DomainError, Entity, ValueObject, type DomainEvent } from "./index";

class Trainer extends Entity<string, { name: string }> {
  static create(id: string, name: string) {
    return new Trainer(id, { name });
  }
}

class Badge extends Entity<string, { name: string }> {
  static create(id: string) {
    return new Badge(id, { name: "Boulder" });
  }
}

class Money extends ValueObject<{ amount: number; currency: string }> {
  static of(amount: number, currency = "PokéDollar") {
    return new Money({ amount, currency });
  }
  get amount() {
    return this.props.amount;
  }
}

class Coins extends ValueObject<{ amount: number; currency: string }> {
  static of(amount: number) {
    return new Coins({ amount, currency: "PokéDollar" });
  }
}

interface BadgeEarned extends DomainEvent {
  readonly badge: string;
}

class Team extends AggregateRoot<string, { badges: string[] }> {
  static create(id: string) {
    return new Team(id, { badges: [] });
  }
  earn(badge: string) {
    this.props.badges.push(badge);
    this.addDomainEvent({ name: "BadgeEarned", occurredAt: new Date(0), badge } as BadgeEarned);
  }
}

describe("Entity", () => {
  it("is equal to an entity of the same class with the same id", () => {
    expect(Trainer.create("ash", "Ash").equals(Trainer.create("ash", "Satoshi"))).toBe(true);
  });

  it("differs by id", () => {
    expect(Trainer.create("ash", "Ash").equals(Trainer.create("gary", "Ash"))).toBe(false);
  });

  it("differs from another entity class with the same id", () => {
    expect(Trainer.create("x", "Ash").equals(Badge.create("x") as never)).toBe(false);
  });

  it("is not equal to nothing", () => {
    expect(Trainer.create("ash", "Ash").equals(undefined)).toBe(false);
  });
});

describe("ValueObject", () => {
  it("is equal when all properties match", () => {
    expect(Money.of(100).equals(Money.of(100))).toBe(true);
  });

  it("differs when a property differs", () => {
    expect(Money.of(100).equals(Money.of(200))).toBe(false);
  });

  it("differs from another value object class with the same properties", () => {
    expect(Money.of(100).equals(Coins.of(100))).toBe(false);
  });

  it("is not equal to nothing", () => {
    expect(Money.of(100).equals(undefined)).toBe(false);
  });

  it("freezes its properties", () => {
    const money = Money.of(100);
    expect(() => {
      (money as unknown as { props: { amount: number } }).props.amount = 1;
    }).toThrow(TypeError);
    expect(money.amount).toBe(100);
  });
});

describe("AggregateRoot", () => {
  it("records domain events and hands them over once", () => {
    const team = Team.create("ash");
    team.earn("Boulder");
    team.earn("Cascade");

    expect(team.pullDomainEvents().map((e) => (e as BadgeEarned).badge)).toEqual([
      "Boulder",
      "Cascade",
    ]);
    expect(team.pullDomainEvents()).toEqual([]);
  });
});

describe("DomainError", () => {
  it("is an Error named after its subclass", () => {
    class InvalidLevel extends DomainError {}
    const error = new InvalidLevel("Level must be between 1 and 100");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InvalidLevel");
    expect(error.message).toBe("Level must be between 1 and 100");
  });
});
