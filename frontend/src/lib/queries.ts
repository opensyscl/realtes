"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore, type AuthUser } from "@/store/auth";

// ===========================================================
// Auth
// ===========================================================
interface LoginPayload {
  email: string;
  password: string;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await api.post<{
        token: string;
        user: { data: AuthUser } | AuthUser;
      }>("/api/auth/login", { ...data, device_name: "web" });
      const user =
        "data" in res.data.user
          ? (res.data.user as { data: AuthUser }).data
          : (res.data.user as AuthUser);
      return { token: res.data.token, user };
    },
    onSuccess: ({ token, user }) => setSession({ token, user }),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: () => api.post("/api/auth/logout"),
    onSettled: () => {
      clear();
      if (typeof window !== "undefined") window.location.href = "/login";
    },
  });
}

// ===========================================================
// Pagination shape
// ===========================================================
export interface Paginated<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ===========================================================
// Properties
// ===========================================================
export interface Property {
  id: number;
  code: string;
  title: string;
  type: string;
  status: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  floor: string | null;
  door: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  province: string;
  country?: string | null;
  price_rent: number | null;
  price_sale: number | null;
  community_fee: number | null;
  parking_spaces?: number | null;
  year_built?: number | null;
  orientation?: string | null;
  floors_count?: number | null;
  units_per_floor?: number | null;
  terrace_sqm?: number | null;
  built_sqm?: number | null;
  // Interior
  condition?: "excelente" | "bueno" | "regular" | "a_reformar" | null;
  suites_count?: number | null;
  service_rooms?: number | null;
  living_rooms?: number | null;
  service_bathrooms?: number | null;
  floor_type?: string | null;
  gas_type?: "caneria" | "balon" | "otros" | null;
  has_termopanel?: boolean | null;
  hot_water_type?: "electrico" | "gas" | "solar" | "otro" | null;
  heating_type?: "central" | "electrica" | "losa_radiante" | "gas" | "no_tiene" | "otro" | null;
  kitchen_type?: "americana" | "cerrada" | "isla" | "otro" | null;
  window_type?: "termopanel" | "aluminio" | "pvc" | "madera" | "otro" | null;
  // Exterior
  elevators_count?: number | null;
  covered_parking_spaces?: number | null;
  uncovered_parking_spaces?: number | null;
  // Deudas y adquisición
  ibi_annual?: number | null;
  acquisition_year?: number | null;
  acquisition_method?: "compra" | "herencia" | "donacion" | "permuta" | "remate" | "otro" | null;
  bank_debt?: number | null;
  debt_institution?: string | null;
  requires_guarantor?: boolean | null;
  // Otros
  rooms_count?: number | null;
  parking_sqm?: number | null;
  storage_count?: number | null;
  apartment_subtype?: "tradicional" | "loft" | "duplex" | "triplex" | "penthouse" | "studio" | "otro" | null;
  max_occupants?: number | null;
  features: string[];
  tags: string[];
  cover_image_url: string | null;
  is_published?: boolean;
  is_shared?: boolean;
  share_pct?: number | null;
  view_count?: number;
  last_viewed_at?: string | null;
  leads_count?: number;
  // Captación + identificación + asignaciones
  currency?: string | null;
  captacion_date?: string | null;
  captacion_source?: "particular" | "portal" | "referido" | "web" | "otro" | null;
  is_exclusive?: boolean;
  commission_pct?: number | null;
  rol?: string | null;
  owner_person_id?: number | null;
  agent_user_id?: number | null;
  client_person_id?: number | null;
  private_note?: string | null;
  inventory_notes?: string | null;
  reception_notes?: string | null;
  booking_enabled?: boolean;
  booking_provider?: "calcom" | "google" | "other" | null;
  booking_url?: string | null;
  owner?: { id: number; full_name: string; email: string | null; phone: string | null } | null;
  agent?: { id: number; name: string; avatar_url: string | null } | null;
  client?: { id: number; full_name: string; email: string | null; phone: string | null } | null;
  building: { id: number; name: string } | null;
  active_contract: {
    id: number;
    code: string;
    monthly_rent: number;
    start_date?: string;
    end_date?: string;
  } | null;
  description?: string | null;
  tour_url?: string | null;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  search?: string;
  status?: string;
  listing_type?: string;
  type?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<Property>>("/api/properties", {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useProperty(id: number | string | null | undefined) {
  return useQuery({
    queryKey: ["property", id],
    enabled: id !== null && id !== undefined,
    queryFn: async () => {
      const res = await api.get<{ data: Property }>(`/api/properties/${id}`);
      return res.data.data;
    },
  });
}

export function usePropertyStats() {
  return useQuery({
    queryKey: ["properties", "stats"],
    queryFn: async () => {
      const res = await api.get<{
        total: number;
        available: number;
        occupied: number;
        maintenance: number;
        avg_rent: number;
      }>("/api/properties/stats");
      return res.data;
    },
  });
}

export type PropertyInput = Partial<
  Omit<Property, "id" | "building" | "active_contract" | "created_at" | "updated_at">
> & {
  building_id?: number | null;
};

export function useSaveProperty(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PropertyInput) => {
      const res = id
        ? await api.patch<{ data: Property }>(`/api/properties/${id}`, data)
        : await api.post<{ data: Property }>("/api/properties", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      if (id) qc.invalidateQueries({ queryKey: ["property", id] });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/properties/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

// ===========================================================
// Persons
// ===========================================================
export interface Person {
  id: number;
  type: "owner" | "tenant" | "both" | "prospect" | string;
  first_name: string;
  last_name: string | null;
  full_name: string;
  nif: string | null;
  email: string | null;
  phone: string | null;
  phone_alt: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  iban_last4: string | null;
  birthday: string | null;
  notes: string | null;
  tags: string[];
  active_contracts_count?: number;
  owned_count?: number;
  created_at: string;
}

export interface PersonFilters {
  search?: string;
  type?: string;
  page?: number;
  per_page?: number;
}

export function usePersons(filters: PersonFilters = {}) {
  return useQuery({
    queryKey: ["persons", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<Person>>("/api/persons", { params: filters });
      return res.data;
    },
  });
}

export function usePerson(id: number | string | null | undefined) {
  return useQuery({
    queryKey: ["person", id],
    enabled: id !== null && id !== undefined,
    queryFn: async () => {
      const res = await api.get<{ data: Person }>(`/api/persons/${id}`);
      return res.data.data;
    },
  });
}

export type PersonInput = Partial<Omit<Person, "id" | "full_name" | "active_contracts_count" | "owned_count" | "created_at">>;

export function useSavePerson(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PersonInput) => {
      const res = id
        ? await api.patch<{ data: Person }>(`/api/persons/${id}`, data)
        : await api.post<{ data: Person }>("/api/persons", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["persons"] });
      if (id) qc.invalidateQueries({ queryKey: ["person", id] });
    },
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/persons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["persons"] }),
  });
}

