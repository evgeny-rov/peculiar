export type Report = {
  type: 'HANDSHAKE' | 'CONNECTION';
};

export interface OutgoingReport extends Report {
  body?: string | Record<string, any>;
}

export interface IncomingReport extends Report {
  status: string;
  body?: string;
}
