export interface ISeed {
  readonly name: string;
  up(): Promise<void>;
  down(): Promise<void>;
}