// ===========================================================
// Contracts
// ===========================================================
export interface Contract {
  id: number;
  code: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit: number;
  commission_pct: number;
  ipc_adjustment: boolean;
  payment_day: number;
  signed_at: string | null;
  notes: string | null;
  property?: {
    id: number;
    code: string;
    title: string;
    address: string;
    city: string;
  };
  owner?: { id: number; full_name: string; email: string | null; phone: string | null };
  tenant?: { id: number; full_name: string; email: string | null; phone: string | null };
  agent?: { id: number; name: string } | null;
  charges_count?: number;
  created_at: string;
}

export interface ContractFilters {
  search?: string;
  status?: string;
  expiring_before?: string;
  page?: number;
  per_page?: number;
}

export function useContracts(filters: ContractFilters = {}) {
  return useQuery({
    queryKey: ["contracts", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<Contract>>("/api/contracts", {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useContract(id: number | string | null | undefined) {
  return useQuery({
    queryKey: ["contract", id],
    enabled: id !== null && id !== undefined,
    queryFn: async () => {
      const res = await api.get<{ data: Contract }>(`/api/contracts/${id}`);
      return res.data.data;
    },
  });
}

// ===========================================================
// Charges
// ===========================================================
export interface Charge {
  id: number;
  code: string;
  concept: string;
  description: string | null;
  amount: number;
  paid_amount: number;
  pending: number;
  issued_at: string;
  due_date: string;
  paid_at: string | null;
  status: string;
  recurring: boolean;
  late_fee: number;
  contract?: { id: number; code: string };
  person?: { id: number; full_name: string };
  payments_count?: number;
}

export interface ChargeFilters {
  status?: string;
  contract_id?: number;
  person_id?: number;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  dir?: "asc" | "desc";
}

export function useCharges(filters: ChargeFilters = {}) {
  return useQuery({
    queryKey: ["charges", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<Charge>>("/api/charges", { params: filters });
      return res.data;
    },
  });
}

export function useChargeStats() {
  return useQuery({
    queryKey: ["charges", "stats"],
    queryFn: async () => {
      const res = await api.get<{
        pending_count: number;
        overdue_count: number;
        paid_count_this_month: number;
        total_pending_amount: number;
        collected_this_month: number;
      }>("/api/charges/stats");
      return res.data;
    },
  });
}

// ===========================================================
// Payments
// ===========================================================
export interface PaymentInput {
  charge_id: number;
  amount: number;
  method: "transferencia" | "efectivo" | "tarjeta" | "domiciliacion" | "otro";
  reference?: string | null;
  received_at: string;
  notes?: string | null;
}

export function useRegisterPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentInput) => api.post("/api/payments", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charges"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ===========================================================
// Dashboard
// ===========================================================
export interface DashboardOverview {
  kpis: {
    properties_active: { value: number; available: number; rented: number; delta_pct: number; trend: number[] };
    active_contracts: { value: number; delta_pct: number; trend: number[] };
    collection_rate: { value: number; delta_pct: number; trend: number[] };
  };
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const res = await api.get<DashboardOverview>("/api/dashboard/overview");
      return res.data;
    },
  });
}

export function useActivityVolume() {
  return useQuery({
    queryKey: ["dashboard", "activity-volume"],
    queryFn: async () => {
      const res = await api.get<{
        data: { day: string; date: string; value: number }[];
        total: number;
      }>("/api/dashboard/activity-volume");
      return res.data;
    },
  });
}

export function useActivityFeed() {
  return useQuery({
    queryKey: ["dashboard", "activity-feed"],
    queryFn: async () => {
      const res = await api.get<{
        data: {
          type: "contract" | "payment" | "overdue" | string;
          title: string;
          description: string;
          time: string | null;
          created_at: string | null;
        }[];
      }>("/api/dashboard/activity-feed");
      return res.data;
    },
  });
}

// ===========================================================
// CRM — Pipelines & Leads
// ===========================================================
export interface Stage {
  id: number;
  name: string;
  color: string;
  position: number;
  probability_pct: number;
  is_won: boolean;
  is_lost: boolean;
  leads_count: number;
  leads_value: number;
}

export type PipelinePurpose = "alquiler" | "venta" | "captacion" | "otros";

export interface Pipeline {
  id: number;
  name: string;
  slug: string;
  purpose: PipelinePurpose;
  is_default: boolean;
  stages: Stage[];
}

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const res = await api.get<{ data: Pipeline[] }>("/api/pipelines");
      return res.data.data;
    },
  });
}

