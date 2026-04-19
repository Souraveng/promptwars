export interface LocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
  isMock?: boolean;
}
