import type { DomainEvent } from "./domain-event";
import { Entity } from "./entity";

export abstract class AggregateRoot<TId, TProps> extends Entity<TId, TProps> {
  private domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = this.domainEvents;
    this.domainEvents = [];
    return events;
  }
}