export interface PipelineInput {
  name: string;
  purpose: PipelinePurpose;
  stages?: Array<{
    name: string;
    color?: string;
    probability_pct?: number;
    is_won?: boolean;
    is_lost?: boolean;
  }>;
}

export function useSavePipeline(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PipelineInput>) => {
      const res = id
        ? await api.patch<{ data: Pipeline }>(`/api/pipelines/${id}`, data)
        : await api.post<{ data: Pipeline }>("/api/pipelines", data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export function useDeletePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/pipelines/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export interface StageInput {
  name: string;
  color?: string;
  probability_pct?: number;
  is_won?: boolean;
  is_lost?: boolean;
}

export function useSaveStage(pipelineId: number, stageId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: StageInput) => {
      const res = stageId
        ? await api.patch(`/api/stages/${stageId}`, data)
        : await api.post(`/api/pipelines/${pipelineId}/stages`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export function useDeleteStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/stages/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export function useReorderStages(pipelineId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: number[]) =>
      api.post(`/api/pipelines/${pipelineId}/stages/reorder`, { order }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipelines"] }),
  });
}

export interface Lead {
  id: number;
  code: string;
  title: string;
  pipeline_id: number;
  stage_id: number;
  position: number;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  source: string;
  value: number;
  probability_pct: number;
  requirements: {
    bedrooms_min?: number;
    max_price?: number;
    zones?: string[];
    type?: string[];
  };
  notes: string | null;
  expected_close_date: string | null;
  last_activity_at: string | null;
  status: "open" | "won" | "lost" | string;
  lost_reason: string | null;
  converted_contract_id: number | null;
  assigned_to: { id: number; name: string; avatar_url: string | null } | null;
  person: { id: number; full_name: string } | null;
  property: { id: number; code: string; title: string } | null;
  activities_count?: number;
  created_at: string;
}

export function useLeadsBoard(pipelineId?: number) {
  return useQuery({
    queryKey: ["leads", "board", pipelineId],
    queryFn: async () => {
      const res = await api.get<{ data: Record<string, Lead[]> }>(
        "/api/leads",
        { params: pipelineId ? { pipeline_id: pipelineId } : {} },
      );
      return res.data.data;
    },
  });
}

export function useLead(id: number | string | null | undefined) {
  return useQuery({
    queryKey: ["lead", id],
    enabled: id !== null && id !== undefined,
    queryFn: async () => {
      const res = await api.get<{ data: Lead }>(`/api/leads/${id}`);
      return res.data.data;
    },
  });
}

export function useMoveLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      stageId,
      position,
    }: {
      leadId: number;
      stageId: number;
      position: number;
    }) => api.post(`/api/leads/${leadId}/move`, { stage_id: stageId, position }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
}

export interface LeadInput {
  pipeline_id: number;
  stage_id: number;
  title: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  source?: string;
  value?: number;
  probability_pct?: number;
  expected_close_date?: string;
  notes?: string;
}

export function useSaveLead(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: LeadInput | Partial<LeadInput>) => {
      const res = id
        ? await api.patch<{ data: Lead }>(`/api/leads/${id}`, data)
        : await api.post<{ data: Lead }>("/api/leads", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["pipelines"] });
      if (id) qc.invalidateQueries({ queryKey: ["lead", id] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });
}

export interface LeadActivity {
  id: number;
  type: string;
  title: string | null;
  body: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  user: { id: number; name: string } | null;
}

export function useLeadActivities(leadId: number | null | undefined) {
  return useQuery({
    queryKey: ["lead-activities", leadId],
    enabled: !!leadId,
    queryFn: async () => {
      const res = await api.get<Paginated<LeadActivity>>(
        `/api/leads/${leadId}/activities`,
      );
      return res.data;
    },
  });
}

export function useAddLeadActivity(leadId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: "note" | "call" | "email" | "meeting" | "visit_scheduled";
      title?: string;
      body?: string;
    }) => api.post(`/api/leads/${leadId}/activities`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead-activities", leadId] });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
    },
  });
}

export function useConvertLead(leadId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      property_id: number;
      owner_id: number;
      monthly_rent: number;
      deposit?: number;
      start_date: string;
      end_date: string;
      payment_day?: number;
      generate_charges?: boolean;
    }) => api.post(`/api/leads/${leadId}/convert`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["pipelines"] });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useConvertLeadToProperty(leadId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      type: string;
      address: string;
      area_sqm?: number;
      bedrooms?: number;
      bathrooms?: number;
      price_rent?: number;
      price_sale?: number;
      listing_type?: string;
    }) => api.post(`/api/leads/${leadId}/convert-to-property`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["pipelines"] });
      qc.invalidateQueries({ queryKey: ["lead", leadId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

// ===========================================================
// Notifications (in-app)
// ===========================================================
export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  payload: Record<string, unknown> | null;
  icon_tone: "neutral" | "info" | "positive" | "warning" | "negative" | string;
  read_at: string | null;
  created_at: string;
}

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: async () => {
      const res = await api.get<Paginated<AppNotification>>("/api/notifications", {
        params: { unread_only: unreadOnly ? 1 : 0, per_page: 30 },
      });
      return res.data;
    },
    refetchInterval: 60_000,
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await api.get<{ count: number }>(
        "/api/notifications/unread-count",
      );
      return res.data.count;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ===========================================================
// Auth — register multi-tenant signup
// ===========================================================
export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (data: {
      agency_name: string;
      agency_slug: string;
      agency_phone?: string;
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const res = await api.post<{
        token: string;
        user: { data: AuthUser } | AuthUser;
      }>("/api/auth/register", data);
      const user =
        "data" in res.data.user
          ? (res.data.user as { data: AuthUser }).data
          : (res.data.user as AuthUser);
      return { token: res.data.token, user };
    },
    onSuccess: ({ token, user }) => setSession({ token, user }),
  });
}

