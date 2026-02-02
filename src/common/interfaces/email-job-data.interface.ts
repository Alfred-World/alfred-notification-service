export interface EmailJobData {
  to: string;
  subject?: string;
  html?: string;
  templateCode?: string;
  params?: Record<string, unknown>;
}
