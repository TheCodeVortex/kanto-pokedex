export abstract class Entity<TId, TProps> {
  protected constructor(
    public readonly id: TId,
    protected props: TProps,
  ) {}

  equals(other?: Entity<TId, TProps>): boolean {
    if (!other || other.constructor !== this.constructor) return false;
    return this.id === other.id;
  }
}