// ===========================================================
// Marketplace cross-broker
// ===========================================================
export interface MarketplaceProperty {
  id: number;
  code: string;
  title: string;
  type: string;
  listing_type: string;
  address: string;
  city: string;
  price_rent: number | null;
  price_sale: number | null;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  cover_image_url: string | null;
  share_pct: number;
  shared_at: string | null;
  agency: {
    id: number;
    name: string;
    slug: string;
    phone: string | null;
    email: string | null;
  };
}

export interface MarketplaceFilters {
  search?: string;
  type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  per_page?: number;
}

export function useMarketplace(filters: MarketplaceFilters = {}) {
  return useQuery({
    queryKey: ["marketplace", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<MarketplaceProperty>>(
        "/api/marketplace",
        { params: filters },
      );
      return res.data;
    },
  });
}

export function useMarketplaceStats() {
  return useQuery({
    queryKey: ["marketplace", "stats"],
    queryFn: async () => {
      const res = await api.get<{
        available_count: number;
        my_shared_count: number;
        agencies_sharing: number;
      }>("/api/marketplace/stats");
      return res.data;
    },
  });
}

// ===========================================================
// Email templates + logs
// ===========================================================
export interface EmailTemplate {
  id: number;
  code: string;
  name: string;
  subject: string;
  body: string;
  audience: "tenant" | "owner" | "lead" | "internal" | string;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
}

export interface EmailLog {
  id: number;
  recipient_email: string;
  subject: string;
  status: "sent" | "queued" | "failed" | string;
  error: string | null;
  sent_at: string | null;
  created_at: string;
  template: { id: number; name: string; code: string } | null;
  person: { id: number; full_name: string } | null;
  sender: { id: number; name: string } | null;
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const res = await api.get<{
        data: EmailTemplate[];
        available_tags: Record<string, string[]>;
      }>("/api/email-templates");
      return res.data;
    },
  });
}

export function useSaveEmailTemplate(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<EmailTemplate>) => {
      const res = id
        ? await api.patch<{ data: EmailTemplate }>(`/api/email-templates/${id}`, data)
        : await api.post<{ data: EmailTemplate }>("/api/email-templates", data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["email-templates"] }),
  });
}

export function useDeleteEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/email-templates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["email-templates"] }),
  });
}

export function usePreviewEmail() {
  return useMutation({
    mutationFn: async (data: {
      template_id: number;
      person_id?: number;
      contract_id?: number;
      charge_id?: number;
      lead_id?: number;
    }) => {
      const { template_id, ...rest } = data;
      const res = await api.post<{ subject: string; body: string }>(
        `/api/email-templates/${template_id}/preview`,
        rest,
      );
      return res.data;
    },
  });
}

export function useSendEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      template_id: number;
      recipient_email: string;
      person_id?: number;
      contract_id?: number;
      charge_id?: number;
      lead_id?: number;
    }) => {
      const { template_id, ...rest } = data;
      const res = await api.post<{ ok: boolean; log_id: number }>(
        `/api/email-templates/${template_id}/send`,
        rest,
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["email-logs"] }),
  });
}

export function useEmailLogs(filters: { status?: string; template_id?: number; page?: number } = {}) {
  return useQuery({
    queryKey: ["email-logs", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<EmailLog>>("/api/email-logs", {
        params: { ...filters, per_page: 25 },
      });
      return res.data;
    },
  });
}

export function useSearchRecipients(q: string) {
  return useQuery({
    queryKey: ["email-recipients", q],
    enabled: q.length >= 1,
    queryFn: async () => {
      const res = await api.get<{
        data: { id: number; full_name: string; email: string; type: string }[];
      }>("/api/email-templates/recipients", { params: { q } });
      return res.data.data;
    },
  });
}

export function useShareProperty(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { is_shared: boolean; share_pct?: number }) =>
      api.post<{ is_shared: boolean; shared_at: string | null; share_pct: number }>(
        `/api/properties/${propertyId}/share`,
        data,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}

// ===========================================================
// Plans + Billing (suscripciones)
// ===========================================================
export interface PlanLimits {
  max_properties: number;
  max_users: number;
  max_active_leads: number;
  max_pipelines: number;
  max_email_sends_month: number;
}

export interface PlanFeature {
  code: string;
  name: string;
  included: boolean;
}

export interface Plan {
  id: number;
  code: "starter" | "pro" | "business" | string;
  name: string;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number;
  limits: PlanLimits;
  features: PlanFeature[];
  is_recommended: boolean;
  position: number;
  active: boolean;
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await api.get<{ data: Plan[] }>("/api/plans");
      return res.data.data;
    },
    staleTime: 60_000,
  });
}

export interface BillingMe {
  agency: {
    id: number;
    name: string;
    slug: string;
    subscription_status: "trialing" | "active" | "past_due" | "cancelled" | string;
    billing_cycle: "monthly" | "yearly" | string;
    subscription_started_at: string | null;
    current_period_end: string | null;
    trial_ends_at: string | null;
    cancelled_at: string | null;
    is_trialing: boolean;
    trial_days_left: number;
  };
  plan: Plan;
  usage: Record<string, { current: number; limit: number | null }>;
}

export function useBillingMe() {
  return useQuery({
    queryKey: ["billing", "me"],
    queryFn: async () => {
      const res = await api.get<BillingMe>("/api/billing/me");
      return res.data;
    },
    refetchInterval: 5 * 60_000,
  });
}

export function useUpgradePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { plan_code: string; billing_cycle?: "monthly" | "yearly" }) =>
      api.post("/api/billing/upgrade", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  });
}

export function useCancelPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/billing/cancel"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  });
}

export function useReactivatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/billing/reactivate"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  });
}

// ===========================================================
// Reports
// ===========================================================
export interface FinancialReport {
  data: {
    month: string;
    label: string;
    issued: number;
    collected: number;
    pending: number;
    collection_rate: number;
  }[];
  summary: {
    total_issued: number;
    total_collected: number;
    avg_collection_rate: number;
    months: number;
  };
}

export function useFinancialReport(months = 12) {
  return useQuery({
    queryKey: ["reports", "financial", months],
    queryFn: async () => {
      const res = await api.get<FinancialReport>("/api/reports/financial", {
        params: { months },
      });
      return res.data;
    },
  });
}

export interface AgingReport {
  buckets: { label: string; count: number; amount: number }[];
  top_debtors: {
    person_id: number;
    name: string;
    email: string | null;
    phone: string | null;
    total_owed: number;
    charges_count: number;
  }[];
  total_pending: number;
}

export function useAgingReport() {
  return useQuery({
    queryKey: ["reports", "aging"],
    queryFn: async () => {
      const res = await api.get<AgingReport>("/api/reports/aging");
      return res.data;
    },
  });
}

export interface PropertiesRevenueReport {
  top_properties: {
    id: number;
    title: string;
    code: string;
    city: string;
    collected: number;
    payments_count: number;
  }[];
  occupancy: {
    total: number;
    available: number;
    occupied: number;
    occupancy_rate: number;
  };
}

export function usePropertiesRevenueReport() {
  return useQuery({
    queryKey: ["reports", "properties-revenue"],
    queryFn: async () => {
      const res = await api.get<PropertiesRevenueReport>(
        "/api/reports/properties-revenue",
      );
      return res.data;
    },
  });
}

export interface PipelineConversionReport {
  funnel: {
    stage_id: number;
    name: string;
    is_won: boolean;
    is_lost: boolean;
    count: number;
    value: number;
  }[];
  monthly: {
    month: string;
    label: string;
    created: number;
    won: number;
    lost: number;
    conversion_rate: number;
  }[];
  avg_days_in_stage: { stage_id: number; name: string; avg_days: number }[];
}

export function usePipelineConversionReport() {
  return useQuery({
    queryKey: ["reports", "pipeline-conversion"],
    queryFn: async () => {
      const res = await api.get<PipelineConversionReport>(
        "/api/reports/pipeline-conversion",
      );
      return res.data;
    },
  });
}

export interface AgentsPerformanceReport {
  data: {
    id: number;
    name: string;
    email: string;
    role: string;
    leads_open: number;
    leads_won: number;
    contracts_count: number;
    managed_rent: number;
  }[];
}

export function useAgentsPerformanceReport() {
  return useQuery({
    queryKey: ["reports", "agents-performance"],
    queryFn: async () => {
      const res = await api.get<AgentsPerformanceReport>(
        "/api/reports/agents-performance",
      );
      return res.data;
    },
  });
}

export function useGenerateCharges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (month?: string) =>
      api.post<{ created: number; skipped: number; month: string }>(
        "/api/charges/generate",
        month ? { month } : {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charges"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

// ===========================================================
// Maintenance
// ===========================================================
export interface MaintenanceTicket {
  id: number;
  code: string;
  title: string;
  description: string | null;
  category: string;
  priority: "baja" | "media" | "alta" | "urgente" | string;
  status:
    | "abierto"
    | "en_progreso"
    | "esperando_proveedor"
    | "resuelto"
    | "cerrado"
    | "cancelado"
    | string;
  estimated_cost: number | null;
  actual_cost: number | null;
  vendor: string | null;
  vendor_notes: string | null;
  opened_at: string | null;
  resolved_at: string | null;
  scheduled_for: string | null;
  property?: {
    id: number;
    code: string;
    title: string;
    address: string;
  };
  reporter?: { id: number; full_name: string; phone: string | null } | null;
  assigned_to?: { id: number; name: string; avatar_url: string | null } | null;
  comments_count?: number;
  created_at: string;
}

export interface MaintenanceFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  property_id?: number;
  page?: number;
  per_page?: number;
}

export function useMaintenanceTickets(filters: MaintenanceFilters = {}) {
  return useQuery({
    queryKey: ["maintenance", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<MaintenanceTicket>>(
        "/api/maintenance",
        { params: filters },
      );
      return res.data;
    },
  });
}

export function useMaintenanceTicket(id: number | string | null | undefined) {
  return useQuery({
    queryKey: ["maintenance-ticket", id],
    enabled: id !== null && id !== undefined,
    queryFn: async () => {
      const res = await api.get<{ data: MaintenanceTicket }>(`/api/maintenance/${id}`);
      return res.data.data;
    },
  });
}

export function useMaintenanceStats() {
  return useQuery({
    queryKey: ["maintenance", "stats"],
    queryFn: async () => {
      const res = await api.get<{
        open: number;
        in_progress: number;
        urgent_open: number;
        resolved_this_month: number;
        total_cost_this_month: number;
      }>("/api/maintenance/stats");
      return res.data;
    },
  });
}

export interface MaintenanceTicketInput {
  property_id: number;
  contract_id?: number;
  reported_by?: number;
  assigned_user_id?: number;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  estimated_cost?: number;
  actual_cost?: number;
  vendor?: string;
  scheduled_for?: string;
}

export function useSaveMaintenanceTicket(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: MaintenanceTicketInput | Partial<MaintenanceTicketInput>) => {
      const res = id
        ? await api.patch<{ data: MaintenanceTicket }>(`/api/maintenance/${id}`, data)
        : await api.post<{ data: MaintenanceTicket }>("/api/maintenance", data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      if (id) {
        qc.invalidateQueries({ queryKey: ["maintenance-ticket", id] });
      }
    },
  });
}

export interface MaintenanceComment {
  id: number;
  type: string;
  body: string;
  payload: Record<string, unknown> | null;
  user: { id: number; name: string } | null;
  created_at: string;
}

export function useMaintenanceComments(ticketId: number | null | undefined) {
  return useQuery({
    queryKey: ["maintenance-comments", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const res = await api.get<Paginated<MaintenanceComment>>(
        `/api/maintenance/${ticketId}/comments`,
      );
      return res.data;
    },
  });
}

export function useAddMaintenanceComment(ticketId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api.post(`/api/maintenance/${ticketId}/comments`, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance-comments", ticketId] });
      qc.invalidateQueries({ queryKey: ["maintenance-ticket", ticketId] });
    },
  });
}

// ===========================================================
// Global search (⌘K)
// ===========================================================
export interface SearchHit {
  kind: "property" | "person" | "contract" | "lead" | string;
  id: number;
  code: string | null;
  title: string;
  subtitle: string;
  meta: Record<string, unknown>;
  href: string;
}

export interface SearchGroup {
  kind: string;
  label: string;
  items: SearchHit[];
}

export function useGlobalSearch(q: string) {
  return useQuery({
    queryKey: ["search", q],
    enabled: q.trim().length >= 2,
    staleTime: 5_000,
    queryFn: async () => {
      const res = await api.get<{ groups: SearchGroup[]; total: number }>(
        "/api/search",
        { params: { q } },
      );
      return res.data;
    },
  });
}

// ===========================================================
// Documents (Spatie Media)
// ===========================================================
export interface Document {
  id: number;
  collection: string;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  category: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
}

type Owner = "properties" | "contracts";

export function useDocuments(owner: Owner, ownerId: number | null | undefined) {
  return useQuery({
    queryKey: ["documents", owner, ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const res = await api.get<{ data: Document[] }>(
        `/api/${owner}/${ownerId}/documents`,
      );
      return res.data.data;
    },
  });
}

export interface UploadDocumentInput {
  file: File;
  category?: string;
  description?: string;
  name?: string;
}

export function useUploadDocument(owner: Owner, ownerId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadDocumentInput) => {
      const fd = new FormData();
      fd.append("file", input.file);
      if (input.category) fd.append("category", input.category);
      if (input.description) fd.append("description", input.description);
      if (input.name) fd.append("name", input.name);
      const res = await api.post<{ data: Document }>(
        `/api/${owner}/${ownerId}/documents`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", owner, ownerId] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/documents/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

// ===========================================================
// Calendar / upcoming
// ===========================================================
export interface UpcomingEvent {
  id: string;
  kind: "visit" | "maintenance" | string;
  title: string;
  description: string | null;
  datetime: string | null;
  lead?: {
    id: number;
    code: string;
    title: string;
    contact_name: string | null;
    contact_phone: string | null;
  } | null;
  property?: { id: number; title: string; address: string } | null;
  agent?: { id: number; name: string } | null;
  priority?: string;
  category?: string;
  code?: string;
}

export function useUpcomingEvents(days = 14) {
  return useQuery({
    queryKey: ["calendar", "upcoming", days],
    queryFn: async () => {
      const res = await api.get<{ data: UpcomingEvent[] }>(
        "/api/calendar/upcoming",
        { params: { days } },
      );
      return res.data.data;
    },
  });
}

// ===========================================================
// Map view (lightweight property list with lat/lng)
// ===========================================================
export interface MapProperty {
  id: number;
  code: string;
  title: string;
  type: string;
  status: string;
  listing_type: string;
  address: string;
  city: string;
  price_rent: number | null;
  price_sale: number | null;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number | null;
  cover_image_url: string | null;
  lat: number;
  lng: number;
}

export interface MapFilters {
  status?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
}

// ===========================================================
// Commissions
// ===========================================================
export interface CommissionSplit {
  id: number;
  role: "captador" | "vendedor" | "broker" | "otros" | string;
  pct: number;
  amount: number;
  status: "pending" | "paid" | "cancelled" | string;
  paid_at: string | null;
  payment_reference: string | null;
  notes: string | null;
  user: {
    id: number;
    name: string;
    role: string;
    avatar_url: string | null;
  } | null;
  contract?: { id: number; code: string; monthly_rent: number };
  created_at: string;
}

export interface CommissionFilters {
  status?: string;
  user_id?: number;
  role?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export function useCommissions(filters: CommissionFilters = {}) {
  return useQuery({
    queryKey: ["commissions", filters],
    queryFn: async () => {
      const res = await api.get<Paginated<CommissionSplit>>("/api/commissions", {
        params: filters,
      });
      return res.data;
    },
  });
}

export function useContractCommissions(contractId: number | null | undefined) {
  return useQuery({
    queryKey: ["contract-commissions", contractId],
    enabled: !!contractId,
    queryFn: async () => {
      const res = await api.get<{ data: CommissionSplit[] }>(
        `/api/contracts/${contractId}/commissions`,
      );
      return res.data.data;
    },
  });
}

export function useCommissionStats() {
  return useQuery({
    queryKey: ["commissions", "stats"],
    queryFn: async () => {
      const res = await api.get<{
        total_pending: number;
        pending_count: number;
        paid_this_month: number;
        paid_this_month_count: number;
        top_agents: {
          user_id: number;
          name: string;
          avatar_url: string | null;
          total: number;
          count: number;
        }[];
      }>("/api/commissions/stats");
      return res.data;
    },
  });
}

export function usePayCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      paid_at,
      payment_reference,
      notes,
    }: {
      id: number;
      paid_at?: string;
      payment_reference?: string;
      notes?: string;
    }) =>
      api.post<{ data: CommissionSplit }>(`/api/commissions/${id}/pay`, {
        paid_at,
        payment_reference,
        notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      qc.invalidateQueries({ queryKey: ["contract-commissions"] });
    },
  });
}

// ===========================================================
// Bulk operations on properties
// ===========================================================
export type BulkAction = "change_status" | "archive" | "restore";

export function useBulkProperties() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      action: BulkAction;
      ids: number[];
      payload?: Record<string, string>;
    }) =>
      api.post<{ action: BulkAction; affected: number }>(
        "/api/properties/bulk",
        data,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["properties", "stats"] });
    },
  });
}

export function useMapProperties(filters: MapFilters = {}) {
  return useQuery({
    queryKey: ["properties", "map", filters],
    queryFn: async () => {
      const res = await api.get<{ data: MapProperty[] }>(
        "/api/properties/map",
        { params: filters },
      );
      return res.data.data;
    },
  });
}

// ===========================================================
// Photos (collection 'photos' on properties)
// ===========================================================
export function usePhotos(propertyId: number | string | null | undefined) {
  return useQuery({
    queryKey: ["photos", propertyId],
    enabled: propertyId !== null && propertyId !== undefined,
    queryFn: async () => {
      const res = await api.get<{ data: Document[] }>(
        `/api/properties/${propertyId}/photos`,
      );
      return res.data.data;
    },
  });
}

export function useUploadPhoto(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ data: Document }>(
        `/api/properties/${propertyId}/photos`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos", propertyId] });
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useSetCoverPhoto(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: number) => api.post(`/api/photos/${photoId}/set-cover`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

// ===========================================================
// Property history (timeline de eventos)
// ===========================================================
export type PropertyEventType =
  | "status_change"
  | "client_assigned"
  | "client_removed"
  | "lease_created"
  | "lease_updated"
  | "lease_ended"
  | string;

export interface PropertyEvent {
  id: number;
  type: PropertyEventType;
  from_value: string | null;
  to_value: string | null;
  snapshot: Record<string, unknown>;
  occurred_at: string;
  user: { id: number; name: string; avatar_url: string | null } | null;
}

export interface PropertyHistoryResponse {
  data: PropertyEvent[];
  meta: { current_status: string };
}

export function usePropertyHistory(propertyId: number | null | undefined) {
  return useQuery({
    queryKey: ["property-history", propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const res = await api.get<PropertyHistoryResponse>(
        `/api/properties/${propertyId}/history`,
      );
      return res.data;
    },
  });
}

// ===========================================================
// Property lease (contrato de arriendo gestionado inline)
// ===========================================================
export interface PropertyLease {
  id: number;
  code: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  monthly_rent: number;
  deposit: number | null;
  alert_days_before: number;
  auto_renew: boolean;
  notes: string | null;
  contract_pdf_url: string | null;
  tenant: {
    id: number;
    first_name: string;
    last_name: string | null;
    full_name: string;
    nif: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface PropertyLeaseInput {
  tenant: {
    full_name: string;
    nif?: string;
    email: string;
    phone?: string;
  };
  start_date: string;
  duration_months?: number;
  end_date?: string;
  monthly_rent: number;
  deposit?: number;
  alert_days_before?: number;
  auto_renew?: boolean;
  notes?: string;
}

export function usePropertyLease(propertyId: number | null | undefined) {
  return useQuery({
    queryKey: ["property-lease", propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const res = await api.get<{ data: PropertyLease | null }>(
        `/api/properties/${propertyId}/lease`,
      );
      return res.data.data;
    },
  });
}

export function useSavePropertyLease(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PropertyLeaseInput) => {
      const res = await api.post<{ data: PropertyLease }>(
        `/api/properties/${propertyId}/lease`,
        data,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property-lease", propertyId] });
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useEndPropertyLease(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/api/properties/${propertyId}/lease`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property-lease", propertyId] });
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
      qc.invalidateQueries({ queryKey: ["properties"] });
      qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useReorderPhotos(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: number[]) =>
      api.post(`/api/properties/${propertyId}/photos/reorder`, { order: orderedIds }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos", propertyId] });
    },
  });
}

export function useUploadPropertyCover() {
  return useMutation({
    mutationFn: async ({ file, propertyId }: { file: File; propertyId?: number }) => {
      const fd = new FormData();
      fd.append("file", file);
      if (propertyId) fd.append("property_id", String(propertyId));
      const res = await api.post<{ data: { key: string; url: string } }>(
        "/api/uploads/property-cover",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
  });
}

export function useReplacePhoto(propertyId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ photoId, file }: { photoId: number; file: File }) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ data: Document }>(
        `/api/photos/${photoId}/replace`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos", propertyId] });
      qc.invalidateQueries({ queryKey: ["property", propertyId] });
    },
  });
}

// ===========================================================
// Property analytics
// ===========================================================
export interface PropertyAnalytics {
  lifetime_revenue: number;
  last_12_revenue: number;
  collection_rate: number;
  occupancy_rate: number;
  days_occupied: number;
  days_since_first_contract: number;
  rent_per_sqm: number | null;
  roi_annual_pct: number | null;
  contracts_count: number;
  active_tenants_count: number;
  maintenance_count: number;
  maintenance_cost_total: number;
  next_contract_end: string | null;
  monthly_revenue: { month: string; label: string; revenue: number }[];
}

export function usePropertyAnalytics(id: number | string | null | undefined) {
  return useQuery({
    queryKey: ["property-analytics", id],
    enabled: id !== null && id !== undefined,
    queryFn: async () => {
      const res = await api.get<PropertyAnalytics>(
        `/api/properties/${id}/analytics`,
      );
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (data: {
      name?: string;
      phone?: string | null;
      avatar_url?: string | null;
      password?: string;
      password_confirmation?: string;
    }) => {
      const res = await api.patch<{ data: AuthUser }>("/api/auth/profile", data);
      return res.data.data;
    },
    onSuccess: (user) => {
      setUser(user);
      qc.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

// ===========================================================
// Agency settings
// ===========================================================
export interface AgencySettings {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  currency: string;
  locale: string;
  logo_url: string | null;
}

export interface AgencyMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

export function useAgencyMembers() {
  return useQuery({
    queryKey: ["agency", "members"],
    queryFn: async () => {
      const res = await api.get<{ data: AgencyMember[] }>("/api/agency/members");
      return res.data.data;
    },
  });
}

export function useAgencySettings() {
  return useQuery({
    queryKey: ["agency", "settings"],
    queryFn: async () => {
      const res = await api.get<{ data: AgencySettings }>("/api/agency");
      return res.data.data;
    },
  });
}

export function useUpdateAgencySettings() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (data: Partial<{
      name: string;
      email: string | null;
      phone: string | null;
      address: string | null;
      city: string | null;
      country: string | null;
      currency: string;
      locale: string;
    }>) => {
      const res = await api.patch<{ data: AgencySettings }>("/api/agency", data);
      return res.data.data;
    },
    onSuccess: (settings) => {
      qc.invalidateQueries({ queryKey: ["agency"] });
      // Mantener el auth user sincronizado para que formatCurrency lo lea
      const current = useAuthStore.getState().user;
      if (current?.agency) {
        setUser({
          ...current,
          agency: {
            ...current.agency,
            name: settings.name,
            currency: settings.currency,
            locale: settings.locale,
          },
        });
      }
    },
  });
}

// ===========================================================
// Watermark (marca de agua para fotos de propiedades)
// ===========================================================
export type WatermarkAlignment =
  | "top_left" | "top" | "top_right"
  | "left" | "center" | "right"
  | "bottom_left" | "bottom" | "bottom_right";

export interface WatermarkSettings {
  enabled: boolean;
  apply_to_cover: boolean;
  apply_to_gallery: boolean;
  apply_to_floors: boolean;
  manual_apply_enabled: boolean;
  alignment: WatermarkAlignment;
  offset_x: number;
  offset_y: number;
  offset_unit: "px" | "percent";
  type: "image" | "text";
  text: string;
  text_color: string;
  size_mode: "original" | "custom" | "scaled";
  size_value: number;
  opacity: number;
  quality: number;
  format: "baseline" | "progressive";
}

export interface WatermarkData {
  image_url: string | null;
  settings: WatermarkSettings;
}

export function useAgencyWatermark() {
  return useQuery({
    queryKey: ["agency", "watermark"],
    queryFn: async () => {
      const res = await api.get<{ data: WatermarkData }>("/api/agency/watermark");
      return res.data.data;
    },
  });
}

export function useUpdateAgencyWatermark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<WatermarkSettings>) => {
      const res = await api.patch<{ data: WatermarkData }>(
        "/api/agency/watermark",
        data,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agency", "watermark"] });
    },
  });
}

export function useUploadWatermarkImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{ data: { image_url: string; key: string } }>(
        "/api/agency/watermark/image",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agency", "watermark"] });
    },
  });
}

export function useDeleteWatermarkImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete("/api/agency/watermark/image"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agency", "watermark"] });
    },
  });
}

// ===========================================================
// API Tokens (Personal Access Tokens para uso externo)
// ===========================================================
export interface ApiToken {
  id: number;
  name: string;
  abilities: string[];
  last_used_at: string | null;
  created_at: string | null;
  preview: string;
}

export interface ApiTokensResponse {
  data: ApiToken[];
  available_abilities: string[];
}

export function useApiTokens() {
  return useQuery({
    queryKey: ["api-tokens"],
    queryFn: async () => {
      const res = await api.get<ApiTokensResponse>("/api/tokens");
      return res.data;
    },
  });
}

export function useCreateApiToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; abilities?: string[] }) => {
      const res = await api.post<{
        data: ApiToken & { plain_text_token: string };
      }>("/api/tokens", data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-tokens"] }),
  });
}

export function useDeleteApiToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/tokens/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-tokens"] }),
  });
}
